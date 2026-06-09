import React from 'react';
import { RefreshCw, Cpu, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const PredictorSteps = () => {
  const steps = [
    {
      id: 1,
      icon: <RefreshCw className="h-6 w-6 text-brand-primary" />,
      title: 'Historical Analysis',
      description: 'We analyze 10+ years of cutoff data from BCECE records to identify pattern shifts and seat demand trends.'
    },
    {
      id: 2,
      icon: <Cpu className="h-6 w-6 text-brand-primary" />,
      title: 'Smart Algorithm',
      description: 'Our AI cross-references your rank, category, and branch preferences against current seat matrices.'
    },
    {
      id: 3,
      icon: <Target className="h-6 w-6 text-brand-primary" />,
      title: 'Instant Prediction',
      description: 'Get a probability-based list of colleges where you have the highest chance of securing a seat.'
    }
  ];

  return (
    <section className="py-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-800 tracking-tight">
            How Our Predictor Works
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="flex flex-col items-center text-center space-y-4 group"
            >
              {/* Icon Circle */}
              <div className="relative">
                {/* Number Badge */}
                <span className="absolute -top-1.5 -right-1.5 h-6 w-6 bg-brand-primary text-white font-bold text-xs flex items-center justify-center rounded-full border-2 border-white shadow-xs font-outfit select-none">
                  {step.id}
                </span>
                
                {/* Inner Icon Ring */}
                <div className="h-16 w-16 rounded-full border-2 border-brand-primary/25 bg-brand-primary/10 flex items-center justify-center group-hover:scale-105 group-hover:border-brand-primary/45 transition-transform duration-300">
                  {step.icon}
                </div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-2 max-w-xs">
                <h3 className="text-lg font-bold font-outfit text-slate-855">
                  {step.title}
                </h3>
                <p className="text-slate-500 font-inter text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PredictorSteps;
