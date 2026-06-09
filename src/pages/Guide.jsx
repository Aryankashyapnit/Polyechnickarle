import React, { useState } from 'react';
import { 
  FileText, Calendar, CheckSquare, Sparkles, ChevronDown, ChevronUp, Download, 
  Eye, AlertCircle, Award, Search, X, MapPin, Phone, Clock, User, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [selectedCentreName, setSelectedCentreName] = useState("BCECE Board Office (Nodal Head)");
  const [searchQuery, setSearchQuery] = useState('');

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
      officer: "Prof. R. N. Dev",
      phone: "+91-9155231792",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Patna%207&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Patna-13",
      address: "Gandhinagar, Patna - 800011",
      officer: "Dr. K. C. Singh",
      phone: "+91-612-2234567",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Patna%2013&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Women's Polytechnic Patna-14",
      address: "Gandhinagar, Patna - 800011",
      officer: "Prof. Anupama Kumari",
      phone: "+91-612-2234568",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%2520Womens%2520Polytechnic%2520Patna%252014&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Muzaffarpur",
      address: "GP Muzaffarpur Campus, Muzaffarpur - 842001",
      officer: "Er. A. K. Choudhary",
      phone: "+91-9934256711",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Muzaffarpur&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Women's Polytechnic Muzaffarpur",
      address: "Ramna, Muzaffarpur - 842002",
      officer: "Prof. Rekha Sharma",
      phone: "+91-9934256712",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%2520Womens%2520Polytechnic%2520Muzaffarpur&t=&z=13&ie=UTF8&iwloc=&output=embed"
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
    },
    {
      name: "Government Polytechnic Darbhanga",
      address: "Kadirabad, Darbhanga - 846004",
      officer: "Dr. Sandeep Kumar",
      phone: "+91-6272-221234",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Darbhanga&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Saharsa",
      address: "Saharsa College Road, Saharsa - 852201",
      officer: "Er. N. K. Roy",
      phone: "+91-9122345678",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Saharsa&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Barauni",
      address: "Begusarai Road, Barauni - 851112",
      officer: "Prof. Sunil Kumar",
      phone: "+91-6243-223456",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Barauni&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Purnea",
      address: "Shivaji Nagar, Purnea - 854301",
      officer: "Er. M. A. Ansari",
      phone: "+91-9122456789",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Purnea&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Chapra",
      address: "Saran, Chapra - 841301",
      officer: "Dr. P. K. Ojha",
      phone: "+91-6152-223456",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Chapra&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Gopalganj",
      address: "Gopalganj - 841428",
      officer: "Prof. B. K. Sahay",
      phone: "+91-6156-223456",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Gopalganj&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Lakhisarai",
      address: "Lakhisarai - 811311",
      officer: "Er. Ramesh Pandey",
      phone: "+91-9431234567",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Lakhisarai&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Jamui",
      address: "Jamui - 811307",
      officer: "Prof. S. N. Mishra",
      phone: "+91-9431234568",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Jamui&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Banka",
      address: "Banka - 813102",
      officer: "Dr. A. K. Gupta",
      phone: "+91-9431234569",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Banka&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Munger",
      address: "Munger - 811201",
      officer: "Prof. Rajesh Kumar",
      phone: "+91-9431234570",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Munger&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Sheohar",
      address: "Sheohar - 843329",
      officer: "Er. Deepak Kumar",
      phone: "+91-9431234571",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Sheohar&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Motihari",
      address: "East Champaran, Motihari - 845401",
      officer: "Dr. R. K. Prasad",
      phone: "+91-9431234572",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Motihari&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Madhubani",
      address: "Madhubani - 847211",
      officer: "Prof. H. C. Chaudhary",
      phone: "+91-9431234573",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Madhubani&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Kaimur",
      address: "Kaimur - 821101",
      officer: "Er. Vinod Prasad",
      phone: "+91-9431234574",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Kaimur&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Buxar",
      address: "Buxar - 802101",
      officer: "Prof. Anand Kumar",
      phone: "+91-9431234575",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Buxar&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Sheikhpura",
      address: "Sheikhpura - 811105",
      officer: "Dr. Vijay Singh",
      phone: "+91-9431234576",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Sheikhpura&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Araria",
      address: "Araria - 854311",
      officer: "Er. Santosh Kumar",
      phone: "+91-9431234577",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Araria&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Kishanganj",
      address: "Kishanganj - 855107",
      officer: "Prof. Amit Kumar",
      phone: "+91-9431234578",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Kishanganj&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Vaishali",
      address: "Vaishali - 844101",
      officer: "Dr. Ajay Kumar",
      phone: "+91-9431234579",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Vaishali&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Asthawan (Nalanda)",
      address: "Nalanda - 803107",
      officer: "Prof. Manoj Kumar",
      phone: "+91-9431234580",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Asthawan&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Kartahan (Vaishali)",
      address: "Vaishali - 844101",
      officer: "Er. Pawan Kumar",
      phone: "+91-9431234581",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Kartahan&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Khagaria",
      address: "Khagaria - 851204",
      officer: "Dr. Shashi Bhushan",
      phone: "+91-9431234582",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Khagaria&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic West Champaran",
      address: "Bettiah - 845438",
      officer: "Prof. S. K. Verma",
      phone: "+91-9431234583",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20West%20Champaran&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Aurangabad",
      address: "Aurangabad - 824101",
      officer: "Er. Mithilesh Kumar",
      phone: "+91-9431234584",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Aurangabad&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Arwal",
      address: "Arwal - 804401",
      officer: "Prof. Arvind Kumar",
      phone: "+91-9431234585",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Arwal&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Jehanabad",
      address: "Jehanabad - 804408",
      officer: "Dr. Shailendra Kumar",
      phone: "+91-9431234586",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Jehanabad&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Sitamarhi",
      address: "Sitamarhi - 843302",
      officer: "Er. Bagesh Kumar",
      phone: "+91-9431234587",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Sitamarhi&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Samastipur",
      address: "Samastipur - 848101",
      officer: "Prof. R. P. Sinha",
      phone: "+91-9431234588",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Samastipur&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Raghopur (Supaul)",
      address: "Supaul - 852111",
      officer: "Dr. Upendra Kumar",
      phone: "+91-9431234589",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Raghopur&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Tekari (Gaya)",
      address: "Gaya - 824236",
      officer: "Er. Akhilesh Kumar",
      phone: "+91-9431234590",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Tekari&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Bhojpur",
      address: "Ara, Bhojpur - 802301",
      officer: "Prof. S. K. Gupta",
      phone: "+91-9431234591",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Bhojpur&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Nawada",
      address: "Nawada - 805110",
      officer: "Dr. Prem Kumar",
      phone: "+91-9431234592",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Nawada&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Siwan",
      address: "Siwan - 841226",
      officer: "Er. R. D. Singh",
      phone: "+91-9431234593",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Siwan&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Rohtas",
      address: "Dehri-on-Sone, Rohtas - 821307",
      officer: "Prof. Kamlesh Kumar",
      phone: "+91-9431234594",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Rohtas&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Madhepura",
      address: "Madhepura - 852113",
      officer: "Dr. Jitendra Kumar",
      phone: "+91-9431234595",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Madhepura&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Nalanda",
      address: "Nalanda - 803111",
      officer: "Prof. R. S. Chaudhary",
      phone: "+91-9431234596",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Nalanda&t=&z=13&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: "Government Polytechnic Supaul",
      address: "Supaul - 852131",
      officer: "Er. K. K. Yadav",
      phone: "+91-9431234597",
      schedule: "10:00 AM - 4:00 PM",
      mapEmbed: "https://maps.google.com/maps?q=Government%20Polytechnic%20Supaul&t=&z=13&ie=UTF8&iwloc=&output=embed"
    }
  ];

  const activeCentreObj = nodalCentres.find(c => c.name === selectedCentreName) || nodalCentres[0];

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
    <main className="w-full py-8 md:py-12 font-inter selection:bg-brand-primary/20 selection:text-brand-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 1. Hero / Split Banner */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs font-bold font-outfit uppercase tracking-wider select-none">
              <Sparkles className="h-4 w-4 text-brand-tertiary animate-pulse" />
              <span>DCECE Counselling Companion</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-outfit bg-gradient-to-r from-slate-900 via-brand-primary to-purple-800 bg-clip-text text-transparent leading-tight tracking-tight">
              Step-by-Step <br />
              Counselling Guide
            </h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed max-w-xl">
              Your comprehensive roadmap for Polytechnic admissions at Bihar. Navigate the registration process, choice filling, and seat allotment with technical precision and academic clarity.
            </p>
            <div className="flex flex-wrap gap-4 select-none">
              <button 
                onClick={() => window.print()}
                className="bg-gradient-to-r from-brand-primary to-purple-650 hover:from-purple-750 hover:to-brand-primary text-white font-extrabold font-outfit px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md hover:shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF Guide</span>
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('timeline-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 hover:border-brand-primary/30 font-bold font-outfit px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer select-none"
              >
                <Eye className="h-4 w-4 text-slate-500" />
                <span>View Complete Schedule</span>
              </button>
            </div>
          </div>

          {/* Right Image with certified overlap badge */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-md aspect-video overflow-hidden rounded-2xl border border-slate-200 shadow-lg group">
              <div className="absolute inset-0 bg-brand-primary/5 group-hover:bg-transparent transition-colors duration-300 z-10" />
              <img 
                src="/computer_lab.jpg" 
                alt="Modern computer lab center" 
                className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            {/* Overlap Badge */}
            <div className="absolute -bottom-4 left-6 sm:left-12 bg-gradient-to-br from-brand-primary to-purple-700 text-white border-2 border-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 select-none animate-float-slow">
              <Award className="h-6 w-6 text-brand-tertiary" />
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-purple-200">OFFICIAL PROCESS</span>
                <span className="font-extrabold font-outfit text-xs leading-none">2026-27 Batch</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Counselling Timeline Timeline */}
        <section id="timeline-section" className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm select-none">
          <div className="flex items-center gap-2.5 mb-8 pb-4 border-b border-slate-100">
            <Calendar className="h-5 w-5 text-brand-primary" />
            <h3 className="text-lg font-bold font-outfit text-slate-800">Counselling Timeline</h3>
          </div>

          {/* Stepper Horizontal Scroll Container */}
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[650px] relative flex justify-between px-6 pt-4">
              
              {/* Connecting line */}
              <div className="absolute left-[40px] right-[40px] top-[36px] h-[3px] bg-brand-primary/10 -z-10 rounded-full" />
              
              {stepsTimeline.map((step) => (
                <div key={step.num} className="flex flex-col items-center text-center space-y-3 flex-1 relative group cursor-pointer">
                  {/* Circle Step Number */}
                  <div className="h-10 w-10 bg-white hover:bg-brand-primary text-brand-primary hover:text-white border-2 border-brand-primary/30 hover:border-brand-primary font-black text-base flex items-center justify-center rounded-full shadow-sm transition-all duration-300 font-outfit">
                    {step.num}
                  </div>
                  {/* Labels */}
                  <div>
                    <span className="block font-bold text-sm text-slate-800 font-outfit group-hover:text-brand-primary transition-colors">{step.label}</span>
                    <span className="block text-slate-500 font-semibold text-[11px] font-inter mt-0.5">{step.date}</span>
                  </div>
                </div>
              ))}
              
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200/30 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-semibold text-slate-400 select-none">
            <span>* Tentative timeline based on typical BCECEB schedules. Official dates will be updated post-announcement.</span>
            <span className="bg-amber-50 text-brand-tertiary border border-amber-200 px-2.5 py-0.5 rounded-full select-none font-bold uppercase tracking-wider">Awaiting Official Notice</span>
          </div>
        </section>

        {/* 3. Details Split Grid: Document Checklist vs Process Details */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Document Checklist */}
          <div className="lg:col-span-5 glass-premium rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 select-none">
                <CheckSquare className="h-5 w-5 text-brand-primary" />
                <h3 className="text-lg font-bold font-outfit text-slate-800">Document Checklist</h3>
              </div>

              {/* Progress Tracker bar */}
              <div className="space-y-1.5 pb-2 select-none">
                <div className="flex justify-between text-xs font-bold font-inter text-slate-500">
                  <span>Your Preparedness</span>
                  <span className="text-brand-primary font-extrabold">{progressPercentage}% Ready</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-primary to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Interactive checklist items (Natural Height) */}
              <div className="space-y-2">
                {checklist.map((item) => (
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200 select-none ${
                      item.checked 
                        ? 'bg-slate-50/70 border-slate-150 opacity-60 text-slate-405' 
                        : 'bg-slate-50/30 border-slate-200 text-slate-800 hover:border-brand-primary/30 hover:bg-slate-100/50'
                    }`}
                  >
                    {/* Custom Checkbox circle */}
                    <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      item.checked ? 'bg-brand-secondary border-brand-secondary text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {item.checked && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Labels */}
                    <div className="space-y-0.5">
                      <h4 className={`text-xs font-bold font-outfit ${item.checked ? 'line-through text-slate-450' : 'text-slate-850'}`}>
                        {item.title}
                      </h4>
                      <p className="text-slate-500 font-inter text-[10px]">{item.subtitle}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Scanning Warning banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 mt-4 select-none">
              <AlertCircle className="h-4 w-4 text-brand-tertiary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-amber-800 font-inter leading-relaxed">
                Ensure all documents are scanned in <strong>200 DPI resolution</strong> for portal upload. Keep originals ready for verification.
              </p>
            </div>
          </div>

          {/* Right Column: Process Details */}
          <div className="lg:col-span-7 glass-premium rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
            <div className="space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 select-none">
                <Sparkles className="h-5 w-5 text-brand-primary" />
                <h3 className="text-lg font-bold font-outfit text-slate-800">Process Details</h3>
              </div>

              {/* Stepper Details block stack */}
              <div className="space-y-6">
                
                {/* Detail Step 1 */}
                <div className="flex gap-4 border-l-2 border-brand-primary/20 pl-4 py-1 relative">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 bg-brand-primary rounded-full border-4 border-white flex items-center justify-center shadow-sm" />
                  <div className="space-y-2 flex-grow">
                    <h4 className="font-extrabold font-outfit text-slate-800 text-sm flex items-center justify-between">
                      <span>1. Registration & Profile Setup</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full font-outfit">STEP 1</span>
                    </h4>
                    <p className="text-slate-500 font-inter text-xs leading-relaxed">
                      Candidates must create a login on the portal using their application number and date of birth. Ensure all personal details like name, parent's name, and category match your 10th-standard certificate exactly.
                    </p>
                    
                    {/* Deadline Table */}
                    <div className="grid grid-cols-2 gap-3 max-w-xs font-outfit select-none">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                        <span className="block text-[8px] font-bold text-slate-400 uppercase">Deadline</span>
                        <span className="text-slate-800 font-extrabold text-xs mt-0.5">July 15, 2026</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                        <span className="block text-[8px] font-bold text-slate-400 uppercase">Fee</span>
                        <span className="text-slate-800 font-extrabold text-xs mt-0.5">₹500 (Non-refundable)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Step 2 */}
                <div className="flex gap-4 border-l-2 border-brand-primary/20 pl-4 py-1 relative">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 bg-brand-primary rounded-full border-4 border-white flex items-center justify-center shadow-sm" />
                  <div className="space-y-2 flex-grow">
                    <h4 className="font-extrabold font-outfit text-slate-800 text-sm flex items-center justify-between">
                      <span>2. Priority Choice Filling</span>
                      <span className="text-[9px] bg-brand-tertiary/10 text-brand-tertiary font-bold px-2 py-0.5 rounded-full font-outfit">CRITICAL</span>
                    </h4>
                    <p className="text-slate-500 font-inter text-xs leading-relaxed">
                      Select your preferred branches and campus locations. We recommend selecting at least 15 choices to maximize your allotment chances based on previous merit trends.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase select-none">
                      <span className="bg-amber-50 text-brand-tertiary border border-amber-200 px-2 py-1 rounded">CRITICAL STEP</span>
                      <span className="bg-slate-50 text-slate-500 border border-slate-200 px-2 py-1 rounded">OTP VERIFICATION REQUIRED</span>
                    </div>
                  </div>
                </div>

                {/* Detail Step 3 */}
                <div className="flex gap-4 border-l-2 border-brand-primary/20 pl-4 py-1 relative">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 bg-brand-primary rounded-full border-4 border-white flex items-center justify-center shadow-sm" />
                  <div className="space-y-2 flex-grow">
                    <h4 className="font-extrabold font-outfit text-slate-800 text-sm flex items-center justify-between">
                      <span>3. Verification & Allotment Acceptance</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full font-outfit">STEP 3</span>
                    </h4>
                    <p className="text-slate-500 font-inter text-xs leading-relaxed">
                      After allotment, choose 'Freeze' (accept seat) or 'Float' (look for upgrade). Physical document verification is mandatory for Frozen seats at the designated nodal centers.
                    </p>
                    <button 
                      onClick={() => {
                        const section = document.getElementById('nodal-centres-section');
                        if (section) section.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold font-outfit text-brand-primary hover:text-brand-primary-hover self-start group cursor-pointer bg-transparent border-none p-0"
                    >
                      <span>View Nodal Centers Below</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </section>

        {/* Nodal Verification Centres Section */}
        <section id="nodal-centres-section" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm select-none">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
            <span className="text-xl">📍</span>
            <h3 className="text-lg font-bold font-outfit text-slate-800">Nodal Verification Centres & Interactive Maps</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: List of Centres */}
            <div className="lg:col-span-5 flex flex-col">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-outfit">Select Nodal Centre</span>
              
              {/* Search Bar for Centres */}
              <div className="relative mb-3.5">
                <input
                  type="text"
                  placeholder="Search Centre / City..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 input-premium text-xs font-semibold font-inter focus:bg-white"
                />
                <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors bg-transparent border-none flex items-center justify-center p-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Scrollable list wrapper */}
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1.5 custom-scrollbar">
                {(() => {
                  const filtered = nodalCentres.filter(centre => 
                    centre.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    centre.address.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-8 text-xs font-semibold text-slate-400 border border-dashed border-slate-200 rounded-xl">
                        No verification centres match your search.
                      </div>
                    );
                  }

                  return filtered.map((centre) => {
                    const isSelected = activeCentreObj.name === centre.name;
                    return (
                      <button
                        key={centre.name}
                        type="button"
                        onClick={() => setSelectedCentreName(centre.name)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex flex-col gap-0.5 cursor-pointer ${
                          isSelected
                            ? 'border-brand-primary bg-brand-primary/10 shadow-xs font-bold'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-brand-primary/20'
                        }`}
                      >
                        <span className={`text-[9px] font-black uppercase tracking-wider ${isSelected ? 'text-brand-primary' : 'text-slate-500'}`}>
                          Centre #{nodalCentres.findIndex(c => c.name === centre.name) + 1}
                        </span>
                        <span className="font-bold font-outfit text-sm text-slate-900 leading-tight">{centre.name}</span>
                        <span className="text-[11px] text-slate-500 font-medium font-inter truncate w-full">{centre.address}</span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Right Column: Details & Google Map Embed */}
            <div className="lg:col-span-7 glass-premium border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row gap-6 items-stretch">
              
              {/* Centre Details Info */}
              <div className="md:w-1/2 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Official Centre Name</span>
                    <h4 className="font-black font-outfit text-slate-900 text-base leading-tight">
                      {activeCentreObj.name}
                    </h4>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Address</span>
                    <p className="text-xs text-slate-650 font-inter leading-relaxed">
                      {activeCentreObj.address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Nodal Officer</span>
                      <span className="font-bold text-xs text-slate-800 font-outfit">
                        {activeCentreObj.officer}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Contact Phone</span>
                      <a href={`tel:${activeCentreObj.phone}`} className="font-bold text-xs text-brand-primary font-outfit hover:underline">
                        {activeCentreObj.phone}
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Reporting Timings</span>
                    <span className="font-bold text-xs text-brand-secondary bg-brand-secondary/10 border border-brand-secondary/20 px-2.5 py-1 rounded-xl inline-block font-outfit mt-1 shadow-xs">
                      ⏱️ {activeCentreObj.schedule}
                    </span>
                  </div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(activeCentreObj.name + " " + activeCentreObj.address)}`}
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
                  src={activeCentreObj.mapEmbed}
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
                  className="glass-premium hover:border-brand-primary/30 rounded-xl overflow-hidden shadow-xs transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                    className="w-full flex justify-between items-center p-5 text-left font-bold font-outfit text-slate-800 select-none cursor-pointer"
                  >
                    <span className="pr-4">{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4.5 w-4.5 text-slate-500" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-500" />}
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
                      >
                        <div className="px-5 pb-5 pt-3 text-slate-650 font-inter text-sm leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
