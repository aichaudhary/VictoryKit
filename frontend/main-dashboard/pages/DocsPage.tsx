
import React from 'react';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, Book, Search, Zap, Code, Terminal, FileText } from 'lucide-react';

const DocsPage: React.FC = () => {
  const { setView } = useScroll();

  return (
    <div className="min-h-screen bg-[#02000a] text-white font-sans p-6 md:p-24">
      <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors mb-24">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </button>

      <div className="max-w-4xl mx-auto space-y-24">
        <div className="space-y-8">
           <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-amber-500/20">
             <Book className="w-4 h-4 text-amber-500" />
             <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-500">Knowledge Base</span>
           </div>
           <h1 className="text-7xl font-black tracking-tighter uppercase">DOCUMENTATION</h1>
           <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="text" placeholder="Search modules, API, guides..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 focus:outline-none focus:border-amber-500 transition-colors" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: "Getting Started", icon: <Zap />, desc: "Initial deployment and environment setup." },
            { title: "API Reference", icon: <Code />, desc: "RESTful endpoints for module orchestration." },
            { title: "CLI Tools", icon: <Terminal />, desc: "Maula control line utilities for DevOps." },
            { title: "Compliance Guides", icon: <FileText />, desc: "Mapping tools to regulatory standards." }
          ].map((doc, i) => (
            <div key={i} className="glass p-10 rounded-3xl border border-white/5 hover:border-amber-500/20 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                {doc.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{doc.title}</h3>
              <p className="text-white/40 leading-relaxed">{doc.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
