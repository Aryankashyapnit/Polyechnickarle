import React from 'react';
import Hero from '../components/Hero';
import LatestUpdates from '../components/LatestUpdates';
import Hub from '../components/Hub';
import PredictorSteps from '../components/PredictorSteps';
import { Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = ({ setCurrentPage }) => {
  return (
    <main className="w-full bg-[#f8fafc]">
      {/* 1. Hero Section */}
      <Hero setCurrentPage={setCurrentPage} />
      
      {/* 2. DCECE Hub Section */}
      <Hub setCurrentPage={setCurrentPage} />
      
      {/* 3. Latest Notifications */}
      <LatestUpdates />
      
      {/* 4. Predictor Explanation */}
      <PredictorSteps />

      {/* 5. CTA Section: Ready to find your future college? */}
      <section className="py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-brand-primary to-purple-800 border border-purple-200 rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl text-white hover:shadow-[0_15px_40px_rgba(90,36,179,0.12)] hover:scale-[1.015] transition-all duration-500"
          >
            <div className="text-center md:text-left space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold font-outfit text-white tracking-tight">
                Ready to find your future college?
              </h3>
              <p className="text-purple-100/70 font-inter text-xs sm:text-sm md:text-base font-medium">
                Join 50,000+ students who use our predictor every year.
              </p>
            </div>
            
            <button
              onClick={() => setCurrentPage('predictor')}
              className="w-full md:w-auto bg-white hover:bg-slate-100 text-brand-primary px-6 py-4.5 rounded-xl font-extrabold font-outfit flex items-center justify-center gap-2 shadow-md hover:shadow-[0_4px_20px_rgba(255,255,255,0.25)] transition-all active:scale-98 cursor-pointer select-none"
            >
              <span>Start Prediction Now</span>
              <Rocket className="h-4.5 w-4.5" />
            </button>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Home;