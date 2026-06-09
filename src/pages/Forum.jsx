import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Flag, Plus, Search, X, 
  User, CheckCircle2, Sparkles, AlertTriangle, Compass, RefreshCw, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Common slang/abusive words list for moderation (English + Hindi/Hinglish)
const PROFANITY_WORDS = [
  'chutiya', 'harami', 'saala', 'gaand', 'madarchod', 'behenchod', 'idiot', 'stupid',
  'asshole', 'bastard', 'fuck', 'bitch', 'randi', 'kamina', 'bhadwa', 'laundia', 'loda'
];

const CATEGORIES = [
  { id: 'guidance', label: '🚀 Future & Career Guidance' },
  { id: 'feature', label: '💡 Feature Request' },
  { id: 'review', label: '⭐ App Reviews' },
  { id: 'discussion', label: '💬 General Discussion' }
];

const Forum = ({ studentInfo }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection/Filtering States
  const [selectedCat, setSelectedCat] = useState('All');
  const [sortBy, setSortBy] = useState('trending'); // 'trending' (votes) or 'latest' (created_at)
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Threads
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Form Inputs
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newComment, setNewComment] = useState('');

  // User Votes & Reports Tracking (to avoid multiple clicks)
  const [userVotes, setUserVotes] = useState({}); // { [post_id]: 'upvote' | 'downvote' }
  const [userReports, setUserReports] = useState({ posts: {}, comments: {} });
  const [authorsStats, setAuthorsStats] = useState({}); // { [roll]: { posts: X, comments: Y } }

  // Moderation warning state
  const [modNotice, setModNotice] = useState('');

  useEffect(() => {
    fetchPosts();
    if (studentInfo) {
      fetchUserVotesAndReports();
    }
  }, [studentInfo]);

  // Re-fetch posts when tab parameters change
  useEffect(() => {
    fetchPosts();
  }, [selectedCat, sortBy]);

  // Sync author statistics (to award Top Helper / Pro Member badges)
  useEffect(() => {
    if (posts.length > 0) {
      computeAuthorsStats();
    }
  }, [posts]);

  // Fetch comments when a post is expanded
  useEffect(() => {
    if (activePostId) {
      fetchComments(activePostId);
    }
  }, [activePostId]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('forum_posts')
        .select('*')
        .eq('is_hidden', false);

      if (selectedCat !== 'All') {
        query = query.eq('category', selectedCat);
      }

      if (sortBy === 'trending') {
        query = query.order('upvotes', { ascending: false }).order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching forum posts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    setCommentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err.message);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchUserVotesAndReports = async () => {
    try {
      // Fetch votes
      const { data: votesData } = await supabase
        .from('forum_votes')
        .select('post_id, vote_type')
        .eq('student_roll', studentInfo.roll);

      const votesMap = {};
      (votesData || []).forEach(v => {
        votesMap[v.post_id] = v.vote_type;
      });
      setUserVotes(votesMap);

      // Fetch reports
      const { data: reportsData } = await supabase
        .from('forum_reports')
        .select('post_id, comment_id')
        .eq('student_roll', studentInfo.roll);

      const reportsMap = { posts: {}, comments: {} };
      (reportsData || []).forEach(r => {
        if (r.post_id) reportsMap.posts[r.post_id] = true;
        if (r.comment_id) reportsMap.comments[r.comment_id] = true;
      });
      setUserReports(reportsMap);
    } catch (err) {
      console.warn('Error fetching user votes/reports metadata:', err.message);
    }
  };

  // Dynamically count posts/comments for badges without requiring backend triggers
  const computeAuthorsStats = async () => {
    try {
      const { data: postsCountData } = await supabase
        .from('forum_posts')
        .select('student_roll');
      
      const { data: commentsCountData } = await supabase
        .from('forum_comments')
        .select('student_roll');

      const stats = {};
      (postsCountData || []).forEach(p => {
        if (!stats[p.student_roll]) stats[p.student_roll] = { posts: 0, comments: 0 };
        stats[p.student_roll].posts++;
      });
      (commentsCountData || []).forEach(c => {
        if (!stats[c.student_roll]) stats[c.student_roll] = { posts: 0, comments: 0 };
        stats[c.student_roll].comments++;
      });

      setAuthorsStats(stats);
    } catch (err) {
      console.warn('Error computing authors stats:', err.message);
    }
  };

  // Client-side Censor/Abuse Clean-up
  const cleanAbusiveContent = (text) => {
    let cleanText = text;
    let containsAbuse = false;
    
    PROFANITY_WORDS.forEach(badWord => {
      const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
      if (regex.test(cleanText)) {
        containsAbuse = true;
        cleanText = cleanText.replace(regex, '***');
      }
    });

    return { cleanText, containsAbuse };
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newCategory) {
      alert('Please select a tag/category for your post.');
      return;
    }

    const titleCensor = cleanAbusiveContent(newTitle);
    const contentCensor = cleanAbusiveContent(newContent);

    if (titleCensor.containsAbuse || contentCensor.containsAbuse) {
      setModNotice('Abusive words detected! Your post content has been moderated and censored to ***.');
      setTimeout(() => setModNotice(''), 5000);
    }

    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert([{
          title: titleCensor.cleanText,
          content: contentCensor.cleanText,
          category: newCategory,
          student_name: studentInfo.name,
          student_roll: studentInfo.roll,
          is_premium: studentInfo.isPremium || false
        }]);

      if (error) throw error;

      setNewTitle('');
      setNewContent('');
      setNewCategory('');
      setShowCreateModal(false);
      fetchPosts();
    } catch (err) {
      alert('Error creating post: ' + err.message);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentCensor = cleanAbusiveContent(newComment);
    if (commentCensor.containsAbuse) {
      setModNotice('Comments containing vulgar words are moderated to ***.');
      setTimeout(() => setModNotice(''), 5000);
    }

    try {
      const { error } = await supabase
        .from('forum_comments')
        .insert([{
          post_id: activePostId,
          content: commentCensor.cleanText,
          student_name: studentInfo.name,
          student_roll: studentInfo.roll,
          is_premium: studentInfo.isPremium || false
        }]);

      if (error) throw error;
      setNewComment('');
      fetchComments(activePostId);
      computeAuthorsStats();
    } catch (err) {
      alert('Error adding comment: ' + err.message);
    }
  };

  const handleVote = async (postId, type) => {
    if (!studentInfo) return;
    
    const currentVote = userVotes[postId];
    let increment = 0;

    try {
      if (currentVote === type) {
        // Undo vote
        increment = type === 'upvote' ? -1 : 1;
        await supabase
          .from('forum_votes')
          .delete()
          .eq('post_id', postId)
          .eq('student_roll', studentInfo.roll);

        setUserVotes(prev => {
          const next = { ...prev };
          delete next[postId];
          return next;
        });
      } else {
        // Change or add vote
        if (currentVote) {
          // Switch vote type
          increment = type === 'upvote' ? 2 : -2;
          await supabase
            .from('forum_votes')
            .update({ vote_type: type })
            .eq('post_id', postId)
            .eq('student_roll', studentInfo.roll);
        } else {
          // New vote
          increment = type === 'upvote' ? 1 : -1;
          await supabase
            .from('forum_votes')
            .insert({ post_id: postId, student_roll: studentInfo.roll, vote_type: type });
        }

        setUserVotes(prev => ({ ...prev, [postId]: type }));
      }

      // Update post upvote count dynamically
      const targetPost = posts.find(p => p.id === postId);
      if (targetPost) {
        const nextVotes = (targetPost.upvotes || 0) + increment;
        await supabase
          .from('forum_posts')
          .update({ upvotes: nextVotes })
          .eq('id', postId);

        setPosts(prev => prev.map(p => p.id === postId ? { ...p, upvotes: nextVotes } : p));
      }
    } catch (err) {
      console.error('Error handling vote:', err.message);
    }
  };

  const handleReportPost = async (postId) => {
    if (userReports.posts[postId]) {
      alert('You have already reported this post.');
      return;
    }

    if (!confirm('Are you sure you want to report this post for review? Moderation team will check it.')) return;

    try {
      // 1. Log report entry
      await supabase
        .from('forum_reports')
        .insert({ post_id: postId, student_roll: studentInfo.roll });

      setUserReports(prev => ({
        ...prev,
        posts: { ...prev.posts, [postId]: true }
      }));

      // 2. Fetch current reports count
      const targetPost = posts.find(p => p.id === postId);
      if (targetPost) {
        const newReports = (targetPost.reports_count || 0) + 1;
        const autoHide = newReports >= 3;

        await supabase
          .from('forum_posts')
          .update({ 
            reports_count: newReports,
            is_hidden: autoHide 
          })
          .eq('id', postId);

        if (autoHide) {
          alert('This post has been temporarily hidden automatically due to multiple reports.');
          fetchPosts();
        } else {
          alert('Thank you, this post has been flagged for moderation review.');
        }
      }
    } catch (err) {
      console.error('Error reporting post:', err.message);
    }
  };

  const handleReportComment = async (commentId) => {
    if (userReports.comments[commentId]) {
      alert('You have already reported this comment.');
      return;
    }

    if (!confirm('Report this comment for containing abusive language or inappropriate content?')) return;

    try {
      await supabase
        .from('forum_reports')
        .insert({ comment_id: commentId, student_roll: studentInfo.roll });

      setUserReports(prev => ({
        ...prev,
        comments: { ...prev.comments, [commentId]: true }
      }));

      const targetComment = comments.find(c => c.id === commentId);
      if (targetComment) {
        const newReports = (targetComment.reports_count || 0) + 1;
        const autoHide = newReports >= 3;

        await supabase
          .from('forum_comments')
          .update({ 
            reports_count: newReports,
            is_hidden: autoHide 
          })
          .eq('id', commentId);

        if (autoHide) {
          alert('This comment has been hidden automatically due to reports.');
          fetchComments(activePostId);
        } else {
          alert('Comment has been flagged.');
        }
      }
    } catch (err) {
      console.error('Error reporting comment:', err.message);
    }
  };

  // Helper to render gamified badges based on user stats
  const renderAuthorBadges = (roll, isPremium) => {
    const stats = authorsStats[roll] || { posts: 0, comments: 0 };
    const badges = [];

    // Verified Premium purchase
    if (isPremium) {
      badges.push(
        <span key="prem" className="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 uppercase select-none font-outfit shadow-xs">
          👑 Premium
        </span>
      );
    }

    // Top Helper (based on comments count)
    if (stats.comments >= 10) {
      badges.push(
        <span key="helper" className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 uppercase select-none font-outfit shadow-xs">
          🏆 Top Helper
        </span>
      );
    }

    // Senior (based on post contributions)
    if (stats.posts >= 5) {
      badges.push(
        <span key="senior" className="bg-purple-100 text-brand-primary border border-purple-250 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 uppercase select-none font-outfit shadow-xs">
          🎓 Senior
        </span>
      );
    } else if (stats.posts >= 3) {
      badges.push(
        <span key="pro" className="bg-blue-100 text-blue-800 border border-blue-200 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 uppercase select-none font-outfit shadow-xs">
          ⚡ Pro Member
        </span>
      );
    }

    return badges;
  };

  const filteredPostsList = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    return posts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.student_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  return (
    <main className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-outfit bg-gradient-to-r from-slate-900 via-brand-primary to-purple-800 bg-clip-text text-transparent tracking-tight">
            Bihar Polytechnic Community Forum
          </h1>
          <p className="text-slate-500 font-inter text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Discuss guidance doubts, suggest features, share feedback, and upvote trending topics with fellow Bihar candidates.
          </p>
        </div>

        {/* Slang/Vulgar content warning alert */}
        <AnimatePresence>
          {modNotice && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-center gap-3 max-w-2xl mx-auto mb-6 text-xs font-bold font-inter"
            >
              <AlertTriangle className="h-4.5 w-4.5 text-amber-600 animate-pulse" />
              <span>{modNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forum Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Side: Category Filters & Options */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold font-outfit text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wide">
                <Compass className="h-4.5 w-4.5 text-brand-primary" />
                <span>Categories</span>
              </h3>
              <div className="flex flex-col gap-1.5 select-none">
                <button
                  onClick={() => setSelectedCat('All')}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCat === 'All'
                      ? 'bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🌐 All Topics
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.label)}
                    className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCat === cat.label
                        ? 'bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary'
                        : 'text-slate-655 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-700 hover:to-brand-primary text-white font-extrabold font-outfit py-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-[0.98] select-none uppercase tracking-wider"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Post</span>
            </button>
          </div>

          {/* Middle/Right: Feed and Comments */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Feed Filters & Search Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Sort selector */}
              <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl w-full md:w-auto">
                <button
                  onClick={() => setSortBy('trending')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer select-none ${
                    sortBy === 'trending'
                      ? 'bg-white text-brand-primary shadow-xs'
                      : 'text-slate-600 hover:bg-slate-105/50'
                  }`}
                >
                  🔥 Trending
                </button>
                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer select-none ${
                    sortBy === 'latest'
                      ? 'bg-white text-brand-primary shadow-xs'
                      : 'text-slate-600 hover:bg-slate-105/50'
                  }`}
                >
                  📅 Latest
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs text-slate-800 focus:border-brand-primary transition-all font-inter"
                />
              </div>

            </div>

            {/* Posts Feed */}
            {loading ? (
              <div className="py-24 text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
                <span className="text-slate-550 font-bold text-xs font-outfit block">Loading community posts...</span>
              </div>
            ) : filteredPostsList.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl py-16 px-6 text-center space-y-4 shadow-sm">
                <div className="h-12 w-12 bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center rounded-xl mx-auto font-bold text-lg select-none">
                  💬
                </div>
                <h3 className="font-extrabold font-outfit text-slate-800 text-sm">No Posts Found</h3>
                <p className="text-xs text-slate-500 font-inter max-w-sm mx-auto leading-relaxed">
                  Be the first one to start the conversation! Click "Create New Post" to ask doubts or share review.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPostsList.map(post => {
                  const isExpanded = activePostId === post.id;
                  const postVote = userVotes[post.id];

                  return (
                    <div 
                      key={post.id} 
                      className={`bg-white border rounded-2xl p-5 shadow-xs transition-all duration-300 hover:border-brand-primary/30 ${
                        isExpanded ? 'ring-1 ring-brand-primary/20 shadow-md' : ''
                      }`}
                    >
                      {/* Post Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="inline-block bg-brand-primary/5 text-brand-primary text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider font-outfit">
                            {post.category}
                          </span>
                          <h3 
                            onClick={() => setActivePostId(isExpanded ? null : post.id)}
                            className="text-base font-extrabold text-slate-900 font-outfit tracking-tight cursor-pointer hover:text-brand-primary leading-snug"
                          >
                            {post.title}
                          </h3>
                        </div>
                        
                        {/* Report Post */}
                        <button
                          onClick={() => handleReportPost(post.id)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            userReports.posts[post.id]
                              ? 'bg-rose-50 border-rose-200 text-rose-500'
                              : 'bg-slate-50 hover:bg-rose-50 border-slate-100 hover:border-rose-200 text-slate-400 hover:text-rose-500'
                          }`}
                          title="Report Post"
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Post Description */}
                      <p className="text-xs text-slate-600 font-inter mt-3 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Post Author Details & Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 mt-4 text-[11px] font-semibold text-slate-500">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-[10px] font-bold border border-brand-primary/10 select-none">
                            {post.student_name ? post.student_name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <span className="font-bold text-slate-900">{post.student_name}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] font-semibold font-inter">{new Date(post.created_at).toLocaleDateString('en-IN')}</span>
                          <div className="flex items-center gap-1.5">
                            {renderAuthorBadges(post.student_roll, post.is_premium)}
                          </div>
                        </div>

                        {/* Votes & Comments Counts */}
                        <div className="flex items-center gap-4 select-none">
                          
                          {/* Voting controls */}
                          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                            <button
                              onClick={() => handleVote(post.id, 'upvote')}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                postVote === 'upvote' 
                                  ? 'bg-brand-primary text-white shadow-xs' 
                                  : 'text-slate-400 hover:text-brand-primary'
                              }`}
                              title="Upvote"
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-2.5 font-bold text-slate-800 text-xs font-outfit">
                              {post.upvotes}
                            </span>
                            <button
                              onClick={() => handleVote(post.id, 'downvote')}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                postVote === 'downvote' 
                                  ? 'bg-rose-500 text-white shadow-xs' 
                                  : 'text-slate-400 hover:text-rose-500'
                              }`}
                              title="Downvote"
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Expand Comments */}
                          <button
                            onClick={() => setActivePostId(isExpanded ? null : post.id)}
                            className="flex items-center gap-1.5 text-slate-500 hover:text-brand-primary transition-colors cursor-pointer"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span className="font-outfit text-xs font-extrabold">Comments</span>
                          </button>

                        </div>
                      </div>

                      {/* Comments Thread Section */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-t border-slate-100 mt-4 pt-4 space-y-4"
                          >
                            {/* Inner comments feed */}
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                              {commentsLoading ? (
                                <div className="py-6 text-center">
                                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
                                </div>
                              ) : comments.length === 0 ? (
                                <div className="text-center py-6 text-slate-400 text-xs italic font-medium">
                                  No replies yet. Start community helping below!
                                </div>
                              ) : (
                                comments.map(comment => (
                                  <div 
                                    key={comment.id}
                                    className="bg-slate-50 border border-slate-150/80 rounded-xl p-3.5 flex flex-col gap-2 relative group"
                                  >
                                    <div className="flex justify-between items-start gap-4">
                                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-550">
                                        <span className="font-bold text-slate-900">{comment.student_name}</span>
                                        <div className="flex items-center gap-1">
                                          {renderAuthorBadges(comment.student_roll, comment.is_premium)}
                                        </div>
                                        <span className="text-slate-300">•</span>
                                        <span className="font-medium font-inter">{new Date(comment.created_at).toLocaleDateString('en-IN')}</span>
                                      </div>

                                      {/* Report Comment */}
                                      <button
                                        onClick={() => handleReportComment(comment.id)}
                                        className={`p-1 bg-white rounded border opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                                          userReports.comments[comment.id]
                                            ? 'border-rose-200 text-rose-500'
                                            : 'border-slate-150 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                                        }`}
                                        title="Report Comment"
                                      >
                                        <Flag className="h-3 w-3" />
                                      </button>
                                    </div>
                                    <p className="text-xs text-slate-650 font-inter leading-relaxed">
                                      {comment.content}
                                    </p>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Add Comment Input Form */}
                            <form onSubmit={handleCreateComment} className="flex gap-2 pt-2">
                              <input
                                type="text"
                                required
                                placeholder="Write a helpful answer..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:bg-white focus:border-brand-primary transition-all font-inter"
                              />
                              <button
                                type="submit"
                                className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold font-outfit flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                              >
                                <Send className="h-3.5 w-3.5" />
                                <span>Reply</span>
                              </button>
                            </form>

                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* Create Post Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateModal(false)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg z-10 flex flex-col"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-brand-primary to-purple-600" />
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 hover:bg-slate-100 p-1.5 rounded-full transition-all cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
                <div className="p-6 space-y-6">
                  <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold font-outfit text-slate-900">
                      Create Community Post
                    </h3>
                    <p className="text-xs text-slate-500">Ask career doubts, submit features request, or write reviews.</p>
                  </div>

                  <form onSubmit={handleCreatePost} className="space-y-4">
                    {/* Category Selection Tag (Compulsory) */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase tracking-widest font-outfit">Select Tag / Category (Compulsory)</label>
                      <select
                        required
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-slate-800 text-xs font-semibold bg-slate-50/50 cursor-pointer font-bold"
                      >
                        <option value="">-- Choose Category tag --</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.label}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase tracking-widest font-outfit">Post Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Civil vs CSE Branch comparison for GP Patna-7"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="px-3.5 py-2.5 border border-slate-200 focus:border-brand-primary outline-none text-slate-850 text-xs font-semibold rounded-xl bg-slate-50/50 font-inter"
                      />
                    </div>

                    {/* Content Description */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-550 uppercase tracking-widest font-outfit">Post content details</label>
                      <textarea
                        required
                        rows="4"
                        placeholder="Write your explanation or doubt details here..."
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="px-3.5 py-2.5 border border-slate-200 focus:border-brand-primary outline-none text-slate-850 text-xs font-medium rounded-xl bg-slate-50/50 font-inter resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#1E1B4B] hover:bg-[#2D297A] text-white font-extrabold font-outfit py-4 rounded-xl text-xs transition-all cursor-pointer mt-6 shadow-md select-none uppercase tracking-wider"
                    >
                      Publish Topic
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
};

export default Forum;
