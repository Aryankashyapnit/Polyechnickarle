import React, { useState } from 'react';
import { FileText, Calendar, CheckSquare, Sparkles, ChevronDown, ChevronUp, Download, Eye, AlertCircle, Award } from 'lucide-react';

const Guide = () => {
  // Document Checklist State
  const [checklist, setChecklist] = useState([
    { id: 1, title: '10th Class Marksheet', subtitle: 'Original Matriculation Marksheet + 3 Photocopies', checked: true },
    { id: 2, title: '10th Class Admit Card', subtitle: 'Original Admit Card of Matriculation (10th) Exam', checked: false },
    { id: 3, title: '10th Class Passing Certificate', subtitle: 'Original Board Passing Certificate of Matriculation', checked: false },
    { id: 4, title: 'DCECE 2026 Admit Card', subtitle: 'Original DCECE Admit Card with invigilator signature', checked: false },
    { id: 5, title: 'DCECE 2026 Rank Card', subtitle: 'Printout of official DCECE merit rank card', checked: false },
    { id: 6, title: 'Locked Choice-Filling Slip', subtitle: 'Printout of locked choice preference sequence list', checked: false },
    { id: 7, title: 'Provisional Allotment Order', subtitle: '3 printed copies of active seat allotment letter', checked: false },
    { id: 8, title: 'Part-A & Part-B Forms', subtitle: 'Printout of DCECE online application form profile', checked: false },
    { id: 9, title: 'Check Slip (2 Copies)', subtitle: 'Downloaded check slip from bceceboard.bihar.gov.in', checked: false },
    { id: 10, title: 'Biometric Form (1 Copy)', subtitle: 'Downloaded biometric identification slip', checked: false },
    { id: 11, title: 'Domicile/Residential Certificate', subtitle: 'Issued by Circle Officer (CO) or SDO of Bihar', checked: false },
    { id: 12, title: 'Caste/Reservation Certificate', subtitle: 'Issued by CO/SDO if claiming category quota', checked: false },
    { id: 13, title: 'Character Certificate', subtitle: 'Issued by the head of last school attended', checked: false },
    { id: 14, title: 'Income & Asset Certificate', subtitle: 'Mandatory if claiming EWS quota category', checked: false },
    { id: 15, title: 'Disability Certificate (DQ)', subtitle: 'Required if claiming disabled quota seat', checked: false },
    { id: 16, title: 'Transfer/School Leaving Certificate', subtitle: 'SLC/CLC or TC issued by school authorities', checked: false },
    { id: 17, title: '6 Passport Photographs', subtitle: 'Matches photo on the DCECE 2026 Admit Card', checked: false }
  ]);

  const toggleChecklist = (id) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const completedCount = checklist.filter(item => item.checked).length;
  const progressPercentage = Math.round((completedCount / checklist.length) * 100);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);

  // Nodal Reporting Centres Data
  const [selectedCentre, setSelectedCentre] = useState(0);
  const nodalCentres = [
    {
      name: "BCECE Board Office (Nodal Head)",
      address: "IAS Association Building, Near Patna Airport, Patna - 800014",
      officer: "Dr. S. K. Sinha (Chief Nodal Officer)",
      phone: "+91-612-2220230",
      schedule: "10:00 AM - 5:00 PM (All working days)",
      mapEmbed: "https://maps.google.com/maps?q=BCECE%20Board%20Patna&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Patna-7",
      address: "Gulzarbagh, Patna - 800007",
      officer: "Prof. R. N. Dev (Nodal Officer)",
      phone: "+91-9155231792",
      schedule: "10:00 AM - 4:00 PM (Reporting Round 1 & 2)",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Patna%207&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Muzaffarpur",
      address: "GP Muzaffarpur Campus, Muzaffarpur - 842001",
      officer: "Er. A. K. Choudhary",
      phone: "+91-9934256711",
      schedule: "10:00 AM - 4:00 PM (Verification Round 1 & 2)",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Muzaffarpur&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Bhagalpur",
      address: "Barari, Bhagalpur - 812003",
      officer: "Dr. J. P. Singh",
      phone: "+91-9431478201",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Bhagalpur&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Gaya",
      address: "Gaya-Dobhi Road, Gaya - 823001",
      officer: "Prof. Vinay Kumar",
      phone: "+91-9876543210",
      schedule: "10:00 AM - 4:30 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Gaya&t=&z=13&ie=UTF8&iwloc=&output=embed"
    }
  ];

  const faqs = [
    {
      id: 1,
      q: 'What if I miss the registration deadline?',
      a: 'Registration is mandatory for entering choice filling. If you miss the registration window, you cannot participate in Round 1 and Round 2 of seat allotment. However, you may be allowed to register fresh in the Mop-up round, subject to seat availability and BCECE guidelines.'
    },
    {
      id: 2,
      q: 'Can I change my choices after locking them?',
      a: 'No. Once you lock your choice list, it cannot be modified under any circumstances. If you do not lock your choices manually, the system will automatically lock your last saved choice preference list at the deadline.'
    },
    {
      id: 3,
      q: 'Is medical certificate mandatory for admission?',
      a: 'Yes, a fitness certificate issued by a registered medical practitioner (government assistant surgeon level or equivalent) is mandatory during physical document verification at the reporting/nodal center.'
    }
  ];

  const stepsTimeline = [
    { num: 1, label: 'Registration', date: 'July 01 - July 15' },
    { num: 2, label: 'Choice Filling', date: 'July 18 - July 22' },
    { num: 3, label: 'Seat Allotment', date: 'July 25' },
    { num: 4, label: 'Verification', date: 'July 26 - July 30' },
    { num: 5, label: 'Admission', date: 'Aug 01 - Aug 05' }
  ];

  return (
    <main className="w-full py-12 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Hero / Split Banner */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center mb-12">
          {/* Left copy */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-outfit bg-gradient-to-r from-slate-900 via-brand-primary to-purple-800 bg-clip-text text-transparent leading-tight tracking-tight">
              Step-by-Step <br />
              Counselling Guide
            </h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed max-w-xl">
              Your comprehensive roadmap for Polytechnic admissions at Karle. Navigate the registration process, choice filling, and seat allotment with technical precision and academic clarity.
            </p>
            <div className="flex flex-wrap gap-4 select-none">
              <button className="bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold font-outfit px-5 py-3 rounded-lg text-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs">
                <Download className="h-4.5 w-4.5" />
                <span>Download PDF Guide</span>
              </button>
              <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold font-outfit px-5 py-3 rounded-lg text-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer select-none">
                <Eye className="h-4.5 w-4.5 text-slate-500" />
                <span>View Schedule</span>
              </button>
            </div>
          </div>

          {/* Right Image with certified overlap badge */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-md aspect-video overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <img 
                src="/computer_lab.jpg" 
                alt="Modern computer lab center" 
                className="w-full h-full object-cover brightness-95"
              />
            </div>
            
            {/* Overlap Badge */}
            <div className="absolute -bottom-4 left-6 sm:left-12 bg-brand-primary text-white border-2 border-white px-5 py-3 rounded-xl shadow-md flex items-center gap-2 select-none">
              <Award className="h-5 w-5 text-brand-secondary" />
              <div>
                <span className="block text-[9px] font-black uppercase tracking-widest text-purple-200">CERTIFIED PROCESS</span>
                <span className="font-extrabold font-outfit text-sm leading-none">2026-27 Batch</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Counselling Timeline Timeline */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-10 select-none">
          <div className="flex items-center gap-2.5 mb-8 pb-4 border-b border-slate-100">
            <Calendar className="h-5 w-5 text-brand-primary" />
            <h3 className="text-lg font-bold font-outfit text-slate-800">Counselling Timeline</h3>
          </div>

          {/* Stepper Horizontal Scroll Container */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[650px] relative flex justify-between px-6 pt-4">
              
              {/* Purple connecting line */}
              <div className="absolute left-[40px] right-[40px] top-[30px] h-[3px] bg-brand-primary/10 -z-10 rounded-full" />
              
              {stepsTimeline.map((step) => (
                <div key={step.num} className="flex flex-col items-center text-center space-y-3 flex-1 relative">
                  {/* Circle Step Number */}
                  <div className="h-10 w-10 bg-brand-primary text-white border border-brand-primary/20 font-extrabold text-base flex items-center justify-center rounded-full shadow-xs font-outfit animate-fadeIn">
                    {step.num}
                  </div>
                  {/* Labels */}
                  <div>
                    <span className="block font-bold text-sm text-slate-850 font-outfit">{step.label}</span>
                    <span className="block text-slate-500 font-semibold text-[11px] font-inter mt-0.5">{step.date}</span>
                  </div>
                </div>
              ))}
              
            </div>
          </div>
        </section>

        {/* 3. Details Split Grid: Document Checklist vs Process Details */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left Column: Document Checklist */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full min-h-[500px]">
            <div className="space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 select-none">
                <CheckSquare className="h-5 w-5 text-brand-primary" />
                <h3 className="text-lg font-bold font-outfit text-slate-800">Document Checklist</h3>
              </div>

              {/* Progress Tracker bar */}
              <div className="space-y-1.5 pb-2 select-none">
                <div className="flex justify-between text-xs font-bold font-inter text-slate-500">
                  <span>Your Preparedness</span>
                  <span className="text-brand-primary font-bold">{progressPercentage}% Ready</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-primary to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Interactive checklist items */}
              <div className="space-y-2.5">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all duration-300 select-none ${
                      item.checked 
                        ? 'bg-slate-50 border-slate-150 opacity-60 text-slate-400' 
                        : 'bg-slate-50/50 border-slate-200 text-slate-850 hover:border-brand-primary/30 hover:bg-slate-100/50'
                    }`}
                  >
                    {/* Custom Checkbox circle */}
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      item.checked ? 'bg-brand-secondary border-brand-secondary text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {item.checked && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Labels */}
                    <div>
                      <h4 className={`text-sm font-extrabold font-outfit ${item.checked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {item.title}
                      </h4>
                      <p className="text-slate-500 font-inter text-[12px] mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scanning Warning banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 mt-8 select-none">
              <AlertCircle className="h-4.5 w-4.5 text-brand-tertiary mt-0.5 flex-shrink-0" />
              <p className="text-[12px] text-amber-800 font-inter leading-relaxed">
                Ensure all documents are scanned in 200 DPI resolution for portal upload.
              </p>
            </div>
          </div>

          {/* Right Column: Process Details */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 select-none">
              <Sparkles className="h-5 w-5 text-brand-primary" />
              <h3 className="text-lg font-bold font-outfit text-slate-800">Process Details</h3>
            </div>

            {/* Stepper Details block stack */}
            <div className="space-y-8">
              
              {/* Detail Step 1 */}
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-brand-primary/10 text-brand-primary font-bold text-sm flex items-center justify-center rounded-full flex-shrink-0 font-outfit select-none">1</div>
                <div className="space-y-3 flex-grow">
                  <h4 className="font-extrabold font-outfit text-slate-800 text-base">Registration & Profile Verification</h4>
                  <p className="text-slate-500 font-inter text-sm leading-relaxed">
                    Candidates must create a login on the portal using their application number and date of birth. Ensure all personal details like name, parent's name, and category match your 10th-standard certificate exactly.
                  </p>
                  
                  {/* Deadline Table */}
                  <div className="grid grid-cols-2 gap-3 max-w-sm font-outfit select-none">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                      <span className="block text-[9px] font-bold text-slate-550 uppercase">Deadline</span>
                      <span className="text-slate-800 font-extrabold text-[13px] mt-0.5">July 15, 2026</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                      <span className="block text-[9px] font-bold text-slate-550 uppercase">Fee</span>
                      <span className="text-slate-800 font-extrabold text-[13px] mt-0.5">₹500 (Non-refundable)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Step 2 */}
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-brand-primary/10 text-brand-primary font-bold text-sm flex items-center justify-center rounded-full flex-shrink-0 font-outfit select-none">2</div>
                <div className="space-y-3 flex-grow">
                  <h4 className="font-extrabold font-outfit text-slate-800 text-base">Priority Choice Filling</h4>
                  <p className="text-slate-500 font-inter text-sm leading-relaxed">
                    Select your preferred branches and campus locations. We recommend selecting at least 15 choices to maximize your allotment chances based on previous merit trends.
                  </p>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase select-none">
                    <span className="bg-amber-50 text-brand-tertiary border border-amber-255 px-3 py-1.5 rounded font-outfit">CRITICAL STEP</span>
                    <span className="bg-slate-50 text-slate-650 border border-slate-200 px-3 py-1.5 rounded font-outfit">Digital Signature Required</span>
                  </div>
                </div>
              </div>

              {/* Detail Step 3 */}
              <div className="flex gap-4">
                <div className="h-8 w-8 bg-brand-primary/10 text-brand-primary font-bold text-sm flex items-center justify-center rounded-full flex-shrink-0 font-outfit select-none">3</div>
                <div className="space-y-3 flex-grow">
                  <h4 className="font-extrabold font-outfit text-slate-800 text-base">Verification & Freeze/Float</h4>
                  <p className="text-slate-500 font-inter text-sm leading-relaxed">
                    After allotment, you must choose to 'Freeze' (accept seat) or 'Float' (look for upgrade in next round). Physical document verification is mandatory for Frozen seats at the designated nodal centers.
                  </p>
                  <a href="#" className="inline-flex items-center gap-1.5 text-xs font-bold font-outfit text-brand-primary hover:text-brand-primary-hover self-start group">
                    <span>View Nodal Centers</span>
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* Nodal Verification Centres Section */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-10 select-none">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
            <span className="text-xl">📍</span>
            <h3 className="text-lg font-bold font-outfit text-slate-800">Nodal Verification Centres & Interactive Maps</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: List of Centres */}
            <div className="lg:col-span-5 space-y-3">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Nodal Centre</span>
              {nodalCentres.map((centre, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedCentre(index)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex flex-col gap-1 cursor-pointer ${
                    selectedCentre === index
                      ? 'border-brand-primary bg-purple-50/50 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-brand-primary/20'
                  }`}
                >
                  <span className={`text-[9px] font-black uppercase tracking-wider ${selectedCentre === index ? 'text-brand-primary' : 'text-slate-500'}`}>
                    Centre #{index + 1}
                  </span>
                  <span className="font-bold font-outfit text-sm text-slate-900">{centre.name}</span>
                  <span className="text-[11px] text-slate-500 font-medium font-inter truncate">{centre.address}</span>
                </button>
              ))}
            </div>

            {/* Right Column: Details & Google Map Embed */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row gap-6 items-stretch">
              
              {/* Centre Details Info */}
              <div className="md:w-1/2 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Centre Name</span>
                    <h4 className="font-black font-outfit text-slate-900 text-base leading-tight">
                      {nodalCentres[selectedCentre].name}
                    </h4>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Address</span>
                    <p className="text-xs text-slate-600 font-inter leading-relaxed">
                      {nodalCentres[selectedCentre].address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nodal Officer</span>
                      <span className="font-bold text-xs text-slate-800 font-outfit">
                        {nodalCentres[selectedCentre].officer}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                      <a href={`tel:${nodalCentres[selectedCentre].phone}`} className="font-bold text-xs text-brand-primary font-outfit hover:underline">
                        {nodalCentres[selectedCentre].phone}
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reporting Timings</span>
                    <span className="font-bold text-xs text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded inline-block font-outfit mt-1">
                      ⏱️ {nodalCentres[selectedCentre].schedule}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(nodalCentres[selectedCentre].name + " " + nodalCentres[selectedCentre].address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-slate-200 text-slate-800 font-bold font-outfit py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors shadow-xs w-full text-center"
                >
                  <span>Open in Google Maps</span>
                  <span>↗</span>
                </a>
              </div>

              {/* Map iFrame */}
              <div className="md:w-1/2 min-h-[220px] bg-slate-200 border border-slate-300 rounded-xl overflow-hidden relative">
                <iframe
                  title="Google Maps Embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={nodalCentres[selectedCentre].mapEmbed}
                />
              </div>

            </div>
          </div>
        </section>

        {/* 4. FAQ Section */}
        <section className="max-w-4xl mx-auto space-y-6">
          <div className="text-center select-none">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit bg-gradient-to-r from-slate-900 via-brand-primary to-purple-800 bg-clip-text text-transparent tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => {
              const isOpen = activeFaq === faq.id;
              return (
                <div 
                  key={faq.id}
                  className="bg-white border border-slate-200 hover:border-brand-primary/30 rounded-xl overflow-hidden shadow-xs transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                    className="w-full flex justify-between items-center p-5 text-left font-bold font-outfit text-slate-800 select-none cursor-pointer"
                  >
                    <span className="pr-4">{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4.5 w-4.5 text-slate-500" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-500" />}
                  </button>
                  
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-slate-600 font-inter text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
};

export default Guide;
