import React, { useState } from 'react';
import { Bell, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LatestUpdates = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncTime, setSyncTime] = useState('Last synced: 1 hour ago');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      month: 'JUN',
      day: '08',
      title: 'DCECE 2026 Choice-Filling Portal Schedule Released',
      description: 'Official schedule for Bihar Polytechnic choice filling, registration, and seat locking is now active.',
      link: 'https://bceceboard.bihar.gov.in'
    },
    {
      id: 2,
      month: 'JUN',
      day: '05',
      title: 'Download DCECE 2026 Polytechnic Rank Card',
      description: 'BCECE Board has published the merit lists and rank cards. Click to check your general and category ranks.',
      link: 'https://bceceboard.bihar.gov.in'
    }
  ]);
  
  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setNotifications(prev => {
        if (prev.some(item => item.id === 3)) return prev;
        return [
          {
            id: 3,
            month: 'JUN',
            day: '09',
            title: '🔥 Live: Mop-up Round Offline Vacancy Matrix Published',
            description: 'BCECEB has released category vacancies for the offline counseling rounds at IAS Association Building, Patna.',
            link: 'https://bceceboard.bihar.gov.in'
          },
          ...prev
        ];
      });
      setSyncTime('Last synced: Just now');
      setSyncing(false);
    }, 1500);
  };

  return (
    <section className="py-12 bg-transparent">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Container Card with Left Border Accent */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-premium border-l-4 border-l-brand-primary rounded-2xl p-6 sm:p-8 shadow-xs"
        >
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="text-brand-primary">
                <Bell className="h-5 w-5 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold font-outfit text-slate-800">
                Latest Notifications
              </h3>
            </div>
            
            <div className="flex items-center gap-3 select-none">
              <span className="text-[11px] text-slate-500 font-semibold font-inter">{syncTime}</span>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="bg-slate-50 hover:bg-slate-100 disabled:bg-slate-50 text-slate-700 hover:text-brand-primary px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold font-outfit transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin text-brand-primary' : ''}`} />
                <span>{syncing ? 'Checking Board...' : 'Sync with BCECEB'}</span>
              </button>
            </div>
          </div>

          {/* Notification Items List */}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {notifications.map((item) => (
                <motion.a
                  layout
                  initial={{ opacity: 0, y: -25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 bg-slate-50/50 border border-slate-150 rounded-xl p-4 hover:border-brand-primary/30 hover:bg-slate-100/50 hover:shadow-xs transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Date Widget */}
                    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-brand-primary to-purple-600 text-white rounded-lg h-14 w-14 flex-shrink-0 select-none font-outfit shadow-sm">
                      <span className="text-[10px] font-bold tracking-wider leading-none uppercase text-purple-100">{item.month}</span>
                      <span className="text-xl font-extrabold mt-0.5 leading-none">{item.day}</span>
                    </div>

                    {/* Copy */}
                    <div>
                      <h4 className="text-sm sm:text-base font-bold font-outfit text-slate-800 group-hover:text-brand-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 font-inter text-xs sm:text-[13px] mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Link Icon */}
                  <div className="text-slate-405 group-hover:text-brand-primary transition-colors p-1 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
                    <ExternalLink className="h-4.5 w-4.5" />
                  </div>
                </motion.a>
              ))}
            </AnimatePresence>
          </div>

        </motion.div>
      </div>
    </section>
  );
};

export default LatestUpdates;