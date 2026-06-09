import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

const getYearFromId = (id) => {
  if (id >= 18 && id <= 2327) return 2025;
  if (id >= 2328 && id <= 4603) return 2024;
  if (id >= 4604 && id <= 6589) return 2022;
  if (id >= 6590 && id <= 8968) return 2020;
  if (id >= 8969 && id <= 10420) return 2021;
  return 2026;
};

const CollegePredictor = () => {
  const [formData, setFormData] = useState({
    domicile: 'Bihar',
    category: 'UR',
    rank: '',
    branch: 'All',
    year: '2025'
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true); // Isko true karna zaroori hai tabhi niche result dikhega

    try {
      // 1. Asli Supabase Query (Jo data filter karegi)
      let supabaseQuery = supabase
        .from('colleges')
        .select('*')
        .eq('domicile', formData.domicile)
        .eq('category', formData.category)
        .or('exam_type.eq.DCECE,exam_type.is.null')
        .gte('closing_rank', parseInt(formData.rank)); // Rank match

      // Agar All Branch nahi hai, toh specific branch filter karo
      if (formData.branch !== 'All') {
        supabaseQuery = supabaseQuery.eq('branch', formData.branch);
      }

      // Filter by ID ranges based on selected year
      if (formData.year === '2025') {
        supabaseQuery = supabaseQuery.gte('id', 18).lte('id', 2327);
      } else if (formData.year === '2024') {
        supabaseQuery = supabaseQuery.gte('id', 2328).lte('id', 4603);
      } else if (formData.year === '2022') {
        supabaseQuery = supabaseQuery.gte('id', 4604).lte('id', 6589);
      } else if (formData.year === '2020') {
        supabaseQuery = supabaseQuery.gte('id', 6590).lte('id', 8968);
      } else if (formData.year === '2021') {
        supabaseQuery = supabaseQuery.gte('id', 8969).lte('id', 10420);
      }

      // Query run karke data lao
      const { data, error } = await supabaseQuery.order('closing_rank', { ascending: true });

      if (error) throw error;
      
      // 👉 YAHAN PAR X-RAY (console.log) LAGA HAI 👈
      console.log("Hey Developer! Supabase se total itne colleges aaye hain:", data.length);
      console.log("Aur wo colleges ye hain:", data);
      
      // 2. Data ko screen par dikhane ke liye set karo
      setResults(data);
      
    } catch (error) {
      console.error("Error aa gaya bhai:", error.message);
      alert("Database error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#f8f9ff] py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#c4c6cf] overflow-hidden mb-10"
      >
        {/* Header Section */}
        <div className="bg-[#1a365d] p-6 md:p-8 text-center border-b border-[#002045]">
          <h2 className="text-[24px] md:text-[32px] font-bold text-white mb-2 tracking-tight">
            College & Branch Predictor
          </h2>
          <p className="text-[#adc7f7] text-[14px] md:text-[16px]">
            Apna rank aur reservation details enter karein taaki accurate allotment chances pata chal sakein.
          </p>
        </div>

        {/* Predictor Form */}
        <form onSubmit={handlePredict} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="text-[14px] font-semibold text-[#0b1c30] mb-2">Domicile</label>
              <select name="domicile" value={formData.domicile} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-[#c4c6cf] focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] outline-none text-[#43474e] bg-white">
                <option value="Bihar">Bihar State</option>
                <option value="Other">Other State</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[14px] font-semibold text-[#0b1c30] mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-[#c4c6cf] focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] outline-none text-[#43474e] bg-white">
                <option value="UR">UR (Unreserved)</option>
                <option value="BC">BC (Backward Class)</option>
                <option value="EBC">EBC (Extremely BC)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
                <option value="RCG">RCG (Reserved Category Girls)</option>
                <option value="E-EBC">E-EBC</option>
                <option value="E-SC">E-SC</option>
                <option value="E-UR">E-UR</option>
                <option value="SMQ">SMQ (Servicemen Quota)</option>
                <option value="E-BC">E-BC</option>
                <option value="E-ST">E-ST</option>
                <option value="DQ">DQ (Disabled Quota)</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[14px] font-semibold text-[#0b1c30] mb-2">Your Rank</label>
              <input type="number" name="rank" value={formData.rank} onChange={handleChange} placeholder="e.g., 2500" required className="w-full px-4 py-3 rounded-lg border border-[#c4c6cf] focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] outline-none text-[#0b1c30] font-medium" />
            </div>

            <div className="flex flex-col">
              <label className="text-[14px] font-semibold text-[#0b1c30] mb-2">Preferred Branch</label>
              <select name="branch" value={formData.branch} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-[#c4c6cf] focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] outline-none text-[#43474e] bg-white">
                <option value="All">All Branches</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[14px] font-semibold text-[#0b1c30] mb-2">Cutoff Year</label>
              <select name="year" value={formData.year} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-[#c4c6cf] focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] outline-none text-[#43474e] bg-white">
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>
          </div>

          <div className="text-center md:text-right border-t border-[#eaf1ff] pt-6 mt-2">
            <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-3.5 bg-[#1a365d] hover:bg-[#002045] text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? "Searching..." : "Predict My Colleges"}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Results Section */}
      {hasSearched && (
        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl font-bold text-[#002045] mb-4">
            Prediction Results ({results.length} Colleges Found)
          </h3>
          
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((college) => {
                const year = getYearFromId(college.id);
                return (
                  <div key={college.id} className="bg-white p-5 rounded-xl border border-[#c4c6cf] hover:border-[#1a365d] hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-[#e5eeff] text-[#1a365d] text-xs font-bold px-2.5 py-1 rounded-full">
                        {college.category}
                      </span>
                      <span className="text-[#016e21] text-sm font-semibold">
                        {year} Cutoff: {college.closing_rank}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-[#0b1c30] mb-1">{college.college_name}</h4>
                    <p className="text-[#43474e] font-medium">{college.branch}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-[#ffdad6] text-center">
              <p className="text-[#93000a] font-medium text-lg">
                Is rank aur category ke hisaab se koi college match nahi hua. Kripya different category ya branch try karein.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CollegePredictor;