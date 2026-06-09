import React from 'react';
import { BookOpen, FileDown, CalendarRange, ArrowRight, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

const Hub = ({ setCurrentPage }) => {
  // Container stagger options
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  // Card slide-up spring options
  const cardVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 85, damping: 16 }
    }
  };

  return (
    <section className="py-16 bg-transparent border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit bg-gradient-to-r from-slate-900 via-brand-primary to-purple-800 bg-clip-text text-transparent tracking-tight">
              DCECE 2026 Hub
            </h2>
            <p className="text-slate-500 font-inter text-sm md:text-base mt-1">
              Everything you need for your Bihar Polytechnic journey.
            </p>
          </div>
          <button 
            onClick={() => setCurrentPage('guide')}
            className="group inline-flex items-center gap-1 text-sm font-bold text-brand-primary hover:text-purple-700 transition-colors font-outfit hover:underline cursor-pointer align-middle"
          >
            <span>View All Resources</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Layout Grid with scroll animation */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          
          {/* Left Large Card: College Directory */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.01, borderColor: "rgba(90, 36, 179, 0.3)", boxShadow: "0 20px 45px rgba(90, 36, 179, 0.06)" }}
            onClick={() => setCurrentPage('college-list')}
            className="lg:col-span-6 flex flex-col glass-premium rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-500 group justify-between cursor-pointer"
          >
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-xs group-hover:scale-105 group-hover:bg-brand-primary/15 transition-all duration-300">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-outfit text-slate-900">
                  College Directory
                </h3>
                <p className="text-slate-600 font-inter text-sm sm:text-[14px] leading-relaxed">
                  Explore all government and private polytechnic colleges in Bihar with details on fees, intake, and facilities.
                </p>
              </div>
            </div>
            
            {/* Image section */}
            <div className="my-6 overflow-hidden rounded-xl border border-slate-200/80 aspect-video relative">
              <img 
                src="/college_building.jpg" 
                alt="Modern College Directory Campus" 
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 rounded-xl"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=400';
                }}
              />
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPage('college-list');
              }}
              className="inline-flex items-center gap-1.5 text-[15px] font-bold text-brand-primary hover:text-purple-700 font-outfit cursor-pointer self-start"
            >
              <span>Explore Colleges</span>
              <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Right Cards Stack: Resource cards + Banner */}
          <div className="lg:col-span-6 flex flex-col gap-6 justify-between">
            
            {/* Upper Grid of 2 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Admit Card Card */}
              <motion.div 
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.01, borderColor: "rgba(90, 36, 179, 0.3)", boxShadow: "0 20px 45px rgba(90, 36, 179, 0.06)" }}
                className="glass-premium rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-all duration-500 group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 group-hover:scale-105 group-hover:bg-brand-primary/15 transition-all duration-300">
                    <FileDown className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold font-outfit text-slate-900">Admit Card</h4>
                    <p className="text-slate-500 text-xs md:text-sm font-inter leading-relaxed">
                      Download your DCECE 2026 hall ticket here.
                    </p>
                  </div>
                </div>
                <a 
                  href="#" 
                  onClick={(e) => e.stopPropagation()}
                  className="mt-6 text-xs font-bold tracking-wider font-outfit text-brand-primary hover:text-purple-700 uppercase flex items-center gap-1"
                >
                  <span>DOWNLOAD NOW</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-350" />
                </a>
              </motion.div>

              {/* Schedule Card */}
              <motion.div 
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.01, borderColor: "rgba(90, 36, 179, 0.3)", boxShadow: "0 20px 45px rgba(90, 36, 179, 0.06)" }}
                onClick={() => setCurrentPage('guide')}
                className="glass-premium rounded-2xl p-6 flex flex-col justify-between shadow-sm transition-all duration-500 group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 group-hover:scale-105 group-hover:bg-brand-primary/15 transition-all duration-300">
                    <CalendarRange className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold font-outfit text-slate-900">Schedule</h4>
                    <p className="text-slate-500 text-xs md:text-sm font-inter leading-relaxed">
                      Important dates for exams and counselling.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage('guide');
                  }}
                  className="mt-6 text-xs font-bold tracking-wider font-outfit text-brand-primary hover:text-purple-700 uppercase text-left cursor-pointer flex items-center gap-1"
                >
                  <span>VIEW CALENDAR</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-350" />
                </button>
              </motion.div>

            </div>

            {/* Lower Banner: Counselling Procedure */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01, boxShadow: "0 20px 45px rgba(90, 36, 179, 0.15)" }}
              onClick={() => setCurrentPage('guide')}
              className="bg-gradient-to-br from-[#2E1065] via-[#1E1B4B] to-[#0F172A] border border-purple-200/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between flex-grow shadow-xl transition-all duration-500 min-h-[200px] text-white group cursor-pointer"
            >
              
              {/* Background watermark icon */}
              <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] text-white select-none pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                <Compass className="h-44 w-44" />
              </div>
              
              <div className="space-y-3 relative z-10">
                <h3 className="text-lg sm:text-xl font-bold font-outfit tracking-tight text-white">
                  Counselling Procedure
                </h3>
                <p className="text-slate-300 font-inter text-xs sm:text-sm leading-relaxed max-w-sm">
                  Step-by-step guide to choice filling, seat locking, document verification, and final admission.
                </p>
              </div>

              <div className="mt-8 relative z-10">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage('guide');
                  }}
                  className="bg-gradient-to-r from-brand-secondary to-teal-500 hover:from-teal-600 hover:to-brand-secondary text-white font-extrabold font-outfit px-5 py-2.5 rounded-lg text-sm transition-all active:scale-95 cursor-pointer shadow-md hover:shadow-lg flex items-center gap-1"
                >
                  <span>Get Guide</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </motion.div>

          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default Hub;
