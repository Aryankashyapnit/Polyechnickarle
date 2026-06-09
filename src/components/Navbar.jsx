import React, { useState } from 'react';
import { Menu, X, LogIn, LogOut, User, Lock, CheckCircle2, AlertTriangle, ShieldCheck, Share2, GraduationCap, Award, BookOpen, Edit3, Copy, Check, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logStudentLogin } from '../firebaseClient';

const getDefaultAvatar = (name) => {
  const initials = (name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23F3E8FF"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="38" font-weight="bold" fill="%236B21A8">${initials}</text></svg>`;
};

const Navbar = ({ currentPage, setCurrentPage, isLoggedIn, setIsLoggedIn, studentInfo, setStudentInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Profile Edit states
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editRank, setEditRank] = useState('');
  const [editCategoryRank, setEditCategoryRank] = useState('');
  const [editCourseGroup, setEditCourseGroup] = useState('PE');
  const [editApplicationNo, setEditApplicationNo] = useState('');
  const [editRoll, setEditRoll] = useState('');
  const [editQualBoard, setEditQualBoard] = useState('');
  const [editQualYear, setEditQualYear] = useState('');
  const [editQualMarks, setEditQualMarks] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editEmailOrPhone, setEditEmailOrPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const openProfileModal = () => {
    if (studentInfo) {
      setEditName(studentInfo.name || '');
      setEditCategory(studentInfo.category || 'UR');
      setEditRank(studentInfo.rank || '');
      setEditCategoryRank(studentInfo.categoryRank || '');
      setEditCourseGroup(studentInfo.courseGroup || 'PE');
      setEditApplicationNo(studentInfo.applicationNo || '');
      setEditRoll(studentInfo.roll || '');
      setEditQualBoard(studentInfo.qualBoard || '');
      setEditQualYear(studentInfo.qualYear || '');
      setEditQualMarks(studentInfo.qualMarks || '');
      setEditPhoto(studentInfo.profilePhoto || '');
      
      // Load password & email from localStorage
      try {
        const users = JSON.parse(localStorage.getItem('pk_registered_students') || '[]');
        const matched = users.find(u => String(u.roll) === String(studentInfo.roll));
        if (matched) {
          setEditEmailOrPhone(matched.emailOrPhone || '');
          setEditPassword(matched.password || 'password');
        } else {
          setEditEmailOrPhone(studentInfo.emailOrPhone || '');
          setEditPassword('password');
        }
      } catch {
        setEditEmailOrPhone(studentInfo.emailOrPhone || '');
        setEditPassword('password');
      }
    }
    setIsEditing(false);
    setIsProfileModalOpen(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleCopyReferral = () => {
    const code = `PK-${(studentInfo?.name || 'STUDENT').split(' ')[0].toUpperCase()}-${studentInfo?.roll || 'ROLL'}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editRoll.trim() || !editRank) {
      alert("Name, Roll Number, and UR Rank are required.");
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('pk_registered_students') || '[]');
      const userIndex = users.findIndex(u => String(u.roll) === String(studentInfo.roll));

      const updatedUserFields = {
        name: editName.trim(),
        roll: editRoll.trim(),
        rank: parseInt(editRank),
        category: editCategory,
        categoryRank: editCategoryRank.trim(),
        courseGroup: editCourseGroup,
        applicationNo: editApplicationNo.trim(),
        qualBoard: editQualBoard.trim(),
        qualYear: editQualYear.trim(),
        qualMarks: editQualMarks.trim(),
        profilePhoto: editPhoto,
        emailOrPhone: editEmailOrPhone.trim(),
        password: editPassword,
      };

      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          ...updatedUserFields
        };
      } else {
        users.push({
          ...updatedUserFields,
          is_premium: studentInfo.isPremium || false
        });
      }

      localStorage.setItem('pk_registered_students', JSON.stringify(users));

      const updatedStudent = {
        ...studentInfo,
        ...updatedUserFields
      };

      setStudentInfo(updatedStudent);

      // Log login updates to Firebase
      logStudentLogin(updatedStudent, studentInfo.roll === '12345');

      setIsEditing(false);
      setSuccessToast('Profile details updated successfully!');
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile changes.');
    }
  };


  // Login form state
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'predictor', label: 'Predictor' },
    { id: 'cutoff', label: 'Cutoff' },
    { id: 'college-list', label: 'College List' },
    { id: 'compare', label: 'Compare' },
    { id: 'guide', label: 'Guide' },
    { id: 'forum', label: 'Forum' }
  ];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const roll = rollNumber.trim();
    const pass = password;

    // 1. Check Default Demo Account
    if (roll === '12345' && pass === 'password') {
      let demoUser = { is_premium: false };
      try {
        const users = JSON.parse(localStorage.getItem('pk_registered_students') || '[]');
        let found = users.find(u => String(u.roll) === '12345');
        if (!found) {
          found = {
            name: 'Aryan Kumar',
            emailOrPhone: '9876543210',
            roll: '12345',
            rank: 1250,
            category: 'OBC',
            gender: 'Male',
            password: 'password',
            is_premium: false
          };
          users.push(found);
          localStorage.setItem('pk_registered_students', JSON.stringify(users));
        }
        demoUser = found;
      } catch (err) {
        console.warn('Error reading demo user:', err);
      }

      const studentObj = {
        roll: '12345',
        name: 'Aryan Kumar',
        rank: 1250,
        category: 'OBC',
        gender: 'Male',
        domicile: 'Bihar',
        isPremium: demoUser.is_premium || false
      };
      setStudentInfo(studentObj);
      logStudentLogin(studentObj, true);
      
      setIsLoggedIn(true);
      setIsLoginOpen(false);
      setRollNumber('');
      setPassword('');

      // Show success toast
      setSuccessToast('Successfully Authenticated as Aryan Kumar!');
      setTimeout(() => setSuccessToast(''), 3000);
      return;
    }

    // 2. Check local storage registered students
    try {
      const users = JSON.parse(localStorage.getItem('pk_registered_students') || '[]');
      const matchedUser = users.find(u => String(u.roll) === String(roll));
      if (matchedUser) {
        // Check if account is blocked
        if (matchedUser.is_blocked) {
          setErrorMsg('🔒 Aapka account block kar diya gaya hai. Contact: 9296276633');
          return;
        }
        if (matchedUser.password === pass) {
          const studentObj = {
            roll: matchedUser.roll,
            name: matchedUser.name,
            rank: parseInt(matchedUser.rank),
            category: matchedUser.category,
            gender: matchedUser.gender,
            domicile: 'Bihar',
            isPremium: matchedUser.is_premium || false,
            profilePhoto: matchedUser.profilePhoto || '',
            courseGroup: matchedUser.courseGroup || 'PE',
            categoryRank: matchedUser.categoryRank || '',
            applicationNo: matchedUser.applicationNo || '',
            qualBoard: matchedUser.qualBoard || '',
            qualYear: matchedUser.qualYear || '',
            qualMarks: matchedUser.qualMarks || '',
            emailOrPhone: matchedUser.emailOrPhone || '',
          };
          setStudentInfo(studentObj);
          logStudentLogin(studentObj, false);

          setIsLoggedIn(true);
          setIsLoginOpen(false);
          setRollNumber('');
          setPassword('');
          setSuccessToast(`Successfully Authenticated as ${matchedUser.name}!`);
          setTimeout(() => setSuccessToast(''), 3000);
        } else {
          setErrorMsg('Incorrect Password. Please try again.');
        }
      } else {
        setErrorMsg('Invalid DCECE Roll Number or Password. Try Roll: 12345, Pass: password');
      }
    } catch (err) {
      setErrorMsg('Error checking credentials. Try Roll: 12345, Pass: password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudentInfo(null);
    setIsProfileOpen(false);
    setSuccessToast('Successfully Logged Out.');
    setTimeout(() => setSuccessToast(''), 2500);
  };

  return (
    <>
      <nav className="glass-premium sticky top-0 z-40 shadow-xs select-none text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo */}
            <div 
              onClick={() => setCurrentPage('home')}
              className="flex-shrink-0 flex items-center gap-3 cursor-pointer select-none"
            >
              <img 
                src="/logo.png" 
                alt="Polytechnic Karle Logo" 
                className="h-10 w-10 object-contain rounded-full border border-slate-200"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="text-xl md:text-2xl font-bold font-outfit text-slate-900 tracking-tight">
                Polytechnic <span className="text-brand-primary opacity-90 font-medium">Karle</span>
              </span>
            </div>
            
            {/* Desktop Menu links */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`px-3 py-2 text-[15px] font-semibold transition-all relative font-outfit cursor-pointer ${
                      isActive 
                        ? 'text-brand-primary' 
                        : 'text-slate-600 hover:text-brand-primary'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span 
                        layoutId="activeTabUnderline"
                        className="absolute bottom-[-10px] left-3 right-3 h-[3px] bg-brand-primary rounded-full" 
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Authentication Widget (Desktop) */}
            <div className="hidden md:flex items-center relative">
              {isLoggedIn ? (
                <button 
                  onClick={openProfileModal}
                  className="flex items-center gap-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15 border border-brand-primary/20 px-3.5 py-2 rounded-xl text-sm font-bold font-outfit hover:shadow-xs transition-all cursor-pointer"
                >
                  <img 
                    src={studentInfo.profilePhoto || getDefaultAvatar(studentInfo.name)}
                    alt="Student Avatar"
                    className="h-6 w-6 rounded-full border border-brand-primary/20 object-cover flex-shrink-0"
                  />
                  <span>Welcome, {studentInfo.name.split(' ')[0]}</span>
                  {studentInfo.isPremium && <span className="ml-1 text-[10px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-full select-none">👑 PRO</span>}
                </button>
              ) : (
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-700 hover:to-brand-primary text-white px-5 py-2.5 rounded-lg text-sm font-extrabold font-outfit shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Student Login</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-600 hover:text-brand-primary p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-slate-200/80 shadow-lg px-4 pt-2 pb-6 space-y-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-base font-semibold font-outfit transition-all flex items-center justify-between cursor-pointer ${
                    isActive 
                      ? 'bg-brand-primary/10 text-brand-primary' 
                      : 'text-slate-650 hover:bg-slate-50 hover:text-brand-primary'
                  }`}
                >
                  {item.label}
                  {isActive && <span className="h-2 w-2 rounded-full bg-brand-primary" />}
                </button>
              );
            })}
            
            {/* Mobile Authentication Block */}
            <div className="pt-4 border-t border-slate-200 select-none">
              {isLoggedIn ? (
                <div 
                  onClick={() => {
                    openProfileModal();
                    setIsOpen(false);
                  }}
                  className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={studentInfo.profilePhoto || getDefaultAvatar(studentInfo.name)}
                      alt="Student Avatar"
                      className="h-11 w-11 rounded-full border border-brand-primary/20 object-cover flex-shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Logged In Candidate</span>
                      <h4 className="font-extrabold text-slate-900 text-sm font-outfit leading-tight flex items-center gap-1">
                        <span>{studentInfo.name}</span>
                        {studentInfo.isPremium && <span className="text-[8px] bg-amber-500 text-white px-1 py-0.5 rounded-full font-black">PRO</span>}
                      </h4>
                      <span className="block text-xs text-slate-500">Rank: {studentInfo.rank} | Category: {studentInfo.category}</span>
                    </div>
                  </div>
                  <div className="w-full bg-brand-primary/10 text-brand-primary py-2.5 rounded-lg text-xs font-bold font-outfit text-center">
                    View & Edit Profile Details
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-700 hover:to-brand-primary text-white py-3 rounded-lg text-base font-bold font-outfit shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Student Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 5. Authentic Toast Notifications */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-white text-slate-800 border border-slate-200 px-5 py-4 rounded-xl flex items-center gap-3 shadow-2xl z-50 max-w-sm select-none"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold font-inter">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Authentic Student Login Modal Popup */}
      <AnimatePresence>
        {isLoginOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 relative shadow-[0_15px_50px_rgba(90,36,179,0.08)]"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setIsLoginOpen(false);
                  setErrorMsg('');
                  setRollNumber('');
                  setPassword('');
                }}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Icon / Brand Title */}
              <div className="flex flex-col items-center text-center space-y-2 mb-6 pt-2">
                <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-outfit bg-gradient-to-r from-slate-950 to-brand-primary bg-clip-text text-transparent">
                  Student Portal Login
                </h3>
                <p className="text-slate-500 font-inter text-[12px] max-w-xs leading-relaxed">
                  Enter your official DCECE credentials to verify your profile and access precision predictor estimates.
                </p>
              </div>

              {/* Form details */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Roll input */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-outfit">DCECE Roll Number</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                    <input 
                      type="text"
                      required
                      placeholder="e.g. 12345"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-inter text-sm w-full text-slate-900 placeholder-slate-400 focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Counselling Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-inter text-sm w-full text-slate-900 placeholder-slate-400 focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Errors display */}
                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-250 p-3 rounded-lg flex items-start gap-2 text-rose-600 text-xs select-none">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span className="font-semibold leading-relaxed">{errorMsg}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-700 hover:to-brand-primary text-white font-bold font-outfit py-3 rounded-lg text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98 cursor-pointer"
                >
                  <LogIn className="h-4.5 w-4.5" />
                  <span>Authenticate Profile</span>
                </button>

                {/* Default Credentials tips */}
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-2.5 text-center mt-3 select-none flex items-center gap-2 justify-center border-l-2 border-l-brand-primary">
                  <ShieldCheck className="h-4.5 w-4.5 text-brand-primary flex-shrink-0" />
                  <span className="text-[10px] text-brand-primary font-bold tracking-wider font-outfit uppercase">
                    Testing Credentials: 12345 / password
                  </span>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Candidate Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative text-slate-800"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsEditing(false);
                }}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-855 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors cursor-pointer z-10"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Modal Banner Background */}
              <div className="h-16 bg-gradient-to-r from-brand-primary/90 to-purple-600 relative">
                <div className="absolute -bottom-7 left-5">
                  <div className="relative group">
                    <img 
                      src={editPhoto || studentInfo.profilePhoto || getDefaultAvatar(studentInfo.name)}
                      alt="Student Avatar"
                      className="h-14 w-14 rounded-xl border-2 border-white bg-slate-100 object-cover shadow-sm"
                    />
                    {isEditing && (
                      <label 
                        htmlFor="profile-photo-upload" 
                        className="absolute inset-0 bg-black/50 rounded-xl flex flex-col items-center justify-center cursor-pointer text-white transition-all hover:bg-black/60"
                      >
                        <Camera className="h-4 w-4 mb-0.5" />
                        <span className="text-[8px] font-bold uppercase tracking-wider">Change</span>
                        <input 
                          type="file" 
                          id="profile-photo-upload" 
                          accept="image/*" 
                          onChange={handlePhotoChange} 
                          className="hidden" 
                        />
                      </label>
                    )}
                    {studentInfo.isPremium && (
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] font-black px-1 py-0.5 rounded-full shadow-xs border border-white">
                        👑 PRO
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="pt-9 px-5 pb-4 space-y-3">
                {!isEditing ? (
                  <>
                    {/* Header Info */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold font-outfit text-slate-900 leading-tight flex items-center gap-1.5">
                          <span>{studentInfo.name}</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 font-inter">
                          {(() => {
                            try {
                              const users = JSON.parse(localStorage.getItem('pk_registered_students') || '[]');
                              const u = users.find(x => String(x.roll) === String(studentInfo.roll));
                              return u?.emailOrPhone && !u.emailOrPhone.includes('@demo.com') ? u.emailOrPhone : 'Demo Account';
                            } catch { return 'DCECE Exam Candidate'; }
                          })()}
                        </p>
                      </div>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-bold font-outfit cursor-pointer transition-colors"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit Profile</span>
                      </button>
                    </div>

                    {/* Demo Account Upgrade Banner — Dismissible */}
                    {(() => {
                      try {
                        const users = JSON.parse(localStorage.getItem('pk_registered_students') || '[]');
                        const u = users.find(x => String(x.roll) === String(studentInfo.roll));
                        const isDemo = !u?.emailOrPhone || u.emailOrPhone.includes('@demo.com');
                        if (!isDemo) return null;

                        // Check if user has dismissed this banner
                        const dismissedKey = `pk_demo_banner_dismissed_${studentInfo.roll}`;
                        const isDismissed = localStorage.getItem(dismissedKey) === 'true';
                        if (isDismissed) return null;

                        return (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2.5 relative">
                            {/* Dismiss (X) Button */}
                            <button
                              onClick={() => {
                                localStorage.setItem(dismissedKey, 'true');
                                // Force re-render by closing and reopening (trigger state update)
                                setIsProfileModalOpen(false);
                                setTimeout(() => setIsProfileModalOpen(true), 10);
                              }}
                              className="absolute top-2 right-2 text-amber-400 hover:text-amber-700 hover:bg-amber-100 p-0.5 rounded-full transition-colors cursor-pointer"
                              title="Dismiss"
                            >
                              <X className="h-3 w-3" />
                            </button>

                            <span className="text-base leading-none mt-0.5">⚡</span>
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-[11px] font-bold text-amber-800">Demo Account — Upgrade karo!</p>
                              <p className="text-[10px] text-amber-700 leading-snug mt-0.5">
                                Edit Profile me jaake apna <strong>Email / Phone</strong> aur <strong>Password</strong> set karo taaki next time roll number ki jagah in se bhi login kar sako.
                              </p>
                              <button
                                onClick={() => setIsEditing(true)}
                                className="mt-1.5 inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-extrabold px-2 py-1 rounded-md cursor-pointer transition-colors font-outfit"
                              >
                                <Edit3 className="h-2.5 w-2.5" />
                                Account Complete Karo
                              </button>
                            </div>
                          </div>
                        );
                      } catch { return null; }
                    })()}

                    {/* Academic & Exam Details Section */}
                    <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                        <GraduationCap className="h-4 w-4 text-brand-primary" />
                        <span>Exam & Academic Details (परीक्षा और शैक्षणिक विवरण)</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
                        {/* Course Group */}
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Course Group</span>
                          <span className="block font-bold text-slate-800">{studentInfo.courseGroup || 'PE (Polytechnic)'}</span>
                        </div>

                        {/* Registration Number */}
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Registration No</span>
                          <span className="block font-bold text-slate-800">{studentInfo.applicationNo || 'Not Provided'}</span>
                        </div>

                        {/* Exam Roll */}
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Roll Number</span>
                          <span className="block font-bold text-slate-800">{studentInfo.roll}</span>
                        </div>

                        {/* Qualification */}
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Educational Qualification</span>
                          <span className="block font-bold text-slate-800 leading-tight">
                            {studentInfo.qualBoard ? `${studentInfo.qualBoard} Board` : 'Not Provided'}
                            {studentInfo.qualYear ? `, ${studentInfo.qualYear}` : ''}
                            {studentInfo.qualMarks ? ` (${studentInfo.qualMarks}%)` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rank / Score Card Section */}
                    <div className="border border-slate-150 rounded-xl p-3 bg-slate-50/50 space-y-2">
                      <h4 className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                        <Award className="h-4 w-4 text-brand-primary" />
                        <span>Rank & Score Card</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
                        <div className="bg-white border border-slate-200 p-2 rounded-lg flex flex-col">
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Open UR Rank</span>
                          <span className="text-sm text-brand-primary font-black mt-0.5">{studentInfo.rank}</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-2 rounded-lg flex flex-col">
                          <span className="text-[9px] text-slate-400 uppercase font-bold">{studentInfo.category} Category Rank</span>
                          <span className="text-sm text-brand-primary font-black mt-0.5">{studentInfo.categoryRank || 'Not Provided'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Refer & Earn Section */}
                    <div className="border border-purple-100 rounded-xl p-3 bg-purple-50/30 flex items-center justify-between gap-2.5">
                      <div className="space-y-0.5">
                        <h4 className="text-[11px] font-extrabold text-brand-primary flex items-center gap-1">
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Refer & Earn (रेफर और कमाएं)</span>
                        </h4>
                        <p className="text-[10px] text-purple-700 leading-tight">Share this referral code with friends to earn premium predictor tokens.</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white border border-purple-200 pl-2 pr-0.5 py-0.5 rounded-lg shadow-xs">
                        <span className="text-[11px] font-black text-slate-900 tracking-wider">
                          {`PK-${(studentInfo?.name || 'STUDENT').split(' ')[0].toUpperCase()}-${studentInfo?.roll || 'ROLL'}`}
                        </span>
                        <button 
                          onClick={handleCopyReferral}
                          className="bg-brand-primary hover:bg-purple-700 text-white p-1.5 rounded-md cursor-pointer transition-colors flex items-center justify-center"
                          title="Copy Code"
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Log Out Button */}
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsProfileModalOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 py-2 rounded-lg text-xs font-bold font-outfit transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out Profile</span>
                    </button>
                  </>
                ) : (
                  /* Edit Profile Form Mode */
                  <form onSubmit={handleSaveProfile} className="space-y-3">
                    <h3 className="text-base font-bold font-outfit text-slate-900 border-b pb-1.5">Edit Candidate Profile</h3>
                    
                    <div className="grid grid-cols-2 gap-2.5 text-xs font-medium max-h-[260px] overflow-y-auto pr-1">
                      {/* Name */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Candidate Name</label>
                        <input 
                          type="text" 
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>

                      {/* Course Group */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Course Group</label>
                        <select
                          value={editCourseGroup}
                          onChange={(e) => setEditCourseGroup(e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800 text-xs w-full focus:border-brand-primary"
                        >
                          <option value="PE">PE (Polytechnic)</option>
                          <option value="PM">PM (Paramedical)</option>
                          <option value="PMM">PMM</option>
                          <option value="PPE">PPE</option>
                        </select>
                      </div>

                      {/* Registration No */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Registration No</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 26010048"
                          value={editApplicationNo}
                          onChange={(e) => setEditApplicationNo(e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>

                      {/* Exam Roll */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Roll Number</label>
                        <input 
                          type="text" 
                          required
                          value={editRoll}
                          onChange={(e) => setEditRoll(e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>

                      {/* UR Rank */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Open UR Rank</label>
                        <input 
                          type="number" 
                          required
                          min="1"
                          value={editRank}
                          onChange={(e) => setEditRank(e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>

                      {/* Category Rank */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category Rank</label>
                        <input 
                          type="text" 
                          placeholder="e.g. BC-450"
                          value={editCategoryRank}
                          onChange={(e) => setEditCategoryRank(e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>

                      {/* Category Selection */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800 text-xs w-full focus:border-brand-primary"
                        >
                          <option value="UR">UR</option>
                          <option value="BC">BC (OBC)</option>
                          <option value="EBC">EBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                          <option value="EWS">EWS</option>
                        </select>
                      </div>

                      {/* Qualifying Board */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Qualifying Board (10th/12th)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. BSEB, CBSE"
                          value={editQualBoard}
                          onChange={(e) => setEditQualBoard(e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>

                      {/* Passing Year */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Passing Year</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 2024"
                          value={editQualYear}
                          onChange={(e) => setEditQualYear(e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>

                      {/* Percentage Marks */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Marks Percentage (%)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 84.5"
                          value={editQualMarks}
                          onChange={(e) => setEditQualMarks(e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>

                      {/* — Login Credentials Section — */}
                      <div className="col-span-2 pt-1.5">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-brand-primary border-t border-slate-205 pt-2">
                          <Lock className="h-3 w-3" />
                          <span>Login Credentials (Demo → Real Account)</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Yaha email/phone aur password set karo taaki roll number ki jagah in se bhi login kar sako.</p>
                      </div>

                      {/* Email/Phone */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Email or Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g. user@gmail.com or 9876543210"
                          value={editEmailOrPhone}
                          onChange={(e) => setEditEmailOrPhone(e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>

                      {/* Password */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Counselling Password</label>
                        <input 
                          type="text" 
                          placeholder="Set custom password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3 border-t">
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold font-outfit transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="bg-brand-primary hover:bg-purple-750 text-white px-4 py-2 rounded-lg text-xs font-bold font-outfit transition-colors cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;