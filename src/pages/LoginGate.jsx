import React, { useState } from 'react';
import { LogIn, Key, Sparkles, User, Lock, ArrowRight, ShieldCheck, AlertTriangle, GraduationCap, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logStudentLogin } from '../firebaseClient';

const LoginGate = ({ onAuthenticate }) => {
  // Authentication View State
  const [isRegistering, setIsRegistering] = useState(false);

  // Sign In Form States
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmailOrPhone, setSignUpEmailOrPhone] = useState('');
  const [signUpRoll, setSignUpRoll] = useState('');
  const [signUpRank, setSignUpRank] = useState('');
  const [signUpCategory, setSignUpCategory] = useState('UR');
  const [signUpGender, setSignUpGender] = useState('Male');
  const [signUpPassword, setSignUpPassword] = useState('');

  // UI Helper States
  const [errorMsg, setErrorMsg] = useState('');
  const [focusField, setFocusField] = useState(null);

  // Demo Creation States
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [demoName, setDemoName] = useState('');
  const [demoRank, setDemoRank] = useState('');
  const [demoCategory, setDemoCategory] = useState('UR');

  const getStoredUsers = () => {
    try {
      return JSON.parse(localStorage.getItem('pk_registered_students') || '[]');
    } catch {
      return [];
    }
  };

  const saveStoredUsers = (users) => {
    localStorage.setItem('pk_registered_students', JSON.stringify(users));
  };

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const identifier = signInIdentifier.trim();
    const password = signInPassword;

    if (!identifier || !password) {
      setErrorMsg('Please enter both your Email/Phone/Roll and Password.');
      return;
    }

    // 1. Check Default Demo Account
    if ((identifier === '12345' || identifier.toLowerCase() === 'demo@example.com' || identifier === '9876543210') && password === 'password') {
      const users = getStoredUsers();
      let demoUser = users.find(u => String(u.roll) === '12345');
      if (!demoUser) {
        demoUser = {
          name: 'Aryan Kumar',
          emailOrPhone: '9876543210',
          roll: '12345',
          rank: 1250,
          category: 'OBC',
          gender: 'Male',
          password: 'password',
          is_premium: false
        };
        users.push(demoUser);
        saveStoredUsers(users);
      }
      onAuthenticate({
        roll: '12345',
        name: 'Aryan Kumar',
        rank: 1250,
        category: 'OBC',
        gender: 'Male',
        domicile: 'Bihar',
        isPremium: demoUser.is_premium || false
      });
      return;
    }

    // 2. Check Local Storage Registered Users
    const users = getStoredUsers();
    const matchedUser = users.find(u => 
      String(u.roll) === String(identifier) || 
      String(u.emailOrPhone).toLowerCase() === String(identifier).toLowerCase()
    );

    if (matchedUser) {
      // Check if account is blocked
      if (matchedUser.is_blocked) {
        setErrorMsg('🔒 Aapka account block kar diya gaya hai. Zyada jaankari ke liye admin se contact karo: 9296276633');
        return;
      }
      if (matchedUser.password === password) {
        onAuthenticate({
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
        });
      } else {
        setErrorMsg('Incorrect Password. Please try again.');
      }
    } else {
      setErrorMsg('Account not found. Try Roll: 12345, Pass: password or click "Create one now".');
    }
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const name = signUpName.trim();
    const emailOrPhone = signUpEmailOrPhone.trim();
    const roll = signUpRoll.trim();
    const rankVal = parseInt(signUpRank);
    const category = signUpCategory;
    const gender = signUpGender;
    const password = signUpPassword;

    // Validation
    if (!name || !emailOrPhone || !roll || isNaN(rankVal) || rankVal <= 0 || !password) {
      setErrorMsg('Please fill in all details correctly. Rank must be a positive number.');
      return;
    }

    const users = getStoredUsers();

    // Check if Roll number or Email/Phone already exists
    if (
      String(roll) === '12345' || 
      String(emailOrPhone) === '9876543210' ||
      users.some(u => 
        String(u.roll) === String(roll) || 
        String(u.emailOrPhone).toLowerCase() === String(emailOrPhone).toLowerCase()
      )
    ) {
      setErrorMsg('This roll number or email/phone is already registered. Please sign in instead.');
      return;
    }

    // Save user to simulated DB (localStorage)
    const newUser = {
      name,
      emailOrPhone,
      roll,
      rank: rankVal,
      category,
      gender,
      password,
      is_premium: false
    };

    users.push(newUser);
    saveStoredUsers(users);

    // Authenticate instantly
    onAuthenticate({
      roll,
      name,
      rank: rankVal,
      category,
      gender,
      domicile: 'Bihar',
      isPremium: false
    });
  };

  const handleDemoUnlock = () => {
    setShowDemoForm(true);
  };

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (!demoName.trim() || !demoRank.trim()) {
      alert("Please enter both Name and Rank.");
      return;
    }

    const rankVal = parseInt(demoRank);
    if (isNaN(rankVal) || rankVal <= 0) {
      alert("Please enter a valid rank.");
      return;
    }

    // Generate a unique 5-digit roll number starting with 9
    const mockRoll = String(Math.floor(20000 + Math.random() * 70000));
    const users = getStoredUsers();
    
    const newDemoUser = {
      name: demoName.trim(),
      emailOrPhone: 'demo_' + mockRoll + '@demo.com',
      roll: mockRoll,
      rank: rankVal,
      category: demoCategory,
      gender: 'Male',
      password: 'password',
      is_premium: false
    };

    users.push(newDemoUser);
    saveStoredUsers(users);

    const studentObj = {
      roll: mockRoll,
      name: demoName.trim(),
      rank: rankVal,
      category: demoCategory,
      gender: 'Male',
      domicile: 'Bihar',
      isPremium: false
    };

    // Log this demo login
    logStudentLogin(studentObj, true);

    onAuthenticate(studentObj);
  };

  const toggleView = () => {
    setErrorMsg('');
    setIsRegistering(!isRegistering);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#f8fafc] font-inter text-slate-800 select-none">
      
      {/* LEFT PANEL: Splendid Brand Showcase */}
      <div className="md:w-1/2 flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-gradient-to-br from-[#2E1065] via-[#1E1B4B] to-[#0F172A] relative overflow-hidden text-white">
        
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-brand-secondary/15 blur-[120px] animate-glow-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-10 h-[300px] w-[300px] rounded-full bg-brand-primary/15 blur-[100px] animate-glow-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-dot-grid opacity-[0.05] pointer-events-none"></div>

        {/* Top: Brand Header */}
        <div className="flex items-center gap-3 relative z-10 animate-float-slow">
          <div className="h-11 w-11 bg-gradient-to-br from-brand-primary to-purple-500 text-white rounded-2xl flex items-center justify-center font-black shadow-[0_4px_15px_rgba(90,36,179,0.3)]">
            <span className="font-outfit text-2xl">P</span>
          </div>
          <span className="text-2xl font-black font-outfit tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            Polytechnic<span className="text-brand-secondary">Karle</span>
          </span>
        </div>

        {/* Center Card: Glassmorphic description */}
        <div className="my-12 md:my-auto space-y-6 relative z-10 max-w-lg bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          {/* Sparkles Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white border border-white/10 text-[11px] font-bold tracking-wider uppercase select-none">
            <Sparkles className="h-4 w-4 text-brand-tertiary animate-pulse" />
            <span>DCECE 2026 COUNSELLING</span>
          </div>

          {/* Headline with Glow */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit leading-[1.15] tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            Predict your <br />
            future college <br />
            <span className="text-brand-tertiary glow-primary">with accuracy.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 font-medium text-sm sm:text-base leading-relaxed">
            Join thousands of Bihar engineering aspirants who trust PolytechnicKarle for data-driven seat matrix forecasting and cutoff insights.
          </p>
        </div>

        {/* Bottom Panel: Statistics */}
        <div className="flex items-center gap-5 relative z-10 bg-black/10 backdrop-blur-xs p-4 rounded-2xl border border-white/5 self-start select-none">
          <div className="flex -space-x-2.5 overflow-hidden">
            <div className="inline-block h-9 w-9 rounded-full ring-2 ring-[#1E1B4B] bg-brand-primary text-white flex items-center justify-center text-[10.5px] font-black uppercase font-outfit select-none">AK</div>
            <div className="inline-block h-9 w-9 rounded-full ring-2 ring-[#1E1B4B] bg-brand-secondary text-white flex items-center justify-center text-[10.5px] font-black uppercase font-outfit select-none">SP</div>
            <div className="inline-block h-9 w-9 rounded-full ring-2 ring-[#1E1B4B] bg-brand-tertiary text-white flex items-center justify-center text-[10.5px] font-black uppercase font-outfit select-none">RK</div>
            <div className="inline-block h-9 w-9 rounded-full ring-2 ring-[#1E1B4B] bg-brand-neutral text-white flex items-center justify-center text-[10.5px] font-black uppercase font-outfit select-none">MD</div>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-white">Over 10,000+ candidates joined</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Verified admissions tracking active</p>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: Sign In / Sign Up Controls */}
      <div className="md:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 bg-white relative">
        <div className="absolute bottom-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-brand-primary/5 blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-sm space-y-6 relative z-10">
          
          <AnimatePresence mode="wait">
            {!isRegistering ? (
              <motion.div
                key="signin-view"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Header & Status Indicator */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 select-none">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-secondary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-secondary shadow-[0_0_8px_#00B388]"></span>
                    </span>
                    <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase font-outfit">Portal Security: Active</span>
                  </div>

                  <h2 className="text-3xl font-black font-outfit tracking-tight text-slate-900">Welcome Back</h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">Sign in to your candidate account to continue</p>
                </div>

                {/* Form Card */}
                <div className="border border-slate-200/70 rounded-3xl p-6 sm:p-8 bg-white shadow-xl shadow-slate-100/50">
                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    {/* Identifier Input */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">EMAIL OR PHONE NUMBER</label>
                      <div className="relative">
                        <User className={`absolute left-3.5 top-3.5 h-4.5 w-4.5 transition-colors duration-300 ${focusField === 'signin-id' ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input 
                          type="text"
                          required
                          value={signInIdentifier}
                          onFocus={() => setFocusField('signin-id')}
                          onBlur={() => setFocusField(null)}
                          onChange={(e) => setSignInIdentifier(e.target.value)}
                          placeholder="e.g. student@gmail.com or 9876543210"
                          className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-900 text-sm w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:shadow-[0_0_15px_rgba(90,36,179,0.05)] transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold tracking-widest font-outfit">
                        <span className="text-slate-500 uppercase">PASSWORD</span>
                      </div>
                      <div className="relative">
                        <Lock className={`absolute left-3.5 top-3.5 h-4.5 w-4.5 transition-colors duration-300 ${focusField === 'signin-pass' ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input 
                          type="password"
                          required
                          value={signInPassword}
                          onFocus={() => setFocusField('signin-pass')}
                          onBlur={() => setFocusField(null)}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          placeholder="•••••••••"
                          className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-900 text-sm w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:shadow-[0_0_15px_rgba(90,36,179,0.05)] transition-all duration-300"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-start gap-2.5 text-rose-600 text-xs">
                        <AlertTriangle className="h-4.5 w-4.5 text-rose-500 mt-0.5 flex-shrink-0" />
                        <span className="font-semibold leading-relaxed">{errorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-700 hover:to-brand-primary text-white font-extrabold font-outfit py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer text-sm shadow-sm hover:shadow-md"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="h-4.5 w-4.5" />
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="signup-view"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 select-none">
                    <Sparkles className="h-3.5 w-3.5 text-brand-primary animate-pulse" />
                    <span className="text-[9px] font-bold tracking-widest text-brand-primary uppercase font-outfit">Free Student Registration</span>
                  </div>

                  <h2 className="text-3xl font-black font-outfit tracking-tight text-slate-900">Create Account</h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">Register with your actual rank for targeted predictions</p>
                </div>

                {/* Form Card */}
                <div className="border border-slate-200/70 rounded-3xl p-6 bg-white shadow-xl shadow-slate-100/50">
                  <form onSubmit={handleSignUpSubmit} className="space-y-3">
                    {/* Full Name */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Full Name</label>
                      <div className="relative">
                        <User className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-300 ${focusField === 'name' ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input 
                          type="text"
                          required
                          value={signUpName}
                          onFocus={() => setFocusField('name')}
                          onBlur={() => setFocusField(null)}
                          onChange={(e) => setSignUpName(e.target.value)}
                          placeholder="e.g. Aryan Kumar"
                          className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                    </div>

                    {/* Email or Phone */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Email or Phone Number</label>
                      <input 
                        type="text"
                        required
                        value={signUpEmailOrPhone}
                        onChange={(e) => setSignUpEmailOrPhone(e.target.value)}
                        placeholder="e.g. student@gmail.com or 9876543210"
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>

                    {/* Roll & Rank Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-outfit">DCECE Roll No</label>
                        <input 
                          type="text"
                          required
                          value={signUpRoll}
                          onChange={(e) => setSignUpRoll(e.target.value)}
                          placeholder="e.g. 56214"
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-outfit">UR Rank</label>
                        <div className="relative">
                          <GraduationCap className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input 
                            type="number"
                            required
                            min="1"
                            value={signUpRank}
                            onChange={(e) => setSignUpRank(e.target.value)}
                            placeholder="e.g. 1250"
                            className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category & Gender Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Category</label>
                        <select
                          value={signUpCategory}
                          onChange={(e) => setSignUpCategory(e.target.value)}
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 text-xs w-full focus:border-brand-primary"
                        >
                          <option value="UR">UR (Unreserved)</option>
                          <option value="BC">BC (OBC)</option>
                          <option value="EBC">EBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                          <option value="EWS">EWS</option>
                        </select>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Gender</label>
                        <select
                          value={signUpGender}
                          onChange={(e) => setSignUpGender(e.target.value)}
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 text-xs w-full focus:border-brand-primary"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-outfit">Choose Password</label>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-2.5 h-4 w-4 transition-colors duration-300 ${focusField === 'signup-pass' ? 'text-brand-primary' : 'text-slate-400'}`} />
                        <input 
                          type="password"
                          required
                          value={signUpPassword}
                          onFocus={() => setFocusField('signup-pass')}
                          onBlur={() => setFocusField(null)}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="•••••••••"
                          className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-900 text-xs w-full focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-start gap-2 text-rose-600 text-xs">
                        <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                        <span className="font-semibold">{errorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-brand-primary to-purple-650 hover:from-purple-750 hover:to-brand-primary text-white font-extrabold font-outfit py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer text-xs shadow-xs"
                    >
                      <span>Create Account & Enter Portal</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle View Link */}
          <div className="text-center text-xs font-semibold text-slate-500 select-none">
            {!isRegistering ? (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={toggleView}
                  className="text-brand-primary hover:underline font-extrabold font-outfit cursor-pointer inline bg-transparent border-none p-0"
                >
                  Create one now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  onClick={toggleView}
                  className="text-brand-primary hover:underline font-extrabold font-outfit cursor-pointer inline bg-transparent border-none p-0"
                >
                  Sign in now
                </button>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-slate-300 select-none">
            <div className="flex-grow h-[1px] bg-slate-200"></div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">OR TRY INSTANTLY</span>
            <div className="flex-grow h-[1px] bg-slate-200"></div>
          </div>

          {/* Demo Button */}
          <button
            onClick={handleDemoUnlock}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-brand-primary/30 font-bold font-outfit py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer text-sm shadow-xs"
          >
            <Key className="h-4 w-4 text-brand-primary" />
            <span>Create Demo Account (No Email)</span>
          </button>

        </div>
      </div>

      {/* Demo Account Parameters Modal popup */}
      <AnimatePresence>
        {showDemoForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden w-full max-w-sm z-10 flex flex-col p-6 space-y-5 shadow-[0_15px_50px_rgba(90,36,179,0.08)] text-slate-800"
            >
              <button 
                type="button"
                onClick={() => setShowDemoForm(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-all cursor-pointer border-none"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center space-y-1.5 pt-2">
                <div className="h-10 w-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center mx-auto">
                  <Key className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold font-outfit text-slate-900">
                  Instant Prediction Demo
                </h3>
                <p className="text-xs text-slate-500 font-inter max-w-xs leading-relaxed mx-auto">
                  Enter your real name and DCECE rank to get immediate estimates matching your rank (No email or password needed).
                </p>
              </div>

              <form onSubmit={handleDemoSubmit} className="space-y-4">
                {/* Name field */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kumar Shanu"
                    value={demoName}
                    onChange={(e) => setDemoName(e.target.value)}
                    className="px-3.5 py-2.5 border border-slate-200 focus:border-brand-primary outline-none text-slate-850 text-xs font-semibold rounded-xl bg-slate-50/50 font-inter"
                  />
                </div>

                {/* Rank field */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-outfit">DCECE UR Rank</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 4850"
                    value={demoRank}
                    onChange={(e) => setDemoRank(e.target.value)}
                    className="px-3.5 py-2.5 border border-slate-200 focus:border-brand-primary outline-none text-slate-850 text-xs font-semibold rounded-xl bg-slate-50/50 font-inter"
                  />
                </div>

                {/* Category Selection dropdown */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-550 uppercase tracking-widest font-outfit">Category</label>
                  <select
                    value={demoCategory}
                    onChange={(e) => setDemoCategory(e.target.value)}
                    className="px-3 py-2.5 border border-slate-200 focus:border-brand-primary outline-none text-slate-800 text-xs font-bold bg-slate-50/50 rounded-xl cursor-pointer"
                  >
                    <option value="UR">UR (Unreserved)</option>
                    <option value="BC">BC (OBC)</option>
                    <option value="EBC">EBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-primary to-purple-650 hover:from-purple-750 hover:to-brand-primary text-white font-extrabold font-outfit py-3 rounded-xl text-xs transition-all cursor-pointer mt-4 shadow-sm"
                >
                  Unlock Predictor & Log In
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginGate;
