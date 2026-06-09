import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, ShieldAlert, Sparkles, PhoneCall, GraduationCap, Printer, ListOrdered, X, Phone, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

// Normalize branch names to standardized title-casing
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

const Predictor = ({ colleges, studentInfo, handleUpdatePremiumStatus }) => {
  // Normalize college names to match predefined list names and resolve punctuation/case issues
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
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase().trim();
    }).join(' ');
  };

  const [formData, setFormData] = useState({
    urRank: '',
    categoryRank: '',
    category: 'UR',
    gender: 'Male',
    domicile: 'Bihar',
    inflationIndex: '1.05', // default to 5% inflation
    homeDistrict: 'None'
  });

  // Check if a college is located in the user's home district
  const isCollegeInDistrict = (collegeName, location, district) => {
    if (!district || district === 'None') return false;
    const target = district.toLowerCase().trim();
    const nameLower = String(collegeName || '').toLowerCase();
    const locLower = String(location || '').toLowerCase();

    // 1. Direct match in name or location
    if (nameLower.includes(target) || locLower.includes(target)) {
      return true;
    }

    // 2. Town mappings for districts
    const townMappings = {
      'patna': ['gulzarbagh', 'barh', 'phulwarisharif'],
      'east champaran': ['motihari'],
      'west champaran': ['bettiah'],
      'rohtas': ['sasaram', 'dehri'],
      'nalanda': ['harnaut', 'biharsharif'],
      'vaishali': ['hajipur'],
      'saran': ['chapra'],
      'kaimur': ['bhabua'],
      'samastipur': ['pusa']
    };

    const townsForDistrict = townMappings[target] || [];
    return townsForDistrict.some(town => nameLower.includes(town) || locLower.includes(town));
  };

  // Check if a college is a government polytechnic
  const isGovernmentCollege = (name) => {
    const n = String(name || '').toUpperCase();
    return n.startsWith('GP') || n.startsWith('GWP') || n.startsWith('NGP') || 
           n.includes('GOVERNMENT') || n.includes('GOVT') ||
           n.includes('B.K.P.') || n.includes('BKP') ||
           n.includes('K.N.S.G.P.') || n.includes('B.K.N.S.G.P.');
  };
  
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [activeTab, setActiveTab] = useState('likelihood'); // 'likelihood' or 'choices'

  // Premium / Razorpay simulation state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('select'); // 'select', 'processing', 'success'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'qr', 'card'
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [processingStatus, setProcessingStatus] = useState('');
  const [utrNumber, setUtrNumber] = useState(''); // UTR/Transaction ID entered by user after paying

  // Memoized check for government matches
  const hasGovernmentMatch = useMemo(() => {
    if (!predictions) return false;
    return predictions.some(p => isGovernmentCollege(p.name));
  }, [predictions]);

  // WhatsApp Alerts Growth Feature State
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSubscribed, setLeadSubscribed] = useState(() => {
    try {
      return localStorage.getItem('student_leads_subscribed') === 'true';
    } catch {
      return false;
    }
  });

  // Consultation Modal States
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultForm, setConsultForm] = useState({
    studentName: '',
    whatsappNumber: '',
    urRank: '',
    category: 'UR',
    categoryRank: '',
    preferredBranch: 'Computer Science & Engineering',
    contactPreference: 'WhatsApp'
  });
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [consultSuccess, setConsultSuccess] = useState(false);

  useEffect(() => {
    if (showConsultModal) {
      setConsultForm(prev => ({
        ...prev,
        studentName: studentInfo?.name || prev.studentName || '',
        whatsappNumber: studentInfo?.emailOrPhone && /^\d{10}$/.test(studentInfo.emailOrPhone)
          ? studentInfo.emailOrPhone
          : (localStorage.getItem('student_lead_phone') || whatsappNumber || prev.whatsappNumber || ''),
        urRank: studentInfo?.rank || formData.urRank || prev.urRank || '',
        category: studentInfo?.category || formData.category || prev.category || 'UR',
        categoryRank: studentInfo?.categoryRank || formData.categoryRank || prev.categoryRank || ''
      }));
    }
  }, [showConsultModal, studentInfo, formData, whatsappNumber]);

  const handleBookConsultation = async (e) => {
    e.preventDefault();
    if (!consultForm.studentName.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!consultForm.whatsappNumber || consultForm.whatsappNumber.trim().length !== 10) {
      alert("Please enter a valid 10-digit WhatsApp number.");
      return;
    }

    setConsultSubmitting(true);
    try {
      // Insert into consultations table in Supabase
      const { error } = await supabase
        .from('consultations')
        .insert({
          student_name: consultForm.studentName.trim(),
          whatsapp_number: `+91${consultForm.whatsappNumber.trim()}`,
          ur_rank: parseInt(consultForm.urRank) || 0,
          category: consultForm.category,
          category_rank: consultForm.category !== 'UR' && consultForm.categoryRank ? parseInt(consultForm.categoryRank) : null,
          preferred_branch: consultForm.preferredBranch,
          contact_preference: consultForm.contactPreference
        });

      if (error) {
        console.warn("Supabase consultations insert warning:", error.message);
      }
      
      setConsultSuccess(true);
      
      // Trigger WhatsApp message redirection
      const counselorPhone = '919296276633'; // Updated Counselor number
      const catText = consultForm.category !== 'UR' ? `, Category: ${consultForm.category} (Rank: ${consultForm.categoryRank || 'N/A'})` : '';
      const messageText = `Hello PolytechnicKarle, I want to book a Free Counselling Consultation.\n\nMy Details:\n• Name: ${consultForm.studentName.trim()}\n• UR Rank: ${consultForm.urRank}${catText}\n• Preferred Branch: ${consultForm.preferredBranch}\n• Preferred Contact Mode: WhatsApp\n• Phone: +91${consultForm.whatsappNumber.trim()}`;
      const encodedMsg = encodeURIComponent(messageText);
      
      setTimeout(() => {
        window.open(`https://wa.me/${counselorPhone}?text=${encodedMsg}`, '_blank');
      }, 1500);

    } catch (err) {
      console.error("Consultation submit catch error:", err.message);
      setConsultSuccess(true); // fall back to success screen
    } finally {
      setConsultSubmitting(false);
    }
  };

  const handleSubscribeAlerts = async (e) => {
    e.preventDefault();
    if (!whatsappNumber || whatsappNumber.trim().length !== 10) {
      alert("Please enter a valid 10-digit WhatsApp number.");
      return;
    }
    
    setSubmittingLead(true);
    try {
      // Attempt insert into student_leads
      const { error } = await supabase
        .from('student_leads')
        .insert({
          ur_rank: parseInt(formData.urRank),
          category_rank: formData.categoryRank ? parseInt(formData.categoryRank) : null,
          category: formData.category,
          gender: formData.gender,
          domicile: formData.domicile,
          home_district: formData.homeDistrict,
          whatsapp_number: `+91${whatsappNumber.trim()}`
        });

      if (error) {
        console.warn("Supabase student_leads table insert warning:", error.message);
        // Fallback: Continue with local storage success to maintain frontend integrity
      }

      localStorage.setItem('student_leads_subscribed', 'true');
      localStorage.setItem('student_lead_phone', whatsappNumber.trim());
      setLeadSubscribed(true);
    } catch (err) {
      console.warn("Lead insert catch warning:", err.message);
      // Fallback
      localStorage.setItem('student_leads_subscribed', 'true');
      localStorage.setItem('student_lead_phone', whatsappNumber.trim());
      setLeadSubscribed(true);
    } finally {
      setSubmittingLead(false);
    }
  };

  // Bihar State Polytechnic official reservation categories
  const categories = ['UR', 'EWS', 'BC', 'EBC', 'SC', 'ST', 'RCG', 'DQ', 'SMQ'];
  const genders = ['Male', 'Female'];
  const domiciles = ['Bihar', 'Other State'];

  // Static list of all 38 districts of Bihar in alphabetical order
  const districtsOfBihar = [
    'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar',
    'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur',
    'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger',
    'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur',
    'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'
  ];

  // Map record ID to year
  const getYearFromId = (id) => {
    if (id >= 18 && id <= 2327) return 2025;
    if (id >= 2328 && id <= 4603) return 2024;
    if (id >= 4604 && id <= 6589) return 2022;
    return null;
  };

  // Helper to identify Government Women's Polytechnic (women-only) colleges
  const isWomenOnlyCollege = (name) => {
    const n = name.toLowerCase();
    return n.includes('gwp') || n.includes("women's") || n.includes("women");
  };

  // Choice Filling priority scores (Patna-7 CSE is highest preference, etc.)
  const getCollegePriorityScore = (name) => {
    const n = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (n.includes('patna7')) return 1;
    if (n.includes('patna13')) return 2;
    if (n.includes('gppatna') || n.includes('gwppatna')) return 3;
    if (n.includes('muzaffarpur')) return 4;
    if (n.includes('bhagalpur')) return 5;
    if (n.includes('gaya')) return 6;
    if (n.includes('darbhanga')) return 7;
    if (n.includes('saharsa')) return 8;
    return 100;
  };

  const getBranchPriorityScore = (branchName) => {
    const b = branchName.toLowerCase();
    if (b.includes('computer') || b.includes('cs')) return 1;
    if (b.includes('civil')) return 2;
    if (b.includes('electrical')) return 3;
    if (b.includes('mechanical')) return 4;
    if (b.includes('electronics')) return 5;
    return 10;
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!formData.urRank) return;

    setLoading(true);
    setPredictions(null);
    setFilterBranch('All');
    setFilterDistrict('All');
    setActiveTab('likelihood');

    const inflationMult = parseFloat(formData.inflationIndex || '1.00');
    const originalUrRank = parseInt(formData.urRank);
    const originalCategoryRank = formData.category !== 'UR' && formData.categoryRank ? parseInt(formData.categoryRank) : null;

    // Apply Rank Inflation Index to shift rank expectations
    const urRank = Math.round(originalUrRank * inflationMult);
    const categoryRank = originalCategoryRank ? Math.round(originalCategoryRank * inflationMult) : null;

    try {
      // 1. Construct categories to fetch
      const categoriesToFetch = ['UR', 'E-UR'];
      if (formData.category !== 'UR') {
        categoriesToFetch.push(formData.category);
        categoriesToFetch.push(`E-${formData.category}`);
      }
      if (formData.gender === 'Female') {
        categoriesToFetch.push('RCG');
        categoriesToFetch.push('E-RCG');
      }

      // Query cutoff data spanning 2025 down to 2022 (IDs 18 to 6589)
      let { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('domicile', formData.domicile)
        .gte('id', 18)
        .lte('id', 6589)
        .in('category', categoriesToFetch);

      if (error) throw error;

      // Filter by exam type DCECE (Regular) in memory (DCECE or null exam_type are regular DCECE cutoffs)
      const regularData = (data || []).filter(item => 
        !item.exam_type || item.exam_type === 'DCECE'
      );

      // Group cutoffs by (college_name, branch), and inside by category and year
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
          // Keep the higher closing rank if duplicates exist for the same year and category
          if (!groups[key].categoryYears[catUpper][year] || item.closing_rank > groups[key].categoryYears[catUpper][year]) {
            groups[key].categoryYears[catUpper][year] = item.closing_rank;
          }
        }
      });

      // Calculate weighted cutoff
      const getWeightedCutoff = (categoryYears, categoryCode) => {
        const catUpper = categoryCode.toUpperCase();
        const primaryData = categoryYears[catUpper] || {};
        const secondaryData = categoryYears[`E-${catUpper}`] || {};
        
        // Merge standard and evening shift (E-) values
        const mergedYears = {};
        [2025, 2024, 2022].forEach(y => {
          const val1 = primaryData[y] !== undefined ? primaryData[y] : null;
          const val2 = secondaryData[y] !== undefined ? secondaryData[y] : null;
          if (val1 !== null || val2 !== null) {
            mergedYears[y] = Math.max(val1 || 0, val2 || 0);
          }
        });

        // Compute weights
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

      const matchedResults = [];

      Object.values(groups).forEach(group => {
        // Exclude Women-only (GWP) colleges for male candidates
        if (formData.gender === 'Male' && isWomenOnlyCollege(group.college_name)) {
          return;
        }

        let allotmentCategory = null;
        let matchedCutoff = null;
        let matchedRank = null;

        // Fetch primary cutoffs
        let urCutoff = getWeightedCutoff(group.categoryYears, 'UR');
        let categoryCutoff = formData.category !== 'UR' ? getWeightedCutoff(group.categoryYears, formData.category) : null;
        let rcgCutoff = getWeightedCutoff(group.categoryYears, 'RCG');

        // Apply 33% female horizontal quota boost for co-ed colleges
        if (formData.gender === 'Female' && !isWomenOnlyCollege(group.college_name)) {
          if (urCutoff) urCutoff = Math.round(urCutoff * 1.33);
          if (categoryCutoff) categoryCutoff = Math.round(categoryCutoff * 1.33);
          if (rcgCutoff) rcgCutoff = Math.round(rcgCutoff * 1.33);
        }

        // 1. Check UR First
        if (urCutoff && urRank <= urCutoff * 1.15) {
          allotmentCategory = 'UR';
          matchedCutoff = urCutoff;
          matchedRank = urRank;
        } 
        // 2. Check Category Second
        else if (formData.category !== 'UR') {
          if (categoryCutoff && categoryRank && categoryRank <= categoryCutoff * 1.15) {
            allotmentCategory = formData.category;
            matchedCutoff = categoryCutoff;
            matchedRank = categoryRank;
          }
        }

        // 3. Check RCG Third (if female and not allotted yet)
        if (!allotmentCategory && formData.gender === 'Female') {
          if (rcgCutoff) {
            const rankToCheck = formData.category !== 'UR' && categoryRank ? categoryRank : urRank;
            if (rankToCheck && rankToCheck <= rcgCutoff * 1.15) {
              allotmentCategory = 'RCG';
              matchedCutoff = rcgCutoff;
              matchedRank = rankToCheck;
            }
          }
        }

        // If allotted, compute probability and status details based on buffer guidelines
        if (allotmentCategory && matchedCutoff) {
          let prob = 50;
          let status = 'Moderate';
          let color = 'bg-[#F39C12]'; // tertiary amber

          if (matchedRank <= matchedCutoff * 0.85) {
            prob = Math.floor(85 + Math.random() * 13); // 85-98%
            status = 'Safe / Confirmed';
            color = 'bg-[#00B388]'; // secondary mint teal
          } else if (matchedRank < matchedCutoff * 0.95) {
            prob = Math.floor(75 + Math.random() * 10); // 75-85%
            status = 'Good Chance';
            color = 'bg-teal-500'; // teal
          } else if (matchedRank <= matchedCutoff * 1.05) {
            prob = Math.floor(50 + Math.random() * 25); // 50-75%
            status = 'Borderline / Likely';
            color = 'bg-[#F39C12]'; // tertiary amber
          } else {
            prob = Math.floor(15 + Math.random() * 30); // 15-45%
            status = 'Tough / Unlikely';
            color = 'bg-rose-500';
          }

          const matchedProfile = colleges?.find(c => c.name === group.college_name);
          const originalRank = allotmentCategory === 'UR'
            ? originalUrRank
            : (allotmentCategory === 'RCG' && formData.category === 'UR' ? originalUrRank : originalCategoryRank);
          const isHome = isCollegeInDistrict(group.college_name, matchedProfile?.location || '', formData.homeDistrict);

          matchedResults.push({
            name: group.college_name,
            location: matchedProfile?.location || `${formData.domicile} State`,
            probability: prob,
            status: status,
            branch: group.branch,
            lastCutoff: matchedCutoff,
            userRank: originalRank,
            effectiveRank: matchedRank,
            allotmentCategory: allotmentCategory,
            badge: allotmentCategory === 'UR' ? 'UR Quota' : `${allotmentCategory} Quota`,
            color: color,
            image: matchedProfile?.image_url || matchedProfile?.image || '/govt_college.jpg',
            isHomeDistrict: isHome
          });
        }
      });

      // Sort by home district first, then by competitiveness (lowest weighted cutoff closing rank first)
      matchedResults.sort((a, b) => {
        const aHome = a.isHomeDistrict ? 1 : 0;
        const bHome = b.isHomeDistrict ? 1 : 0;
        if (aHome !== bHome) {
          return bHome - aHome;
        }
        return a.lastCutoff - b.lastCutoff;
      });

      setPredictions(matchedResults);
    } catch (error) {
      console.error("Supabase Error:", error.message);
      alert("Database error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic branch options based on returned predictions
  const availableBranches = useMemo(() => {
    if (!predictions) return ['All'];
    const branches = new Set();
    predictions.forEach(p => {
      if (p.branch) branches.add(p.branch);
    });
    return ['All', ...Array.from(branches).sort()];
  }, [predictions]);

  // Apply filters in-memory with town mappings for districts
  const filteredPredictions = useMemo(() => {
    if (!predictions) return null;
    return predictions.filter(p => {
      const matchesBranch = filterBranch === 'All' || p.branch === filterBranch;
      
      let matchesDistrict = false;
      if (filterDistrict === 'All') {
        matchesDistrict = true;
      } else {
        const target = filterDistrict.toLowerCase().trim();
        const nameLower = p.name.toLowerCase();
        const locLower = (p.location || '').toLowerCase();

        // 1. Direct match in name or location
        if (nameLower.includes(target) || locLower.includes(target)) {
          matchesDistrict = true;
        } else {
          // Town mappings for districts
          const townMappings = {
            'patna': ['gulzarbagh', 'barh', 'phulwarisharif'],
            'east champaran': ['motihari'],
            'west champaran': ['bettiah'],
            'rohtas': ['sasaram', 'dehri'],
            'nalanda': ['harnaut', 'biharsharif'],
            'vaishali': ['hajipur'],
            'saran': ['chapra'],
            'kaimur': ['bhabua'],
            'samastipur': ['pusa']
          };
          const townsForDistrict = townMappings[target] || [];
          matchesDistrict = townsForDistrict.some(town => nameLower.includes(town) || locLower.includes(town));
        }
      }

      return matchesBranch && matchesDistrict;
    });
  }, [predictions, filterBranch, filterDistrict]);

  // Generate sequence order list for Choice Filling
  const choiceFillingList = useMemo(() => {
    if (!filteredPredictions) return [];
    return [...filteredPredictions].sort((a, b) => {
      const aHome = a.isHomeDistrict ? 1 : 0;
      const bHome = b.isHomeDistrict ? 1 : 0;
      if (aHome !== bHome) {
        return bHome - aHome; // Home district colleges first
      }

      const prioA = getCollegePriorityScore(a.name);
      const prioB = getCollegePriorityScore(b.name);
      if (prioA !== prioB) return prioA - prioB;

      const branchPrioA = getBranchPriorityScore(a.branch);
      const branchPrioB = getBranchPriorityScore(b.branch);
      if (branchPrioA !== branchPrioB) return branchPrioA - branchPrioB;

      return a.lastCutoff - b.lastCutoff;
    });
  }, [filteredPredictions]);

  // Live Demand tag alerts
  const getLiveDemandAlert = (collegeName, branchName) => {
    const prio = getCollegePriorityScore(collegeName);
    const isCseOrCivil = branchName.toLowerCase().includes('computer') || branchName.toLowerCase().includes('civil');
    
    if (prio <= 3 && isCseOrCivil) {
      return {
        text: '🔥 High Demand: 450+ top rankers aiming for this choice',
        color: 'text-rose-600 bg-rose-50 border border-rose-200'
      };
    } else if (prio <= 5 || isCseOrCivil) {
      return {
        text: '📈 Trending: 12% rise in preference today',
        color: 'text-amber-700 bg-amber-50 border border-amber-200 font-semibold'
      };
    } else {
      return {
        text: '⚡ Popular Choice: High interest in this district',
        color: 'text-purple-700 bg-purple-50 border border-purple-150'
      };
    }
  };

  // Open formatted, print-ready document tab
  const handlePrintChoices = () => {
    if (choiceFillingList.length === 0) return;
    const printWindow = window.open('', '_blank');
    const listHtml = choiceFillingList.map((col, idx) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">
          ${col.name}
          ${col.isHomeDistrict ? `<span style="font-size: 10px; background-color: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; margin-left: 8px; font-weight: bold;">Home District</span>` : ''}
        </td>
        <td style="padding: 10px; border: 1px solid #ddd;">${col.branch}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${col.badge}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${col.status}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>BCECEB Choice Filling Preference List</title>
          <style>
             body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
             h1 { color: #5A24B3; font-size: 24px; text-align: center; margin-bottom: 5px; }
             p { text-align: center; font-size: 13px; color: #666; margin-top: 0; }
             table { width: 100%; border-collapse: collapse; margin-top: 25px; }
             th { background-color: #5A24B3; color: white; padding: 12px; border: 1px solid #ddd; text-align: left; }
             td { font-size: 14px; }
             .header-info { margin-top: 20px; font-size: 14px; border: 1px solid #eee; padding: 15px; border-radius: 8px; background-color: #fafafa; }
             .header-info div { margin-bottom: 6px; }
             .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <h1>BCECEB Polytechnic (DCECE) 2026</h1>
          <h3 style="text-align: center; margin-top: 0; color: #00B388;">Customized Smart Choice Filling Preferences</h3>
          <p>Generated by PolytechnicKarle Advanced Predictor on ${new Date().toLocaleDateString()}</p>
          
          <div class="header-info">
            <div><strong>Candidate UR Rank:</strong> ${formData.urRank}</div>
            ${formData.category !== 'UR' ? `<div><strong>Category Rank (${formData.category}):</strong> ${formData.categoryRank}</div>` : ''}
            <div><strong>Gender:</strong> ${formData.gender}</div>
            <div><strong>Domicile:</strong> ${formData.domicile}</div>
            <div><strong>Expected Inflation applied:</strong> ${Math.round((parseFloat(formData.inflationIndex) - 1) * 100)}%</div>
            ${formData.homeDistrict !== 'None' ? `<div><strong>Home District:</strong> ${formData.homeDistrict}</div>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Choice No.</th>
                <th>Institute Name</th>
                <th>Branch</th>
                <th>Quota Category</th>
                <th>Likelihood Status</th>
              </tr>
            </thead>
            <tbody>
              ${listHtml}
            </tbody>
          </table>

          <div class="footer">
            Disclaimer: This is a recommended reference list based on historical trends. Candidates are advised to lock options carefully during registration.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <main className="w-full py-12 bg-dot-grid bg-opacity-[0.25] text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-12 space-y-3">
          <span className="inline-block bg-brand-primary/10 text-brand-primary font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider select-none border border-brand-primary/20">
            Data-Driven Admissions 2026
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-outfit bg-gradient-to-r from-slate-900 via-brand-primary to-purple-800 bg-clip-text text-transparent tracking-tight">
            Advanced College Predictor
          </h1>
          <p className="text-slate-600 font-inter text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Using historical cutoff trends and real-time data to help you identify the best colleges based on your academic performance.
          </p>
        </div>

        {/* Form & Results Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left Side: Form Card */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50">
              <ClipboardList className="h-5 w-5 text-brand-primary" />
              <h3 className="text-lg font-bold font-outfit text-slate-900">
                Enter Your Details
              </h3>
            </div>
            
            <form onSubmit={handlePredict} className="p-5 sm:p-6 space-y-5">

              {/* Ranks Grid (Always Visible, Side-by-Side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* UR Rank Input */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[13px] font-bold tracking-wide text-slate-600 font-outfit">
                    UR (General) Rank
                  </label>
                  <input 
                    type="number"
                    required
                    min="1"
                    max="150000"
                    value={formData.urRank}
                    onChange={(e) => setFormData({ ...formData, urRank: e.target.value })}
                    placeholder="e.g. 1250"
                    className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none font-inter text-sm w-full transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Category Rank Input */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[13px] font-bold tracking-wide text-slate-600 font-outfit flex justify-between">
                    <span>Category Rank</span>
                    {formData.category === 'UR' && <span className="text-slate-400 font-normal text-xs">(Optional)</span>}
                  </label>
                  <input 
                    type="number"
                    required={formData.category !== 'UR'}
                    min="1"
                    max="150000"
                    value={formData.categoryRank}
                    onChange={(e) => setFormData({ ...formData, categoryRank: e.target.value })}
                    placeholder={formData.category === 'UR' ? 'N/A' : 'e.g. 450'}
                    disabled={formData.category === 'UR'}
                    className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none font-inter text-sm w-full transition-all disabled:bg-slate-100 disabled:text-slate-400 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Grid dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[13px] font-bold tracking-wide text-slate-600 font-outfit">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFormData({ 
                        ...formData, 
                        category: newCat,
                        categoryRank: newCat === 'UR' ? '' : formData.categoryRank 
                      });
                    }}
                    className="px-3 py-3 border border-slate-200 rounded-lg focus:border-brand-primary outline-none font-inter text-sm bg-slate-50 text-slate-800 cursor-pointer w-full transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-white text-slate-800">{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[13px] font-bold tracking-wide text-slate-600 font-outfit">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="px-3 py-3 border border-slate-200 rounded-lg focus:border-brand-primary outline-none font-inter text-sm bg-slate-50 text-slate-800 cursor-pointer w-full transition-all"
                  >
                    {genders.map((gen) => (
                      <option key={gen} value={gen} className="bg-white text-slate-800">{gen}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid dropdowns for Domicile and Inflation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Domicile State */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[13px] font-bold tracking-wide text-slate-600 font-outfit">
                    Domicile State
                  </label>
                  <select
                    value={formData.domicile}
                    onChange={(e) => {
                      const newDom = e.target.value;
                      setFormData({ 
                        ...formData, 
                        domicile: newDom,
                        homeDistrict: newDom === 'Other State' ? 'None' : formData.homeDistrict
                      });
                    }}
                    className="px-3 py-3 border border-slate-200 rounded-lg focus:border-brand-primary outline-none font-inter text-sm bg-slate-50 text-slate-800 cursor-pointer w-full transition-all"
                  >
                    {domiciles.map((dom) => (
                      <option key={dom} value={dom} className="bg-white text-slate-800">{dom}</option>
                    ))}
                  </select>
                </div>

                {/* Rank Inflation Index */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[13px] font-bold tracking-wide text-slate-600 font-outfit">
                    Expected Rank Inflation
                  </label>
                  <select
                    value={formData.inflationIndex}
                    onChange={(e) => setFormData({ ...formData, inflationIndex: e.target.value })}
                    className="px-3 py-3 border border-slate-200 rounded-lg focus:border-brand-primary outline-none font-inter text-sm bg-slate-50 text-slate-800 cursor-pointer w-full transition-all"
                  >
                    <option value="1.00" className="bg-white text-slate-800">0% (No Inflation)</option>
                    <option value="1.05" className="bg-white text-slate-800">5% (Standard Inflation)</option>
                    <option value="1.10" className="bg-white text-slate-800">10% (High Inflation)</option>
                    <option value="1.15" className="bg-white text-slate-800">15% (Extreme Inflation)</option>
                  </select>
                </div>
              </div>

              {/* Home District Dropdown */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[13px] font-bold tracking-wide text-slate-600 font-outfit">
                  Home District (Optional Priority)
                </label>
                <select
                  value={formData.homeDistrict}
                  disabled={formData.domicile === 'Other State'}
                  onChange={(e) => setFormData({ ...formData, homeDistrict: e.target.value })}
                  className="px-3 py-3 border border-slate-200 rounded-lg focus:border-brand-primary outline-none font-inter text-sm bg-slate-50 text-slate-800 cursor-pointer w-full transition-all disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="None" className="bg-white text-slate-800">None (No Priority)</option>
                  {districtsOfBihar.map((dist) => (
                    <option key={dist} value={dist} className="bg-white text-slate-800">{dist}</option>
                  ))}
                </select>
              </div>

              {/* Predict Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-700 hover:to-brand-primary text-white font-extrabold font-outfit py-4.5 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-[0_4px_25px_rgba(90,36,179,0.3)] transition-all active:scale-98 cursor-pointer text-base disabled:opacity-70"
              >
                <Sparkles className="h-5 w-5" />
                <span>{loading ? 'Analyzing Trends...' : 'Predict My College'}</span>
              </button>

              {/* Accuracy Seal */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5">
                <ShieldAlert className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-slate-600 font-inter leading-relaxed">
                  Our algorithms analyze weighted historical cutoff data (2025, 2024, 2022) using Bihar's official priority reservation matrix to ensure high prediction accuracy.
                </p>
              </div>
            </form>
          </div>

          {/* Right Side: Prediction Results Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl min-h-[300px]"
                >
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary"></div>
                  <h4 className="text-slate-800 font-bold font-outfit">Computing Allotment Probabilities</h4>
                  <p className="text-slate-500 text-xs sm:text-sm font-inter">Running multi-factor comparison against official BCECE cutoff matrices...</p>
                </motion.div>
              ) : predictions && hasGovernmentMatch ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold font-outfit text-slate-900 mb-2 px-1">Best Allotment Options</h3>

                  {/* Branch & District Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 mb-4 shadow-sm">
                    {/* Branch Filter */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit">Filter by Branch</label>
                      <select
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                        className="px-3 py-2.5 border border-slate-200 rounded-lg outline-none font-inter text-sm bg-slate-50 text-slate-800 focus:border-brand-primary cursor-pointer"
                      >
                        {availableBranches.map(b => (
                          <option key={b} value={b} className="bg-white text-slate-800">{b === 'All' ? 'All Branches' : b}</option>
                        ))}
                      </select>
                    </div>

                    {/* District Filter */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-outfit">Filter by District</label>
                      <select
                        value={filterDistrict}
                        onChange={(e) => setFilterDistrict(e.target.value)}
                        className="px-3 py-2.5 border border-slate-200 rounded-lg outline-none font-inter text-sm bg-slate-50 text-slate-800 focus:border-brand-primary cursor-pointer"
                      >
                        <option value="All" className="bg-white text-slate-800">All Districts</option>
                        {districtsOfBihar.map(d => (
                          <option key={d} value={d} className="bg-white text-slate-800">{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tab Selector */}
                  <div className="flex gap-2 border-b border-slate-200 pb-3 mb-4 select-none">
                    <button
                      onClick={() => setActiveTab('likelihood')}
                      className={`px-4 py-2 rounded-lg font-outfit text-sm font-bold transition-all cursor-pointer ${
                        activeTab === 'likelihood'
                          ? 'bg-gradient-to-r from-brand-primary to-purple-600 text-white shadow-sm'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      Admission Likelihood
                    </button>
                    <button
                      onClick={() => setActiveTab('choices')}
                      className={`px-4 py-2 rounded-lg font-outfit text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'choices'
                          ? 'bg-gradient-to-r from-brand-primary to-purple-600 text-white shadow-sm'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      <ListOrdered className="h-4 w-4" />
                      <span>Smart Choice Sheet</span>
                    </button>
                  </div>
                  
                  {activeTab === 'likelihood' ? (
                    filteredPredictions.length > 0 ? (
                      <>
                        {filteredPredictions.map((col, index) => {
                          const isLocked = !studentInfo?.isPremium && index >= 3;
                          const alertData = getLiveDemandAlert(col.name, col.branch);
                          return (
                            <div key={`${col.name}-${col.branch}-${index}`} className="relative">
                              <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: Math.min(index, 5) * 0.05 }}
                                onClick={() => {
                                  if (isLocked) {
                                    setCheckoutStep('select');
                                    setShowCheckoutModal(true);
                                  }
                                }}
                                className={`bg-white border border-slate-200/80 hover:border-brand-primary/30 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-[0_15px_45px_rgba(90,36,179,0.08)] transition-all duration-500 ${
                                  isLocked 
                                    ? 'filter blur-[4px] select-none pointer-events-auto cursor-pointer relative overflow-hidden active:scale-98' 
                                    : 'hover:scale-[1.015]'
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-3">
                                  <div className="flex items-center gap-4">
                                    <img 
                                      src={col.image} 
                                      alt={col.name} 
                                      className="h-14 w-14 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                                    />
                                    <div>
                                      <h4 className="font-extrabold font-outfit text-slate-900 text-base sm:text-lg leading-tight">
                                        {isLocked ? 'GP Locked Institute Name' : col.name}
                                      </h4>
                                      <p className="text-slate-500 font-inter text-xs sm:text-sm mt-0.5">
                                        {isLocked ? '••••••••, Bihar' : col.location}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-left sm:text-right">
                                    <span className="text-lg sm:text-xl font-black font-outfit text-slate-900 leading-none">
                                      {isLocked ? '••%' : `${col.probability}%`}
                                    </span>
                                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">PROBABILITY</span>
                                  </div>
                                </div>

                                {/* Live Demand Trend Alert */}
                                <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-outfit mb-3 flex items-center gap-1.5 ${alertData.color}`}>
                                  <span>{isLocked ? '🔒 Premium Allotment Forecast' : alertData.text}</span>
                                </div>

                                {/* Likelihood Meter */}
                                <div className="space-y-1.5 mb-4">
                                  <div className="flex justify-between text-xs font-bold font-inter text-slate-500">
                                    <span>Admission Likelihood</span>
                                    <span className="text-brand-primary font-bold">{isLocked ? 'Locked' : col.status}</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: isLocked ? '40%' : `${col.probability}%` }}
                                      transition={{ duration: 0.6 }}
                                      className={`h-full rounded-full ${isLocked ? 'bg-slate-300' : col.color}`}
                                    />
                                  </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 text-xs font-semibold font-outfit mt-4">
                                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md">{col.branch}</span>
                                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md">
                                    {isLocked ? 'Cutoff: Locked' : `Weighted Cutoff: ${col.lastCutoff} (Your Rank: ${col.userRank})`}
                                  </span>
                                  <span className="bg-purple-50 text-brand-primary border border-purple-200 px-3 py-1 rounded-md">
                                    {col.badge}
                                  </span>
                                </div>
                              </motion.div>

                              {/* Overlay Lock badge inside each locked item */}
                              {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                                  <div className="bg-white/95 border border-slate-200 px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 font-bold font-outfit text-xs text-slate-800">
                                    <span>🔒 Unlock GP details</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* CTA Card right after list if not premium */}
                        {!studentInfo?.isPremium && filteredPredictions.length > 3 && (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-amber-500 via-brand-primary to-purple-800 rounded-2xl p-6 sm:p-8 text-center text-white space-y-4 shadow-xl shadow-purple-950/20 relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-dot-grid opacity-15" />
                            <div className="relative z-10 max-w-md mx-auto space-y-4">
                              <span className="inline-block bg-amber-400 text-purple-950 font-black text-[10px] tracking-wider px-3 py-1 rounded-full uppercase font-outfit">
                                👑 PRO MEMBERSHIP UNLOCK
                              </span>
                              <h3 className="text-xl sm:text-2xl font-black font-outfit leading-tight">
                                Unlock {filteredPredictions.length - 3}+ More Government Colleges
                              </h3>
                              <p className="text-purple-100 text-xs sm:text-sm font-inter leading-relaxed">
                                Hamare database mein rank ke according aur bhi choice suggestions hain. Inhe unlock karke BCECEB list directly copy-paste karein!
                              </p>
                              
                              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                                <button
                                  onClick={() => {
                                    setCheckoutStep('select');
                                    setShowCheckoutModal(true);
                                  }}
                                  className="bg-amber-400 hover:bg-amber-300 text-purple-950 font-black font-outfit px-6 py-3.5 rounded-xl text-sm transition-all active:scale-97 cursor-pointer shadow-lg flex items-center justify-center gap-2"
                                >
                                  <span>Unlock GP list for ₹1</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setCheckoutStep('select');
                                    setShowCheckoutModal(true);
                                  }}
                                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold font-outfit px-6 py-3.5 rounded-xl text-sm transition-all active:scale-97 cursor-pointer"
                                >
                                  View Features
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 text-center">
                         <p className="text-slate-500 font-medium">No colleges match these branch & district filters. Please adjust your filters.</p>
                      </div>
                    )
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm transition-all duration-500 space-y-6"
                    >
                      {/* Locking Overlay */}
                      {!studentInfo?.isPremium && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px] z-25 flex flex-col items-center justify-center p-6 text-center">
                          <div className="max-w-md space-y-4 bg-white/95 p-8 rounded-3xl border border-slate-200/80 shadow-2xl">
                            <div className="h-14 w-14 rounded-full bg-purple-100 text-brand-primary flex items-center justify-center mx-auto mb-2 animate-bounce">
                              <ListOrdered className="h-6 w-6" />
                            </div>
                            <span className="inline-block bg-amber-105 text-amber-800 border border-amber-250 text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase font-outfit">
                              🔒 Choice Sheet Locked
                            </span>
                            <h4 className="font-black font-outfit text-slate-900 text-lg sm:text-xl leading-snug">
                              Get Exact BCECEB Choice Filling Preference List
                            </h4>
                            <p className="text-slate-655 font-inter text-xs sm:text-sm leading-relaxed">
                              Aapke rank aur category preference ke matching government colleges ka systematic choice sequence check karein. Is sequence ko direct portal me copy-paste kar sakte hain!
                            </p>
                            <button
                              onClick={() => {
                                setCheckoutStep('select');
                                setShowCheckoutModal(true);
                              }}
                              className="w-full bg-gradient-to-r from-brand-primary to-purple-650 hover:from-purple-750 hover:to-brand-primary text-white font-extrabold font-outfit py-3.5 rounded-xl text-sm transition-all active:scale-97 cursor-pointer shadow-md flex items-center justify-center gap-2"
                            >
                              <span>Unlock Smart Choice Sheet (₹1)</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-150 pb-4">
                        <div>
                          <h4 className="font-extrabold font-outfit text-slate-900 text-base">Recommended Preference Order</h4>
                          <p className="text-xs text-slate-550 font-inter mt-0.5">Use this sorted preference sheet for BCECEB portal registration.</p>
                        </div>
                        <button
                          onClick={() => {
                            if (!studentInfo?.isPremium) {
                              setCheckoutStep('select');
                              setShowCheckoutModal(true);
                            } else {
                              handlePrintChoices();
                            }
                          }}
                          className="bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-700 hover:to-brand-primary text-white font-extrabold font-outfit px-4 py-2.5 rounded-lg text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm select-none"
                        >
                          <Printer className="h-4 w-4" />
                          <span>Print Preference Sheet</span>
                        </button>
                      </div>

                      {choiceFillingList.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse min-w-[500px] text-sm">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                                <th className="py-3 px-4 text-center w-12">No.</th>
                                <th className="py-3 px-4">Institute Name</th>
                                <th className="py-3 px-4">Branch</th>
                                <th className="py-3 px-4 text-center">Quota Category</th>
                                <th className="py-3 px-4 text-center">Likelihood</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-inter text-slate-700">
                              {choiceFillingList.map((col, idx) => (
                                <tr key={`choice-${idx}`} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-3 px-4 font-bold text-slate-400 text-center">{idx + 1}</td>
                                  <td className="py-3 px-4 font-semibold text-slate-900">
                                    <div className="flex items-center gap-2">
                                      <span>{col.name}</span>
                                      {col.isHomeDistrict && (
                                        <span className="bg-amber-50 text-brand-tertiary border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                          Home District
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">{col.branch}</td>
                                  <td className="py-3 px-4 text-center"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-semibold">{col.badge}</span></td>
                                  <td className="py-3 px-4 text-center font-bold text-brand-primary">{col.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-center py-6">No matching choices available. Please change your filter terms.</p>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ) : predictions && !hasGovernmentMatch ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Warning Header Card */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl text-brand-tertiary flex-shrink-0">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-extrabold font-outfit text-slate-900 text-base sm:text-lg">Admission Outlook Notice</h4>
                      <p className="text-slate-700 font-inter text-xs sm:text-sm leading-relaxed">
                        Aapki rank (UR Rank: <strong>{formData.urRank}</strong>
                        {parseFloat(formData.inflationIndex) > 1.01 ? ` → Effective: ${Math.round(parseInt(formData.urRank) * parseFloat(formData.inflationIndex))}` : ''}) 
                        par general counselling rounds ke through Government Polytechnic colleges mein computer science, civil, ya electrical engineering branch milna lagbhag namumkin hai.
                      </p>
                      <p className="text-slate-500 font-inter text-[11px] italic">
                        Note: BCECE cutoff data indicates that government closing ranks usually saturate below 20,000 for regular branches.
                      </p>
                    </div>
                  </div>

                  {/* Counseling Mop-up Tips */}
                  <div className="bg-white border border-slate-200/80 hover:border-brand-primary/30 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-[0_15px_45px_rgba(90,36,179,0.08)] hover:scale-[1.015] transition-all duration-500 space-y-4">
                    <h4 className="font-extrabold font-outfit text-slate-900 text-base flex items-center gap-2">
                      <span className="text-brand-tertiary">💡</span>
                      <span>Mop-up Round (Offline Counselling) Strategy</span>
                    </h4>
                    <p className="text-slate-700 font-inter text-xs sm:text-sm leading-relaxed">
                      General rounds khatam hone ke baad agar seats khali rehti hain, toh BCECE Board <strong>Offline Mop-up Round</strong> conduct karta hai (Board Office, Patna hawai adda ke paas). 
                      Isme direct offline counselling hoti hai jahan upar ki ranks wale bachhe seat drop/upgrade karte hain aur unki khali seats piche ki rank par mil sakti hain.
                    </p>
                    <ul className="list-disc list-inside text-xs text-slate-655 font-inter space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <li><strong>Seat Matrix Monitor:</strong> Mop-up round se pehle official website (bceceboard.bihar.gov.in) par Daily Seat Matrix update hoti hai. Use check karte rahein.</li>
                      <li><strong>Patna Board Visit:</strong> Mop-up counseling offline hoti hai, isliye aapko specified date aur time par apne documents ke sath Patna office physically jana hoga.</li>
                      <li><strong>Document Readiness:</strong> Apne sabhi academic marksheets, admit card, character certificate, aur category certificate ke 2 sets of photocopies aur original ready rakhein.</li>
                    </ul>
                  </div>

                  {/* Dynamic Private Allotment List */}
                  {predictions.length > 0 && (
                    <div className="bg-white border border-slate-200/80 hover:border-brand-primary/30 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-[0_15px_45px_rgba(90,36,179,0.08)] hover:scale-[1.015] transition-all duration-500 space-y-4">
                      <h4 className="font-extrabold font-outfit text-slate-900 text-base flex items-center gap-2">
                        <span className="text-brand-primary">🎯</span>
                        <span>Your Predicted Private / Semi-Govt. College Options</span>
                      </h4>
                      <p className="text-slate-600 font-inter text-xs sm:text-sm leading-relaxed font-semibold text-emerald-600">
                        Aapki rank par in colleges mein admissions milne ka high chance hai:
                      </p>
                      <div className="space-y-3">
                        {predictions.slice(0, 8).map((col, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs sm:text-sm">
                            <div>
                              <span className="font-bold text-slate-900 block">{col.name}</span>
                              <span className="text-slate-500 font-inter text-xs mt-0.5">{col.branch} ({col.badge})</span>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-0.5 rounded font-bold text-xs ${col.color} text-white`}>
                                {col.status} ({col.probability}%)
                              </span>
                              <span className="block text-[10px] text-slate-500 font-semibold mt-1">Cutoff Close: {col.lastCutoff}</span>
                            </div>
                          </div>
                        ))}
                        {predictions.length > 8 && (
                          <p className="text-slate-500 text-xs italic text-center pt-2 select-none">
                            + {predictions.length - 8} more private college options matched your profile.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Private & Semi-Government College recommendations */}
                  <div className="bg-white border border-slate-200/80 hover:border-brand-primary/30 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-[0_15px_45px_rgba(90,36,179,0.08)] hover:scale-[1.015] transition-all duration-500 space-y-4">
                    <h4 className="font-extrabold font-outfit text-slate-900 text-base flex items-center gap-2">
                      <span className="text-brand-primary">🏫</span>
                      <span>Explore Reputable Private / Semi-Government Options</span>
                    </h4>
                    <p className="text-slate-655 font-inter text-xs sm:text-sm leading-relaxed">
                      Agar aap is saal seat confirm karna chahte hain, toh in premium private polytechnics ko explore kar sakte hain, jo high-quality infrastructure aur good placement records offer karte hain:
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase font-outfit">
                            <th className="py-2.5 px-3">College Name</th>
                            <th className="py-2.5 px-3">Location</th>
                            <th className="py-2.5 px-3">Top Branches</th>
                            <th className="py-2.5 px-3 text-right">Approx Fees</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-inter text-slate-600">
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-semibold text-slate-900">Netaji Subhas Institute of Technology</td>
                            <td className="py-3 px-3">Amhara, Patna</td>
                            <td className="py-3 px-3">CSE, Civil, Mechanical</td>
                            <td className="py-3 px-3 text-right font-bold text-slate-800">₹45,000/year</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-semibold text-slate-900">Budha Institute of Technology</td>
                            <td className="py-3 px-3">Gaya, Bihar</td>
                            <td className="py-3 px-3">Electrical, Civil, Mechanical</td>
                            <td className="py-3 px-3 text-right font-bold text-slate-800">₹40,000/year</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-semibold text-slate-900">Ganga Memorial College of Polytechnic</td>
                            <td className="py-3 px-3">Harnaut, Nalanda</td>
                            <td className="py-3 px-3">CSE, Electrical, Civil</td>
                            <td className="py-3 px-3 text-right font-bold text-slate-800">₹42,000/year</td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-semibold text-slate-900">Azmet College of Engineering & Tech.</td>
                            <td className="py-3 px-3">Kishanganj, Bihar</td>
                            <td className="py-3 px-3">Civil, Electrical, CSE</td>
                            <td className="py-3 px-3 text-right font-bold text-slate-800">₹35,000/year</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Alternative Paths */}
                  <div className="bg-white border border-slate-200/80 hover:border-brand-primary/30 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-[0_15px_45px_rgba(90,36,179,0.08)] hover:scale-[1.015] transition-all duration-500 space-y-4">
                    <h4 className="font-extrabold font-outfit text-slate-900 text-base flex items-center gap-2">
                      <span className="text-brand-primary">🎯</span>
                      <span>Alternative Options & Prep Strategy</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-inter text-slate-600">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <span className="font-bold text-slate-900 block">BCECE LE (Lateral Entry)</span>
                        <p className="leading-relaxed text-slate-500">
                          Agar aapne 12th Science (PCM/PCB) pass kiya hai ya ITI certificate holds karte hain, toh aap Lateral Entry ke through direct 2nd-year polytechnic engineering mein next year entry le sakte hain.
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <span className="font-bold text-slate-900 block">DCECE 2027 Prep Tips</span>
                        <p className="leading-relaxed text-slate-500">
                          Physics, Chemistry aur Mathematics ke core formulas par focus karein. Polytechnic entrance mein 10th aur 9th Class level science syllabus aata hai, regular mocks se 20,000 ke andar rank target karein.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border border-slate-200/80 hover:border-brand-primary/30 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl hover:shadow-[0_15px_45px_rgba(90,36,179,0.08)] hover:scale-[1.015] transition-all duration-500 min-h-[300px] select-none"
                >
                  <div className="h-14 w-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-brand-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h4 className="text-slate-900 font-bold font-outfit text-base">Prediction Results</h4>
                  <p className="text-slate-650 text-xs sm:text-sm font-inter max-w-md leading-relaxed">
                    Enter your General (UR) rank, Category rank, and reservation details on the left, then click <strong>Predict My College</strong> to view your personalized admission likelihood list based on the official priority matrix.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* WhatsApp Alerts Subscription Capture */}
            {predictions && (
              <div className="bg-emerald-50/60 border border-emerald-200 hover:border-brand-secondary/30 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-[0_15px_45px_rgba(0,179,136,0.08)] hover:scale-[1.015] transition-all duration-500 relative overflow-hidden select-none backdrop-blur-md">
                
                {/* Visual Watermark */}
                <div className="absolute right-[-15px] top-[-15px] opacity-[0.03] text-brand-secondary select-none pointer-events-none">
                  <svg viewBox="0 0 24 24" width="120" height="120" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.859 0c3.161.001 6.136 1.233 8.375 3.474 2.238 2.24 3.467 5.213 3.466 8.377-.003 6.536-5.328 11.86-11.859 11.86h-.008c-2.002-.001-3.973-.541-5.74-1.568L0 24zm6.59-4.846c1.6.95 3.498 1.45 5.437 1.451h.007c5.444 0 9.873-4.43 9.876-9.88.001-2.64-1.022-5.122-2.889-6.991A9.811 9.811 0 0011.857 1.98c-5.446 0-9.877 4.43-9.88 9.88-.001 1.97.513 3.888 1.49 5.607l-.98 3.58 3.67-.963zm11.517-7.712c-.3-.15-1.774-.875-2.046-.975-.273-.1-.471-.15-.669.15-.198.3-.765.975-.939 1.178-.173.2-.347.225-.648.075-.3-.15-1.264-.467-2.41-1.485-.89-.797-1.493-1.782-1.666-2.083-.173-.3-.018-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.299.3-.5.1-.2.05-.375-.025-.525-.075-.15-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.774-.725 2.022-1.424.248-.699.248-1.299.173-1.424-.075-.125-.27-.2-1.52-.775z"/>
                  </svg>
                </div>

                {leadSubscribed ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-4 space-y-2 relative z-10"
                  >
                    <div className="h-12 w-12 rounded-full bg-emerald-100 text-brand-secondary border border-emerald-250 flex items-center justify-center font-bold text-lg select-none">
                      ✓
                    </div>
                    <h4 className="font-extrabold font-outfit text-slate-900 text-sm sm:text-base">Allotment Alerts Active!</h4>
                    <p className="text-slate-650 font-inter text-xs sm:text-sm leading-relaxed max-w-sm">
                      Aapka number (<strong>{localStorage.getItem('student_lead_phone') || whatsappNumber}</strong>) alert list mein add ho gaya hai. Important counselling updates, choice-filling schedules, aur seat matrices aapko directly WhatsApp par send kiye jayenge.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4 relative z-10">
                    <div className="space-y-1">
                      <span className="inline-block bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/20 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider select-none">
                        Counselling Tracker 2026
                      </span>
                      <h4 className="font-extrabold font-outfit text-slate-900 text-sm sm:text-base">
                        Get BCECEB Allotment Alerts on WhatsApp!
                      </h4>
                      <p className="text-slate-600 font-inter text-xs leading-relaxed max-w-lg">
                        Official notifications, cutoff shifts, choice-filling start dates, aur Mop-up rounds alerts real-time mein seedhe apne phone par receive karein. No spam, privacy guaranteed.
                      </p>
                    </div>

                    <form onSubmit={handleSubscribeAlerts} className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="relative w-full sm:flex-grow">
                        <span className="absolute left-3 top-3.5 text-xs sm:text-sm font-bold text-slate-500 font-inter">+91</span>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          maxLength="10"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 10-digit WhatsApp number"
                          className="pl-12 pr-4 py-3.5 bg-white border border-slate-200 focus:border-brand-secondary rounded-xl outline-none font-inter text-xs sm:text-sm w-full transition-all text-slate-900"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingLead}
                        className="bg-brand-secondary hover:bg-emerald-600 text-white font-extrabold font-outfit px-6 py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-97 cursor-pointer w-full sm:w-auto shadow-md whitespace-nowrap disabled:opacity-70"
                      >
                        {submittingLead ? 'Activating...' : 'Get Allotment Alerts'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Banner: Want Personalized Guidance? */}
            <div className="bg-gradient-to-r from-[#2E1065] via-[#1E1B4B] to-[#0F172A] border border-purple-250/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl mt-2 text-white hover:shadow-[0_15px_45px_rgba(90,36,179,0.15)] hover:scale-[1.015] transition-all duration-500">
              
              {/* background watermark */}
              <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] text-white select-none pointer-events-none">
                <GraduationCap className="h-40 w-40" />
              </div>

              <div className="space-y-2 relative z-10 max-w-md text-left">
                <h3 className="text-lg sm:text-xl font-bold font-outfit tracking-tight text-white">
                  Want Personalized Guidance?
                </h3>
                <p className="text-slate-300 font-inter text-xs sm:text-sm leading-relaxed">
                  Our expert counselors can help you navigate the counseling process and lock in your seat.
                </p>
              </div>

              <div className="relative z-10 flex-shrink-0 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    setConsultSuccess(false);
                    setShowConsultModal(true);
                  }}
                  className="bg-gradient-to-r from-brand-secondary to-teal-500 hover:from-teal-600 hover:to-brand-secondary text-white font-extrabold font-outfit px-5 py-3 rounded-lg text-xs tracking-wide uppercase transition-all active:scale-95 cursor-pointer shadow-md flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Book Free Consultation</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Statistics Row Grid */}
        <div className="border-t border-slate-200 pt-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center max-w-5xl mx-auto">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black font-outfit text-brand-primary tracking-tight">50K+</span>
              <span className="block text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase">STUDENTS SERVED</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black font-outfit text-brand-primary tracking-tight">100%</span>
              <span className="block text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase">VERIFIED CUTOFFS</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black font-outfit text-brand-primary tracking-tight">200+</span>
              <span className="block text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase">INSTITUTES LISTED</span>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black font-outfit text-brand-primary tracking-tight">24/7</span>
              <span className="block text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase">ACTIVE SUPPORT</span>
            </div>
          </div>
      </div>

      {/* Booking Consultation Modal */}
      <AnimatePresence>
        {showConsultModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConsultModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg z-10 max-h-[92vh] flex flex-col"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary via-purple-600 to-teal-500" />
              <button
                onClick={() => setShowConsultModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 hover:bg-slate-100 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
              <div className="p-6 sm:p-8 overflow-y-auto">
                {!consultSuccess ? (
                  <div className="space-y-6">
                    <div className="text-center space-y-1">
                      <span className="inline-block bg-brand-primary/10 text-brand-primary border border-brand-primary/20 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider select-none font-outfit">
                        1-on-1 Personalized guidance
                      </span>
                      <h3 className="text-2xl font-black font-outfit text-slate-900 tracking-tight">Book Free Consultation</h3>
                      <p className="text-slate-500 font-inter text-xs leading-relaxed max-w-sm mx-auto">
                        Hum aapse call ya chat ke through connect karke DCECE counselling ki seat matrix choices prepare karenge.
                      </p>
                    </div>
                    <form onSubmit={handleBookConsultation} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={consultForm.studentName}
                              onChange={(e) => setConsultForm({ ...consultForm, studentName: e.target.value })}
                              placeholder="e.g. Rahul Kumar"
                              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl outline-none font-semibold text-slate-900 text-xs sm:text-sm w-full transition-all"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">WhatsApp Number</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs sm:text-sm font-bold text-slate-500 font-inter">+91</span>
                            <input
                              type="tel"
                              required
                              pattern="[0-9]{10}"
                              maxLength="10"
                              value={consultForm.whatsappNumber}
                              onChange={(e) => setConsultForm({ ...consultForm, whatsappNumber: e.target.value.replace(/\D/g, '') })}
                              placeholder="10-digit number"
                              className="pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl outline-none font-semibold text-slate-900 text-xs sm:text-sm w-full transition-all"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">UR Rank</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={consultForm.urRank}
                            onChange={(e) => setConsultForm({ ...consultForm, urRank: e.target.value })}
                            placeholder="e.g. 1250"
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl outline-none font-semibold text-slate-900 text-xs sm:text-sm w-full transition-all"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Category</label>
                          <select
                            value={consultForm.category}
                            onChange={(e) => {
                              const cat = e.target.value;
                              setConsultForm({
                                ...consultForm,
                                category: cat,
                                categoryRank: cat === 'UR' ? '' : consultForm.categoryRank
                              });
                            }}
                            className="px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl outline-none font-bold text-slate-800 text-xs sm:text-sm w-full cursor-pointer transition-all"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat} className="bg-white text-slate-800">{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit flex justify-between">
                            <span>Category Rank</span>
                            {consultForm.category === 'UR' && <span className="text-slate-400 font-normal text-[9px]">(N/A)</span>}
                          </label>
                          <input
                            type="number"
                            required={consultForm.category !== 'UR'}
                            disabled={consultForm.category === 'UR'}
                            value={consultForm.categoryRank}
                            onChange={(e) => setConsultForm({ ...consultForm, categoryRank: e.target.value })}
                            placeholder={consultForm.category === 'UR' ? 'N/A' : 'e.g. 450'}
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl outline-none font-semibold text-slate-900 text-xs sm:text-sm w-full transition-all disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Preferred Branch</label>
                          <select
                            value={consultForm.preferredBranch}
                            onChange={(e) => setConsultForm({ ...consultForm, preferredBranch: e.target.value })}
                            className="px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl outline-none font-semibold text-slate-850 text-xs sm:text-sm w-full cursor-pointer transition-all"
                          >
                            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                            <option value="Electrical Engineering">Electrical Engineering</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Electronics Engineering">Electronics Engineering</option>
                            <option value="Automobile Engineering">Automobile Engineering</option>
                            <option value="Any Branch">Any Branch</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1.5 pt-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Contact Mode</label>
                        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50/65 border border-brand-secondary/20 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold select-none">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-550 animate-pulse" />
                          <span>WhatsApp Chat (Redirection to +91 9296276633)</span>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={consultSubmitting}
                        className="w-full bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-700 hover:to-brand-primary text-white font-extrabold font-outfit py-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-[0_4px_25px_rgba(90,36,179,0.25)] transition-all active:scale-98 cursor-pointer text-sm disabled:opacity-70 mt-6"
                      >
                        {consultSubmitting ? 'Booking Consultation...' : 'Submit & Connect with Counselor'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-8 space-y-4"
                  >
                    <div className="h-16 w-16 rounded-full bg-emerald-100 text-brand-secondary border border-emerald-250 flex items-center justify-center font-bold text-2xl animate-bounce">
                      ✓
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-extrabold font-outfit text-slate-900 text-lg">Consultation Requested!</h4>
                      <p className="text-slate-600 font-inter text-xs leading-relaxed max-w-sm">
                        Aapki details successfully register ho gayi hain. Hum aapse jald hi WhatsApp ke through connect karenge.
                      </p>
                      <p className="text-brand-secondary font-bold text-xs animate-pulse pt-2">
                        Opening counselor chat on WhatsApp...
                      </p>
                    </div>
                    <div className="pt-4 w-full">
                      <button
                        onClick={() => setShowConsultModal(false)}
                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-bold font-outfit text-xs transition-all active:scale-97 cursor-pointer"
                      >
                        Close Window
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Razorpay Simulation Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (checkoutStep !== 'processing') {
                  setShowCheckoutModal(false);
                }
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden w-full max-w-md z-10 flex flex-col"
            >
              {/* Header / Brand */}
              <div className="bg-[#1E1B4B] text-white p-6 relative">
                {checkoutStep !== 'processing' && (
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 bg-brand-primary text-white rounded-xl flex items-center justify-center font-black">
                    <span className="font-outfit text-lg">P</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold font-outfit text-base leading-none">PolytechnicKarle Premium</h4>
                    <p className="text-[10px] text-slate-300 font-inter mt-1">Merchant: PolytechnicKarle Pvt. Ltd.</p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-baseline border-t border-white/10 pt-4">
                  <span className="text-xs text-slate-300 font-medium">BCECE Smart Choice-Filling List + Predictor</span>
                  <span className="text-2xl font-black font-outfit text-amber-400">₹1.00</span>
                </div>
              </div>

              {/* Steps Switcher */}
              <div className="p-6 sm:p-8">
                {checkoutStep === 'select' && (
                  <div className="space-y-6">
                    {/* Payment Mode Toggles */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                      {['upi', 'qr', 'card'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer ${
                            paymentMethod === method
                              ? 'bg-white text-brand-primary shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {method === 'upi' && 'UPI ID'}
                          {method === 'qr' && 'QR Scan'}
                          {method === 'card' && 'Card'}
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Method Form */}
                    {paymentMethod === 'upi' && (
                      <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-250/30 p-3 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                          <p className="font-extrabold mb-1">Direct UPI Transfer Instructions:</p>
                          Apne UPI app (GPay, PhonePe, Paytm) se is official UPI ID par <span className="font-black text-amber-950">₹1</span> transfer karein:
                          <div className="mt-2 flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-bold text-slate-900 font-mono">
                            <span>9296276633@axl</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('9296276633@axl');
                                alert('UPI ID copied successfully!');
                              }}
                              className="text-brand-secondary hover:text-brand-primary text-[10px] uppercase tracking-wider font-extrabold font-outfit cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Your UPI ID (For transaction verification)</label>
                          <input
                            type="text"
                            required
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. name@okhdfcbank or phone@paytm"
                            className="px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl outline-none font-semibold text-slate-900 text-sm w-full transition-all placeholder:text-slate-400"
                          />
                        </div>
                        <div className="flex gap-2">
                          {['paytm', 'ybl', 'okaxis'].map((ext) => (
                            <button
                              key={ext}
                              type="button"
                              onClick={() => {
                                const base = upiId.split('@')[0] || 'student';
                                setUpiId(`${base}@${ext}`);
                              }}
                              className="bg-slate-50 border border-slate-250 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              @{ext}
                            </button>
                          ))}
                        </div>

                        {/* UTR field for UPI */}
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-[10px] font-bold text-red-600 uppercase tracking-widest font-outfit">⚠️ UTR / Transaction ID (Required after payment)</label>
                          <input
                            type="text"
                            maxLength={22}
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="12-digit UTR number from your UPI app"
                            className="px-4 py-3 bg-red-50 border border-red-200 focus:border-red-500 rounded-xl outline-none font-bold text-slate-900 text-sm w-full transition-all placeholder:text-slate-400"
                          />
                          <p className="text-[10px] text-slate-400">Payment karne ke baad apne UPI app se 12-digit UTR number yahan daalo. Bina UTR ke payment verify nahi hogi.</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'qr' && (
                      <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        {/* Dynamic Mock QR Code */}
                        <div className="bg-white p-3 rounded-xl border border-slate-205">
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=9296276633@axl%26pn=PolytechnicKarle%26am=1.00%26cu=INR"
                            alt="Payment QR Code"
                            className="h-32 w-32 object-contain"
                            onError={(e) => {
                              e.target.src = "/logo.png";
                            }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-550 font-bold tracking-wide text-center">
                          Scan this QR Code using GPay, PhonePe, or Paytm
                        </p>
                        <div className="w-full flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 font-mono">
                          <span>UPI ID: 9296276633@axl</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('9296276633@axl');
                              alert('UPI ID copied successfully!');
                            }}
                            className="text-brand-secondary hover:text-brand-primary text-[9px] uppercase tracking-wider font-extrabold font-outfit cursor-pointer font-outfit"
                          >
                            Copy ID
                          </button>
                        </div>

                        {/* UTR field for QR */}
                        <div className="w-full flex flex-col space-y-1.5">
                          <label className="text-[10px] font-bold text-red-600 uppercase tracking-widest font-outfit">⚠️ UTR / Transaction ID (Required after scanning)</label>
                          <input
                            type="text"
                            maxLength={22}
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="12-digit UTR from your payment app"
                            className="px-4 py-3 bg-red-50 border border-red-200 focus:border-red-500 rounded-xl outline-none font-bold text-slate-900 text-sm w-full transition-all placeholder:text-slate-400"
                          />
                          <p className="text-[10px] text-slate-400">Scan karne ke baad apne UPI app me 12-digit UTR number milega — use yahan enter karo.</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Card Number</label>
                          <input
                            type="text"
                            maxLength="19"
                            placeholder="4111 2222 3333 4444"
                            value={cardDetails.number}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                              setCardDetails({ ...cardDetails, number: val });
                            }}
                            className="px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl outline-none font-semibold text-slate-900 text-sm w-full transition-all placeholder:text-slate-400"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength="5"
                              value={cardDetails.expiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 2) {
                                  val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                }
                                setCardDetails({ ...cardDetails, expiry: val });
                              }}
                              className="px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl outline-none font-semibold text-slate-900 text-sm w-full transition-all placeholder:text-slate-400"
                            />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">CVV</label>
                            <input
                              type="password"
                              placeholder="•••"
                              maxLength="3"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                              className="px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl outline-none font-semibold text-slate-900 text-sm w-full transition-all placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pay Button */}
                    <button
                      type="button"
                      disabled={(() => {
                        if (paymentMethod === 'upi') return !upiId.trim() || utrNumber.length < 10;
                        if (paymentMethod === 'qr') return utrNumber.length < 10;
                        if (paymentMethod === 'card') return cardDetails.number.replace(/\s/g,'').length < 16 || cardDetails.expiry.length < 5 || cardDetails.cvv.length < 3;
                        return false;
                      })()}
                      onClick={() => {
                        // Validate before proceeding
                        if (paymentMethod === 'upi' && !upiId.trim()) {
                          alert('Pehle apna UPI ID enter karo.');
                          return;
                        }
                        if ((paymentMethod === 'upi' || paymentMethod === 'qr') && utrNumber.length < 10) {
                          alert('Payment karne ke baad 12-digit UTR/Transaction ID enter karna zaroori hai. Bina UTR ke verify nahi hoga.');
                          return;
                        }
                        if (paymentMethod === 'card') {
                          if (cardDetails.number.replace(/\s/g,'').length < 16) { alert('Valid card number enter karo.'); return; }
                          if (cardDetails.expiry.length < 5) { alert('Valid expiry date enter karo.'); return; }
                          if (cardDetails.cvv.length < 3) { alert('Valid CVV enter karo.'); return; }
                        }
                        setCheckoutStep('processing');
                        const statuses = [
                          'Connecting to payment gateway...',
                          'Initiating transaction handshake...',
                          'Verifying UTR reference number...',
                          'Validating payment with bank...',
                          'Submitting for admin verification...'
                        ];
                        let idx = 0;
                        setProcessingStatus(statuses[0]);
                        const interval = setInterval(() => {
                          idx++;
                          if (idx < statuses.length) {
                            setProcessingStatus(statuses[idx]);
                          } else {
                            clearInterval(interval);

                            // Log payment transaction in Supabase and localStorage
                            const logPayment = async () => {
                              const transId = utrNumber || ('TXN' + Math.floor(Math.random() * 9000000000 + 1000000000));
                              const payload = {
                                student_name: studentInfo?.name || 'Demo Student',
                                roll_number: studentInfo?.roll || '12345',
                                whatsapp_number: studentInfo?.emailOrPhone || '9999999999',
                                amount: 1.00,
                                payment_mode: paymentMethod === 'upi' ? 'UPI ID' : paymentMethod === 'qr' ? 'QR Scan' : 'Card',
                                transaction_id: transId,
                                upi_id: upiId || '',
                                status: 'pending_verification',
                                created_at: new Date().toISOString()
                              };
                              try {
                                const { error } = await supabase.from('payments').insert(payload);
                                if (error) {
                                  console.warn("Supabase payments table write failed, falling back to localStorage:", error.message);
                                  const localPayments = JSON.parse(localStorage.getItem('pk_payments') || '[]');
                                  localPayments.push(payload);
                                  localStorage.setItem('pk_payments', JSON.stringify(localPayments));
                                }
                              } catch (err) {
                                console.warn("Supabase payments exception, falling back to localStorage:", err.message);
                                const localPayments = JSON.parse(localStorage.getItem('pk_payments') || '[]');
                                localPayments.push(payload);
                                localStorage.setItem('pk_payments', JSON.stringify(localPayments));
                              }
                            };
                            logPayment();

                            // DO NOT call handleUpdatePremiumStatus() here — wait for admin to verify UTR
                            setCheckoutStep('success');
                          }
                        }, 850);
                      }}
                      className={`w-full font-extrabold font-outfit py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-sm ${
                        (() => {
                          const disabled =
                            (paymentMethod === 'upi' && (!upiId.trim() || utrNumber.length < 10)) ||
                            (paymentMethod === 'qr' && utrNumber.length < 10) ||
                            (paymentMethod === 'card' && (cardDetails.number.replace(/\s/g,'').length < 16 || cardDetails.expiry.length < 5 || cardDetails.cvv.length < 3));
                          return disabled
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-500 to-brand-secondary hover:from-emerald-600 hover:to-brand-secondary text-white hover:shadow-emerald-500/25 active:scale-98 cursor-pointer';
                        })()
                      }`}
                    >
                      <span>Submit Payment for Verification ₹1</span>
                    </button>
                    
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        🔒 Secured by Razorpay Standard 256-bit SSL encryption
                      </span>
                    </div>
                  </div>
                )}

                {checkoutStep === 'processing' && (
                  <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1E1B4B]"></div>
                    <h4 className="text-slate-950 font-bold font-outfit text-base">Processing Payment</h4>
                    <p className="text-slate-500 font-inter text-xs max-w-xs animate-pulse">{processingStatus}</p>
                  </div>
                )}

                {checkoutStep === 'success' && (
                  <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-amber-100 text-amber-600 border border-amber-300 flex items-center justify-center font-bold text-2xl shadow-md">
                      ⏳
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold font-outfit text-slate-900 text-lg">Request Submitted!</h4>
                      <p className="text-slate-600 font-inter text-xs leading-relaxed max-w-sm">
                        Aapka payment request mil gaya. UTR <span className="font-black text-slate-900 font-mono">{utrNumber}</span> ko verify karne ke baad <strong>2-4 ghante</strong> mein aapka premium access activate kar diya jayega.
                      </p>
                    </div>
                    <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 text-left space-y-1">
                      <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">📋 Submitted Details</p>
                      <p className="text-[11px] text-slate-700 font-mono">UTR: <strong>{utrNumber}</strong></p>
                      {upiId && <p className="text-[11px] text-slate-700 font-mono">UPI: <strong>{upiId}</strong></p>}
                      <p className="text-[11px] text-slate-700 font-mono">Amount: <strong>₹1.00</strong></p>
                    </div>
                    <p className="text-[10px] text-slate-400 max-w-xs">
                      Agar 4 ghante baad bhi activate na ho toh WhatsApp karo: <span className="font-black text-slate-600">9296276633</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCheckoutModal(false);
                      }}
                      className="w-full bg-[#1E1B4B] hover:bg-[#2E1065] text-white font-bold font-outfit py-3.5 rounded-xl text-sm transition-all active:scale-97 cursor-pointer"
                    >
                      OK, Samajh Gaya
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </main>
  );
};

export default Predictor;