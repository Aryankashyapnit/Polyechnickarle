import React from 'react';
import { motion } from 'framer-motion';

const CounsellingGuide = () => {
  // Step-by-step counselling process data
  const steps = [
    { 
      id: 1, 
      title: "Online Registration", 
      desc: "BCECEB official portal par apne DCECE roll number aur basic details ke sath register karein. Ek naya password create karein aur counselling fee pay karein." 
    },
    { 
      id: 2, 
      title: "Choice Filling & Locking", 
      desc: "Apne preferred Government aur Private Polytechnic colleges aur branches ko priority ke hisaab se select karein. Last date se pehle choices ko 'Lock' karna na bhoolein." 
    },
    { 
      id: 3, 
      title: "Seat Allotment Result", 
      desc: "Aapke rank aur choices ke basis par college allot hoga. Apna account login karke Provisional Seat Allotment Order download karein." 
    },
    { 
      id: 4, 
      title: "Document Verification", 
      desc: "Allotment letter par diye gaye Nodal Center par sabhi original documents aur unki xerox copy ke sath physically report karein." 
    },
    { 
      id: 5, 
      title: "Final Admission", 
      desc: "Agar aap apne allotted college se satisfied hain, toh verification ke baad college me admission fee submit karke apni seat confirm karein." 
    }
  ];

  return (
    <section className="bg-slate-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Title Section */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Counselling Process Guide
          </h2>
        </div>

        {/* Purpose Section */}
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-5 mb-10 shadow-sm rounded-r-xl">
          <p className="text-indigo-900 text-sm md:text-base font-medium">
            BCECEB dwara conduct kiye jane wali DCECE counselling in 5 main stages me complete hoti hai. Niche diye gaye step-by-step process ko dhyan se samjhein taaki aapse koi galti na ho.
          </p>
        </div>

        {/* Vertical Stepper */}
        <div className="relative pl-4 md:pl-8">
          {/* Main vertical line */}
          <div className="absolute left-[27px] md:left-[43px] top-4 bottom-4 w-1 bg-indigo-200 rounded-full"></div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative flex items-start group"
              >
                {/* Step Number Indicator */}
                <div className="absolute left-0 w-10 h-10 md:w-12 md:h-12 bg-white border-4 border-indigo-500 rounded-full flex items-center justify-center font-bold text-indigo-600 z-10 shadow-md group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  {step.id}
                </div>

                {/* Step Content */}
                <div className="ml-16 md:ml-20 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 w-full">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default CounsellingGuide;