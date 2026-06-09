import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Compass, FileText } from 'lucide-react';

const Hero = ({ setCurrentPage }) => {
  return (
    <section className="relative overflow-hidden py-12 md:py-20 lg:py-24 bg-dot-grid bg-opacity-[0.25]">
      {/* Background Mesh Gradient Blobs */}
      <div className="absolute top-1/4 left-1/12 w-72 h-72 rounded-full bg-brand-primary/10 blur-3xl -z-10 animate-mesh-drift" />
      <div className="absolute bottom-1/4 right-1/12 w-80 h-80 rounded-full bg-brand-secondary/8 blur-3xl -z-10 animate-mesh-drift [animation-delay:4s]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 text-left space-y-6 md:space-y-8">
            
            {/* Partner Tag */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="pulsing-border inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs font-bold tracking-wide select-none"
            >
              <ShieldCheck className="h-4 w-4 text-brand-primary" />
              <span>Official BCECE Counselling Partner</span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="text-[36px] sm:text-[44px] md:text-[52px] font-extrabold font-outfit leading-[1.15] tracking-tight text-slate-900">
                Bihar Polytechnic <br />
                <span className="bg-gradient-to-r from-brand-primary via-purple-700 to-brand-secondary bg-clip-text text-transparent glow-primary">Counselling Guide 2026</span>
              </h1>
              <p className="text-slate-600 font-inter text-[15px] sm:text-[17px] leading-relaxed max-w-xl">
                Your ultimate destination for DCECE admissions. Use our precision tools to predict your college based on rank and view historical cutoff trends.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 sm:items-center"
            >
              <button
                onClick={() => setCurrentPage('predictor')}
                className="group bg-gradient-to-r from-brand-primary to-purple-600 hover:from-purple-750 hover:to-brand-primary text-white px-7 py-4.5 rounded-xl font-extrabold font-outfit flex items-center justify-center gap-2 shadow-md hover:shadow-[0_8px_25px_rgba(90,36,179,0.35)] hover:scale-[1.025] hover:-translate-y-0.5 transition-all duration-300 active:scale-98 select-none cursor-pointer"
              >
                <Compass className="h-5 w-5 group-hover:rotate-45 transition-transform duration-500" />
                <span>Predict My College</span>
              </button>
              
              <button
                onClick={() => setCurrentPage('cutoff')}
                className="group bg-white hover:bg-brand-primary/5 text-slate-800 hover:text-brand-primary border border-slate-200 hover:border-brand-primary/35 px-7 py-4.5 rounded-xl font-bold font-outfit flex items-center justify-center gap-2 shadow-xs hover:shadow-[0_4px_15px_rgba(90,36,179,0.05)] hover:scale-[1.025] hover:-translate-y-0.5 transition-all duration-300 active:scale-98 select-none cursor-pointer"
              >
                <FileText className="h-5 w-5 text-slate-500 group-hover:-translate-y-0.5 transition-transform duration-300" />
                <span>View Cutoffs</span>
              </button>
            </motion.div>
          </div>
 
          {/* Right Column: Circular Brand Logo Illustration */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 70 }}
              className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 p-6"
            >
              {/* Outer soft shadow ring */}
              <div className="absolute inset-2 rounded-full bg-radial from-brand-primary/20 to-transparent blur-3xl -z-10 animate-pulse"></div>
              
              {/* Animated Orbital Ring 1 */}
              <div className="absolute inset-0 rounded-full border border-dashed border-brand-primary/20 animate-spin [animation-duration:25s]" />
              
              {/* Animated Orbital Ring 2 */}
              <div className="absolute -inset-2 rounded-full border border-dotted border-brand-secondary/25 animate-spin [animation-duration:40s] [animation-direction:reverse]" />
              
              <img 
                src="/logo.png" 
                alt="Polytechnic Karle Seal Logo" 
                className="w-full h-full object-contain rounded-full filter drop-shadow-[0_12px_30px_rgba(90,36,179,0.15)] animate-float relative z-10"
                onError={(e) => {
                  // Fallback logo if missing
                  e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=300&auto=format&fit=crop';
                }}
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;