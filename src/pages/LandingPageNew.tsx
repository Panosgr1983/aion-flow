import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Globe, FileText, Image, Users,
  TrendingUp, Activity, Cpu, Building2, HeartHandshake,
  Stethoscope, Hotel, UtensilsCrossed, Scale, ShoppingBag,
  LayoutDashboard, Layers, Shield, Clock, BarChart3,
  CheckCircle, Sparkles
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

export default function LandingPageNew() {
  useEffect(() => {
    document.title = 'AION FLOW | Το Operating System της επιχείρησής σας';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Το AION FLOW είναι μια σύγχρονη Business Platform που ενοποιεί website, CRM, περιεχόμενο, analytics και αυτοματισμούς σε ένα σύστημα προσαρμοσμένο στην επιχείρησή σας.';
    document.head.appendChild(meta);
    return () => { document.title = 'AION FLOW Project Merge'; meta.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 overflow-x-hidden">
      {/* ─── NAVBAR ─────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between glass-dark">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION FLOW</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">Σύνδεση</Link>
          <Link to="/dashboard" className="btn-primary text-sm px-5 py-2">
            Δείτε Demo
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-8 animate-fade-in">
            <Cpu size={14} />
            <span>Business Platform · Industry Blueprints</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight animate-fade-in" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Το Operating System<br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              της δικής σου
            </span>
            <br />
            επιχείρησης.
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-4 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Δεν αγοράζεις λογισμικό. Αποκτάς το λειτουργικό σύστημα της επιχείρησής σου.
          </p>
          <p className="text-base text-gray-500 mb-10 max-w-xl mx-auto animate-fade-in">
            Από διάσπαρτα εργαλεία… σε μία οργανωμένη επιχείρηση.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in">
            <Link to="/login" className="btn-primary text-base px-8 py-3.5">
              Σύνδεση
              <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="btn-secondary text-base px-8 py-3.5">
              Δείτε Demo →
            </Link>
          </div>

          {/* Hero Glass Panel */}
          <div className="mt-16 max-w-lg mx-auto glass rounded-2xl p-6 text-left animate-fade-in border border-blue-500/10 shadow-2xl shadow-blue-500/5"
               style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-4">
              <LayoutDashboard size={14} className="text-blue-400" />
              <span className="text-xs font-medium text-gray-300">Platform Overview</span>
              <span className="ml-auto text-[10px] text-gray-600">Live</span>
            </div>
            <div className="flex gap-3 mb-4 text-xs text-gray-500">
              <span className="text-blue-400">● Website</span>
              <span className="text-cyan-400">● CRM</span>
              <span className="text-emerald-400">● Media</span>
              <span className="text-purple-400">● Analytics</span>
            </div>
            <div className="border-t border-gray-800 pt-3 space-y-2">
              <p className="text-[11px] text-gray-500 font-medium mb-2">Live Activity</p>
              {[
                { icon: Globe, text: 'Σελίδα ενημερώθηκε', time: '2λ πριν', color: 'text-blue-400' },
                { icon: Users, text: 'New lead received', time: '15λ πριν', color: 'text-cyan-400' },
                { icon: Image, text: 'Media uploaded', time: '1ω πριν', color: 'text-emerald-400' },
                { icon: Shield, text: 'Backup completed', time: '3ω πριν', color: 'text-gray-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <item.icon size={10} className={item.color} />
                  <span className="text-gray-400">{item.text}</span>
                  <span className="ml-auto text-gray-600">{item.time}</span>
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
              <p className="text-gray-400 max-w-2xl mx-auto">
                Η επιχείρησή σου είναι μοναδική. Γιατί να χρησιμοποιεί το ίδιο λογισμικό με όλες;
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {pillars.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div key={i} className="card p-6 hover:border-blue-500/20 transition-all duration-300 group">
                    <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                      <Icon size={20} className="text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-200">{p.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── MODULES ─────────────────────── */}
      <RevealSection>
        <section className="py-24 px-6 bg-gray-900/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Όσα χρειάζεστε, τίποτα περισσότερο
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Ενεργοποιείτε μόνο τα modules που θέλετε. Προσθέτετε αργότερα.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modules.map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className="card p-5 hover:bg-gray-800/40 hover:border-blue-500/20 transition-all duration-300 group"
                       style={{ transitionDelay: `${i * 50}ms` }}>
                    <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon size={18} className="text-blue-400" />
                    </div>
                    <h3 className="font-medium text-sm text-gray-200 mb-1">{m.label}</h3>
                    <p className="text-xs text-gray-500">{m.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── HOW IT ADAPTS (Industry Blueprints) ─── */}
      <RevealSection>
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Μία πλατφόρμα. Κάθε κλάδος.
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Η ίδια πλατφόρμα προσαρμόζεται σε κάθε επάγγελμα.
                Δεν αλλάζεις εσύ τη δουλειά σου για να χωρέσει στο λογισμικό.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {industries.map((ind, i) => {
                const Icon = ind.icon;
                return (
                  <div key={i} className="card p-6 hover:bg-gray-800/40 hover:border-blue-500/20 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <Icon size={18} className="text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-gray-200">{ind.label}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ind.tags.map((tag, j) => (
                        <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400">
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
        <section className="py-24 px-6 bg-gray-900/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Εξελίσσεται μαζί με την επιχείρησή σου
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-12">
              Modules όταν τα χρειάζεστε. Όχι όταν θέλει ο vendor.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
              {badges.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="card p-4 hover:border-blue-500/20 transition-all duration-300">
                    <div className="size-9 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                      <Icon size={16} className="text-blue-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-300">{b.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Visual timeline */}
            <div className="max-w-2xl mx-auto">
              <div className="relative flex items-start justify-between">
                {['Website', 'Customers', 'Operations', 'Growth', 'Insights'].map((step, i) => (
                  <div key={i} className="flex flex-col items-center relative z-10">
                    <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < 3 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {i + 1}
                    </div>
                    <p className={`text-xs mt-2 ${i < 3 ? 'text-gray-300' : 'text-gray-600'}`}>{step}</p>
                  </div>
                ))}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-800 -z-0">
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
            <div className="card p-12 border-blue-500/10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Έτοιμοι να οργανώσετε<br />την επιχείρησή σας;
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Συνδεθείτε στο AION FLOW και ανακαλύψτε το Operating System της επιχείρησής σας.
              </p>
              <Link to="/login" className="btn-primary text-base px-10 py-4 inline-flex">
                Σύνδεση
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── FOOTER ───────────────────────── */}
      <footer className="py-12 px-6 border-t border-gray-800/50 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded flex items-center justify-center">
            <Zap size={11} className="text-white" />
          </div>
          <span className="text-gray-300 font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION FLOW</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Το Operating System της επιχείρησής σας.</p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
          <span>Powered by</span>
          <span className="text-gray-500">React</span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-500">Supabase</span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-500">Vercel</span>
        </div>
      </footer>
    </div>
  );
}
