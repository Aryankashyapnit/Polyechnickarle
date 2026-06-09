import React from 'react';
import { BookOpen, FileDown, CalendarRange, ArrowRight, Compass } from 'lucide-react';

const Hub = ({ setCurrentPage }) => {
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
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-primary hover:text-purple-700 transition-colors font-outfit hover:underline cursor-pointer align-middle"
          >
            <span>View All Resources</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Large Card: College Directory */}
          <div className="lg:col-span-6 flex flex-col bg-white border border-slate-200/80 hover:border-brand-primary/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-[0_15px_45px_rgba(90,36,179,0.08)] hover:scale-[1.015] transition-all duration-500 group justify-between">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-xs">
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
                  e.target.className = "w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 rounded-xl";
                }}
              />
            </div>

            <button 
              onClick={() => setCurrentPage('college-list')}
              className="inline-flex items-center gap-1.5 text-[15px] font-bold text-brand-primary hover:text-purple-700 font-outfit cursor-pointer self-start"
            >
              <span>Explore Colleges</span>
              <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Cards Stack: Resource cards + Banner */}
          <div className="lg:col-span-6 flex flex-col gap-6 justify-between">
            
            {/* Upper Grid of 2 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Admit Card Card */}
              <div className="bg-white border border-slate-200/80 hover:border-brand-primary/30 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-[0_15px_45px_rgba(90,36,179,0.08)] hover:scale-[1.015] transition-all duration-500">
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
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
                  className="mt-6 text-xs font-bold tracking-wider font-outfit text-brand-primary hover:text-purple-700 uppercase"
                >
                  DOWNLOAD NOW
                </a>
              </div>

              {/* Schedule Card */}
              <div className="bg-white border border-slate-200/80 hover:border-brand-primary/30 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-[0_15px_45px_rgba(90,36,179,0.08)] hover:scale-[1.015] transition-all duration-500">
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
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
                  onClick={() => setCurrentPage('guide')}
                  className="mt-6 text-xs font-bold tracking-wider font-outfit text-brand-primary hover:text-purple-700 uppercase text-left cursor-pointer"
                >
                  VIEW CALENDAR
                </button>
              </div>

            </div>

            {/* Lower Banner: Counselling Procedure */}
            <div className="bg-gradient-to-br from-[#2E1065] via-[#1E1B4B] to-[#0F172A] border border-purple-200/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between flex-grow shadow-xl hover:shadow-[0_15px_45px_rgba(90,36,179,0.15)] hover:scale-[1.015] transition-all duration-500 min-h-[200px] text-white">
              
              {/* Background watermark icon */}
              <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] text-white select-none pointer-events-none">
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
                  onClick={() => setCurrentPage('guide')}
                  className="bg-gradient-to-r from-brand-secondary to-teal-500 hover:from-teal-600 hover:to-brand-secondary text-white font-extrabold font-outfit px-5 py-2.5 rounded-lg text-sm transition-all active:scale-95 cursor-pointer shadow-md hover:shadow-lg"
                >
                  Get Guide
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default Hub;
