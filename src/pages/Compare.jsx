import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftRight, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Briefcase, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { supabase } from '../supabaseClient';

// Normalize branch names to standardized title-casing
const normalizeBranchName = (branchName) => {
  const b = String(branchName || '').toLowerCase().trim();
  
  if (b.includes('civil') && b.includes('rural')) return 'Civil (Rural) Engineering';
  if (b.includes('civil') && b.includes('construction')) return 'Civil Engineering (Construction Tech.)';
  if (b.includes('civil')) return 'Civil Engineering';
  if (b.includes('mechanical') && (b.includes('auto') || b.includes('automobile'))) return 'Mechanical Engineering (Automobile)';
  if (b.includes('automobile')) return 'Automobile Engineering';
  if (b.includes('mechanical') && b.includes('cad')) return 'Mechanical Engineering (CAD/CAM)';
  if (b.includes('mechanical')) return 'Mechanical Engineering';
  if (b.includes('electrical') && b.includes('electronics')) return 'Electrical & Electronics Engineering';
  if (b.includes('electrical')) return 'Electrical Engineering';
  if (b.includes('electronics') && b.includes('robotics')) return 'Electronics Engineering (Robotics)';
  if (b.includes('electronics') && b.includes('communication')) return 'Electronics & Communication Engineering';
  if (b.includes('electronics') || b === 'electronics') return 'Electronics Engineering';
  if (b.includes('computer') || b.includes('cs') || b.includes('cse')) return 'Computer Science & Engineering';
  if (b.includes('information') || b.includes('it')) return 'Information Technology';
  if (b.includes('agri')) return 'Agricultural Engineering';
  if (b.includes('ai') || b.includes('artificial') || b.includes('machine')) return 'AI and Machine Learning';
  if (b.includes('textile')) return 'Textile Engineering';
  if (b.includes('leather')) return 'Leather Technology';
  if (b.includes('ceramic')) return 'Ceramic Engineering';
  if (b.includes('print')) return 'Printing Technology';
  if (b.includes('fire')) return 'Fire Technology & Safety';
  if (b.includes('mining')) return 'Mining Engineering';
  if (b.includes('chemical')) return 'Chemical Engineering';
  if (b.includes('costume') || b.includes('dress')) return 'Costume Design & Garment Technology';
  if (b.includes('architectural')) return 'Architectural Assistantship';
  if (b.includes('library')) return 'Library & Information Science';
  if (b.includes('office') || b.includes('practice')) return 'Modern Office Practice';

  return b.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Helper to identify Government Women's Polytechnic (women-only) colleges
const isWomenOnlyCollege = (name) => {
  const n = name.toLowerCase();
  return n.includes('gwp') || n.includes("women's") || n.includes("women");
};

// Map record ID to year
const getYearFromId = (id) => {
  if (id >= 18 && id <= 2327) return 2025;
  if (id >= 2328 && id <= 4603) return 2024;
  if (id >= 4604 && id <= 6589) return 2022;
  return null;
};

const Compare = ({ colleges, studentInfo }) => {
  const [selectedIds, setSelectedIds] = useState(['', '', '']);
  const [cutoffsData, setCutoffsData] = useState([]);
  const [loadingCutoffs, setLoadingCutoffs] = useState(false);
  const [inflationIndex, setInflationIndex] = useState('1.05'); // default 5%

  // Normalize college names to match predefined list names
  const normalizeCollegeName = (name) => {
    if (!name) return '';
    let cleaned = name.replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
    cleaned = cleaned.replace(/^g\s*p\s+/i, 'GP ');
    cleaned = cleaned.replace(/^g\s*w\s*p\s+/i, 'GWP ');
    cleaned = cleaned.replace(/^n\s*g\s*p\s+/i, 'NGP ');
    
    const matched = colleges?.find(c => {
      const normC = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normCleaned = cleaned.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normC === normCleaned;
    });
    
    if (matched) return matched.name;
    
    return cleaned.split(' ').map(word => {
      const upper = word.toUpperCase();
      if (upper === 'GP' || upper === 'GWP' || upper === 'NGP') return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  };

  // Map selected college names
  const selectedColleges = useMemo(() => {
    return selectedIds.map(id => {
      if (!id) return null;
      return colleges.find(c => String(c.id) === String(id)) || null;
    });
  }, [selectedIds, colleges]);

  const activeCollegesCount = useMemo(() => {
    return selectedColleges.filter(c => c !== null).length;
  }, [selectedColleges]);

  // Fetch cutoff data for selected colleges from Supabase when selections change
  useEffect(() => {
    const fetchCutoffs = async () => {
      const activeNames = selectedColleges.filter(c => c !== null).map(c => c.name);
      if (activeNames.length === 0) {
        setCutoffsData([]);
        return;
      }

      setLoadingCutoffs(true);
      try {
        // Construct query parameters including lowercase/uppercase variants
        const queries = [];
        activeNames.forEach(name => {
          queries.push(name);
          queries.push(name.toUpperCase());
          queries.push(name.toLowerCase());
          // Standardize periods
          queries.push(name.replace(/GP\s+/i, 'G.P.'));
          queries.push(name.replace(/GWP\s+/i, 'G.W.P.'));
          queries.push(name.replace(/NGP\s+/i, 'N.G.P.'));
        });

        const uniqueQueries = [...new Set(queries)];

        const { data, error } = await supabase
          .from('colleges')
          .select('*')
          .in('college_name', uniqueQueries)
          .gte('id', 18)
          .lte('id', 6589);

        if (error) throw error;
        setCutoffsData(data || []);
      } catch (err) {
        console.error('Error fetching compare cutoffs:', err.message);
      } finally {
        setLoadingCutoffs(false);
      }
    };

    fetchCutoffs();
  }, [selectedColleges]);

  // Calculate prediction likelihood for each branch of compared colleges
  const predictionsMap = useMemo(() => {
    if (!studentInfo || cutoffsData.length === 0) return {};

    const originalUrRank = parseInt(studentInfo.rank);
    const originalCategoryRank = studentInfo.category !== 'UR' && studentInfo.roll === '12345' ? 450 : null; // mock category rank since it is not in studentInfo directly

    const inflationMult = parseFloat(inflationIndex || '1.00');
    const urRank = Math.round(originalUrRank * inflationMult);
    const categoryRank = originalCategoryRank ? Math.round(originalCategoryRank * inflationMult) : null;

    const candidateCategory = studentInfo.category === 'OBC' ? 'BC' : studentInfo.category;

    // Categories to fetch
    const categoriesToFetch = ['UR', 'E-UR'];
    if (candidateCategory !== 'UR') {
      categoriesToFetch.push(candidateCategory);
      categoriesToFetch.push(`E-${candidateCategory}`);
    }
    if (studentInfo.gender === 'Female') {
      categoriesToFetch.push('RCG');
      categoriesToFetch.push('E-RCG');
    }

    // Filter by DCECE (Regular)
    const regularData = cutoffsData.filter(item => 
      (!item.exam_type || item.exam_type === 'DCECE') && 
      categoriesToFetch.includes(item.category.trim().toUpperCase())
    );

    // Group cutoffs by (college_name, branch)
    const groups = {};
    regularData.forEach(item => {
      const normCollege = normalizeCollegeName(item.college_name);
      const normBranch = normalizeBranchName(item.branch);
      const key = `${normCollege}||${normBranch}`;

      if (!groups[key]) {
        groups[key] = {
          college_name: normCollege,
          branch: normBranch,
          categoryYears: {}
        };
      }

      const catUpper = item.category.trim().toUpperCase();
      const year = getYearFromId(item.id);
      if (year) {
        if (!groups[key].categoryYears[catUpper]) {
          groups[key].categoryYears[catUpper] = {};
        }
        if (!groups[key].categoryYears[catUpper][year] || item.closing_rank > groups[key].categoryYears[catUpper][year]) {
          groups[key].categoryYears[catUpper][year] = item.closing_rank;
        }
      }
    });

    const getWeightedCutoff = (categoryYears, categoryCode) => {
      const catUpper = categoryCode.toUpperCase();
      const primaryData = categoryYears[catUpper] || {};
      const secondaryData = categoryYears[`E-${catUpper}`] || {};
      const mergedYears = {};

      [2025, 2024, 2022].forEach(y => {
        const val1 = primaryData[y] !== undefined ? primaryData[y] : null;
        const val2 = secondaryData[y] !== undefined ? secondaryData[y] : null;
        if (val1 !== null || val2 !== null) {
          mergedYears[y] = Math.max(val1 || 0, val2 || 0);
        }
      });

      let sumWeight = 0;
      let sumValue = 0;

      if (mergedYears[2025] !== undefined) {
        sumWeight += 0.5;
        sumValue += mergedYears[2025] * 0.5;
      }
      if (mergedYears[2024] !== undefined) {
        sumWeight += 0.3;
        sumValue += mergedYears[2024] * 0.3;
      }
      if (mergedYears[2022] !== undefined) {
        sumWeight += 0.2;
        sumValue += mergedYears[2022] * 0.2;
      }

      if (sumWeight === 0) return null;
      return Math.round(sumValue / sumWeight);
    };

    const results = {};

    Object.values(groups).forEach(group => {
      // Exclude Women-only (GWP) colleges for male candidates
      if (studentInfo.gender === 'Male' && isWomenOnlyCollege(group.college_name)) {
        return;
      }

      let allotmentCategory = null;
      let matchedCutoff = null;
      let matchedRank = null;

      let urCutoff = getWeightedCutoff(group.categoryYears, 'UR');
      let categoryCutoff = candidateCategory !== 'UR' ? getWeightedCutoff(group.categoryYears, candidateCategory) : null;
      let rcgCutoff = getWeightedCutoff(group.categoryYears, 'RCG');

      // Female horizontal boost
      if (studentInfo.gender === 'Female' && !isWomenOnlyCollege(group.college_name)) {
        if (urCutoff) urCutoff = Math.round(urCutoff * 1.33);
        if (categoryCutoff) categoryCutoff = Math.round(categoryCutoff * 1.33);
        if (rcgCutoff) rcgCutoff = Math.round(rcgCutoff * 1.33);
      }

      // Check UR
      if (urCutoff && urRank <= urCutoff * 1.15) {
        allotmentCategory = 'UR';
        matchedCutoff = urCutoff;
        matchedRank = urRank;
      } 
      // Check Category
      else if (candidateCategory !== 'UR' && categoryCutoff && categoryRank && categoryRank <= categoryCutoff * 1.15) {
        allotmentCategory = candidateCategory;
        matchedCutoff = categoryCutoff;
        matchedRank = categoryRank;
      }
      // Check RCG
      else if (!allotmentCategory && studentInfo.gender === 'Female' && rcgCutoff) {
        const rankToCheck = candidateCategory !== 'UR' && categoryRank ? categoryRank : urRank;
        if (rankToCheck && rankToCheck <= rcgCutoff * 1.15) {
          allotmentCategory = 'RCG';
          matchedCutoff = rcgCutoff;
          matchedRank = rankToCheck;
        }
      }

      if (allotmentCategory && matchedCutoff) {
        let prob = 50;
        let status = 'Moderate';
        let color = 'text-brand-tertiary bg-amber-50 border-amber-200';

        if (matchedRank <= matchedCutoff * 0.85) {
          prob = 90;
          status = 'Safe';
          color = 'text-brand-secondary bg-emerald-50 border border-emerald-200';
        } else if (matchedRank < matchedCutoff * 0.95) {
          prob = 80;
          status = 'Good';
          color = 'text-teal-600 bg-teal-50 border border-teal-200';
        } else if (matchedRank <= matchedCutoff * 1.05) {
          prob = 60;
          status = 'Borderline';
          color = 'text-brand-tertiary bg-amber-50 border border-amber-200';
        } else {
          prob = 35;
          status = 'Tough';
          color = 'text-rose-600 bg-rose-50 border border-rose-200';
        }

        const collegeKey = group.college_name;
        if (!results[collegeKey]) {
          results[collegeKey] = {};
        }
        results[collegeKey][group.branch] = {
          probability: prob,
          status: status,
          color: color,
          cutoff: matchedCutoff,
          quota: allotmentCategory
        };
      }
    });

    return results;
  }, [studentInfo, cutoffsData, inflationIndex]);

  // Master facilities list to compare
  const facilitiesList = ['Hostel', 'Computer Labs', 'Library', 'Smart Classrooms', 'Workshop', 'Seminar Hall', 'Girls Hostel', 'Gymnasium', 'Sports Ground'];

  const handleSelectChange = (index, value) => {
    const next = [...selectedIds];
    next[index] = value;
    setSelectedIds(next);
  };

  const clearSelection = (index) => {
    const next = [...selectedIds];
    next[index] = '';
    setSelectedIds(next);
  };

  // Get union of all branches available in compared colleges
  const allBranches = useMemo(() => {
    const branches = new Set();
    selectedColleges.forEach(col => {
      if (col && col.branches) {
        col.branches.forEach(b => branches.add(normalizeBranchName(b)));
      }
    });
    return Array.from(branches).sort();
  }, [selectedColleges]);

  return (
    <main className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12 space-y-3">
          <span className="inline-block bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider select-none">
            Interactive Admissions Assistant
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-outfit bg-gradient-to-r from-slate-900 via-brand-primary to-purple-800 bg-clip-text text-transparent tracking-tight flex items-center justify-center gap-3">
            <ArrowLeftRight className="h-8 w-8 md:h-10 md:w-10 text-brand-primary" />
            <span>College Comparison Tool</span>
          </h1>
          <p className="text-slate-500 font-inter text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Select up to three government polytechnic colleges to compare placement records, branch seats, amenities, and your personal admission chances.
          </p>
        </div>

        {/* Profile / Inflation panel (If Authenticated) */}
        {studentInfo && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 mb-8 shadow-xs max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 select-none">
              <div className="h-10 w-10 bg-brand-primary/10 text-brand-primary border border-brand-primary/25 rounded-xl flex items-center justify-center font-bold font-outfit text-sm">
                {studentInfo.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 font-outfit">Active Candidate Profile: {studentInfo.name}</h4>
                <p className="text-xs text-slate-500 font-inter">Rank: {studentInfo.rank} | Category: {studentInfo.category} | Gender: {studentInfo.gender}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit text-right leading-tight hidden md:block">
                Predictor Shift
              </label>
              <select
                value={inflationIndex}
                onChange={(e) => setInflationIndex(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg outline-none font-inter text-xs cursor-pointer focus:border-brand-primary w-full sm:w-48"
              >
                <option value="1.00">0% Inflation (Standard)</option>
                <option value="1.05">5% Inflation (Default)</option>
                <option value="1.10">10% Inflation (High)</option>
                <option value="1.15">15% Inflation (Extreme)</option>
              </select>
            </div>
          </div>
        )}

        {/* Dropdown Selectors Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          {[0, 1, 2].map((idx) => {
            const currentSelected = selectedColleges[idx];
            return (
              <div key={idx} className="bg-white border border-slate-200 hover:border-brand-primary/30 rounded-2xl p-4 shadow-xs hover:shadow-md hover:scale-[1.015] transition-all duration-300 flex flex-col space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-outfit">
                  College {idx + 1}
                </label>
                
                <div className="relative">
                  <select
                    value={selectedIds[idx]}
                    onChange={(e) => handleSelectChange(idx, e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl outline-none font-inter text-sm cursor-pointer focus:border-brand-primary"
                  >
                    <option value="">-- Choose College --</option>
                    {colleges.map((col) => {
                      // Disable if selected in another dropdown
                      const isDisabled = selectedIds.some((id, selectIdx) => selectIdx !== idx && String(id) === String(col.id));
                      return (
                        <option key={col.id} value={col.id} disabled={isDisabled}>
                          {col.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {currentSelected && (
                  <button
                    onClick={() => clearSelection(idx)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-500 font-outfit text-left pt-1.5 transition-colors cursor-pointer select-none"
                  >
                    Clear College selection
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison Dashboard Grid */}
        <AnimatePresence mode="wait">
          {activeCollegesCount > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              
              {/* College cards row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map((idx) => {
                  const col = selectedColleges[idx];
                  if (!col) {
                    return (
                      <div key={idx} className="hidden md:flex border border-dashed border-slate-200 rounded-3xl h-full min-h-[200px] items-center justify-center p-8 bg-slate-50/55 text-slate-400 select-none">
                        <div className="text-center space-y-2">
                          <HelpCircle className="h-8 w-8 mx-auto stroke-1 text-slate-400" />
                          <p className="text-xs font-semibold font-inter">Slot Empty. Choose a college to compare.</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      key={col.id}
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white border border-slate-200 hover:border-brand-primary/30 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:scale-[1.015] transition-all duration-300 relative flex flex-col h-full"
                    >
                      {/* Badge if top-tier */}
                      {col.topRanked && (
                        <span className="absolute top-4 left-4 bg-brand-primary text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider z-10 shadow-xs">
                          Tier 1
                        </span>
                      )}

                      {/* Image Block */}
                      <div className="h-44 w-full relative bg-slate-100 overflow-hidden">
                        <img 
                          src={col.image} 
                          alt={col.name} 
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-103"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h3 className="font-extrabold font-outfit text-lg leading-tight">{col.name}</h3>
                          <div className="flex items-center gap-1 mt-1 text-slate-300 font-inter text-xs">
                            <MapPin className="h-3 w-3 flex-shrink-0 text-brand-secondary" />
                            <span>{col.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Details Matrix */}
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-5">
                        
                        <div className="grid grid-cols-3 gap-2.5 text-center text-xs select-none">
                          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl flex flex-col items-center justify-center">
                            <Calendar className="h-4 w-4 text-brand-primary mb-1" />
                            <span className="block text-[9px] font-bold text-slate-500 uppercase">ESTABLISHED</span>
                            <span className="font-extrabold font-outfit text-slate-800 text-[13px] mt-0.5">{col.established}</span>
                          </div>
                          
                          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl flex flex-col items-center justify-center">
                            <IndianRupee className="h-4 w-4 text-brand-primary mb-1" />
                            <span className="block text-[9px] font-bold text-slate-500 uppercase">FEES</span>
                            <span className="font-extrabold font-outfit text-slate-800 text-[13px] mt-0.5">{col.fees ? col.fees.split('/')[0] : '₹1,000'}</span>
                          </div>

                          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl flex flex-col items-center justify-center">
                            <Briefcase className="h-4 w-4 text-brand-primary mb-1" />
                            <span className="block text-[9px] font-bold text-slate-500 uppercase">PLACEMENT</span>
                            <span className="font-extrabold font-outfit text-slate-800 text-[13px] mt-0.5">{col.placement}%</span>
                          </div>
                        </div>

                        {/* description snippet */}
                        <p className="text-slate-600 font-inter text-xs leading-relaxed flex-grow">
                          {col.desc || col.description || 'Information not added yet.'}
                        </p>

                        {/* placement bar indicator */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-500">
                            <span>Placement Rate</span>
                            <span className="text-brand-primary">{col.placement}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand-primary to-purple-500 rounded-full" style={{ width: `${col.placement}%` }}></div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Personalized Admission likelihood side-by-side (Only when logged in) */}
              {studentInfo && (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:border-brand-primary/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4 select-none">
                    <Sparkles className="h-5 w-5 text-brand-primary fill-brand-primary/10" />
                    <div>
                      <h4 className="font-extrabold font-outfit text-slate-800 text-base">Personalized Admission Likelihood</h4>
                      <p className="text-xs text-slate-500 font-inter mt-0.5">Calculated using your rank of {studentInfo.rank} ({studentInfo.category} category) with {Math.round((parseFloat(inflationIndex) - 1) * 100)}% inflation.</p>
                    </div>
                  </div>

                  {loadingCutoffs ? (
                    <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
                      <span className="text-xs text-slate-500 font-inter">Running match criteria...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[0, 1, 2].map((idx) => {
                        const col = selectedColleges[idx];
                        if (!col) {
                          return <div key={idx} className="hidden md:block"></div>;
                        }

                        const colPredict = predictionsMap[col.name] || {};
                        const colBranches = col.branches || [];

                        return (
                          <div key={col.id} className="space-y-3.5 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                            <span className="block text-xs font-bold text-slate-800 font-outfit border-b border-slate-200/60 pb-2">{col.name} Chance</span>
                            
                            {colBranches.length > 0 ? (
                              <div className="space-y-2">
                                {colBranches.map(branchName => {
                                  const normBranch = normalizeBranchName(branchName);
                                  const match = colPredict[normBranch];

                                  return (
                                    <div key={branchName} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-150 text-xs">
                                      <span className="font-semibold text-slate-700 truncate max-w-[120px]" title={normBranch}>
                                        {normBranch}
                                      </span>
                                      
                                      {match ? (
                                        <span className={`px-2.5 py-0.5 rounded-md font-bold ${match.color}`}>
                                          {match.status} ({match.probability}%)
                                        </span>
                                      ) : (
                                        <span className="bg-slate-100 text-slate-400 px-2.5 py-0.5 rounded-md font-semibold border border-slate-200">
                                          Unlikely
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-450 text-xs font-medium italic block py-2">No branches defined in profile.</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Seat Matrix Comparison Table */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:border-brand-primary/30 transition-all duration-300 overflow-hidden">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4 select-none">
                  <GraduationCap className="h-5 w-5 text-brand-primary" />
                  <div>
                    <h4 className="font-extrabold font-outfit text-slate-800 text-base">Seat Matrix Comparison</h4>
                    <p className="text-xs text-slate-500 font-inter mt-0.5">Regular shift seat intake capacities for each department.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                     <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase font-outfit">
                        <th className="py-3 px-4">Branch / Stream</th>
                        {[0, 1, 2].map((idx) => {
                          const col = selectedColleges[idx];
                          if (!col) return <th key={idx} className="py-3 px-4 hidden md:table-cell text-slate-400 font-normal">Slot Empty</th>;
                          return (
                            <th key={col.id} className="py-3 px-4 font-bold text-brand-primary text-center">
                              {col.name}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-inter text-slate-650 text-xs sm:text-sm">
                      {allBranches.map((branchName) => (
                        <tr key={branchName} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{branchName}</td>
                          {[0, 1, 2].map((idx) => {
                            const col = selectedColleges[idx];
                            if (!col) return <td key={idx} className="py-3.5 px-4 text-center hidden md:table-cell text-slate-400 font-light">-</td>;
                            
                            // Lookup in seatMatrix or default to 0
                            const seatCount = col.seatMatrix ? (col.seatMatrix[branchName] || col.seatMatrix[Object.keys(col.seatMatrix).find(k => normalizeBranchName(k) === branchName)] || 0) : 0;
                            
                            return (
                              <td key={col.id} className="py-3.5 px-4 text-center font-bold text-slate-700">
                                {seatCount > 0 ? seatCount : <span className="text-slate-400 font-normal">N/A</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Infrastructure Checklist Comparison */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:border-brand-primary/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4 select-none">
                  <ArrowLeftRight className="h-5 w-5 text-brand-primary" />
                  <div>
                    <h4 className="font-extrabold font-outfit text-slate-800 text-base">Infrastructure & Facilities Checklist</h4>
                    <p className="text-xs text-slate-500 font-inter mt-0.5">Quick lookup of campus amenities and laboratory facilities.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[0, 1, 2].map((idx) => {
                    const col = selectedColleges[idx];
                    if (!col) {
                      return <div key={idx} className="hidden md:block"></div>;
                    }

                    const colFacilities = (col.facilities || []).map(f => f.toLowerCase().trim());

                    return (
                      <div key={col.id} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3.5">
                        <span className="block text-sm font-extrabold text-slate-800 font-outfit border-b border-slate-200/60 pb-2.5">
                          {col.name}
                        </span>

                        <div className="space-y-2.5 font-inter text-xs">
                          {facilitiesList.map(facility => {
                            const hasFacility = colFacilities.includes(facility.toLowerCase()) || 
                              colFacilities.some(cf => cf.includes(facility.toLowerCase()) || facility.toLowerCase().includes(cf));
                            
                            return (
                              <div key={facility} className="flex items-center justify-between">
                                <span className="text-slate-500 font-medium">{facility}</span>
                                {hasFacility ? (
                                  <CheckCircle className="h-4.5 w-4.5 text-brand-secondary fill-brand-secondary/10" />
                                ) : (
                                  <XCircle className="h-4.5 w-4.5 text-slate-300" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-xs min-h-[350px] select-none max-w-3xl mx-auto"
            >
              <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                <ArrowLeftRight className="h-7 w-7 text-brand-primary" />
              </div>
              <h4 className="text-slate-800 font-bold font-outfit text-lg">Compare Colleges Side-by-Side</h4>
              <p className="text-slate-500 text-xs sm:text-sm font-inter leading-relaxed max-w-md">
                Select one or more government polytechnic colleges from the dropdown slots above to initiate a comprehensive performance, seat, and facilities comparison.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
};

export default Compare;
