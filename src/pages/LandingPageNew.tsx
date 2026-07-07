import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Globe, FileText, Image, Users,
  TrendingUp, Activity, Cpu, Building2, HeartHandshake,
  Stethoscope, Hotel, UtensilsCrossed, Scale, ShoppingBag,
  LayoutDashboard, Layers, Shield, Clock, BarChart3,
  CheckCircle, Sparkles, Sun, Moon
} from 'lucide-react';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('animate-fade-in');
          el.style.opacity = '1';
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`opacity-0 ${className}`}>
      {children}
    </div>
  );
}

const modules = [
  { icon: Globe, label: 'Website', desc: 'Διαχείριση περιεχομένου, σελίδων και SEO' },
  { icon: FileText, label: 'Content', desc: 'Blog, υπηρεσίες, παρουσιάσεις, κείμενα' },
  { icon: Image, label: 'Media', desc: 'Εικόνες, αρχεία, gallery και οργάνωση' },
  { icon: Users, label: 'CRM', desc: 'Επικοινωνία, leads, ιστορικό πελατών' },
  { icon: TrendingUp, label: 'Pipeline', desc: 'Πωλήσεις, στάδια, αυτοματισμοί' },
  { icon: BarChart3, label: 'Analytics', desc: 'Μετρήσεις, reports, insights' },
  { icon: Activity, label: 'Automation', desc: 'Email, backups, αυτοματοποιήσεις' },
  { icon: Cpu, label: 'Knowledge', desc: 'Τεκμηρίωση, διαδικασίες, blueprint' },
];

const industries = [
  { icon: Stethoscope, label: 'Ψυχολόγος', tags: ['Ιστοσελίδα', 'Blog', 'Κριτικές', 'Πιστοποιήσεις'] },
  { icon: HeartHandshake, label: 'Κλινική', tags: ['Ραντεβού', 'Ασθενείς', 'Ιατρικά αρχεία'] },
  { icon: Hotel, label: 'Ξενοδοχείο', tags: ['Κρατήσεις', 'Δωμάτια', 'Κριτικές'] },
  { icon: UtensilsCrossed, label: 'Εστιατόριο', tags: ['Μενού', 'Παραγγελίες', 'Κρατήσεις'] },
  { icon: Scale, label: 'Δικηγόρος', tags: ['Υποθέσεις', 'Έγγραφα', 'Ημερολόγιο'] },
  { icon: ShoppingBag, label: 'Retail', tags: ['Προϊόντα', 'Απόθεμα', 'e-Shop'] },
];

const pillars = [
  {
    icon: Layers,
    title: 'Ένα σύστημα, όχι δέκα εφαρμογές',
    desc: 'Website, CRM, Analytics, Media και Pipeline σε μία ενιαία πλατφόρμα. Χωρίς εναλλαγές tabs, χωρίς διπλότυπα δεδομένα.',
  },
  {
    icon: Sparkles,
    title: 'Ξεκινά μικρό, μεγαλώνει μαζί σας',
    desc: 'Ενεργοποιείτε μόνο τα modules που χρειάζεστε σήμερα. Προσθέτετε νέα δυνατότητα όταν η επιχείρησή σας μεγαλώνει.',
  },
  {
    icon: CheckCircle,
    title: 'Πραγματικά δεδομένα, πραγματικές αποφάσεις',
    desc: 'Usage telemetry και real-time analytics σας δείχνουν τι λειτουργεί και τι όχι. Αποφάσεις βασισμένες σε δεδομένα, όχι σε διαίσθηση.',
  },
];

const badges = [
  { icon: LayoutDashboard, label: 'Modular Architecture' },
  { icon: Building2, label: 'Multi-Tenant' },
  { icon: Shield, label: 'Role-based' },
  { icon: Clock, label: 'Real-time' },
  { icon: Activity, label: 'Telemetry Ready' },
];

const steps = ['Website', 'Customers', 'Operations', 'Growth', 'Insights'];

export default function LandingPageNew() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.title = 'AION FLOW | Το Operating System της επιχείρησής σας';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Το AION FLOW είναι μια σύγχρονη Business Platform που ενοποιεί website, CRM, περιεχόμενο, analytics και αυτοματισμούς σε ένα σύστημα προσαρμοσμένο στην επιχείρησή σας.';
    document.head.appendChild(meta);
    return () => { document.title = 'AION FLOW Project Merge'; meta.remove(); };
  }, []);

  const bg = dark ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-900';
  const surface = dark ? 'bg-gray-900/30' : 'bg-gray-100/50';
  const cardBg = dark ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200';
  const cardHover = dark ? 'hover:bg-gray-800/40 hover:border-blue-500/20' : 'hover:bg-gray-200/60 hover:border-blue-400/30';
  const border = dark ? 'border-gray-800/50' : 'border-gray-200/50';
  const textMuted = dark ? 'text-gray-400' : 'text-gray-500';
  const textDim = dark ? 'text-gray-500' : 'text-gray-400';
  const textLight = dark ? 'text-gray-200' : 'text-gray-800';
  const textBright = dark ? 'text-gray-300' : 'text-gray-700';
  const tagBg = dark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500';
  const navBg = dark ? 'glass-dark' : 'bg-white/70 backdrop-blur-md border-b border-gray-200/50';
  const glassPanel = dark ? 'glass' : 'bg-gray-50/80 backdrop-blur-md border border-gray-200/50';

  return (
    <div className={`min-h-screen ${bg} overflow-x-hidden transition-colors duration-300`}>
      {/* ─── NAVBAR ─────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between ${navBg}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION FLOW</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className={`p-2 rounded-xl transition-colors ${dark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/login" className={`text-sm transition-colors px-4 py-2 ${dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>Σύνδεση</Link>
          <Link to="/dashboard" className={`${dark ? 'btn-primary' : 'bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm cursor-pointer'}`}>
            Δείτε Demo
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────── */}
      <section className={`relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-20 ${dark ? '' : 'bg-gradient-to-b from-blue-50/30 to-transparent'}`}>
        {dark && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/8 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
          </div>
        )}

        <div className="relative text-center max-w-4xl mx-auto">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-8 animate-fade-in ${dark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-100 border border-blue-200 text-blue-600'}`}>
            <Cpu size={14} />
            <span>Business Platform · Industry Blueprints</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight animate-fade-in" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Το Operating System<br />
            <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              της δικής σου
            </span>
            <br />
            επιχείρησης.
          </h1>

          <p className={`text-lg md:text-xl ${textMuted} mb-4 max-w-2xl mx-auto leading-relaxed animate-fade-in`}>
            Δεν αγοράζεις λογισμικό. Αποκτάς το λειτουργικό σύστημα της επιχείρησής σου.
          </p>
          <p className={`text-base ${textDim} mb-10 max-w-xl mx-auto animate-fade-in`}>
            Από διάσπαρτα εργαλεία… σε μία οργανωμένη επιχείρηση.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in">
            <Link to="/login" className={`${dark ? 'btn-primary' : 'bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-base cursor-pointer'}`}>
              Σύνδεση
              <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className={`${dark ? 'btn-secondary' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-base border border-gray-300 cursor-pointer'}`}>
              Δείτε Demo →
            </Link>
          </div>

          {/* Hero Glass Panel */}
          <div className={`mt-16 max-w-lg mx-auto ${glassPanel} rounded-2xl p-6 text-left animate-fade-in border-blue-500/10 shadow-2xl ${dark ? 'shadow-blue-500/5' : 'shadow-blue-500/10'}`}
               style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-4">
              <LayoutDashboard size={14} className="text-blue-400" />
              <span className={`text-xs font-medium ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Platform Overview</span>
              <span className={`ml-auto text-[10px] ${dark ? 'text-gray-600' : 'text-gray-400'}`}>Live</span>
            </div>
            <div className="flex gap-3 mb-4 text-xs text-gray-500">
              <span className="text-blue-400">● Website</span>
              <span className="text-cyan-400">● CRM</span>
              <span className="text-emerald-400">● Media</span>
              <span className="text-purple-400">● Analytics</span>
            </div>
            <div className={`border-t ${dark ? 'border-gray-800' : 'border-gray-200'} pt-3 space-y-2`}>
              <p className={`text-[11px] ${dark ? 'text-gray-500' : 'text-gray-400'} font-medium mb-2`}>Live Activity</p>
              {[
                { icon: Globe, text: 'Σελίδα ενημερώθηκε', time: '2λ πριν', color: 'text-blue-400' },
                { icon: Users, text: 'New lead received', time: '15λ πριν', color: 'text-cyan-400' },
                { icon: Image, text: 'Media uploaded', time: '1ω πριν', color: 'text-emerald-400' },
                { icon: Shield, text: 'Backup completed', time: '3ω πριν', color: 'text-gray-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <item.icon size={10} className={item.color} />
                  <span className={dark ? 'text-gray-400' : 'text-gray-500'}>{item.text}</span>
                  <span className={`ml-auto ${dark ? 'text-gray-600' : 'text-gray-400'}`}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── THE PLATFORM ───────────────── */}
      <RevealSection>
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                One Platform. Built Around Your Business.
              </h2>
              <p className={`${textMuted} max-w-2xl mx-auto`}>
                Η επιχείρησή σου είναι μοναδική. Γιατί να χρησιμοποιεί το ίδιο λογισμικό με όλες;
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {pillars.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div key={i} className={`${cardBg} ${cardHover} p-6 rounded-2xl transition-all duration-300 group`}>
                    <div className={`size-10 rounded-xl ${dark ? 'bg-blue-500/10' : 'bg-blue-100'} flex items-center justify-center mb-4 ${dark ? 'group-hover:bg-blue-500/20' : 'group-hover:bg-blue-200'} transition-colors`}>
                      <Icon size={20} className="text-blue-500" />
                    </div>
                    <h3 className={`font-semibold text-lg mb-2 ${textLight}`}>{p.title}</h3>
                    <p className={`text-sm leading-relaxed ${textMuted}`}>{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── MODULES ─────────────────────── */}
      <RevealSection>
        <section className={`py-24 px-6 ${surface}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Όσα χρειάζεστε, τίποτα περισσότερο
              </h2>
              <p className={`${textMuted} max-w-xl mx-auto`}>
                Ενεργοποιείτε μόνο τα modules που θέλετε. Προσθέτετε αργότερα.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modules.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className={`${cardBg} ${cardHover} p-5 rounded-2xl transition-all duration-300 group`}
                       style={{ transitionDelay: `${i * 50}ms` }}>
                    <div className={`size-10 rounded-xl ${dark ? 'bg-blue-500/10' : 'bg-blue-100'} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon size={18} className="text-blue-500" />
                    </div>
                    <h3 className={`font-medium text-sm mb-1 ${textLight}`}>{m.label}</h3>
                    <p className={`text-xs ${textDim}`}>{m.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── HOW IT ADAPTS ───────────────── */}
      <RevealSection>
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Μία πλατφόρμα. Κάθε κλάδος.
              </h2>
              <p className={`${textMuted} max-w-xl mx-auto`}>
                Η ίδια πλατφόρμα προσαρμόζεται σε κάθε επάγγελμα.
                Δεν αλλάζεις εσύ τη δουλειά σου για να χωρέσει στο λογισμικό.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {industries.map((ind, i) => {
                const Icon = ind.icon;
                return (
                  <div key={i} className={`${cardBg} ${cardHover} p-6 rounded-2xl transition-all duration-300 group`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`size-10 rounded-xl ${dark ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' : 'bg-gradient-to-br from-blue-100 to-cyan-100'} flex items-center justify-center`}>
                        <Icon size={18} className="text-blue-500" />
                      </div>
                      <h3 className={`font-semibold ${textLight}`}>{ind.label}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ind.tags.map((tag, j) => (
                        <span key={j} className={`text-xs px-2.5 py-1 rounded-full ${tagBg}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── GROWTH ───────────────────────── */}
      <RevealSection>
        <section className={`py-24 px-6 ${surface}`}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Εξελίσσεται μαζί με την επιχείρησή σου
            </h2>
            <p className={`${textMuted} max-w-xl mx-auto mb-12`}>
              Modules όταν τα χρειάζεστε. Όχι όταν θέλει ο vendor.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
              {badges.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className={`${cardBg} ${cardHover} p-4 rounded-2xl transition-all duration-300`}>
                    <div className={`size-9 rounded-lg ${dark ? 'bg-blue-500/10' : 'bg-blue-100'} flex items-center justify-center mx-auto mb-2`}>
                      <Icon size={16} className="text-blue-500" />
                    </div>
                    <p className={`text-xs font-medium ${textBright}`}>{b.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Timeline */}
            <div className="max-w-2xl mx-auto">
              <div className="relative flex items-start justify-between">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center relative z-10">
                    <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < 3
                        ? dark
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-600 text-white'
                        : dark
                          ? 'bg-gray-800 text-gray-500'
                          : 'bg-gray-200 text-gray-400'
                    }`}>
                      {i + 1}
                    </div>
                    <p className={`text-xs mt-2 ${i < 3 ? textBright : textDim}`}>{step}</p>
                  </div>
                ))}
                <div className={`absolute top-4 left-0 right-0 h-0.5 -z-0 ${dark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div className="h-full w-3/5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── CTA ──────────────────────────── */}
      <RevealSection>
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className={`${cardBg} p-12 rounded-2xl ${dark ? 'border-blue-500/10' : 'border-blue-200/50'} transition-colors duration-300`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Έτοιμοι να οργανώσετε<br />την επιχείρησή σας;
              </h2>
              <p className={`${textMuted} mb-8 max-w-md mx-auto`}>
                Συνδεθείτε στο AION FLOW και ανακαλύψτε το Operating System της επιχείρησής σας.
              </p>
              <Link to="/login" className={`${dark ? 'btn-primary' : 'bg-blue-600 hover:bg-blue-500 text-white font-medium px-10 py-4 rounded-xl transition-all duration-200 inline-flex items-center gap-2 text-base cursor-pointer'}`}>
                Σύνδεση
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── FOOTER ───────────────────────── */}
      <footer className={`py-12 px-6 border-t ${border} text-center transition-colors duration-300`}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded flex items-center justify-center">
            <Zap size={11} className="text-white" />
          </div>
          <span className={`font-bold ${dark ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION FLOW</span>
        </div>
        <p className={`text-sm ${textDim} mb-4`}>Το Operating System της επιχείρησής σας.</p>
        <div className="flex items-center justify-center gap-4 text-xs ${textDim}">
          <span>Powered by</span>
          <span className={dark ? 'text-gray-500' : 'text-gray-400'}>React</span>
          <span>·</span>
          <span className={dark ? 'text-gray-500' : 'text-gray-400'}>Supabase</span>
          <span>·</span>
          <span className={dark ? 'text-gray-500' : 'text-gray-400'}>Vercel</span>
        </div>
      </footer>
    </div>
  );
}
