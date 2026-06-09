import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Predictor from './pages/Predictor';
import Cutoff from './pages/Cutoff';
import CollegeList from './pages/CollegeList';
import Guide from './pages/Guide';
import Compare from './pages/Compare';
import AdminDashboard from './pages/AdminDashboard';
import LoginGate from './pages/LoginGate';
import Forum from './pages/Forum';
import { supabase } from './supabaseClient';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Track browser path for /admin SPA routing
  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname === '/admin') {
        setCurrentPage('admin');
      } else {
        // If not at /admin but state is admin, reset back to home
        setCurrentPage(prev => prev === 'admin' ? 'home' : prev);
      }
    };

    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  // Student Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);

  // Global state for colleges including branch-wise seat matrices
  const [colleges, setColleges] = useState([
    {
      id: 1,
      name: 'GP Patna-7',
      location: 'Gulzarbagh, Patna',
      seats: 420,
      placement: 85,
      branches: ['Civil Engineering', 'Computer Science & Engineering', 'Electrical Engineering', 'Textile Engineering'],
      topRanked: true,
      fees: '₹8,500/year',
      established: 1954,
      facilities: ['Hostel', 'Computer Labs', 'Library', 'Smart Classrooms'],
      desc: 'One of the oldest and most prestigious polytechnic institutions in Bihar, known for high academic standards and strong placement records.',
      image: '/govt_college.jpg',
      image_url: null,
      seatMatrix: { 'Civil Engineering': 120, 'Computer Science & Engineering': 90, 'Electrical Engineering': 90, 'Textile Engineering': 120 }
    },
    {
      id: 2,
      name: 'GWP Muzaffarpur',
      location: 'Muzaffarpur, Bihar',
      seats: 360,
      placement: 78,
      branches: ['Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering'],
      topRanked: false,
      fees: '₹7,800/year',
      established: 1960,
      facilities: ['Girls Hostel', 'Workshop', 'Library', 'Seminar Hall'],
      desc: 'A leading women government polytechnic college focused on empowering female engineering aspirants in core disciplines.',
      image: '/college_building.jpg',
      image_url: null,
      seatMatrix: { 'Mechanical Engineering': 120, 'Electrical Engineering': 120, 'Civil Engineering': 120 }
    },
    {
      id: 3,
      name: 'GP Bhagalpur',
      location: 'Bhagalpur, Bihar',
      seats: 380,
      placement: 82,
      branches: ['Electronics Engineering', 'Computer Science & Engineering', 'Electrical Engineering'],
      topRanked: false,
      fees: '₹8,200/year',
      established: 1972,
      facilities: ['Hostel', 'Electronics Lab', 'Library', 'Sports Ground'],
      desc: 'Renowned institute in eastern Bihar offering high-quality technical curriculum, state-of-the-art electronics labs, and active student clubs.',
      image: '/college_two.jpg',
      image_url: null,
      seatMatrix: { 'Electronics Engineering': 120, 'Computer Science & Engineering': 120, 'Electrical Engineering': 140 }
    },
    {
      id: 4,
      name: 'GP Darbhanga',
      location: 'Darbhanga, Bihar',
      seats: 300,
      placement: 72,
      branches: ['Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering'],
      topRanked: false,
      fees: '₹7,500/year',
      established: 1985,
      facilities: ['Hostel', 'Physics Lab', 'Workshop', 'Canteen'],
      desc: 'Dedicated to providing comprehensive practical knowledge in mechanical and civil engineering with modernized workshops.',
      image: '/college_three.jpg',
      image_url: null,
      seatMatrix: { 'Civil Engineering': 100, 'Mechanical Engineering': 100, 'Electrical Engineering': 100 }
    },
    {
      id: 5,
      name: 'GP Gaya',
      location: 'Gaya, Bihar',
      seats: 400,
      placement: 80,
      branches: ['Automobile Engineering', 'Civil Engineering', 'Electrical Engineering'],
      topRanked: false,
      fees: '₹8,000/year',
      established: 1968,
      facilities: ['Hostel', 'Automobile Lab', 'Library', 'Gymnasium'],
      desc: 'Famous for its unique Automobile engineering course. GP Gaya boasts excellent laboratory setups and strong regional industry tie-ups.',
      image: '/govt_college.jpg',
      image_url: null,
      seatMatrix: { 'Automobile Engineering': 100, 'Civil Engineering': 150, 'Electrical Engineering': 150 }
    },
    {
      id: 6,
      name: 'GP Saharsa',
      location: 'Saharsa, Bihar',
      seats: 320,
      placement: 68,
      branches: ['Civil Engineering', 'Mechanical Engineering', 'Electronics Engineering'],
      topRanked: false,
      fees: '₹7,000/year',
      established: 2016,
      facilities: ['Hostel', 'Labs', 'Library'],
      desc: 'A newly established institute rapidly building its resources to serve students in Kosi division with quality polytechnic credentials.',
      image: '/college_building.jpg',
      image_url: null,
      seatMatrix: { 'Civil Engineering': 100, 'Mechanical Engineering': 120, 'Electronics Engineering': 100 }
    }
  ]);

  // Fetch seat matrices and profile details from Supabase on mount
  useEffect(() => {
    const fetchCollegeProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('college_profiles')
          .select('*');

        if (error) {
          console.warn('Supabase college_profiles table load info:', error.message);
          return;
        }

        if (data && data.length > 0) {
          setColleges(prevColleges => {
            const normalizeName = (n) => n.toLowerCase().replace(/[^a-z0-9]/g, '');

            // Map existing DB records
            const dbColleges = data.map((dbRecord, index) => {
              const regularMatrix = dbRecord.seat_matrix_regular || {};
              const regularTotal = Object.values(regularMatrix).reduce((sum, val) => sum + val, 0);
              
              // Find matching hardcoded college using normalized name
              const hardcodedCol = prevColleges.find(
                item => normalizeName(item.name) === normalizeName(dbRecord.college_name)
              );
              
              return {
                id: hardcodedCol ? hardcodedCol.id : (index + 100),
                name: dbRecord.college_name,
                location: dbRecord.location || (hardcodedCol ? hardcodedCol.location : ''),
                established: dbRecord.established || (hardcodedCol ? hardcodedCol.established : 2026),
                fees: dbRecord.fees || (hardcodedCol ? hardcodedCol.fees : '₹8,000/year'),
                image_url: dbRecord.image_url || (hardcodedCol ? hardcodedCol.image_url : null),
                image: dbRecord.image_url || (hardcodedCol ? hardcodedCol.image : '/govt_college.jpg'),
                desc: dbRecord.description || (hardcodedCol ? hardcodedCol.desc : 'Information not added yet.'),
                description: dbRecord.description || (hardcodedCol ? hardcodedCol.description : 'Information not added yet.'),
                seatMatrix: regularMatrix,
                seats: regularTotal,
                branches: Object.keys(regularMatrix).length > 0 
                  ? Object.keys(regularMatrix) 
                  : (hardcodedCol ? hardcodedCol.branches : ['Civil Engineering', 'Computer Science & Engineering', 'Electrical Engineering']),
                facilities: dbRecord.facilities || (hardcodedCol ? hardcodedCol.facilities : ['Hostel', 'Labs', 'Library']),
                placement: hardcodedCol ? hardcodedCol.placement : 70
              };
            });
            
            // Add any hardcoded colleges that are NOT in the database yet
            const missingHardcoded = prevColleges.filter(
              hc => !data.some(db => normalizeName(db.college_name) === normalizeName(hc.name))
            );
            
            // Sort by priority (top-tier colleges first) and then alphabetically
            const getCollegePriority = (name) => {
              const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (norm.includes('patna7')) return 1;
              if (norm.includes('patna13')) return 2;
              if (norm.includes('gppatna') || norm.includes('gwppatna')) return 3;
              if (norm.includes('muzaffarpur')) return 4;
              if (norm.includes('bhagalpur')) return 5;
              if (norm.includes('gaya')) return 6;
              if (norm.includes('darbhanga')) return 7;
              return 100;
            };

            return [...dbColleges, ...missingHardcoded].sort((a, b) => {
              const prioA = getCollegePriority(a.name);
              const prioB = getCollegePriority(b.name);
              if (prioA !== prioB) {
                return prioA - prioB;
              }
              return a.name.localeCompare(b.name);
            });
          });
        }
      } catch (err) {
        console.warn('Error querying seat matrices:', err.message);
      }
    };

    fetchCollegeProfiles();
  }, []);

  const handleAuthenticate = (student) => {
    setStudentInfo(student);
    setIsLoggedIn(true);
  };

  const handleUpdatePremiumStatus = () => {
    if (!studentInfo) return;
    try {
      const users = JSON.parse(localStorage.getItem('pk_registered_students') || '[]');
      const updatedUsers = users.map(u => {
        if (String(u.roll) === String(studentInfo.roll)) {
          return { ...u, is_premium: true };
        }
        return u;
      });
      localStorage.setItem('pk_registered_students', JSON.stringify(updatedUsers));
    } catch (err) {
      console.warn('Error updating premium status in localStorage:', err);
    }
    setStudentInfo(prev => ({ ...prev, isPremium: true }));
  };

  // 1. Standalone Admin Dashboard bypass
  if (currentPage === 'admin') {
    return <AdminDashboard colleges={colleges} setColleges={setColleges} />;
  }

  // 2. Global Authenticated Lock Check
  if (!isLoggedIn) {
    return <LoginGate onAuthenticate={handleAuthenticate} />;
  }

  // 3. Main unlocked portal layout switcher
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={handlePageChange} />;
      case 'predictor':
        return (
          <Predictor 
            colleges={colleges} 
            studentInfo={studentInfo} 
            handleUpdatePremiumStatus={handleUpdatePremiumStatus} 
          />
        );
      case 'cutoff':
        return <Cutoff />;
      case 'college-list':
        return <CollegeList colleges={colleges} />;
      case 'compare':
        return <Compare colleges={colleges} studentInfo={studentInfo} />;
      case 'guide':
        return <Guide />;
      case 'forum':
        return <Forum studentInfo={studentInfo} />;
      default:
        return <Home setCurrentPage={handlePageChange} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-bg-canvas text-slate-800 flex flex-col font-sans selection:bg-brand-primary/20 selection:text-brand-primary relative overflow-hidden">
      
      {/* Dynamic ambient background auroras */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] h-[50vw] w-[50vw] rounded-full bg-brand-primary/5 blur-[130px] animate-glow-pulse"></div>
        <div className="absolute bottom-[10%] right-[-10%] h-[40vw] w-[40vw] rounded-full bg-brand-secondary/4 blur-[120px] animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[35%] right-[10%] h-[30vw] w-[30vw] rounded-full bg-brand-primary/3 blur-[110px] animate-glow-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-[-10%] left-[15%] h-[45vw] w-[45vw] rounded-full bg-brand-secondary/3 blur-[120px] animate-glow-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Subtle dot grid pattern on canvas */}
        <div className="absolute inset-0 bg-dot-grid opacity-[0.25]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={handlePageChange} 
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          studentInfo={studentInfo}
          setStudentInfo={setStudentInfo}
        />
        <div className="flex-grow relative z-10">
          {renderPage()}
        </div>
        <Footer setCurrentPage={handlePageChange} />
      </div>
    </div>
  );
}

export default App;