import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DocumentChecklist = () => {
  // DCECE required documents list
  const initialDocuments = [
    { id: 1, name: "DCECE 2026 Admit Card", checked: false },
    { id: 2, name: "DCECE Rank Card", checked: false },
    { id: 3, name: "10th Marksheet & Passing Certificate", checked: false },
    { id: 4, name: "Caste/Category Certificate (if applicable)", checked: false },
    { id: 5, name: "Residential / Domicile Certificate", checked: false },
    { id: 6, name: "Aadhaar Card (Original & Copy)", checked: false },
    { id: 7, name: "6 Passport Size Photographs (Same as Admit Card)", checked: false },
    { id: 8, name: "Seat Allotment Order (3 Copies)", checked: false },
  ];

  const [documents, setDocuments] = useState(initialDocuments);

  // Toggle checkbox state
  const handleToggle = (id) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, checked: !doc.checked } : doc
    ));
  };

  // Calculate progress percentage
  const completedCount = documents.filter(doc => doc.checked).length;
  const progressPercentage = Math.round((completedCount / documents.length) * 100);

  return (
    <section className="bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Title Section */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-extrabold text-slate-800">
            Document Checklist
          </h2>
        </div>

        {/* Purpose Section */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
          <p className="text-amber-800 text-sm md:text-base font-medium">
            Reporting center par jaane se pehle in sabhi documents ki original copy aur 2 sets xerox ready rakhein. Apni tayari track karne ke liye items ko check karein.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
            <span>Your Progress</span>
            <span>{progressPercentage}% Ready</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <motion.div 
              className="bg-green-500 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.4 }}
            ></motion.div>
          </div>
        </div>

        {/* Interactive Checklist */}
        <motion.div 
          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li 
                key={doc.id}
                onClick={() => handleToggle(doc.id)}
                className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  doc.checked 
                    ? 'bg-green-50 border-green-500 text-slate-500' 
                    : 'bg-white border-transparent hover:border-indigo-200 shadow-sm text-slate-800'
                }`}
              >
                {/* Custom Checkbox */}
                <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                  doc.checked ? 'bg-green-500' : 'bg-slate-200'
                }`}>
                  {doc.checked && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                
                {/* Document Name */}
                <span className={`font-semibold text-sm md:text-base ${
                  doc.checked ? 'line-through' : ''
                }`}>
                  {doc.name}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </section>
  );
};

export default DocumentChecklist;