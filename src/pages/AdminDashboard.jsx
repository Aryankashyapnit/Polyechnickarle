import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Database, Plus, Trash2, LayoutDashboard, Lock, LogOut, Shield, Save, CheckCircle,
  Edit3, Clipboard, FileSpreadsheet, UploadCloud, FileJson, X, Grid, Search, PhoneCall,
  MessageSquare, Download, CreditCard, ShieldAlert, AlertTriangle, RefreshCw, Activity,
  UserCheck, UserX, Users, Ban, CheckCircle2, ToggleLeft, ToggleRight, ChevronRight,
  TrendingUp, Bell, Star, ArrowUpRight, Zap, BookOpen, Eye, EyeOff
} from 'lucide-react';
import { db, collection, onSnapshot, query, orderBy, limit, firebaseInitialized } from '../firebaseClient';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Helpers ────────────────────────────────────────────────────────────────
const getYearFromId = (id) => {
  if (id >= 18   && id <= 2327)  return 2025;
  if (id >= 2328 && id <= 4603)  return 2024;
  if (id >= 4604 && id <= 6589)  return 2022;
  if (id >= 6590 && id <= 8968)  return 2020;
  if (id >= 8969 && id <= 10420) return 2021;
  return 2026;
};

// ─── Design Tokens ──────────────────────────────────────────────────────────
const SIDEBAR_BG   = 'linear-gradient(180deg,#0f0c29 0%,#1a1040 50%,#16122e 100%)';
const ACCENT       = '#7C3AED';
const ACCENT_LIGHT = '#a78bfa';
const CARD_GLASS   = 'rgba(255,255,255,0.04)';
const CARD_BORDER  = 'rgba(255,255,255,0.08)';

// ─── Reusable UI atoms ──────────────────────────────────────────────────────
const GlassCard = ({ children, className = '', style = {} }) => (
  <div
    className={`rounded-2xl border ${className}`}
    style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', ...style }}
  >
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, badge, color = '#7C3AED' }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className="text-lg font-black text-slate-800 font-outfit">{title}</h2>
        {badge && (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full font-outfit uppercase tracking-wider"
            style={{ background: `${color}18`, color }}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 font-inter mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const StatCard = ({ label, value, sub, icon: Icon, gradient, textColor = 'white' }) => (
  <div className="rounded-2xl p-5 flex flex-col justify-between min-h-[110px] relative overflow-hidden" style={{ background: gradient }}>
    <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-10" style={{ background: 'white' }} />
    <div className="flex items-start justify-between">
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-75" style={{ color: textColor }}>{label}</span>
      {Icon && <Icon className="h-4 w-4 opacity-70" style={{ color: textColor }} />}
    </div>
    <div>
      <div className="text-3xl font-black font-outfit" style={{ color: textColor }}>{value}</div>
      {sub && <div className="text-[10px] font-semibold mt-0.5 opacity-60" style={{ color: textColor }}>{sub}</div>}
    </div>
  </div>
);

const FormField = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600 font-outfit uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const fieldCls = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all font-inter";

const PrimaryBtn = ({ children, className = '', style = {}, ...props }) => (
  <button
    className={`flex items-center justify-center gap-2 font-bold text-sm text-white px-5 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md hover:shadow-lg ${className}`}
    style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 4px 16px rgba(124,58,237,0.35)', ...style }}
    {...props}
  >
    {children}
  </button>
);

const DangerBtn = ({ children, className = '', style = {}, ...props }) => (
  <button
    className={`flex items-center justify-center gap-2 font-bold text-sm text-white px-5 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer ${className}`}
    style={{ background: 'linear-gradient(135deg,#EF4444,#B91C1C)', ...style }}
    {...props}
  >
    {children}
  </button>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminDashboard = ({ colleges = [], setColleges }) => {

  // Auth States
  const [session, setSession] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Data States
  const [dbColleges, setDbColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    college_name: '', branch: 'Civil Engineering', category: 'UR',
    opening_rank: '', closing_rank: '', domicile: 'Bihar', exam_type: 'DCECE'
  });

  // Tab State
  const [activeTab, setActiveTab] = useState('cutoff');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Moderation
  const [reportedPosts, setReportedPosts] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const [moderationLoading, setModerationLoading] = useState(false);

  // Live Logins
  const [liveLogins, setLiveLogins] = useState([]);

  // Leads
  const [leadsAlerts, setLeadsAlerts] = useState([]);
  const [leadsConsultations, setLeadsConsultations] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsSearch, setLeadsSearch] = useState('');
  const [leadsSubTab, setLeadsSubTab] = useState('consults');
  const [paymentsLog, setPaymentsLog] = useState([]);

  // Users
  const [allUsers, setAllUsers] = useState([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [userActionMsg, setUserActionMsg] = useState('');

  // Vacancies
  const [vacanciesList, setVacanciesList] = useState([]);
  const [vacanciesLoading, setVacanciesLoading] = useState(false);
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState(null);
  const [vacancyForm, setVacancyForm] = useState({
    college_name: '', branch: 'Computer Science & Engineering',
    total_seats: '', filled_seats: '',
    ur: '', bc: '', ebc: '', sc: '', st: '', ews: '', rcg: '', dq: '', smq: ''
  });
  const [vacanciesSearch, setVacanciesSearch] = useState('');

  // Seat Matrix
  const [selectedColId, setSelectedColId] = useState(colleges[0]?.id || 1);
  const [successMsg, setSuccessMsg] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvStatus, setCsvStatus] = useState('');

  // Profile form
  const [profileLocation, setProfileLocation] = useState('');
  const [profileEstablished, setProfileEstablished] = useState('');
  const [profileFees, setProfileFees] = useState('');
  const [profileDesc, setProfileDesc] = useState('');
  const [profileBranchesText, setProfileBranchesText] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [seatMatrix, setSeatMatrix] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [rowUploadingId, setRowUploadingId] = useState(null);

  // Profile Add / Delete / Import
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeLocation, setNewCollegeLocation] = useState('');
  const [profileImportLoading, setProfileImportLoading] = useState(false);
  const [profileImportStatus, setProfileImportStatus] = useState('');

  const allBranches = Array.from(new Set(colleges.flatMap(c => Object.keys(c.seatMatrix || {})))).sort();
  const [matrixSearch, setMatrixSearch] = useState('');

  const standardBranches = [
    "Civil Engineering", "Computer Science", "Electrical Engineering",
    "Mechanical Engineering", "Electronics Engineering", "Automobile Engineering",
    "Textile Engineering", "Custom..."
  ];
  const [selectedNewBranch, setSelectedNewBranch] = useState(standardBranches[0]);
  const [customBranchName, setCustomBranchName] = useState('');
  const [newBranchSeats, setNewBranchSeats] = useState('60');

  const currentCollege = colleges.find(c => c.id === selectedColId);

  // ─── Effects ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentCollege) {
      setSeatMatrix(currentCollege.seatMatrix || {});
      setProfileLocation(currentCollege.location || '');
      setProfileEstablished(currentCollege.established || '');
      setProfileFees(currentCollege.fees || '');
      setProfileDesc(currentCollege.desc || currentCollege.description || '');
      setProfileBranchesText((currentCollege.branches || []).join(', '));
      setProfileImageUrl(currentCollege.image_url || currentCollege.image || '');
    }
  }, [selectedColId, colleges]);

  useEffect(() => {
    if (colleges.length > 0 && !colleges.some(c => c.id === selectedColId)) {
      setSelectedColId(colleges[0].id);
    }
  }, [colleges]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) { fetchColleges(); fetchLeads(); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { fetchColleges(); fetchLeads(); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && activeTab === 'moderation') fetchReportedContent();
  }, [activeTab, session]);

  useEffect(() => {
    if (!session) return;
    if (firebaseInitialized && db) {
      try {
        const q = query(collection(db, "student_logins"), orderBy("timestamp", "desc"), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const logins = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            logins.push({ id: doc.id, ...data, timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp });
          });
          setLiveLogins(logins);
        }, (error) => { console.warn("Firestore warning:", error.message); });
        return () => unsubscribe();
      } catch (err) { console.warn("Firestore snapshot error:", err.message); }
    }
    const loadSupabaseLogins = async () => {
      try {
        const { data, error } = await supabase.from('student_logins').select('*').order('created_at', { ascending: false }).limit(50);
        if (error) { loadLocalLogins(); return; }
        setLiveLogins((data || []).map(d => ({ id: d.id, roll: d.roll, name: d.name, rank: d.rank, category: d.category, isPremium: d.is_premium, isDemo: d.is_demo, timestamp: d.created_at })));
      } catch { loadLocalLogins(); }
    };
    const loadLocalLogins = () => {
      try {
        const localLogins = JSON.parse(localStorage.getItem('pk_fallback_logins') || '[]');
        setLiveLogins(localLogins.slice(-50).reverse());
      } catch (e) { console.warn(e); }
    };
    loadSupabaseLogins();
    const interval = setInterval(loadSupabaseLogins, 4000);
    return () => clearInterval(interval);
  }, [session]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault(); setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) alert("Login Failed: " + error.message);
    setAuthLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const fetchColleges = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('colleges').select('*').order('id', { ascending: false });
    if (error) console.error("Error fetching data:", error);
    else setDbColleges(data);
    setLoading(false);
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const { data: alertsData } = await supabase.from('student_leads').select('*').order('created_at', { ascending: false });
      setLeadsAlerts(alertsData || []);
      const { data: consultsData } = await supabase.from('consultations').select('*').order('created_at', { ascending: false });
      setLeadsConsultations(consultsData || []);
      try {
        const { data: paymentsData } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
        let combined = paymentsData || [];
        try {
          const local = JSON.parse(localStorage.getItem('pk_payments') || '[]');
          local.forEach(lp => { if (!combined.some(cp => cp.transaction_id === lp.transaction_id)) combined.push(lp); });
        } catch {}
        combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPaymentsLog(combined);
      } catch {
        try { setPaymentsLog(JSON.parse(localStorage.getItem('pk_payments') || '[]').sort((a,b) => new Date(b.created_at)-new Date(a.created_at))); } catch { setPaymentsLog([]); }
      }
      await fetchVacancies();
      await fetchReportedContent();
    } catch (err) { console.error("Fetch leads error:", err.message); }
    finally { setLeadsLoading(false); }
  };

  const fetchReportedContent = async () => {
    setModerationLoading(true);
    try {
      const { data: postsData } = await supabase.from('forum_posts').select('*').gt('reports_count', 0).order('reports_count', { ascending: false });
      setReportedPosts(postsData || []);
      const { data: commentsData } = await supabase.from('forum_comments').select('*').gt('reports_count', 0).order('reports_count', { ascending: false });
      setReportedComments(commentsData || []);
    } catch (err) { console.error('Error fetching reported content:', err.message); }
    finally { setModerationLoading(false); }
  };

  const handleApprovePost = async (postId) => {
    try {
      await supabase.from('forum_posts').update({ reports_count: 0, is_hidden: false }).eq('id', postId);
      await supabase.from('forum_reports').delete().eq('post_id', postId);
      alert('Post approved.'); fetchReportedContent();
    } catch (err) { alert('Error: ' + err.message); }
  };
  const handleApproveComment = async (commentId) => {
    try {
      await supabase.from('forum_comments').update({ reports_count: 0, is_hidden: false }).eq('id', commentId);
      await supabase.from('forum_reports').delete().eq('comment_id', commentId);
      alert('Comment approved.'); fetchReportedContent();
    } catch (err) { alert('Error: ' + err.message); }
  };
  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post permanently?')) return;
    try { await supabase.from('forum_posts').delete().eq('id', postId); alert('Post deleted.'); fetchReportedContent(); } catch (err) { alert('Error: ' + err.message); }
  };
  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment permanently?')) return;
    try { await supabase.from('forum_comments').delete().eq('id', commentId); alert('Comment deleted.'); fetchReportedContent(); } catch (err) { alert('Error: ' + err.message); }
  };

  const fetchVacancies = async () => {
    setVacanciesLoading(true);
    try {
      const { data } = await supabase.from('live_seat_matrix').select('*').order('college_name', { ascending: true }).order('branch', { ascending: true });
      setVacanciesList(data || []);
    } catch {}
    finally { setVacanciesLoading(false); }
  };

  const handleOpenAddVacancy = () => {
    setEditingVacancy(null);
    setVacancyForm({ college_name: colleges[0]?.name || '', branch: 'Computer Science & Engineering', total_seats: 120, filled_seats: 0, ur: 0, bc: 0, ebc: 0, sc: 0, st: 0, ews: 0, rcg: 0, dq: 0, smq: 0 });
    setShowVacancyModal(true);
  };
  const handleOpenEditVacancy = (vac) => {
    setEditingVacancy(vac);
    setVacancyForm({ college_name: vac.college_name, branch: vac.branch, total_seats: vac.total_seats, filled_seats: vac.filled_seats, ur: vac.ur, bc: vac.bc, ebc: vac.ebc, sc: vac.sc, st: vac.st, ews: vac.ews, rcg: vac.rcg, dq: vac.dq || 0, smq: vac.smq || 0 });
    setShowVacancyModal(true);
  };
  const handleSaveVacancy = async (e) => {
    e.preventDefault();
    const total = parseInt(vacancyForm.total_seats) || 0, filled = parseInt(vacancyForm.filled_seats) || 0;
    const payload = { college_name: vacancyForm.college_name, branch: vacancyForm.branch, total_seats: total, filled_seats: filled, vacant_seats: total - filled, ur: parseInt(vacancyForm.ur)||0, bc: parseInt(vacancyForm.bc)||0, ebc: parseInt(vacancyForm.ebc)||0, sc: parseInt(vacancyForm.sc)||0, st: parseInt(vacancyForm.st)||0, ews: parseInt(vacancyForm.ews)||0, rcg: parseInt(vacancyForm.rcg)||0, dq: parseInt(vacancyForm.dq)||0, smq: parseInt(vacancyForm.smq)||0 };
    try {
      if (editingVacancy) await supabase.from('live_seat_matrix').update(payload).eq('id', editingVacancy.id);
      else await supabase.from('live_seat_matrix').insert(payload);
      setShowVacancyModal(false); fetchVacancies();
    } catch (err) { alert("Error: " + err.message); }
  };
  const handleDeleteVacancy = async (id) => {
    if (!confirm("Delete this record?")) return;
    try { await supabase.from('live_seat_matrix').delete().eq('id', id); fetchVacancies(); } catch (err) { alert(err.message); }
  };
  const handleClearAllVacancies = async () => {
    if (!confirm("WARNING: Clear ALL vacancy records?")) return;
    try { await supabase.from('live_seat_matrix').delete().neq('id', 0); fetchVacancies(); } catch (err) { alert(err.message); }
  };

  const handleSeatChange = (branch, value) => setSeatMatrix({ ...seatMatrix, [branch]: parseInt(value) || 0 });

  const handleAddBranchToMatrix = () => {
    const name = selectedNewBranch === 'Custom...' ? customBranchName.trim() : selectedNewBranch;
    if (!name) { alert('Enter a branch name.'); return; }
    const updatedMatrix = { ...seatMatrix, [name]: parseInt(newBranchSeats) || 0 };
    setSeatMatrix(updatedMatrix);
    const branches = profileBranchesText.split(',').map(b => b.trim()).filter(Boolean);
    if (!branches.includes(name)) branches.push(name);
    setProfileBranchesText(branches.join(', '));
    setCustomBranchName(''); setNewBranchSeats('60');
  };

  const handleDeleteBranchFromMatrix = (branchName) => {
    if (!window.confirm(`Remove "${branchName}"?`)) return;
    const updated = { ...seatMatrix };
    delete updated[branchName];
    setSeatMatrix(updated);
    const branches = profileBranchesText.split(',').map(b => b.trim()).filter(Boolean).filter(b => b !== branchName);
    setProfileBranchesText(branches.join(', '));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `colleges/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('college-photos').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('college-photos').getPublicUrl(filePath);
      setProfileImageUrl(publicUrl);
    } catch (err) { alert(`Upload failed: ${err.message}`); }
    finally { setUploadingPhoto(false); }
  };

  const handleRowPhotoUpload = async (e, college) => {
    const file = e.target.files[0]; if (!file) return;
    setRowUploadingId(college.id);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `colleges/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('college-photos').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('college-photos').getPublicUrl(filePath);
      await supabase.from('college_profiles').upsert({ college_name: college.name, image_url: publicUrl }, { onConflict: 'college_name' });
      setColleges(prev => prev.map(c => c.id === college.id ? { ...c, image_url: publicUrl, image: publicUrl } : c));
    } catch (err) { alert(`Upload failed: ${err.message}`); }
    finally { setRowUploadingId(null); }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const branchList = profileBranchesText.split(',').map(b => b.trim()).filter(Boolean);
    const totalRegularSeats = Object.values(seatMatrix).reduce((sum, val) => sum + val, 0);
    try {
      await supabase.from('college_profiles').upsert({ college_name: currentCollege.name, location: profileLocation, established: parseInt(profileEstablished) || null, fees: profileFees, image_url: profileImageUrl, description: profileDesc, facilities: currentCollege.facilities || [], seat_matrix_regular: seatMatrix }, { onConflict: 'college_name' });
    } catch (err) { alert(`Profile save error: ${err.message}`); }
    setColleges(colleges.map(col => col.id === selectedColId ? { ...col, location: profileLocation, established: parseInt(profileEstablished) || col.established, fees: profileFees, image_url: profileImageUrl, desc: profileDesc, description: profileDesc, branches: branchList.length > 0 ? branchList : col.branches, seats: totalRegularSeats, seatMatrix } : col));
    setSuccessMsg(`Saved: ${currentCollege.name}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    if (!newCollegeName.trim() || !newCollegeLocation.trim()) return;
    const name = newCollegeName.trim(), location = newCollegeLocation.trim();
    if (colleges.some(c => c.name.toLowerCase() === name.toLowerCase())) { alert("College already exists."); return; }
    const newId = colleges.length > 0 ? Math.max(...colleges.map(c => c.id)) + 1 : 1;
    const newCollege = { id: newId, name, location, seats: 0, placement: 70, branches: [], fees: '₹8,000/year', established: new Date().getFullYear(), facilities: ['Hostel', 'Labs', 'Library'], desc: 'Information not added yet.', image: '/govt_college.jpg', image_url: null, seatMatrix: {} };
    try { await supabase.from('college_profiles').insert([{ college_name: name, location, established: newCollege.established, fees: newCollege.fees, description: newCollege.desc, facilities: newCollege.facilities, seat_matrix_regular: {} }]); } catch {}
    setColleges([...colleges, newCollege]);
    setSelectedColId(newId); setNewCollegeName(''); setNewCollegeLocation(''); setShowAddProfileModal(false);
    setSuccessMsg(`Created: ${name}`); setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteCollege = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await supabase.from('college_profiles').delete().eq('college_name', name); } catch {}
    const updated = colleges.filter(c => c.id !== id);
    setColleges(updated);
    if (selectedColId === id) setSelectedColId(updated[0]?.id || null);
    setSuccessMsg(`Deleted: ${name}`); setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddCollege = async (e) => {
    e.preventDefault(); setAdding(true);
    const { error } = await supabase.from('colleges').insert([{ college_name: formData.college_name, branch: formData.branch, category: formData.category, opening_rank: formData.opening_rank ? parseInt(formData.opening_rank) : null, closing_rank: parseInt(formData.closing_rank), domicile: formData.domicile, exam_type: formData.exam_type }]);
    if (error) alert("Error: " + error.message);
    else { setFormData({ ...formData, college_name: '', opening_rank: '', closing_rank: '' }); fetchColleges(); }
    setAdding(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this record?")) {
      const { error } = await supabase.from('colleges').delete().eq('id', id);
      if (error) alert("Error: " + error.message); else fetchColleges();
    }
  };

  const splitCSVLine = (line) => {
    const result = []; let current = ''; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
      else current += char;
    }
    result.push(current.trim()); return result;
  };

  const downloadSampleFile = (type) => {
    let content = '', filename = '', mimeType = '';
    if (type === 'csv') { content = 'college_name,branch,category,opening_rank,closing_rank,domicile,exam_type\nGP Patna-7,Computer Science,UR,100,500,Bihar,DCECE'; filename = 'sample_cutoffs.csv'; mimeType = 'text/csv'; }
    else { content = JSON.stringify([{ college_name: "GP Patna-7", branch: "Computer Science", category: "UR", opening_rank: 100, closing_rank: 500, domicile: "Bihar", exam_type: "DCECE" }], null, 2); filename = 'sample_cutoffs.json'; mimeType = 'application/json'; }
    const blob = new Blob([content], { type: mimeType }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const downloadProfileSample = (type) => {
    let content = '', filename = '', mimeType = '';
    if (type === 'csv') { content = 'college_name,location,established,fees,description,branches,Civil,CS,Electrical,Mechanical\nGP Patna-7,Gulzarbagh,1954,₹8500/year,Famous GP,Civil|CS|Electrical,120,90,90,0'; filename = 'sample_profiles.csv'; mimeType = 'text/csv'; }
    else { content = JSON.stringify([{ college_name: "GP Patna-7", location: "Gulzarbagh, Patna", established: 1954, fees: "₹8,500/year", description: "One of the oldest polytechnics.", branches: ["Civil","CS","Electrical"], seat_matrix: { Civil: 120, CS: 90, Electrical: 90 } }], null, 2); filename = 'sample_profiles.json'; mimeType = 'application/json'; }
    const blob = new Blob([content], { type: mimeType }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const downloadVacancySample = (type) => {
    let content = '', filename = '', mimeType = '';
    if (type === 'csv') { content = 'college_name,branch,total_seats,filled_seats,ur,bc,ebc,sc,st,ews,rcg,dq,smq\nGP Patna-7,Computer Science & Engineering,90,88,0,1,0,1,0,0,0,0,0'; filename = 'sample_vacancies.csv'; mimeType = 'text/csv'; }
    else { content = JSON.stringify([{ college_name: "GP Patna-7", branch: "Computer Science & Engineering", total_seats: 90, filled_seats: 88, ur: 0, bc: 1, ebc: 0, sc: 1, st: 0, ews: 0, rcg: 0, dq: 0, smq: 0 }], null, 2); filename = 'sample_vacancies.json'; mimeType = 'application/json'; }
    const blob = new Blob([content], { type: mimeType }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleExportLeadsCSV = (type) => {
    let content = '', filename = '';
    if (type === 'consults') {
      content = 'ID,Student Name,WhatsApp,UR Rank,Category,Category Rank,Preferred Branch,Preference,Created At\n';
      leadsConsultations.forEach(c => { content += `"${c.id}","${c.student_name}","${c.whatsapp_number}","${c.ur_rank}","${c.category}","${c.category_rank||'N/A'}","${c.preferred_branch}","${c.contact_preference}","${new Date(c.created_at).toLocaleString()}"\n`; });
      filename = 'consultation_bookings.csv';
    } else if (type === 'alerts') {
      content = 'ID,WhatsApp,UR Rank,Category,Category Rank,Gender,Domicile,District,Created At\n';
      leadsAlerts.forEach(a => { content += `"${a.id}","${a.whatsapp_number}","${a.ur_rank}","${a.category||'N/A'}","${a.category_rank||'N/A'}","${a.gender||'N/A'}","${a.domicile||'N/A'}","${a.home_district||'N/A'}","${new Date(a.created_at).toLocaleString()}"\n`; });
      filename = 'whatsapp_alert_subscribers.csv';
    } else {
      content = 'ID,Name,Roll,WhatsApp,Amount,Mode,TXN ID,Time\n';
      paymentsLog.forEach(p => { content += `"${p.id||''}","${p.student_name}","${p.roll_number||''}","${p.whatsapp_number||''}","${p.amount}","${p.payment_mode}","${p.transaction_id}","${new Date(p.created_at).toLocaleString()}"\n`; });
      filename = 'premium_payments_log.csv';
    }
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.setAttribute("href", url); link.setAttribute("download", filename);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleFileImport = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const isJson = file.name.endsWith('.json'), isCsv = file.name.endsWith('.csv');
    if (!isJson && !isCsv) { alert('Upload CSV or JSON.'); return; }
    setCsvLoading(true); setCsvStatus(`Reading ${isJson ? 'JSON' : 'CSV'}...`);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result; let records = [];
        const findVal = (obj, pats, def = null) => { const keys = Object.keys(obj); for (const p of pats) { const k = keys.find(k => k.toLowerCase().replace(/[^a-z0-9_]/g,'').includes(p)); if (k !== undefined && obj[k] !== undefined) return obj[k]; } return def; };
        if (isJson) {
          let jsonData = JSON.parse(text);
          let arrayData = Array.isArray(jsonData) ? jsonData : (Object.keys(jsonData).find(k => Array.isArray(jsonData[k])) ? jsonData[Object.keys(jsonData).find(k => Array.isArray(jsonData[k]))] : [jsonData]);
          for (const item of arrayData) {
            if (!item || typeof item !== 'object') continue;
            const collegeName = findVal(item, ['collegename','college','name','institute']);
            const branch = findVal(item, ['branch','course','stream']);
            const category = findVal(item, ['category','cat','caste']);
            const closingRank = findVal(item, ['closingrank','closerank','close','cutoff','closing']);
            if (!collegeName || !branch || !category || closingRank === null || isNaN(parseInt(closingRank))) continue;
            const examType = findVal(item, ['examtype','exam','type'], 'DCECE');
            if (String(examType||'').toUpperCase().includes('LE')) continue;
            records.push({ college_name: String(collegeName).trim(), branch: String(branch).trim(), category: String(category).trim(), opening_rank: parseInt(findVal(item, ['openingrank','openrank','open'])) || null, closing_rank: parseInt(closingRank), domicile: String(findVal(item, ['domicile','state'], 'Bihar')).trim(), exam_type: 'DCECE' });
          }
        } else {
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length < 2) throw new Error('CSV is empty.');
          const headers = splitCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g,''));
          const ci = headers.findIndex(h => h.includes('college')||h.includes('name')||h.includes('institute'));
          const bi = headers.findIndex(h => h.includes('branch')||h.includes('course')||h.includes('stream'));
          const cati = headers.findIndex(h => h.includes('category')||h.includes('caste'));
          const openi = headers.findIndex(h => h.includes('open'));
          const closei = headers.findIndex(h => h.includes('close')||h.includes('cutoff'));
          const exami = headers.findIndex(h => h.includes('exam')||h.includes('type'));
          const domi = headers.findIndex(h => h.includes('domicile')||h.includes('state'));
          if (ci === -1 || bi === -1 || cati === -1 || closei === -1) throw new Error('CSV missing required columns.');
          for (let i = 1; i < lines.length; i++) {
            const vals = splitCSVLine(lines[i]); if (vals.length < headers.length) continue;
            const examVal = exami !== -1 ? vals[exami] : 'DCECE';
            if (String(examVal).toUpperCase().includes('LE')) continue;
            const cr = parseInt(vals[closei]); if (isNaN(cr)) continue;
            records.push({ college_name: vals[ci], branch: vals[bi], category: vals[cati], opening_rank: openi !== -1 ? (parseInt(vals[openi])||null) : null, closing_rank: cr, domicile: domi !== -1 ? vals[domi] : 'Bihar', exam_type: 'DCECE' });
          }
        }
        if (records.length === 0) throw new Error('No valid records found.');
        setCsvStatus(`Uploading ${records.length} records...`);
        const { error } = await supabase.from('colleges').insert(records);
        if (error) throw error;
        setCsvStatus(`✅ Imported ${records.length} records.`);
        fetchColleges();
      } catch (err) { setCsvStatus(`Error: ${err.message}`); alert(`Import Failed: ${err.message}`); }
      finally { setCsvLoading(false); e.target.value = ''; }
    };
    reader.readAsText(file);
  };

  const handleProfileImport = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const isJson = file.name.endsWith('.json'), isCsv = file.name.endsWith('.csv');
    if (!isJson && !isCsv) { alert('Upload CSV or JSON.'); return; }
    setProfileImportLoading(true); setProfileImportStatus(`Reading...`);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result; let records = [];
        if (isJson) {
          const jsonData = JSON.parse(text);
          const arrayData = Array.isArray(jsonData) ? jsonData : [jsonData];
          for (const item of arrayData) {
            if (!item || typeof item !== 'object') continue;
            const name = item.college_name || item.name || item.college; if (!name) continue;
            records.push({ college_name: String(name).trim(), location: String(item.location||'').trim(), established: parseInt(item.established)||null, fees: String(item.fees||'').trim(), description: String(item.description||item.desc||'').trim(), seat_matrix_regular: item.seat_matrix||item.seatMatrix||{} });
          }
        } else {
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          const headers = splitCSVLine(lines[0]); const lh = headers.map(h => h.toLowerCase().trim());
          const ni = lh.findIndex(h => h.includes('college_name')||h.includes('name')), li = lh.findIndex(h => h==='location'), ei = lh.findIndex(h => h==='established'), fi = lh.findIndex(h => h==='fees'), di = lh.findIndex(h => h==='description'), bi = lh.findIndex(h => h==='branches');
          if (ni === -1) throw new Error('Missing college_name column.');
          const metaIdx = [ni,li,ei,fi,di,bi];
          for (let i = 1; i < lines.length; i++) {
            const vals = splitCSVLine(lines[i]); if (!vals[ni]) continue;
            const sm = {};
            headers.forEach((h, idx) => { if (!metaIdx.includes(idx)) { const c = parseInt(vals[idx])||0; if (c > 0) sm[h] = c; } });
            records.push({ college_name: vals[ni], location: li !== -1 ? vals[li] : '', established: ei !== -1 ? parseInt(vals[ei])||null : null, fees: fi !== -1 ? vals[fi] : '', description: di !== -1 ? vals[di] : '', seat_matrix_regular: sm });
          }
        }
        if (records.length === 0) throw new Error('No records found.');
        setProfileImportStatus(`Upserting ${records.length} profiles...`);
        for (const rec of records) { await supabase.from('college_profiles').upsert({ college_name: rec.college_name, location: rec.location, established: rec.established, fees: rec.fees, description: rec.description, facilities: ['Hostel','Labs','Library'], seat_matrix_regular: rec.seat_matrix_regular }, { onConflict: 'college_name' }); }
        setColleges(prev => {
          let updated = [...prev];
          for (const rec of records) {
            const idx = updated.findIndex(col => col.name.toLowerCase() === rec.college_name.toLowerCase());
            const totalSeats = Object.values(rec.seat_matrix_regular).reduce((s,v) => s+v, 0);
            if (idx !== -1) { updated[idx] = { ...updated[idx], location: rec.location||updated[idx].location, established: rec.established||updated[idx].established, fees: rec.fees||updated[idx].fees, desc: rec.description||updated[idx].desc, description: rec.description||updated[idx].description, seatMatrix: rec.seat_matrix_regular, seats: totalSeats }; }
            else { const nextId = updated.length > 0 ? Math.max(...updated.map(c => c.id))+1 : 1; updated.push({ id: nextId, name: rec.college_name, location: rec.location, established: rec.established||2026, fees: rec.fees||'₹8,000/year', desc: rec.description||'', description: rec.description||'', branches: Object.keys(rec.seat_matrix_regular), seats: totalSeats, seatMatrix: rec.seat_matrix_regular, facilities: ['Hostel','Labs','Library'], image: '/govt_college.jpg', image_url: null }); }
          }
          return updated;
        });
        setProfileImportStatus(`✅ Imported ${records.length} profiles.`);
      } catch (err) { setProfileImportStatus(`Error: ${err.message}`); alert(`Import Failed: ${err.message}`); }
      finally { setProfileImportLoading(false); e.target.value = ''; }
    };
    reader.readAsText(file);
  };

  const handleVacancyImportFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const isJson = file.name.endsWith('.json'), isCsv = file.name.endsWith('.csv');
    if (!isJson && !isCsv) { alert('Upload CSV or JSON.'); return; }
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result; let records = [];
        if (isJson) {
          const arr = JSON.parse(text); const arrayData = Array.isArray(arr) ? arr : [arr];
          for (const item of arrayData) {
            const college = item.college_name||item.college||'', branch = item.branch||'';
            if (!college||!branch) continue;
            const total = parseInt(item.total_seats||item.total)||0, filled = parseInt(item.filled_seats||item.filled)||0;
            records.push({ college_name: college.trim(), branch: branch.trim(), total_seats: total, filled_seats: filled, vacant_seats: parseInt(item.vacant_seats)||total-filled, ur: parseInt(item.ur)||0, bc: parseInt(item.bc)||0, ebc: parseInt(item.ebc)||0, sc: parseInt(item.sc)||0, st: parseInt(item.st)||0, ews: parseInt(item.ews)||0, rcg: parseInt(item.rcg)||0, dq: parseInt(item.dq)||0, smq: parseInt(item.smq)||0 });
          }
        } else {
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          const headers = lines[0].toLowerCase().split(',').map(h => h.replace(/^["']|["']$/g,'').trim());
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.replace(/^["']|["']$/g,'').trim());
            const record = {}; headers.forEach((h,idx) => { record[h] = cols[idx]||''; });
            const total = parseInt(record.total_seats||record.total)||0, filled = parseInt(record.filled_seats||record.filled)||0;
            records.push({ college_name: record.college_name||record.college||'', branch: record.branch||'', total_seats: total, filled_seats: filled, vacant_seats: parseInt(record.vacant_seats)||total-filled, ur: parseInt(record.ur)||0, bc: parseInt(record.bc)||0, ebc: parseInt(record.ebc)||0, sc: parseInt(record.sc)||0, st: parseInt(record.st)||0, ews: parseInt(record.ews)||0, rcg: parseInt(record.rcg)||0, dq: parseInt(record.dq)||0, smq: parseInt(record.smq)||0 });
          }
          records = records.filter(r => r.college_name && r.branch);
        }
        if (records.length === 0) { alert("No valid records."); return; }
        const { error } = await supabase.from('live_seat_matrix').insert(records);
        if (error) alert("Save failed: " + error.message); else { alert(`Imported ${records.length} records!`); fetchVacancies(); }
      } catch (err) { alert("Import failed: " + err.message); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  // ─── SIDEBAR NAV ITEMS ────────────────────────────────────────────────────
  const navItems = [
    { id: 'cutoff',     label: 'Cutoff DB',       icon: Database,       color: '#8B5CF6', desc: 'Manage rank data' },
    { id: 'seats',      label: 'Profile Editor',  icon: Edit3,          color: '#0EA5E9', desc: 'College profiles' },
    { id: 'matrix',     label: 'Seat Matrix',     icon: Grid,           color: '#10B981', desc: 'Branch overview' },
    { id: 'leads',      label: 'Leads & CRM',     icon: Clipboard,      color: '#F59E0B', desc: 'Students & payments' },
    { id: 'vacancies',  label: 'Live Vacancies',  icon: FileSpreadsheet,color: '#3B82F6', desc: 'Seat availability' },
    { id: 'moderation', label: 'Moderation',      icon: ShieldAlert,    color: '#EF4444', desc: 'Reported content' },
    { id: 'logins',     label: 'Live Logins',     icon: Activity,       color: '#22C55E', desc: 'Real-time stream', live: true },
    { id: 'users',      label: 'Users',           icon: Users,          color: '#EC4899', desc: 'Manage accounts' },
  ];

  // ─── LOGIN SCREEN ─────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)' }}>
        {/* Animated blobs */}
        <div className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle,#7C3AED,transparent)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle,#2563EB,transparent)' }} />
        <div className="absolute top-[40%] left-[40%] h-[300px] w-[300px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle,#EC4899,transparent)' }} />

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md mx-4 rounded-3xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}
        >
          {/* Top accent gradient bar */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#7C3AED,#EC4899,#3B82F6)' }} />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 relative" style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', boxShadow: '0 8px 32px rgba(124,58,237,0.5)' }}>
                <Shield className="h-8 w-8 text-white" />
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
              <h1 className="text-2xl font-black text-white font-outfit tracking-tight">Admin Portal</h1>
              <p className="text-sm mt-1 font-inter" style={{ color: 'rgba(167,139,250,0.8)' }}>PolytechnicKarle — Authorized Access Only</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-2 font-outfit" style={{ color: 'rgba(255,255,255,0.5)' }}>ADMIN EMAIL</label>
                <input
                  type="email" required value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl outline-none text-sm font-semibold text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                  placeholder="admin@polytechnickarle.com"
                  onFocus={e => { e.target.style.borderColor = 'rgba(167,139,250,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.2)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 font-outfit" style={{ color: 'rgba(255,255,255,0.5)' }}>PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-12 rounded-xl outline-none text-sm font-semibold text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                    placeholder="••••••••••"
                    onFocus={e => { e.target.style.borderColor = 'rgba(167,139,250,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.2)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit" disabled={authLoading}
                className="w-full text-white font-black py-3.5 rounded-xl transition-all mt-2 font-outfit text-sm tracking-wide relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 8px 24px rgba(124,58,237,0.45)', opacity: authLoading ? 0.7 : 1 }}
              >
                {authLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" />
                    Secure Login
                  </span>
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <a
                href="/"
                onClick={e => { e.preventDefault(); window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                className="text-xs font-bold cursor-pointer font-outfit uppercase tracking-wider transition-colors"
                style={{ color: 'rgba(167,139,250,0.6)' }}
                onMouseEnter={e => e.target.style.color = 'rgba(167,139,250,1)'}
                onMouseLeave={e => e.target.style.color = 'rgba(167,139,250,0.6)'}
              >
                ← Back to Student Portal
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── MAIN DASHBOARD ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9' }}>

      {/* ── SIDEBAR ── */}
      <aside
        className="flex flex-col flex-shrink-0 relative transition-all duration-300"
        style={{ width: sidebarCollapsed ? '68px' : '240px', background: SIDEBAR_BG, borderRight: '1px solid rgba(255,255,255,0.07)', boxShadow: '4px 0 24px rgba(0,0,0,0.3)' }}
      >
        {/* Sidebar top brand */}
        <div className="p-4 pb-3 flex items-center gap-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
            <LayoutDashboard className="h-4.5 w-4.5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <div className="text-white font-black text-sm font-outfit truncate">PolytechnicKarle</div>
              <div className="text-[10px] font-bold font-outfit" style={{ color: ACCENT_LIGHT }}>Admin Console</div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-14 h-6 w-6 rounded-full flex items-center justify-center cursor-pointer z-10 transition-all hover:scale-110"
          style={{ background: '#7C3AED', boxShadow: '0 2px 8px rgba(124,58,237,0.5)' }}
        >
          <ChevronRight className="h-3 w-3 text-white" style={{ transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
        </button>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'users') {
                    try { setAllUsers(JSON.parse(localStorage.getItem('pk_registered_students') || '[]')); } catch {}
                  }
                }}
                title={sidebarCollapsed ? item.label : ''}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer relative group"
                style={isActive
                  ? { background: `${item.color}22`, border: `1px solid ${item.color}44` }
                  : { background: 'transparent', border: '1px solid transparent' }
                }
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: isActive ? item.color : 'rgba(255,255,255,0.07)', boxShadow: isActive ? `0 4px 12px ${item.color}55` : 'none' }}
                >
                  <Icon className="h-4 w-4" style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.45)' }} />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-xs font-bold font-outfit truncate" style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.55)' }}>
                      {item.label}
                    </div>
                  </div>
                )}
                {!sidebarCollapsed && item.live && (
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                )}
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r" style={{ background: item.color }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 space-y-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            title={sidebarCollapsed ? 'Student Site' : ''}
          >
            <ArrowUpRight className="h-4 w-4 flex-shrink-0" style={{ color: 'rgba(167,139,250,0.7)' }} />
            {!sidebarCollapsed && <span className="text-xs font-bold font-outfit" style={{ color: 'rgba(167,139,250,0.7)' }}>Student Site</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" style={{ color: '#FCA5A5' }} />
            {!sidebarCollapsed && <span className="text-xs font-bold font-outfit" style={{ color: '#FCA5A5' }}>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto min-w-0">

        {/* Top Bar */}
        <div className="sticky top-0 z-40 px-6 h-14 flex items-center justify-between border-b" style={{ background: 'rgba(241,245,249,0.85)', backdropFilter: 'blur(12px)', borderColor: '#e2e8f0' }}>
          <div>
            <h1 className="text-sm font-black text-slate-800 font-outfit">
              {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-[10px] text-slate-400 font-inter">{navItems.find(n => n.id === activeTab)?.desc}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: 'linear-gradient(135deg,#7C3AED,#4C1D95)' }}>
              A
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-700 font-outfit">{session?.user?.email}</div>
              <div className="text-[10px] text-slate-400">Super Admin</div>
            </div>
          </div>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="mx-6 mt-4 flex items-center gap-2.5 p-3.5 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', border: '1px solid #6ee7b7', color: '#065f46' }}
            >
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 space-y-6">

          {/* ══ CUTOFF DB TAB ══════════════════════════════════════════════ */}
          {activeTab === 'cutoff' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left: Form + Import */}
              <div className="space-y-5">
                <GlassCard>
                  <div className="p-5">
                    <SectionHeader icon={Database} title="Add Entry" subtitle="Single cutoff record" color="#8B5CF6" />
                    <form onSubmit={handleAddCollege} className="space-y-4">
                      <FormField label="College Name">
                        <input type="text" required value={formData.college_name} onChange={e => setFormData({...formData, college_name: e.target.value})} className={fieldCls} placeholder="e.g. GP Patna-7" />
                      </FormField>
                      <FormField label="Branch">
                        <select value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className={fieldCls}>
                          <option>Civil Engineering</option>
                          <option>Mechanical Engineering</option>
                          <option>Electrical Engineering</option>
                          <option>Computer Science</option>
                          <option>Electronics Engineering</option>
                          <option>Automobile Engineering</option>
                          <option>Textile Engineering</option>
                        </select>
                      </FormField>
                      <div className="grid grid-cols-3 gap-3">
                        <FormField label="Category">
                          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={fieldCls + ' px-2'}>
                            {['UR','BC','EBC','SC','ST','EWS','RCG','E-EBC','E-SC','E-UR','SMQ','E-BC','E-ST','DQ'].map(c => <option key={c}>{c}</option>)}
                          </select>
                        </FormField>
                        <FormField label="Open Rank">
                          <input type="number" value={formData.opening_rank} onChange={e => setFormData({...formData, opening_rank: e.target.value})} className={fieldCls} placeholder="500" />
                        </FormField>
                        <FormField label="Close Rank">
                          <input type="number" required value={formData.closing_rank} onChange={e => setFormData({...formData, closing_rank: e.target.value})} className={fieldCls} placeholder="1500" />
                        </FormField>
                      </div>
                      <PrimaryBtn type="submit" disabled={adding} className="w-full">
                        {adding ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Plus className="h-4 w-4" /> Add to Database</>}
                      </PrimaryBtn>
                    </form>
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="p-5">
                    <SectionHeader icon={UploadCloud} title="Bulk Import" subtitle="CSV or JSON cutoffs" badge="CSV / JSON" color="#10B981" />
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button onClick={() => downloadSampleFile('csv')} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}>
                          <FileSpreadsheet className="h-3.5 w-3.5" /> CSV Template
                        </button>
                        <button onClick={() => downloadSampleFile('json')} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
                          <FileJson className="h-3.5 w-3.5" /> JSON Template
                        </button>
                      </div>
                      <label className={`relative block py-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${csvLoading ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/30 bg-slate-50'}`}>
                        <div className="flex flex-col items-center gap-2">
                          <UploadCloud className={`h-8 w-8 ${csvLoading ? 'text-violet-500 animate-bounce' : 'text-slate-300'}`} />
                          <span className="text-xs font-bold text-slate-500 font-outfit">{csvLoading ? csvStatus : 'Click to Upload Cutoff File'}</span>
                          {!csvLoading && <span className="text-[10px] text-slate-400">.csv and .json supported</span>}
                        </div>
                        <input type="file" accept=".csv,.json" onChange={handleFileImport} disabled={csvLoading} className="hidden" />
                      </label>
                      {csvStatus && !csvLoading && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> {csvStatus}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Right: Table */}
              <div className="lg:col-span-2">
                <GlassCard className="overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-black text-slate-800 font-outfit">Database Records</h3>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#ede9fe', color: '#7c3aed' }}>{dbColleges.length} records</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/60">
                          {['College & Branch', 'Year', 'Category', 'Open Rank', 'Close Rank', ''].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider font-outfit">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan="6" className="py-16 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="h-8 w-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
                              <span className="text-xs text-slate-400 font-outfit">Loading data...</span>
                            </div>
                          </td></tr>
                        ) : dbColleges.length === 0 ? (
                          <tr><td colSpan="6" className="py-16 text-center text-slate-400 text-xs font-outfit">No records yet. Add some data above.</td></tr>
                        ) : dbColleges.map(college => {
                          const year = getYearFromId(college.id);
                          const yearColors = { 2025: '#dbeafe,#1d4ed8', 2024: '#ede9fe,#7c3aed', 2022: '#fef3c7,#d97706', 2021: '#d1fae5,#065f46', 2020: '#e0e7ff,#4338ca' };
                          const [bg, tc] = (yearColors[year] || '#f1f5f9,#64748b').split(',');
                          return (
                            <tr key={college.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-4">
                                <div className="font-bold text-slate-800 text-sm">{college.college_name}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{college.branch}</div>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full font-outfit" style={{ background: bg, color: tc }}>{year}</span>
                              </td>
                              <td className="px-5 py-4 font-semibold text-slate-700 text-xs">{college.category}</td>
                              <td className="px-5 py-4 text-slate-400 font-medium text-xs">{college.opening_rank || '—'}</td>
                              <td className="px-5 py-4 font-black text-violet-600 text-sm">{college.closing_rank}</td>
                              <td className="px-5 py-4 text-right">
                                <button onClick={() => handleDelete(college.id)} className="p-2 rounded-lg cursor-pointer transition-all hover:bg-red-50" style={{ color: '#ef4444' }}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* ══ PROFILE EDITOR TAB ═════════════════════════════════════════ */}
          {activeTab === 'seats' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: College selector + bulk import */}
              <div className="lg:col-span-4 space-y-5">
                <GlassCard>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-slate-800 font-outfit text-sm">Select Institution</h3>
                      <PrimaryBtn onClick={() => setShowAddProfileModal(true)} style={{ padding: '6px 12px', fontSize: '11px' }}>
                        <Plus className="h-3.5 w-3.5" /> Add
                      </PrimaryBtn>
                    </div>

                    <AnimatePresence>
                      {showAddProfileModal && (
                        <motion.form
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onSubmit={handleCreateCollege}
                          className="mb-4 rounded-xl overflow-hidden"
                          style={{ background: '#f8f7ff', border: '1px solid #ddd6fe' }}
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-violet-700 font-outfit">New College Profile</span>
                              <button type="button" onClick={() => setShowAddProfileModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="h-4 w-4" /></button>
                            </div>
                            <input type="text" required value={newCollegeName} onChange={e => setNewCollegeName(e.target.value)} placeholder="College Name (e.g. GP Muzaffarpur)" className={fieldCls} />
                            <input type="text" required value={newCollegeLocation} onChange={e => setNewCollegeLocation(e.target.value)} placeholder="Location (e.g. Muzaffarpur, Bihar)" className={fieldCls} />
                            <PrimaryBtn type="submit" className="w-full" style={{ padding: '8px 12px', fontSize: '12px' }}>Create Profile</PrimaryBtn>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {colleges.map(col => {
                        const isSelected = col.id === selectedColId;
                        return (
                          <div key={col.id} onClick={() => setSelectedColId(col.id)} className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all" style={isSelected ? { background: '#f5f3ff', border: '1px solid #c4b5fd' } : { background: 'white', border: '1px solid #f1f5f9' }}>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate" style={{ color: isSelected ? '#7c3aed' : '#1e293b' }}>{col.name}</div>
                              <div className="text-[10px] text-slate-400 font-inter">{col.location}</div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded font-outfit" style={{ background: isSelected ? '#7c3aed' : '#f1f5f9', color: isSelected ? 'white' : '#64748b' }}>{col.seats}s</span>
                              <button type="button" onClick={e => { e.stopPropagation(); handleDeleteCollege(col.id, col.name); }} className="p-1 rounded transition-colors hover:bg-red-50" style={{ color: '#ef4444' }}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="p-5">
                    <SectionHeader icon={UploadCloud} title="Bulk Import" subtitle="Profiles & seat matrices" badge="CSV / JSON" color="#10B981" />
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button onClick={() => downloadProfileSample('csv')} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold cursor-pointer" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}>
                          <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
                        </button>
                        <button onClick={() => downloadProfileSample('json')} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold cursor-pointer" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
                          <FileJson className="h-3.5 w-3.5" /> JSON
                        </button>
                      </div>
                      <label className={`block py-7 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${profileImportLoading ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-violet-300 bg-slate-50'}`}>
                        <UploadCloud className={`h-7 w-7 mx-auto mb-1.5 ${profileImportLoading ? 'text-violet-500 animate-bounce' : 'text-slate-300'}`} />
                        <span className="text-xs font-bold text-slate-500 font-outfit block">{profileImportLoading ? profileImportStatus : 'Upload Profile File'}</span>
                        <input type="file" accept=".csv,.json" onChange={handleProfileImport} disabled={profileImportLoading} className="hidden" />
                      </label>
                      {profileImportStatus && !profileImportLoading && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> {profileImportStatus}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Right: Profile editor form */}
              <div className="lg:col-span-8">
                <GlassCard>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                      <Edit3 className="h-5 w-5 text-violet-500" />
                      <h3 className="font-black text-slate-800 font-outfit">Edit: <span className="text-violet-600">{currentCollege?.name}</span></h3>
                    </div>

                    <form onSubmit={handleProfileSave} className="space-y-6">
                      {/* Metadata */}
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit mb-3">College Metadata</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField label="Location"><input type="text" value={profileLocation} onChange={e => setProfileLocation(e.target.value)} className={fieldCls} placeholder="e.g. Gulzarbagh, Patna" /></FormField>
                          <FormField label="Est. Year"><input type="number" value={profileEstablished} onChange={e => setProfileEstablished(e.target.value)} className={fieldCls} placeholder="e.g. 1954" /></FormField>
                          <FormField label="Annual Fees"><input type="text" value={profileFees} onChange={e => setProfileFees(e.target.value)} className={fieldCls} placeholder="₹8,500/year" /></FormField>
                          <FormField label="Branches (comma-sep)"><input type="text" value={profileBranchesText} onChange={e => setProfileBranchesText(e.target.value)} className={fieldCls} placeholder="Civil, CS, Electrical" /></FormField>
                        </div>
                        <div className="mt-4">
                          <FormField label="Description">
                            <textarea rows="3" value={profileDesc} onChange={e => setProfileDesc(e.target.value)} className={fieldCls + ' resize-none'} placeholder="Brief description of the college..." />
                          </FormField>
                        </div>
                      </div>

                      {/* Photo */}
                      <div className="pt-4 border-t border-slate-100">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit mb-3">College Photo</div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                          <div className="sm:col-span-8">
                            <FormField label="Photo URL">
                              <input type="text" value={profileImageUrl} onChange={e => setProfileImageUrl(e.target.value)} className={fieldCls} placeholder="https://..." />
                            </FormField>
                          </div>
                          <div className="sm:col-span-4">
                            <FormField label="Upload File">
                              <label className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all" style={{ background: '#ede9fe', border: '1px solid #c4b5fd', color: '#7c3aed' }}>
                                {uploadingPhoto ? 'Uploading...' : <><UploadCloud className="h-3.5 w-3.5" /> Choose Image</>}
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} className="hidden" />
                              </label>
                            </FormField>
                          </div>
                        </div>
                        {profileImageUrl && (
                          <div className="mt-3 rounded-xl overflow-hidden aspect-video max-w-xs border border-slate-200">
                            <img src={profileImageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                          </div>
                        )}
                      </div>

                      {/* Seat Matrix */}
                      <div className="pt-4 border-t border-slate-100">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit mb-3">Seat Matrix Intakes</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(profileBranchesText ? profileBranchesText.split(',').map(b => b.trim()).filter(Boolean) : (currentCollege?.branches || [])).map(branch => (
                            <div key={branch} className="p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-[10px] font-bold text-slate-500 font-outfit uppercase">{branch}</label>
                                <button type="button" onClick={() => handleDeleteBranchFromMatrix(branch)} className="text-red-400 hover:text-red-600 cursor-pointer p-0.5 rounded hover:bg-red-50 transition-all">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <input type="number" min="0" max="300" value={seatMatrix[branch] !== undefined ? seatMatrix[branch] : 0} onChange={e => handleSeatChange(branch, e.target.value)} className={fieldCls + ' text-center font-black text-violet-700'} />
                            </div>
                          ))}

                          {/* Add new branch */}
                          <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 flex flex-col gap-3">
                            <span className="text-[10px] font-bold text-slate-400 font-outfit uppercase">+ Add Branch</span>
                            <div className="grid grid-cols-7 gap-2">
                              <div className="col-span-4">
                                <select value={selectedNewBranch} onChange={e => setSelectedNewBranch(e.target.value)} className={fieldCls + ' px-2 py-2 text-xs'}>
                                  {standardBranches.map(b => <option key={b}>{b}</option>)}
                                </select>
                              </div>
                              <div className="col-span-3">
                                <input type="number" min="0" max="300" value={newBranchSeats} onChange={e => setNewBranchSeats(e.target.value)} placeholder="Seats" className={fieldCls + ' px-2 py-2 text-xs text-center'} />
                              </div>
                            </div>
                            {selectedNewBranch === 'Custom...' && (
                              <input type="text" value={customBranchName} onChange={e => setCustomBranchName(e.target.value)} placeholder="Custom Branch Name" className={fieldCls} />
                            )}
                            <button type="button" onClick={handleAddBranchToMatrix} className="w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-all" style={{ background: '#ede9fe', border: '1px solid #c4b5fd', color: '#7c3aed' }}>
                              Add to Matrix
                            </button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="mt-4 flex items-center justify-between p-4 rounded-xl" style={{ background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', border: '1px solid #c4b5fd' }}>
                          <div>
                            <div className="font-black text-violet-700 font-outfit text-sm">Total Regular Intake</div>
                            <div className="text-xs text-violet-500">Sum of all branches</div>
                          </div>
                          <div className="text-3xl font-black text-violet-700 font-outfit">{Object.values(seatMatrix).reduce((s,v) => s+v, 0)}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <PrimaryBtn type="submit">
                          <Save className="h-4 w-4" /> Save Profile
                        </PrimaryBtn>
                      </div>
                    </form>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* ══ SEAT MATRIX TAB ════════════════════════════════════════════ */}
          {activeTab === 'matrix' && (
            <GlassCard className="overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-black text-slate-800 font-outfit">Seat Matrix Overview</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Live view of all seat intakes across institutions</p>
                </div>
                <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="text-center px-4 border-r border-slate-200">
                    <div className="text-[10px] font-bold text-slate-400 uppercase font-outfit">Colleges</div>
                    <div className="text-xl font-black text-violet-600">{colleges.length}</div>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase font-outfit">Total Seats</div>
                    <div className="text-xl font-black text-violet-600">{colleges.reduce((sum,col) => sum + Object.values(col.seatMatrix||{}).reduce((s,v)=>s+v,0), 0)}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-b border-slate-100">
                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="Search college..." value={matrixSearch} onChange={e => setMatrixSearch(e.target.value)} className={fieldCls + ' pl-9'} />
                </div>
              </div>

              <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase font-outfit">Photo</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase font-outfit">College</th>
                      <th className="px-4 py-3 text-center text-[10px] font-black text-violet-600 uppercase font-outfit">Total</th>
                      {allBranches.map(b => <th key={b} className="px-3 py-3 text-center text-[10px] font-bold text-slate-400 uppercase font-outfit whitespace-nowrap">{b}</th>)}
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase font-outfit">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colleges.filter(col => {
                      const q = matrixSearch.toLowerCase().replace(/[^a-z0-9]/g,'');
                      return (col.name||'').toLowerCase().replace(/[^a-z0-9]/g,'').includes(q) || (col.location||'').toLowerCase().replace(/[^a-z0-9]/g,'').includes(q);
                    }).map(col => {
                      const total = Object.values(col.seatMatrix||{}).reduce((s,v)=>s+v,0);
                      return (
                        <tr key={col.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="relative group w-20 h-13 rounded-lg overflow-hidden border border-slate-200">
                              {rowUploadingId === col.id ? (
                                <div className="h-12 flex items-center justify-center bg-white">
                                  <div className="h-4 w-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                                </div>
                              ) : (
                                <>
                                  <img src={col.image_url||col.image||'/govt_college.jpg'} alt={col.name} className="w-full h-12 object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { e.target.src = '/govt_college.jpg'; }} />
                                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-white text-[9px] font-bold cursor-pointer transition-all">
                                    <UploadCloud className="h-3.5 w-3.5" /> Change
                                    <input type="file" accept="image/*" className="hidden" onChange={e => handleRowPhotoUpload(e, col)} disabled={rowUploadingId !== null} />
                                  </label>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-800 text-sm">{col.name}</div>
                            <div className="text-[10px] text-slate-400">{col.location}</div>
                          </td>
                          <td className="px-4 py-3 text-center font-black text-violet-600">{total}</td>
                          {allBranches.map(b => {
                            const s = col.seatMatrix?.[b]||0;
                            return <td key={b} className="px-3 py-3 text-center text-sm font-semibold" style={{ color: s > 0 ? '#1e293b' : '#cbd5e1' }}>{s > 0 ? s : '—'}</td>;
                          })}
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => { setSelectedColId(col.id); setActiveTab('seats'); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ml-auto" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                              <Edit3 className="h-3 w-3" /> Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="sticky bottom-0 bg-slate-50 border-t-2 border-slate-200 font-black">
                      <td className="bg-slate-50" /><td className="px-4 py-3 font-extrabold text-slate-700 text-sm">Total Sum</td>
                      <td className="px-4 py-3 text-center text-violet-700 text-base">{colleges.reduce((s,c)=>s+Object.values(c.seatMatrix||{}).reduce((ss,v)=>ss+v,0),0)}</td>
                      {allBranches.map(b => <td key={b} className="px-3 py-3 text-center font-black text-slate-700">{colleges.reduce((s,c)=>s+(c.seatMatrix?.[b]||0),0)}</td>)}
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* ══ LEADS TAB ══════════════════════════════════════════════════ */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Consultations" value={leadsConsultations.length} sub="Requests received" icon={Clipboard} gradient="linear-gradient(135deg,#7C3AED,#5B21B6)" />
                <StatCard label="WhatsApp Alerts" value={leadsAlerts.length} sub="Subscribers" icon={Bell} gradient="linear-gradient(135deg,#0EA5E9,#1D4ED8)" />
                <StatCard label="Premium Payments" value={paymentsLog.length} sub="Paid unlocks" icon={CreditCard} gradient="linear-gradient(135deg,#10B981,#0F766E)" />
                <StatCard label="Total Revenue" value={`₹${paymentsLog.reduce((s,p)=>s+Number(p.amount||0),0)}`} sub="Earnings" icon={TrendingUp} gradient="linear-gradient(135deg,#F59E0B,#D97706)" />
              </div>

              {/* Table Card */}
              <GlassCard className="overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Sub-tabs */}
                  <div className="flex p-1 gap-1 rounded-xl" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                    {[
                      { id: 'consults', label: `Consultations (${leadsConsultations.length})`, icon: Clipboard },
                      { id: 'alerts', label: `WA Alerts (${leadsAlerts.length})`, icon: MessageSquare },
                      { id: 'payments', label: `Payments (${paymentsLog.length})`, icon: CreditCard },
                    ].map(st => (
                      <button key={st.id} onClick={() => setLeadsSubTab(st.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-outfit" style={leadsSubTab === st.id ? { background: '#7c3aed', color: 'white' } : { color: '#64748b' }}>
                        <st.icon className="h-3.5 w-3.5" />{st.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input type="text" placeholder="Search..." value={leadsSearch} onChange={e => setLeadsSearch(e.target.value)} className={fieldCls + ' pl-9 py-2 text-xs w-52'} />
                    </div>
                    <button onClick={fetchLeads} disabled={leadsLoading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b' }}>
                      <RefreshCw className={`h-3.5 w-3.5 ${leadsLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => handleExportLeadsCSV(leadsSubTab)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
                      <Download className="h-3.5 w-3.5" /> Export CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {leadsLoading ? (
                    <div className="py-16 flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
                      <span className="text-xs text-slate-400 font-outfit">Loading from Supabase...</span>
                    </div>
                  ) : leadsSubTab === 'consults' ? (
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-slate-100 bg-slate-50/60">
                        {['Student Name','WhatsApp','UR Rank','Category','Cat. Rank','Preferred Branch','Mode','Time','Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider font-outfit">{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {leadsConsultations.filter(c => { const q = leadsSearch.toLowerCase(); return !q || c.student_name?.toLowerCase().includes(q) || c.whatsapp_number?.includes(q) || String(c.ur_rank)?.includes(q); }).map(lead => {
                          const waUrl = `https://wa.me/${lead.whatsapp_number?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hello ${lead.student_name}, thank you for booking on PolytechnicKarle. Let's discuss your DCECE UR Rank: ${lead.ur_rank}.`)}`;
                          return (
                            <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-800">{lead.student_name}</td>
                              <td className="px-4 py-3 font-semibold text-slate-600">{lead.whatsapp_number}</td>
                              <td className="px-4 py-3 font-black text-violet-600">{lead.ur_rank}</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded font-bold text-[10px]" style={{ background: '#ede9fe', color: '#7c3aed' }}>{lead.category}</span></td>
                              <td className="px-4 py-3 text-slate-500">{lead.category_rank||'—'}</td>
                              <td className="px-4 py-3 text-slate-600">{lead.preferred_branch||'Any'}</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: lead.contact_preference==='WhatsApp'?'#d1fae5':'#ede9fe', color: lead.contact_preference==='WhatsApp'?'#065f46':'#7c3aed' }}>{lead.contact_preference}</span></td>
                              <td className="px-4 py-3 text-slate-400">{new Date(lead.created_at).toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1.5">
                                  <a href={waUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg cursor-pointer hover:scale-110 transition-all" style={{ background: '#d1fae5', color: '#065f46' }}><MessageSquare className="h-3.5 w-3.5" /></a>
                                  <a href={`tel:${lead.whatsapp_number}`} className="p-1.5 rounded-lg cursor-pointer hover:scale-110 transition-all" style={{ background: '#ede9fe', color: '#7c3aed' }}><PhoneCall className="h-3.5 w-3.5" /></a>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : leadsSubTab === 'alerts' ? (
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-slate-100 bg-slate-50/60">
                        {['WhatsApp','UR Rank','Category','Cat. Rank','Gender','Domicile','District','Time','Action'].map(h => <th key={h} className="px-4 py-3 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider font-outfit">{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {leadsAlerts.filter(a => { const q = leadsSearch.toLowerCase(); return !q || a.whatsapp_number?.includes(q) || String(a.ur_rank)?.includes(q) || a.home_district?.toLowerCase().includes(q); }).map(lead => {
                          const waUrl = `https://wa.me/${lead.whatsapp_number?.replace(/\D/g,'')}?text=${encodeURIComponent(`Hello, thank you for subscribing to DCECE alerts on PolytechnicKarle. UR Rank: ${lead.ur_rank}.`)}`;
                          return (
                            <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-800">{lead.whatsapp_number}</td>
                              <td className="px-4 py-3 font-black text-violet-600">{lead.ur_rank}</td>
                              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: '#ede9fe', color: '#7c3aed' }}>{lead.category||'UR'}</span></td>
                              <td className="px-4 py-3 text-slate-500">{lead.category_rank||'—'}</td>
                              <td className="px-4 py-3 text-slate-600">{lead.gender||'—'}</td>
                              <td className="px-4 py-3 text-slate-600">{lead.domicile||'—'}</td>
                              <td className="px-4 py-3 text-slate-600">{lead.home_district||'—'}</td>
                              <td className="px-4 py-3 text-slate-400">{new Date(lead.created_at).toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3">
                                <a href={waUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg cursor-pointer inline-flex hover:scale-110 transition-all" style={{ background: '#d1fae5', color: '#065f46' }}><MessageSquare className="h-3.5 w-3.5" /></a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-slate-100 bg-slate-50/60">
                        {['Student','Roll','WhatsApp','Amount','Mode','TXN ID','Time','Status'].map(h => <th key={h} className="px-4 py-3 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider font-outfit">{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {paymentsLog.filter(p => { const q = leadsSearch.toLowerCase(); return !q || p.student_name?.toLowerCase().includes(q) || p.roll_number?.toLowerCase().includes(q) || p.transaction_id?.toLowerCase().includes(q); }).map(payment => (
                          <tr key={payment.transaction_id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-800">{payment.student_name}</td>
                            <td className="px-4 py-3 font-semibold text-slate-600">{payment.roll_number||'—'}</td>
                            <td className="px-4 py-3 font-semibold text-slate-600">
                              <div className="flex items-center gap-1">
                                {payment.whatsapp_number||'—'}
                                {payment.whatsapp_number && <a href={`https://wa.me/${payment.whatsapp_number?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700"><MessageSquare className="h-3 w-3" /></a>}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-black text-emerald-600">₹{payment.amount}</td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: '#f1f5f9', color: '#64748b' }}>{payment.payment_mode}</span></td>
                            <td className="px-4 py-3 font-mono text-slate-600 text-[10px]">{payment.transaction_id}</td>
                            <td className="px-4 py-3 text-slate-400">{new Date(payment.created_at).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#d1fae5', color: '#065f46' }}>SUCCESS</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* ══ VACANCIES TAB ══════════════════════════════════════════════ */}
          {activeTab === 'vacancies' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-800 font-outfit">Live Seat Vacancies</h2>
                  <p className="text-xs text-slate-400">Real-time counselling round availability</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={handleOpenAddVacancy} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer transition-all" style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
                    <Plus className="h-3.5 w-3.5" /> Add Record
                  </button>
                  <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}>
                    <UploadCloud className="h-3.5 w-3.5" /> Import File
                    <input type="file" accept=".csv,.json" onChange={handleVacancyImportFile} className="hidden" />
                  </label>
                  <div className="flex gap-1.5">
                    <button onClick={() => downloadVacancySample('csv')} className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
                      <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
                    </button>
                    <button onClick={() => downloadVacancySample('json')} className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
                      <FileJson className="h-3.5 w-3.5" /> JSON
                    </button>
                  </div>
                  <DangerBtn onClick={handleClearAllVacancies} style={{ padding: '8px 14px', fontSize: '12px' }}>
                    <Trash2 className="h-3.5 w-3.5" /> Clear All
                  </DangerBtn>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Search by college or branch..." value={vacanciesSearch} onChange={e => setVacanciesSearch(e.target.value)} className={fieldCls + ' pl-10 max-w-sm'} />
              </div>

              <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-slate-100 bg-slate-50/60">
                      {['College','Branch','Total','Filled','Vacant','UR','BC','EBC','SC','ST','EWS','RCG','DQ','SMQ','Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-bold text-slate-400 uppercase text-[9px] tracking-wider font-outfit">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {vacanciesLoading ? (
                        <tr><td colSpan="15" className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-8 w-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
                            <span className="text-xs text-slate-400">Loading vacancies...</span>
                          </div>
                        </td></tr>
                      ) : vacanciesList.filter(v => { const q = vacanciesSearch.toLowerCase(); return !q || v.college_name?.toLowerCase().includes(q) || v.branch?.toLowerCase().includes(q); }).length === 0 ? (
                        <tr><td colSpan="15" className="py-16 text-center text-slate-400 text-xs">No vacancy records. Add one above.</td></tr>
                      ) : vacanciesList.filter(v => { const q = vacanciesSearch.toLowerCase(); return !q || v.college_name?.toLowerCase().includes(q) || v.branch?.toLowerCase().includes(q); }).map(vac => (
                        <tr key={vac.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-800">{vac.college_name}</td>
                          <td className="px-4 py-3 text-slate-600">{vac.branch}</td>
                          <td className="px-4 py-3 font-black text-slate-800">{vac.total_seats}</td>
                          <td className="px-4 py-3 font-semibold text-slate-600">{vac.filled_seats}</td>
                          <td className="px-4 py-3">
                            <span className="font-black px-2 py-0.5 rounded-full text-[10px]" style={{ background: vac.vacant_seats > 0 ? '#d1fae5' : '#fee2e2', color: vac.vacant_seats > 0 ? '#065f46' : '#991b1b' }}>{vac.vacant_seats}</span>
                          </td>
                          {['ur','bc','ebc','sc','st','ews','rcg','dq','smq'].map(k => <td key={k} className="px-3 py-3 text-center text-slate-600">{vac[k]||0}</td>)}
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              <button onClick={() => handleOpenEditVacancy(vac)} className="p-1.5 rounded-lg cursor-pointer transition-all hover:scale-110" style={{ background: '#ede9fe', color: '#7c3aed' }}><Edit3 className="h-3.5 w-3.5" /></button>
                              <button onClick={() => handleDeleteVacancy(vac.id)} className="p-1.5 rounded-lg cursor-pointer transition-all hover:scale-110" style={{ background: '#fee2e2', color: '#ef4444' }}><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* Vacancy Modal */}
              <AnimatePresence>
                {showVacancyModal && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowVacancyModal(false); }}
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                      <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <h3 className="font-black text-slate-800 font-outfit">{editingVacancy ? 'Edit Vacancy Record' : 'Add Vacancy Record'}</h3>
                        <button onClick={() => setShowVacancyModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-all"><X className="h-4 w-4" /></button>
                      </div>
                      <form onSubmit={handleSaveVacancy} className="p-5 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField label="College Name">
                            <input type="text" required value={vacancyForm.college_name} onChange={e => setVacancyForm({...vacancyForm, college_name: e.target.value})} className={fieldCls} list="college-list-dl" placeholder="GP Patna-7" />
                            <datalist id="college-list-dl">{colleges.map(c => <option key={c.id} value={c.name} />)}</datalist>
                          </FormField>
                          <FormField label="Branch">
                            <input type="text" required value={vacancyForm.branch} onChange={e => setVacancyForm({...vacancyForm, branch: e.target.value})} className={fieldCls} placeholder="Computer Science & Engineering" />
                          </FormField>
                          <FormField label="Total Seats">
                            <input type="number" required min="0" value={vacancyForm.total_seats} onChange={e => setVacancyForm({...vacancyForm, total_seats: e.target.value})} className={fieldCls} />
                          </FormField>
                          <FormField label="Filled Seats">
                            <input type="number" required min="0" value={vacancyForm.filled_seats} onChange={e => setVacancyForm({...vacancyForm, filled_seats: e.target.value})} className={fieldCls} />
                          </FormField>
                        </div>
                        <div className="pt-2 border-t border-slate-100">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit mb-3">Category-wise Vacancies</div>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {['ur','bc','ebc','sc','st','ews','rcg','dq','smq'].map(cat => (
                              <FormField key={cat} label={cat.toUpperCase()}>
                                <input type="number" min="0" value={vacancyForm[cat]} onChange={e => setVacancyForm({...vacancyForm, [cat]: e.target.value})} className={fieldCls + ' text-center py-2'} />
                              </FormField>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                          <button type="button" onClick={() => setShowVacancyModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all" style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>Cancel</button>
                          <PrimaryBtn type="submit"><Save className="h-4 w-4" /> {editingVacancy ? 'Update' : 'Save Record'}</PrimaryBtn>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ══ MODERATION TAB ═════════════════════════════════════════════ */}
          {activeTab === 'moderation' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-800 font-outfit">Forum Moderation Queue</h2>
                  <p className="text-xs text-slate-400">Reported posts and comments</p>
                </div>
                <button onClick={fetchReportedContent} disabled={moderationLoading} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b' }}>
                  <RefreshCw className={`h-3.5 w-3.5 ${moderationLoading ? 'animate-spin' : ''}`} /> Refresh Queue
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Reported Posts" value={reportedPosts.length} icon={AlertTriangle} gradient="linear-gradient(135deg,#F59E0B,#D97706)" />
                <StatCard label="Reported Comments" value={reportedComments.length} icon={MessageSquare} gradient="linear-gradient(135deg,#EF4444,#B91C1C)" />
              </div>

              {/* Reported Posts */}
              {reportedPosts.length > 0 && (
                <GlassCard>
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <h3 className="font-black text-slate-800 font-outfit text-sm">Reported Posts ({reportedPosts.length})</h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {reportedPosts.map(post => (
                      <div key={post.id} className="p-4 hover:bg-slate-50/40 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-black text-slate-800 text-sm">{post.title}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>{post.reports_count} reports</span>
                              {post.is_hidden && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fee2e2', color: '#991b1b' }}>Hidden</span>}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{post.content}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-400">
                              <span>By: <strong>{post.student_name}</strong> (Roll: {post.student_roll})</span>
                              <span>{new Date(post.created_at).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => handleApprovePost(post.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all" style={{ background: '#d1fae5', color: '#065f46' }}>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button onClick={() => handleDeletePost(post.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all" style={{ background: '#fee2e2', color: '#991b1b' }}>
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Reported Comments */}
              {reportedComments.length > 0 && (
                <GlassCard>
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-red-500" />
                    <h3 className="font-black text-slate-800 font-outfit text-sm">Reported Comments ({reportedComments.length})</h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {reportedComments.map(comment => (
                      <div key={comment.id} className="p-4 hover:bg-slate-50/40 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fee2e2', color: '#991b1b' }}>{comment.reports_count} reports</span>
                              {comment.is_hidden && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>Hidden</span>}
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 mb-2">{comment.content}</p>
                            <div className="text-[10px] text-slate-400">By: <strong>{comment.student_name}</strong> (Roll: {comment.student_roll})</div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => handleApproveComment(comment.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all" style={{ background: '#d1fae5', color: '#065f46' }}>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button onClick={() => handleDeleteComment(comment.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all" style={{ background: '#fee2e2', color: '#991b1b' }}>
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {moderationLoading && (
                <div className="py-16 flex flex-col items-center gap-3">
                  <div className="h-8 w-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
                  <span className="text-xs text-slate-400">Loading moderation queue...</span>
                </div>
              )}
              {!moderationLoading && reportedPosts.length === 0 && reportedComments.length === 0 && (
                <div className="py-24 flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: '#f0fdf4' }}>✅</div>
                  <h3 className="font-black text-slate-700 font-outfit">Queue is clean!</h3>
                  <p className="text-xs text-slate-400">No reported content awaiting moderation.</p>
                </div>
              )}
            </div>
          )}

          {/* ══ LIVE LOGINS TAB ════════════════════════════════════════════ */}
          {activeTab === 'logins' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Total Events" value={liveLogins.length} icon={Activity} gradient="linear-gradient(135deg,#22C55E,#16A34A)" />
                <StatCard label="Registered" value={liveLogins.filter(l=>!l.isDemo).length} icon={UserCheck} gradient="linear-gradient(135deg,#3B82F6,#1D4ED8)" />
                <StatCard label="Demo Accounts" value={liveLogins.filter(l=>l.isDemo).length} icon={Users} gradient="linear-gradient(135deg,#8B5CF6,#6D28D9)" />
              </div>

              <GlassCard className="overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="font-black text-slate-800 font-outfit text-sm">Login Stream — Live</h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#dcfce7', color: '#166534' }}>{liveLogins.length} events</span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="Search name or roll..." value={leadsSearch} onChange={e => setLeadsSearch(e.target.value)} className={fieldCls + ' pl-9 py-2 text-xs w-56'} />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-slate-100 bg-slate-50/60">
                      {['Timestamp','Candidate','Roll No','Rank','Category','Type'].map(h => <th key={h} className="px-5 py-3 text-left font-bold text-slate-400 uppercase text-[10px] tracking-wider font-outfit">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {liveLogins.filter(log => { if (!leadsSearch.trim()) return true; const t = leadsSearch.toLowerCase(); return log.name?.toLowerCase().includes(t) || log.roll?.toLowerCase().includes(t); }).map((log, i) => {
                        const isRecent = new Date() - new Date(log.timestamp) < 120000;
                        return (
                          <tr key={log.id||i} className={`border-b border-slate-50 transition-colors ${isRecent ? 'bg-emerald-50/30 hover:bg-emerald-50/50' : 'hover:bg-slate-50/50'}`}>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                {isRecent && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />}
                                <span className="text-slate-500">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-800">
                              <div className="flex items-center gap-1.5">
                                {log.name}
                                {log.isPremium && <span className="text-[9px] font-black px-1.5 py-0.5 rounded font-outfit" style={{ background: '#fef3c7', color: '#92400e' }}>⭐ PRO</span>}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-mono font-bold text-slate-600">{log.roll}</td>
                            <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: '#f1f5f9', color: '#475569' }}>UR: {log.rank}</span></td>
                            <td className="px-5 py-3.5 font-bold text-slate-600 uppercase text-[10px]">{log.category}</td>
                            <td className="px-5 py-3.5">
                              {log.isDemo ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase font-outfit" style={{ background: '#ede9fe', border: '1px solid #c4b5fd', color: '#7c3aed' }}>Demo</span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase font-outfit" style={{ background: '#dbeafe', border: '1px solid #93c5fd', color: '#1d4ed8' }}>Registered</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {liveLogins.length === 0 && (
                        <tr><td colSpan="6" className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">🕒</div>
                            <h4 className="font-bold text-slate-700 text-sm font-outfit">Waiting for logins...</h4>
                            <p className="text-xs text-slate-400">No events yet in the live stream.</p>
                          </div>
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {/* ══ USERS TAB ══════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={allUsers.length} icon={Users} gradient="linear-gradient(135deg,#7C3AED,#5B21B6)" />
                <StatCard label="Premium Users" value={allUsers.filter(u=>u.is_premium).length} icon={Star} gradient="linear-gradient(135deg,#F59E0B,#D97706)" />
                <StatCard label="Blocked" value={allUsers.filter(u=>u.is_blocked).length} icon={Ban} gradient="linear-gradient(135deg,#EF4444,#B91C1C)" />
                <StatCard label="Demo Accounts" value={allUsers.filter(u=>!u.emailOrPhone||u.emailOrPhone.includes('@demo.com')).length} icon={Zap} gradient="linear-gradient(135deg,#0EA5E9,#1D4ED8)" />
              </div>

              {/* Search + Refresh */}
              <GlassCard>
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="Search by name, roll number, email…" value={usersSearch} onChange={e => setUsersSearch(e.target.value)} className={fieldCls + ' pl-10'} />
                  </div>
                  <button onClick={() => { try { setAllUsers(JSON.parse(localStorage.getItem('pk_registered_students')||'[]')); setUserActionMsg('✅ List refreshed'); setTimeout(()=>setUserActionMsg(''),2500); } catch { setAllUsers([]); } }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex-shrink-0" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b' }}>
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </button>
                </div>
                {userActionMsg && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold" style={{ background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46' }}>
                      <CheckCircle className="h-3.5 w-3.5" /> {userActionMsg}
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* User Cards */}
              <div className="space-y-3">
                {(() => {
                  const q = usersSearch.toLowerCase();
                  const filtered = allUsers.filter(u => !q || String(u.name||'').toLowerCase().includes(q) || String(u.roll||'').toLowerCase().includes(q) || String(u.emailOrPhone||'').toLowerCase().includes(q));

                  if (filtered.length === 0) return (
                    <div className="py-24 flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: '#f8fafc' }}>👤</div>
                      <h3 className="font-black text-slate-700 font-outfit">{usersSearch ? 'No matching users' : 'No registered users yet'}</h3>
                    </div>
                  );

                  const avatarGradients = ['linear-gradient(135deg,#7C3AED,#5B21B6)','linear-gradient(135deg,#0EA5E9,#1D4ED8)','linear-gradient(135deg,#10B981,#0F766E)','linear-gradient(135deg,#F43F5E,#BE185D)','linear-gradient(135deg,#F59E0B,#EA580C)','linear-gradient(135deg,#06B6D4,#4338CA)'];

                  return filtered.map((user, idx) => {
                    const isDemo = !user.emailOrPhone || user.emailOrPhone.includes('@demo.com');
                    const isBlocked = !!user.is_blocked, isPremium = !!user.is_premium;
                    const grad = avatarGradients[(user.name||'A').charCodeAt(0) % avatarGradients.length];

                    const saveUser = (updated) => {
                      try {
                        const stored = JSON.parse(localStorage.getItem('pk_registered_students')||'[]');
                        const newList = stored.map(u => String(u.roll) === String(updated.roll) ? { ...u, ...updated } : u);
                        localStorage.setItem('pk_registered_students', JSON.stringify(newList));
                        setAllUsers(newList);
                      } catch (e) { console.warn(e); }
                    };

                    const togglePremium = () => { saveUser({...user, is_premium: !isPremium}); setUserActionMsg(`${isPremium?'❌ Removed premium from':'⭐ Premium granted to'} ${user.name}`); setTimeout(()=>setUserActionMsg(''),3000); };
                    const toggleBlock = () => { saveUser({...user, is_blocked: !isBlocked}); setUserActionMsg(`${isBlocked?'✅ Unblocked':'🔒 Blocked'}: ${user.name}`); setTimeout(()=>setUserActionMsg(''),3000); };

                    return (
                      <div key={user.roll||idx} className="rounded-2xl p-4 transition-all relative overflow-hidden" style={isBlocked ? { background: '#fef2f2', border: '1px solid #fecaca' } : isPremium ? { background: 'linear-gradient(135deg,#fffbeb,#fef9c3)', border: '1px solid #fde68a' } : { background: 'white', border: '1px solid #e2e8f0' }}>
                        {isBlocked && <div className="absolute top-0 right-0 text-[9px] font-black px-3 py-1 text-white rounded-bl-xl rounded-tr-2xl uppercase tracking-widest" style={{ background: '#ef4444' }}>🔒 BLOCKED</div>}
                        {isPremium && !isBlocked && <div className="absolute top-0 right-0 text-[9px] font-black px-3 py-1 text-white rounded-bl-xl rounded-tr-2xl uppercase tracking-widest" style={{ background: 'linear-gradient(90deg,#f59e0b,#eab308)' }}>⭐ PREMIUM</div>}

                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md flex-shrink-0" style={{ background: grad }}>{(user.name||'?')[0].toUpperCase()}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <h4 className="font-black text-slate-900 font-outfit text-sm">{user.name||'—'}</h4>
                              {isDemo ? <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b' }}>🎭 Demo</span> : <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#dbeafe', border: '1px solid #93c5fd', color: '#1d4ed8' }}>✅ Registered</span>}
                              {user.category && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#ede9fe', border: '1px solid #c4b5fd', color: '#7c3aed' }}>{user.category}</span>}
                            </div>
                            <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-500 font-inter">
                              <span className="font-mono font-bold text-slate-700">Roll: #{user.roll}</span>
                              {user.rank && <span>Rank: <strong className="text-slate-800">#{user.rank}</strong></span>}
                              <span>Group: <strong className="text-slate-700">{user.courseGroup||'PE'}</strong></span>
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-400">{isDemo ? '📱 No email/phone' : `📧 ${user.emailOrPhone}`}</div>
                          </div>
                          <div className="flex-shrink-0 flex flex-col gap-2">
                            <button onClick={togglePremium} className="flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-black cursor-pointer transition-all font-outfit whitespace-nowrap border" style={isPremium ? { background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e' } : { background: '#fafafa', border: '1px solid #e2e8f0', color: '#64748b' }}>
                              {isPremium ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                              {isPremium ? '⭐ Remove' : '☆ Premium'}
                            </button>
                            <button onClick={toggleBlock} className="flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-black cursor-pointer transition-all font-outfit whitespace-nowrap border" style={isBlocked ? { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534' } : { background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626' }}>
                              {isBlocked ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                              {isBlocked ? '✅ Unblock' : '🔒 Block'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
