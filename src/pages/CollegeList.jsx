import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowRight, ShieldCheck, CheckCircle2, X, School, Users, Landmark, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CollegeList = ({ colleges }) => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedCollege, setSelectedCollege] = useState(null);

  // Filters
  const filteredColleges = useMemo(() => {
    const cleanStr = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const query = cleanStr(searchQuery);

    return colleges.filter(col => {
      const matchesSearch = cleanStr(col.name).includes(query) || 
                            cleanStr(col.location).includes(query);
      const matchesBranch = selectedBranch === 'All' || col.branches.includes(selectedBranch);
      return matchesSearch && matchesBranch;
    });
  }, [searchQuery, selectedBranch, colleges]);

  return (
    <main className="w-full font-inter">
      
      {/* 1. Header Area (Deep Purple-Navy Gradient Banner for Premium Contrast) */}
      <section className="bg-gradient-to-r from-[#2E1065] via-[#1E1B4B] to-[#0F172A] border-b border-slate-200/10 text-white py-12 md:py-16 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* Left Column Copy */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap gap-2.5">
                <span className="bg-brand-secondary text-white font-extrabold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider select-none">
                  AICTE Approved
                </span>
                <span className="bg-white/10 text-purple-100 border border-white/15 font-bold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider select-none">
                  44+ Institutions
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit bg-gradient-to-r from-white via-purple-100 to-brand-secondary bg-clip-text text-transparent leading-tight tracking-tight">
                Bihar Government <br className="hidden sm:inline" />
                Polytechnic Institutions
              </h1>
              <p className="text-purple-100/70 font-medium text-sm sm:text-base leading-relaxed max-w-xl">
                Comprehensive list of top government technical colleges in Bihar. Explore seat matrices, campus placements, and course offerings to plan your professional future.
              </p>
            </div>

            {/* Right Column Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="overflow-hidden rounded-2xl shadow-2xl border border-white/10 w-full max-w-md aspect-video relative">
                <img 
                  src="/govt_college.jpg" 
                  alt="Bihar Government Polytechnic Campus" 
                  className="w-full h-full object-cover brightness-95"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Filters & Search Grid */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch select-none">
            
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by college name or city..."
                className="pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-805 rounded-lg outline-none font-inter text-sm w-full focus:border-brand-primary"
              />
            </div>

            {/* More Filters */}
            <button className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold font-outfit px-5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs select-none h-[50px] sm:h-auto">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Colleges Grid */}
      <section className="py-12 min-h-[400px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {filteredColleges.length > 0 ? (
              filteredColleges.map((col) => (
                <motion.div
                  key={col.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white border border-slate-200 hover:border-brand-primary/30 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md hover:scale-[1.015] transition-all duration-300 group"
                >
                  {/* College Card Image Header */}
                  <div className="h-44 w-full overflow-hidden relative border-b border-slate-100 bg-slate-50">
                    <img 
                      src={col.image_url || col.image} 
                      alt={col.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=400';
                      }}
                    />
                    {col.topRanked && (
                      <span className="absolute top-3 right-3 bg-brand-primary text-white font-bold text-[10px] px-2.5 py-1 rounded-md shadow-xs select-none">
                        Top Ranked
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-extrabold font-outfit text-slate-800 text-lg leading-snug">{col.name}</h3>
                        <p className="text-slate-500 font-inter text-xs flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-brand-secondary" />
                          <span>{col.location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stats List */}
                    <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-150 font-outfit select-none">
                      <div>
                        <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Seats</span>
                        <span className="text-slate-850 font-black text-lg">{col.seats}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider">Placement Rate</span>
                        <span className="text-brand-secondary font-black text-lg">{col.placement}%</span>
                      </div>
                    </div>

                    {/* Branches pills */}
                    <div className="space-y-1.5 select-none">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available Branches & Seats</span>
                      <div className="flex flex-wrap gap-1.5">
                        {col.branches.map((b) => (
                          <span 
                            key={b} 
                            className="bg-slate-50 text-slate-655 border border-slate-205 px-2 py-0.5 rounded text-[11px] font-semibold"
                          >
                            {b} ({col.seatMatrix && col.seatMatrix[b] !== undefined ? col.seatMatrix[b] : 'N/A'})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="px-6 pb-6 pt-2">
                    <button
                      onClick={() => {
                        setSelectedCollege(col);
                      }}
                      className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold font-outfit py-3 rounded-lg text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer select-none"
                    >
                      <span>View Detail</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-slate-500 font-semibold select-none">
                No polytechnic institutes found matching your filters.
              </div>
            )}

          </div>

        </div>
      </section>

      {/* 4. College Detail Modal Popups */}
      <AnimatePresence>
        {selectedCollege && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-lg w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Image Banner */}
              <div className="h-48 w-full relative bg-slate-100 flex-shrink-0">
                <img 
                  src={selectedCollege.image_url || selectedCollege.image} 
                  alt={selectedCollege.name} 
                  className="w-full h-full object-cover brightness-95"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=400';
                  }}
                />
                <button 
                  onClick={() => setSelectedCollege(null)}
                  className="absolute top-4 right-4 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-xs p-2 rounded-full text-white cursor-pointer transition-colors z-10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Header (Deep Purple Banner for Premium Accent) */}
              <div className="bg-gradient-to-r from-[#2E1065] to-[#1E1B4B] text-white p-6 border-b border-white/10 relative flex justify-between items-start gap-4 flex-shrink-0 select-none">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold font-outfit bg-gradient-to-r from-white via-purple-100 to-brand-secondary bg-clip-text text-transparent">{selectedCollege.name}</h3>
                  <p className="text-purple-200 font-inter text-xs flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-secondary" />
                    <span>{selectedCollege.location}</span>
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto bg-white text-slate-600">
                
                {/* Established & Fees Quick Rows */}
                <div className="grid grid-cols-3 gap-4 border-b border-slate-150 pb-4 text-center select-none font-outfit">
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <Landmark className="h-5 w-5 text-brand-primary mb-1.5" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Established</span>
                    <span className="text-slate-805 font-extrabold text-sm mt-0.5">{selectedCollege.established}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <Users className="h-5 w-5 text-brand-primary mb-1.5" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Seats Intake</span>
                    <span className="text-slate-805 font-extrabold text-sm mt-0.5">
                      {selectedCollege.seats}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <School className="h-5 w-5 text-brand-primary mb-1.5" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Academic Fees</span>
                    <span className="text-slate-805 font-extrabold text-sm mt-0.5">{selectedCollege.fees || '₹1,000/year'}</span>
                  </div>
                </div>

                {/* About description */}
                <div className="space-y-2">
                  <h4 className="font-bold font-outfit text-slate-800 text-base">About Institution</h4>
                  <p className="text-slate-600 font-inter text-sm leading-relaxed">{selectedCollege.desc || selectedCollege.description}</p>
                </div>

                {/* Seat Matrix Breakdown */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-150 pb-2">
                    <h4 className="font-bold font-outfit text-slate-800 text-base">Seat Matrix Breakdown</h4>
                  </div>

                  {/* Grid display */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center select-none font-outfit">
                    {selectedCollege.seatMatrix && Object.keys(selectedCollege.seatMatrix).length > 0 ? (
                      Object.entries(selectedCollege.seatMatrix).map(([branch, seats]) => (
                        <div key={branch} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate" title={branch}>{branch}</span>
                          <span className="text-brand-primary font-extrabold text-sm mt-0.5">{seats} Seats</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-4 text-xs text-slate-400">No regular seats defined</div>
                    )}
                  </div>
                </div>

                {/* Campus Facilities */}
                <div className="space-y-3">
                  <h4 className="font-bold font-outfit text-slate-800 text-base">Campus Infrastructure & Facilities</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 font-medium font-inter">
                    {selectedCollege.facilities.map((fac) => (
                      <div key={fac} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-brand-secondary flex-shrink-0" />
                        <span>{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Placement metrics details */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-4 font-outfit select-none">
                  <div>
                    <h5 className="font-extrabold text-brand-secondary text-base">Placement Statistics</h5>
                    <p className="text-slate-600 font-inter text-[13px] mt-0.5">Verified recruitment rate for standard batch records.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-brand-secondary">{selectedCollege.placement}%</span>
                    <span className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mt-0.5">PLACEMENT RATIO</span>
                  </div>
                </div>

              </div>
              
              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end flex-shrink-0">
                <button 
                  onClick={() => setSelectedCollege(null)}
                  className="bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold font-outfit px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer shadow-xs"
                >
                  Close Detail
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
};

export default CollegeList;
