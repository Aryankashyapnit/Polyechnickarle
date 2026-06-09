import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, FileSpreadsheet, ArrowRight, LineChart, GraduationCap, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

const getYearFromId = (id) => {
  if (id >= 18 && id <= 2327) return 2025;
  if (id >= 2328 && id <= 4603) return 2024;
  if (id >= 4604 && id <= 6589) return 2022;
  if (id >= 6590 && id <= 8968) return 2020;
  if (id >= 8969 && id <= 10420) return 2021;
  return 2026;
};

const getCategoryBadge = (category) => {
  const cat = String(category || '').trim().toUpperCase();
  if (cat === 'UR' || cat === 'E-UR') {
    return (
      <span className="font-extrabold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded text-xs select-none uppercase tracking-wide">
        {category}
      </span>
    );
  }
  
  let styleClass = "bg-slate-50 text-slate-600 border border-slate-200";
  if (cat === 'BC' || cat === 'E-BC') {
    styleClass = "bg-emerald-50 text-brand-secondary border border-emerald-250";
  } else if (cat === 'EBC' || cat === 'E-EBC') {
    styleClass = "bg-amber-50 text-brand-tertiary border border-amber-250";
  } else if (cat === 'SC' || cat === 'E-SC') {
    styleClass = "bg-rose-50 text-rose-600 border border-rose-200";
  } else if (cat === 'ST' || cat === 'E-ST') {
    styleClass = "bg-cyan-50 text-cyan-600 border border-cyan-200";
  } else if (cat === 'EWS') {
    styleClass = "bg-purple-50 text-brand-primary border border-brand-primary/20";
  } else if (cat === 'RCG') {
    styleClass = "bg-pink-50 text-pink-600 border border-pink-200";
  } else if (cat === 'DQ' || cat === 'SMQ') {
    styleClass = "bg-blue-50 text-blue-600 border border-blue-200";
  }
  
  return (
    <span className={`font-bold px-2.5 py-1 rounded text-xs select-none uppercase tracking-wide ${styleClass}`}>
      {category}
    </span>
  );
};

const getBranchScore = (branchName) => {
  const b = String(branchName || '').toLowerCase();
  if (b.includes('civil')) return 1;
  if (b.includes('mechanical')) return 2;
  if (b.includes('electrical')) return 3;
  if (b.includes('electronics')) return 4;
  if (b.includes('computer') || b.includes('cs')) return 5;
  if (b.includes('information') || b.includes('it')) return 6;
  if (b.includes('agri')) return 7;
  if (b.includes('ai') || b.includes('machine')) return 8;
  if (b.includes('auto')) return 9;
  if (b.includes('textile')) return 10;
  if (b.includes('leather')) return 11;
  if (b.includes('ceramic')) return 12;
  if (b.includes('print')) return 13;
  if (b.includes('fire')) return 14;
  if (b.includes('mining')) return 15;
  return 99; // fallback
};

const normalizeBranchName = (branchName) => {
  const b = String(branchName || '').toLowerCase().trim();
  
  if (b.includes('civil') && b.includes('rural')) {
    return 'Civil (Rural) Engineering';
  }
  if (b.includes('civil') && b.includes('construction')) {
    return 'Civil Engineering (Construction Tech.)';
  }
  if (b.includes('civil')) {
    return 'Civil Engineering';
  }
  
  if (b.includes('mechanical') && (b.includes('auto') || b.includes('automobile'))) {
    return 'Mechanical Engineering (Automobile)';
  }
  if (b.includes('automobile')) {
    return 'Automobile Engineering';
  }
  if (b.includes('mechanical') && b.includes('cad')) {
    return 'Mechanical Engineering (CAD/CAM)';
  }
  if (b.includes('mechanical')) {
    return 'Mechanical Engineering';
  }
  
  if (b.includes('electrical') && b.includes('electronics')) {
    return 'Electrical & Electronics Engineering';
  }
  if (b.includes('electrical')) {
    return 'Electrical Engineering';
  }
  
  if (b.includes('electronics') && b.includes('robotics')) {
    return 'Electronics Engineering (Robotics)';
  }
  if (b.includes('electronics') && b.includes('communication')) {
    return 'Electronics & Communication Engineering';
  }
  if (b.includes('electronics') || b === 'electronics') {
    return 'Electronics Engineering';
  }
  
  if (b.includes('computer') || b.includes('cs') || b.includes('cse')) {
    return 'Computer Science & Engineering';
  }
  if (b.includes('information') || b.includes('it')) {
    return 'Information Technology';
  }
  if (b.includes('agri')) {
    return 'Agricultural Engineering';
  }
  if (b.includes('ai') || b.includes('artificial') || b.includes('machine')) {
    return 'AI and Machine Learning';
  }
  if (b.includes('textile')) {
    return 'Textile Engineering';
  }
  if (b.includes('leather')) {
    return 'Leather Technology';
  }
  if (b.includes('ceramic')) {
    return 'Ceramic Engineering';
  }
  if (b.includes('print')) {
    return 'Printing Technology';
  }
  if (b.includes('fire')) {
    return 'Fire Technology & Safety';
  }
  if (b.includes('mining')) {
    return 'Mining Engineering';
  }
  if (b.includes('chemical')) {
    return 'Chemical Engineering';
  }
  if (b.includes('costume') || b.includes('dress')) {
    return 'Costume Design & Garment Technology';
  }
  if (b.includes('architectural')) {
    return 'Architectural Assistantship';
  }
  if (b.includes('library')) {
    return 'Library & Information Science';
  }
  if (b.includes('office') || b.includes('practice')) {
    return 'Modern Office Practice';
  }

  // Fallback
  return b
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getCategorySortScore = (category) => {
  const cat = String(category || '').trim().toUpperCase();
  if (cat === 'UR' || cat === 'E-UR') return 1;
  if (cat === 'BC' || cat === 'E-BC') return 2;
  if (cat === 'EBC' || cat === 'E-EBC') return 3;
  if (cat === 'SC' || cat === 'E-SC') return 4;
  if (cat === 'ST' || cat === 'E-ST') return 5;
  if (cat === 'EWS') return 6;
  if (cat === 'RCG') return 7;
  return 8; // DQ, SMQ, others
};

const Cutoff = () => {
  const [cutoffData, setCutoffData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sub-navigation tab: 'cutoff' or 'seatMatrix'
  const [cutoffTab, setCutoffTab] = useState('cutoff');

  // Cutoff Database states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Seat Matrix Tracker states
  const [smQuery, setSmQuery] = useState('');
  const [smBranch, setSmBranch] = useState('All');

  const [seatMatrixData, setSeatMatrixData] = useState([]);
  const [smLoading, setSmLoading] = useState(false);

  useEffect(() => {
    const fetchLiveSeatMatrix = async () => {
      setSmLoading(true);
      try {
        const { data, error } = await supabase
          .from('live_seat_matrix')
          .select('*')
          .order('college_name', { ascending: true })
          .order('branch', { ascending: true });

        if (error) {
          console.warn("Error fetching live_seat_matrix:", error.message);
        } else {
          const mapped = (data || []).map(item => ({
            id: item.id,
            college: item.college_name,
            branch: item.branch,
            total: item.total_seats,
            filled: item.filled_seats,
            vacant: item.vacant_seats,
            ur: item.ur || 0,
            bc: item.bc || 0,
            ebc: item.ebc || 0,
            sc: item.sc || 0,
            st: item.st || 0,
            ews: item.ews || 0,
            rcg: item.rcg || 0,
            dq: item.dq || 0,
            smq: item.smq || 0
          }));
          setSeatMatrixData(mapped);
        }
      } catch (err) {
        console.error("Fetch seat matrix exception:", err);
      } finally {
        setSmLoading(false);
      }
    };
    fetchLiveSeatMatrix();
  }, []);

  useEffect(() => {
    const fetchCutoffs = async () => {
      setLoading(true);
      try {
        let allData = [];
        let from = 0;
        let hasMore = true;
        const limit = 1000;

        while (hasMore) {
          const { data, error } = await supabase
            .from('colleges')
            .select('*')
            .range(from, from + limit - 1)
            .order('id', { ascending: true });

          if (error) throw error;

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            if (data.length < limit) {
              hasMore = false;
            } else {
              from += limit;
            }
          } else {
            hasMore = false;
          }
        }

        // Sort allData by College -> Branch Score -> Category Score -> Closing Rank
        allData.sort((a, b) => {
          // 1. Sort by College Name
          const nameA = (a.college_name || '').trim().toLowerCase();
          const nameB = (b.college_name || '').trim().toLowerCase();
          if (nameA !== nameB) {
            return nameA.localeCompare(nameB);
          }

          // 2. Sort by Branch Score
          const branchScoreA = getBranchScore(a.branch);
          const branchScoreB = getBranchScore(b.branch);
          if (branchScoreA !== branchScoreB) {
            return branchScoreA - branchScoreB;
          }

          // 3. Sort by Category Score (UR -> BC -> EBC -> etc.)
          const catScoreA = getCategorySortScore(a.category);
          const catScoreB = getCategorySortScore(b.category);
          if (catScoreA !== catScoreB) {
            return catScoreA - catScoreB;
          }

          // 4. Sort by Closing Rank
          return (a.closing_rank || 0) - (b.closing_rank || 0);
        });

        setCutoffData(allData);
      } catch (err) {
        console.error('Error fetching cutoffs:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCutoffs();
  }, []);

  // Branch unique list for filters (dynamically filtered by search query)
  const branches = useMemo(() => {
    const searchTokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const normalizedTokens = searchTokens.map(token => token.replace(/\./g, ''));

    const list = new Set();
    cutoffData.forEach(item => {
      const matchesSearch = normalizedTokens.length === 0 || normalizedTokens.every(token => 
        (item.college_name || '').toLowerCase().replace(/\./g, '').includes(token) ||
        (item.branch || '').toLowerCase().replace(/\./g, '').includes(token) ||
        (item.category || '').toLowerCase().replace(/\./g, '').includes(token) ||
        String(item.id).includes(token)
      );

      if (matchesSearch && item.branch) {
        list.add(normalizeBranchName(item.branch));
      }
    });
    return ['All', ...Array.from(list).sort()];
  }, [cutoffData, searchQuery]);

  // Reset selected branch if it's no longer available in the searched college
  useEffect(() => {
    if (selectedBranch !== 'All' && !branches.includes(selectedBranch)) {
      setSelectedBranch('All');
    }
  }, [branches, selectedBranch]);

  const categories = useMemo(() => {
    const list = new Set();
    cutoffData.forEach(item => {
      if (item.category) {
        list.add(item.category.toUpperCase().trim());
      }
    });
    return ['All', ...Array.from(list).sort()];
  }, [cutoffData]);

  // Filter Logic
  const filteredData = useMemo(() => {
    const searchTokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const normalizedTokens = searchTokens.map(token => token.replace(/\./g, ''));

    return cutoffData.filter(item => {
      const matchesSearch = normalizedTokens.length === 0 || normalizedTokens.every(token => 
        (item.college_name || '').toLowerCase().replace(/\./g, '').includes(token) ||
        (item.branch || '').toLowerCase().replace(/\./g, '').includes(token) ||
        (item.category || '').toLowerCase().replace(/\./g, '').includes(token) ||
        String(item.id).includes(token)
      );
      
      const matchesBranch = selectedBranch === 'All' || 
        normalizeBranchName(item.branch).toLowerCase() === selectedBranch.toLowerCase();
      const matchesCategory = selectedCategory === 'All' || 
        (item.category || '').toLowerCase() === selectedCategory.toLowerCase();
      const isRegular = item.exam_type !== 'DCECE LE';

      const year = getYearFromId(item.id);
      const matchesYear = selectedYear === 'All' || String(year) === selectedYear;

      return matchesSearch && matchesBranch && matchesCategory && isRegular && matchesYear;
    });
  }, [searchQuery, selectedBranch, selectedCategory, selectedYear, cutoffData]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBranch, selectedCategory, selectedYear]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end indices for pages around currentPage
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust start/end to show a consistent number of pages
      if (currentPage <= 3) {
        end = 4;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      // Add ellipsis if needed before start
      if (start > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed before end
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  return (
    <main className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-outfit bg-gradient-to-r from-slate-900 via-brand-primary to-purple-800 bg-clip-text text-transparent tracking-tight">
            Admission Cutoffs & Seat Matrix
          </h1>
          <p className="text-slate-500 font-inter text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Access verified historical closing ranks and monitor round-wise vacant seats across Bihar Government Polytechnics.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex justify-center mb-8 select-none">
          <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex gap-2 shadow-sm">
            <button
              onClick={() => setCutoffTab('cutoff')}
              className={`px-5 py-2.5 rounded-xl font-outfit text-sm font-black transition-all cursor-pointer ${
                cutoffTab === 'cutoff'
                  ? 'bg-gradient-to-r from-brand-primary to-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Cutoff Database
            </button>
            <button
              onClick={() => setCutoffTab('seatMatrix')}
              className={`px-5 py-2.5 rounded-xl font-outfit text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                cutoffTab === 'seatMatrix'
                  ? 'bg-gradient-to-r from-brand-primary to-purple-600 text-white shadow-md'
                  : 'text-slate-655 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Live Seat Matrix Tracker</span>
              <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                Mop-up
              </span>
            </button>
          </div>
        </div>

        {cutoffTab === 'cutoff' ? (
          <>
            {/* Filters Card */}
            <div className="glass-premium shadow-sm rounded-2xl p-5 sm:p-6 space-y-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            
            {/* Search */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-slate-505 uppercase tracking-wider font-outfit">Search College</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim() !== '') {
                      setSelectedYear('All');
                    }
                  }}
                  placeholder="Enter college name..."
                  className="pl-9 pr-4 py-3 input-premium text-slate-900 font-inter text-sm w-full"
                />
              </div>
            </div>

            {/* Branch */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-slate-505 uppercase tracking-wider font-outfit">Engineering Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedBranch(val);
                  if (val !== 'All') {
                    setSelectedYear('All');
                  }
                }}
                className="px-3 py-3 input-premium text-slate-900 font-inter text-sm w-full cursor-pointer font-bold animate-transition"
              >
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-slate-505 uppercase tracking-wider font-outfit">Caste Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-3 input-premium text-slate-900 font-inter text-sm w-full cursor-pointer font-bold animate-transition"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Cutoff Year Selector */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold text-slate-505 uppercase tracking-wider font-outfit">Cutoff Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-3 input-premium text-slate-900 font-inter text-sm w-full cursor-pointer font-bold animate-transition"
              >
                <option value="All">All Years</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>

          </div>

          {/* Table Footer Controls */}
          <div className="border-t border-slate-200/40 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs font-semibold bg-slate-100/50 text-slate-600 border border-slate-205 px-3 py-1.5 rounded-full select-none backdrop-blur-xs">
              Results: {filteredData.length} Cutoffs Found
            </span>
            <button className="bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold font-outfit px-5 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs select-none uppercase tracking-wide">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Download PDF Report</span>
            </button>
          </div>

        </div>

        {/* Database Table Container */}
        <div className="glass-premium rounded-2xl shadow-sm hover:border-brand-primary/30 transition-all duration-300 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              {/* Header */}
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-650 font-outfit text-sm select-none">
                  <th className="py-4 px-6 font-bold">ID</th>
                  <th className="py-4 px-6 font-bold">Institute Name</th>
                  <th className="py-4 px-6 font-bold">Year</th>
                  <th className="py-4 px-6 font-bold">Branch</th>
                  <th className="py-4 px-6 font-bold">Category</th>
                  <th className="py-4 px-6 font-bold">Opening Rank</th>
                  <th className="py-4 px-6 font-bold text-brand-primary">Closing Rank</th>
                </tr>
              </thead>
              {/* Rows */}
              <tbody className="divide-y divide-slate-100 font-inter text-slate-600 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 font-semibold">
                      Loading real-time cutoffs from Supabase...
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((row) => {
                     const year = getYearFromId(row.id);
                     let yearBadgeClass = "bg-slate-50 text-slate-500 border border-slate-200";
                     if (year === 2025) yearBadgeClass = "bg-blue-50 text-blue-600 border border-blue-200";
                     else if (year === 2024) yearBadgeClass = "bg-purple-50 text-brand-primary border border-brand-primary/20";
                     else if (year === 2022) yearBadgeClass = "bg-amber-50 text-brand-tertiary border border-amber-250";
                     else if (year === 2021) yearBadgeClass = "bg-teal-50 text-brand-secondary border border-teal-250";
                     else if (year === 2020) yearBadgeClass = "bg-indigo-50 text-indigo-650 border border-indigo-200";

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-4.5 px-6 font-bold text-brand-primary">#{row.id}</td>
                        <td className="py-4.5 px-6 font-semibold text-slate-800">{row.college_name}</td>
                        <td className="py-4.5 px-6">
                          <span className={`text-[10.5px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-outfit ${yearBadgeClass}`}>
                            {year}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded text-xs font-semibold border border-slate-200">
                            {normalizeBranchName(row.branch)}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">{getCategoryBadge(row.category)}</td>
                        <td className="py-4.5 px-6 font-semibold">{row.opening_rank ? row.opening_rank.toLocaleString() : '—'}</td>
                        <td className="py-4.5 px-6 font-extrabold text-brand-primary">{row.closing_rank.toLocaleString()}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-450 font-semibold">
                      No matching cutoffs found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50 select-none">
            <span className="text-xs text-slate-500 font-semibold font-inter">
              Showing {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors font-semibold cursor-pointer text-xs"
              >
                &lt;
              </button>
              {getPageNumbers().map((pageNum, idx) => {
                if (pageNum === '...') {
                  return (
                    <span 
                      key={`ellipsis-${idx}`} 
                      className="px-3 py-1.5 text-slate-400 font-bold text-xs flex items-center select-none"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3.5 py-1.5 border rounded text-xs font-bold transition-colors cursor-pointer ${
                      currentPage === pageNum 
                        ? 'bg-brand-primary border-brand-primary text-white shadow-xs' 
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors font-semibold cursor-pointer text-xs"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </>
      ) : (
        smLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary"></div>
            <p className="text-slate-500 font-bold text-sm font-outfit">Loading Seat Matrix Tracker from Supabase...</p>
          </div>
        ) : seatMatrixData.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full bg-gradient-to-br from-amber-50 to-orange-50/55 border border-amber-200/60 rounded-3xl p-8 sm:p-10 text-center shadow-md space-y-4 animate-fadeIn">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-2xl animate-pulse">
                ⚠️
              </div>
              <h3 className="text-xl font-black font-outfit text-slate-900 tracking-tight">Counselling Has Not Started Yet</h3>
              <p className="text-sm text-slate-650 font-inter leading-relaxed max-w-md mx-auto">
                DCECE Bihar Polytechnic 2026 Choice Filling & Counselling round allocations have not started yet. Once official seat allotment/vacancy lists are released by BCECEB, the Live Seat Matrix & vacancy status will be updated here in real-time.
              </p>
              <div className="pt-2">
                <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest font-outfit">
                  Status: Awaiting Official Notice
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn mb-8">
            {/* Stat Cards Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-outfit">Total Seats</span>
                  <span className="block text-3xl font-black text-slate-900 font-outfit mt-1">
                    {seatMatrixData.reduce((sum, item) => sum + item.total, 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Bihar State Polytechnic Intake</span>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-purple-50 text-brand-primary border border-purple-100 flex items-center justify-center font-bold text-lg">
                  🏫
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-outfit">Allotted Seats</span>
                  <span className="block text-3xl font-black text-emerald-600 font-outfit mt-1">
                    {seatMatrixData.reduce((sum, item) => sum + item.filled, 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                    {seatMatrixData.reduce((sum, item) => sum + item.total, 0) > 0 
                      ? ((seatMatrixData.reduce((sum, item) => sum + item.filled, 0) / seatMatrixData.reduce((sum, item) => sum + item.total, 0)) * 100).toFixed(1) 
                      : 0}% Filled
                  </span>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-outfit">Vacant Seats</span>
                  <span className="block text-3xl font-black text-rose-500 font-outfit mt-1">
                    {seatMatrixData.reduce((sum, item) => sum + item.vacant, 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-rose-500 font-semibold mt-1 block">Available for Counselling</span>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center font-bold text-lg">
                  ⚠️
                </div>
              </div>
            </div>

            {/* Category Vacancy Counters Grid */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 select-none">
              <h4 className="text-sm font-extrabold font-outfit text-slate-900 mb-4 flex items-center gap-2">
                <span>⚡ Category-wise Vacancies</span>
                <span className="bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider animate-pulse">Live</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { label: 'UR', count: seatMatrixData.reduce((sum, item) => sum + (item.ur || 0), 0), color: 'border-slate-350 bg-white text-slate-800' },
                  { label: 'EBC', count: seatMatrixData.reduce((sum, item) => sum + (item.ebc || 0), 0), color: 'border-amber-250 bg-amber-50 text-amber-805' },
                  { label: 'BC', count: seatMatrixData.reduce((sum, item) => sum + (item.bc || 0), 0), color: 'border-emerald-250 bg-emerald-50 text-emerald-850' },
                  { label: 'SC', count: seatMatrixData.reduce((sum, item) => sum + (item.sc || 0), 0), color: 'border-rose-250 bg-rose-50 text-rose-800' },
                  { label: 'EWS', count: seatMatrixData.reduce((sum, item) => sum + (item.ews || 0), 0), color: 'border-purple-200 bg-purple-50 text-brand-primary' },
                  { label: 'ST', count: seatMatrixData.reduce((sum, item) => sum + (item.st || 0), 0), color: 'border-cyan-200 bg-cyan-50 text-cyan-805' },
                  { label: 'RCG', count: seatMatrixData.reduce((sum, item) => sum + (item.rcg || 0), 0), color: 'border-pink-200 bg-pink-50 text-pink-850' }
                ].map((item) => (
                  <div key={item.label} className={`border rounded-xl p-3 text-center space-y-1 shadow-sm ${item.color}`}>
                    <span className="text-[11px] font-black font-outfit block uppercase tracking-wider">{item.label}</span>
                    <span className="text-base font-black font-outfit block">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Filter Controls */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit">Search College / Branch</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={smQuery}
                    onChange={(e) => setSmQuery(e.target.value)}
                    placeholder="Search e.g. Patna, Civil..."
                    className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-850 rounded-lg outline-none font-inter text-sm w-full focus:border-brand-primary focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit">Select Branch</label>
                <select
                  value={smBranch}
                  onChange={(e) => setSmBranch(e.target.value)}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-inter text-sm text-slate-800 cursor-pointer focus:border-brand-primary transition-all"
                >
                  <option value="All">All Branches</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electronics Engineering">Electronics Engineering</option>
                  <option value="Automobile Engineering">Automobile Engineering</option>
                </select>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center select-none">
                <div>
                  <h4 className="font-extrabold font-outfit text-slate-900 text-sm">Detailed Vacancy Seat Matrix</h4>
                  <p className="text-[11px] text-slate-400 font-inter mt-0.5">Real-time status of remaining intake after regular rounds.</p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                  Matches: {
                    seatMatrixData.filter(item => {
                      const matchesSearch = smQuery.trim() === '' || 
                        item.college.toLowerCase().includes(smQuery.toLowerCase()) ||
                        item.branch.toLowerCase().includes(smQuery.toLowerCase());
                      const matchesBranch = smBranch === 'All' || 
                        item.branch.toLowerCase() === smBranch.toLowerCase();
                      return matchesSearch && matchesBranch;
                    }).length
                  } choices
                </span>
              </div>

              {seatMatrixData.filter(item => {
                const matchesSearch = smQuery.trim() === '' || 
                  item.college.toLowerCase().includes(smQuery.toLowerCase()) ||
                  item.branch.toLowerCase().includes(smQuery.toLowerCase());
                const matchesBranch = smBranch === 'All' || 
                  item.branch.toLowerCase() === smBranch.toLowerCase();
                return matchesSearch && matchesBranch;
              }).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-650 uppercase">
                        <th className="py-3 px-4 font-outfit font-bold">College Name</th>
                        <th className="py-3 px-4 font-outfit font-bold">Branch</th>
                        <th className="py-3 px-4 text-center font-outfit font-bold">Intake</th>
                        <th className="py-3 px-4 text-center font-outfit font-bold">Filled</th>
                        <th className="py-3 px-4 text-center text-rose-500 font-black font-outfit">Vacant</th>
                        <th className="py-3 px-4 w-40 font-outfit font-bold">Fill Progress</th>
                        <th className="py-3 px-4 text-center font-outfit font-bold">Category Vacancies</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-inter text-slate-700">
                      {seatMatrixData.filter(item => {
                        const matchesSearch = smQuery.trim() === '' || 
                          item.college.toLowerCase().includes(smQuery.toLowerCase()) ||
                          item.branch.toLowerCase().includes(smQuery.toLowerCase());
                        const matchesBranch = smBranch === 'All' || 
                          item.branch.toLowerCase() === smBranch.toLowerCase();
                        return matchesSearch && matchesBranch;
                      }).map((item, idx) => {
                        const fillPercent = item.total > 0 ? Math.round((item.filled / item.total) * 100) : 0;
                        return (
                          <tr key={`seat-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">{item.college}</td>
                            <td className="py-3 px-4 font-medium text-slate-600">{item.branch}</td>
                            <td className="py-3 px-4 text-center font-bold text-slate-800">{item.total}</td>
                            <td className="py-3 px-4 text-center font-bold text-emerald-600">{item.filled}</td>
                            <td className="py-3 px-4 text-center font-bold text-rose-500">{item.vacant}</td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                  <span>{fillPercent}% Filled</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      fillPercent >= 90 ? 'bg-emerald-500' : fillPercent >= 75 ? 'bg-teal-500' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${fillPercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-1.5 font-outfit text-[9px] font-bold">
                                {item.ur > 0 && <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">UR:{item.ur}</span>}
                                {item.ebc > 0 && <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">EBC:{item.ebc}</span>}
                                {item.bc > 0 && <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">BC:{item.bc}</span>}
                                {item.sc > 0 && <span className="bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded border border-rose-200">SC:{item.sc}</span>}
                                {item.ews > 0 && <span className="bg-purple-50 text-brand-primary px-1.5 py-0.5 rounded border border-purple-100">EWS:{item.ews}</span>}
                                {item.st > 0 && <span className="bg-cyan-50 text-cyan-800 px-1.5 py-0.5 rounded border border-cyan-150">ST:{item.st}</span>}
                                {item.rcg > 0 && <span className="bg-pink-50 text-pink-850 px-1.5 py-0.5 rounded border border-pink-150">RCG:{item.rcg}</span>}
                                {item.vacant === 0 && <span className="text-slate-400 italic font-medium">No vacancy</span>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-slate-500 font-medium">No vacancy seat matrix choices match your search terms.</p>
                </div>
              )}
            </div>
          </div>
        )
      )}

        {/* Bottom Three Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 hover:border-brand-primary/30 rounded-2xl p-6 shadow-xs hover:scale-[1.015] transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary border border-brand-primary/20">
                <LineChart className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold font-outfit text-slate-800 text-base">Cutoff Trends</h4>
                <p className="text-slate-500 font-inter text-[13px] leading-relaxed">
                  Analyze how cutoffs have changed over the last 3 years. Computer science cutoffs have seen a 12% rise since 2021.
                </p>
              </div>
            </div>
            <a href="#" className="inline-flex items-center gap-1 mt-6 text-[13px] font-bold font-outfit text-brand-primary hover:text-brand-primary-hover self-start group">
              <span>View Charts</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Card 2 (Highlighted) */}
          <div className="bg-brand-primary/5 border-2 border-brand-primary rounded-2xl p-6 shadow-xs hover:scale-[1.015] transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-10px] text-brand-primary/5 pointer-events-none select-none">
              <GraduationCap className="h-24 w-24" />
            </div>
            <div className="space-y-4">
              <div className="h-10 w-10 bg-brand-primary/15 rounded-lg flex items-center justify-center text-brand-primary border border-brand-primary/25">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold font-outfit text-brand-primary text-base">Admission Guide</h4>
                <p className="text-slate-650 font-inter text-[13px] leading-relaxed">
                  Unsure about the CAP round process? Download our comprehensive 2024 admission handbook for step-by-step guidance.
                </p>
              </div>
            </div>
            <a href="#" className="inline-flex items-center gap-1 mt-6 text-[13px] font-bold font-outfit text-brand-primary hover:text-brand-primary-hover self-start group">
              <span>Read Guide</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 hover:border-brand-primary/30 rounded-2xl p-6 shadow-xs hover:scale-[1.015] transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-10 w-10 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary border border-brand-primary/20">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold font-outfit text-slate-800 text-base">Expert Support</h4>
                <p className="text-slate-500 font-inter text-[13px] leading-relaxed">
                  Get personalized counseling from our career experts to choose the right college based on your specific rank.
                </p>
              </div>
            </div>
            <a href="#" className="inline-flex items-center gap-1 mt-6 text-[13px] font-bold font-outfit text-brand-primary hover:text-brand-primary-hover self-start group">
              <span>Contact Us</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Cutoff;
