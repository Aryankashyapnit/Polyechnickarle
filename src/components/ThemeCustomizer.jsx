import React, { useState, useEffect } from 'react';
import { Palette, X, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeCustomizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(() => {
    try {
      return localStorage.getItem('pk_active_theme') || 'royal';
    } catch {
      return 'royal';
    }
  });

  const [aurorasEnabled, setAurorasEnabled] = useState(() => {
    try {
      return localStorage.getItem('pk_auroras_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-cyber-midnight', 'theme-sunset-gold', 'theme-emerald-luxury');
    
    if (activeTheme === 'cyber') {
      root.classList.add('theme-cyber-midnight');
    } else if (activeTheme === 'sunset') {
      root.classList.add('theme-sunset-gold');
    } else if (activeTheme === 'emerald') {
      root.classList.add('theme-emerald-luxury');
    }
    
    try {
      localStorage.setItem('pk_active_theme', activeTheme);
    } catch (err) {
      console.warn(err);
    }
  }, [activeTheme]);

  useEffect(() => {
    // Enable/disable background auroras
    const auroras = document.querySelectorAll('.animate-glow-pulse');
    auroras.forEach(a => {
      if (aurorasEnabled) {
        a.style.display = 'block';
      } else {
        a.style.display = 'none';
      }
    });

    try {
      localStorage.setItem('pk_auroras_enabled', String(aurorasEnabled));
    } catch (err) {
      console.warn(err);
    }
  }, [aurorasEnabled]);

  const themes = [
    { id: 'royal', name: 'Indigo Royal', color: '#5A24B3', desc: 'Classic light theme with violet highlights' },
    { id: 'cyber', name: 'Cyber Midnight', color: '#8b5cf6', desc: 'Electric neon dark mode for night browsing' },
    { id: 'sunset', name: 'Sunset Gold', color: '#ea580c', desc: 'Warm amber theme for soft reading comfort' },
    { id: 'emerald', name: 'Emerald Luxury', color: '#059669', desc: 'Sophisticated mint green velvet vibes' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        className="h-12 w-12 rounded-full bg-gradient-to-r from-brand-primary to-purple-650 text-white flex items-center justify-center shadow-lg hover:shadow-[0_8px_25px_rgba(90,36,179,0.3)] cursor-pointer relative group border border-white/20"
      >
        <Palette className="h-5.5 w-5.5 animate-pulse" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-brand-secondary border-2 border-white rounded-full"></span>
      </motion.button>

      {/* Slide-out Customizer Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/10 cursor-pointer pointer-events-auto"
            />

            {/* Customizer Panel */}
            <motion.div
              initial={{ opacity: 0, x: 280, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 280, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 150, damping: 19 }}
              className="absolute bottom-16 right-0 w-80 max-w-sm glass-premium border border-slate-200 rounded-3xl p-5 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 mb-4">
                <div className="flex items-center gap-1.5 text-slate-800">
                  <Palette className="h-5 w-5 text-brand-primary" />
                  <h3 className="font-outfit font-extrabold text-sm tracking-tight">Style & Theme Options</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Theme Choices */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block font-outfit">Color Palettes</span>
                
                <div className="space-y-2">
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTheme(t.id)}
                      className={`w-full p-2.5 rounded-2xl border flex items-center gap-3 transition-all duration-300 text-left cursor-pointer ${
                        activeTheme === t.id
                          ? 'border-brand-primary bg-brand-primary/5 shadow-xs font-bold'
                          : 'border-slate-200/60 hover:bg-slate-50/50 font-normal'
                      }`}
                    >
                      {/* Color Dot indicator */}
                      <div 
                        className="h-7 w-7 rounded-full flex items-center justify-center shadow-inner text-white border border-white/20"
                        style={{ backgroundColor: t.color }}
                      >
                        {activeTheme === t.id && <Check className="h-3.5 w-3.5 font-bold" />}
                      </div>

                      {/* Info Text */}
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold font-outfit text-slate-800 leading-tight">{t.name}</span>
                        <span className="block text-[10px] text-slate-500 font-medium truncate">{t.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Effects Switches */}
              <div className="border-t border-slate-200/50 mt-4 pt-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block font-outfit">Visual Effects</span>

                <div className="flex items-center justify-between p-2 hover:bg-slate-50/50 rounded-2xl transition-colors">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-brand-secondary animate-pulse" />
                    <div>
                      <span className="block text-xs font-bold font-outfit text-slate-800 leading-tight">Ambient Auroras</span>
                      <span className="block text-[10px] text-slate-500 leading-tight">Glow background lights</span>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <button
                    onClick={() => setAurorasEnabled(!aurorasEnabled)}
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${
                      aurorasEnabled ? 'bg-brand-primary' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                        aurorasEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Tagline Footer */}
              <div className="text-center text-[9px] font-semibold text-slate-400 pt-3 border-t border-slate-200/30 mt-4 select-none">
                Interactive Design Engine v1.1 • PolytechnicKarle
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeCustomizer;
