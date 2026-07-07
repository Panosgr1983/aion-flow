import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Star } from 'lucide-react';

const versions = [
  { path: '/', label: 'Landing Page (Original)', desc: 'Η αρχική σελίδα', color: 'bg-gray-700' },
  { path: '/new', label: 'New V1', desc: 'Dark-first, glass UI', color: 'bg-blue-700' },
  { path: '/new-v2', label: 'New V2', desc: 'Light mode, parallax everywhere', color: 'bg-teal-600' },
  { path: '/new-v3', label: 'New V3', desc: 'Light Flow Edition', color: 'bg-indigo-600' },
  { path: '/new-v4', label: 'New V4', desc: 'Restrained premium', color: 'bg-cyan-700' },
  { path: '/new-v5', label: 'New V5', desc: 'Experimental blend', color: 'bg-violet-600' },
  { path: '/new-v6', label: 'New V6', desc: 'V4 refined + canvas particles + top waves', color: 'bg-sky-600' },
  { path: '/new-version-deathstar', label: '★ Deathstar Edition', desc: 'Dark cosmic, starfield, 3D tilt, ultimate visuals', color: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600' },
  { path: '/new-sales', label: 'Sales Funnel', desc: 'Cinematic storytelling — 6 acts, 0 features', color: 'bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-600' },
];

export default function VersionsList() {
  return (
    <div className="min-h-screen bg-[#08091a] text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white/70" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION FLOW</span>
        </div>
        <p className="text-center text-white/30 text-sm mb-8">Landing Page Versions</p>
        <div className="space-y-3">
          {versions.map((v) => (
            <Link
              key={v.path}
              to={v.path}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/20 hover:bg-white/[0.05] transition-all group"
            >
              <div className={`size-10 rounded-lg shrink-0 flex items-center justify-center text-white text-xs font-bold ${v.color}`}>
                {v.path === '/' ? 'OG' : v.path.replace('/new-version-', 'D').replace('/new-', 'V').replace('/new-sales', 'SF')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{v.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{v.desc}</p>
              </div>
              <ArrowRight size={14} className="text-white/20 group-hover:text-cyan-400 transition-all group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} — <a href="https://www.aionweb.gr" target="_blank" rel="noopener noreferrer" className="text-cyan-400/60 hover:text-cyan-400 transition-colors">Παναγιώτης Χολιασμένος</a> — Web Designer & Digital Marketer
          </p>
        </div>
      </div>
    </div>
  );
}
