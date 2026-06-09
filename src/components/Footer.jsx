import React from 'react';
import { Globe, Share2, Mail } from 'lucide-react';

const Footer = ({ setCurrentPage }) => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 font-inter">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 items-center">
          {/* Brand & Desc */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <img 
                src="/logo.png" 
                alt="Polytechnic Karle Logo" 
                className="h-9 w-9 object-contain rounded-full border border-slate-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-xl font-bold font-outfit tracking-tight text-slate-800">
                Polytechnic <span className="text-brand-primary opacity-90 font-medium">Karle</span>
              </span>
            </div>
            <p className="text-slate-500 text-[14px] leading-relaxed max-w-md">
              Empowering Bihar's polytechnic students with data-driven counselling insights since 2014. Helping thousands secure seats in top government polytechnic colleges.
            </p>
          </div>

          {/* Quick Links & Socials */}
          <div className="flex flex-col md:items-end gap-6">
            {/* Links */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm font-medium text-slate-500">
              <a href="#about" className="hover:text-brand-primary transition-colors">About Us</a>
              <a href="#contact" className="hover:text-brand-primary transition-colors">Contact</a>
              <a href="#privacy" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-brand-primary transition-colors">Terms of Service</a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="h-10 w-10 bg-slate-100 hover:bg-brand-primary/10 hover:text-brand-primary transition-all rounded-full flex items-center justify-center text-slate-650"
                title="Website"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="h-10 w-10 bg-slate-100 hover:bg-brand-primary/10 hover:text-brand-primary transition-all rounded-full flex items-center justify-center text-slate-650"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </a>
              <a 
                href="mailto:support@polytechnickarle.com" 
                className="h-10 w-10 bg-slate-100 hover:bg-brand-primary/10 hover:text-brand-primary transition-all rounded-full flex items-center justify-center text-slate-650"
                title="Email Support"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Separator line */}
        <div className="border-t border-slate-200 my-8"></div>

        {/* Bottom copyright */}
        <div className="text-center text-xs md:text-sm text-slate-400 font-medium font-outfit tracking-wide">
          © 2026 Polytechnic Karle. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
