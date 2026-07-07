import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Globe, FileText, Image, Users,
  TrendingUp, Activity, Cpu, Building2, HeartHandshake,
  Stethoscope, Hotel, UtensilsCrossed, Scale, ShoppingBag,
  LayoutDashboard, Layers, Shield, Clock, BarChart3,
  CheckCircle, Sparkles, Menu, X, ChevronRight
} from 'lucide-react';
import { useParallax } from '../hooks/useParallax';

/* ─── CUSTOM CSS ─────────────── */
const customCSS = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); filter: blur(8px); }
    to   { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  @keyframes fadeSlideLeft {
    from { opacity: 0; transform: translateX(40px); filter: blur(6px); }
    to   { opacity: 1; transform: translateX(0); filter: blur(0); }
  }
  @keyframes floatCard {
    0%, 100% { transform: translateY(-6px); }
    50%      { transform: translateY(6px); }
  }
  @keyframes floatPill {
    0%, 100% { transform: translate(0,0); }
    25%      { transform: translate(8px,-12px); }
    50%      { transform: translate(-6px,-20px); }
    75%      { transform: translate(-12px,-8px); }
  }
  @keyframes waveFloat {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(5px); }
  }
  @keyframes drawLine {
    to { stroke-dashoffset: 0; }
  }
  .reveal-up {
    animation: fadeSlideUp .9s cubic-bezier(.16,1,.3,1) forwards;
  }
  .reveal-left {
    animation: fadeSlideLeft .9s cubic-bezier(.16,1,.3,1) forwards;
  }
  .magnetic-btn {
    transition: all .35s cubic-bezier(.16,1,.3,1);
  }
  .magnetic-btn:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 32px rgba(59,130,246,.25);
  }
  .card-lift {
    transition: all .35s cubic-bezier(.16,1,.3,1);
  }
  .card-lift:hover {
    transform: translateY(-4px);
    border-color: #3b82f6;
    box-shadow: 0 8px 32px rgba(59,130,246,.1);
  }
`;

/* ─── HOOKS ──────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, className: vis ? 'reveal-up' : 'opacity-0' };
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, className: anim } = useReveal();
  return <div ref={ref} className={`${anim} ${className}`} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

/* ─── COMPONENTS ─────────────── */
function ParallaxBg({ src, speed = 0.15 }: { src: string; speed?: number }) {
  const { ref, style } = useParallax(speed);
  return <div ref={ref as any} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${src})`, ...style }} />;
}

function WaveDivider({ fill, height = 70 }: { fill: string; height?: number }) {
  return (
    <div className="relative leading-[0] -mb-[2px] z-10">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full" style={{ height }}>
        <path
          d="M0,20 C240,70 480,0 720,35 C960,70 1200,10 1440,35 L1440,80 L0,80 Z"
          fill={fill}
          style={{ animation: 'waveFloat 5s ease-in-out infinite' }}
        />
      </svg>
    </div>
  );
}

function MagneticBtn({ to, primary = true, children }: { to: string; primary?: boolean; children: React.ReactNode }) {
  const Tag = to.startsWith('/') ? Link : 'a' as any;
  const props = to.startsWith('/') ? { to } : { href: to };
  return (
    <Tag {...props} className={`magnetic-btn inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-medium ${
      primary
        ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
    }`}>
      {children}
    </Tag>
  );
}

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let cur = 0; const inc = target / 40;
      const t = setInterval(() => { cur += inc; if (cur >= target) { setN(target); clearInterval(t); } else setN(Math.floor(cur)); }, 30);
      obs.unobserve(el);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ─── DATA ───────────────────── */
const modules = [
  { icon: Globe, label: 'Website', desc: 'Περιεχόμενο, σελίδες, SEO & presentation' },
  { icon: FileText, label: 'Content', desc: 'Blog, υπηρεσίες, κείμενα & storytelling' },
  { icon: Image, label: 'Media', desc: 'Εικόνες, gallery, αρχεία & οργάνωση' },
  { icon: Users, label: 'CRM', desc: 'Επικοινωνία, leads, πελάτες & ιστορικό' },
  { icon: TrendingUp, label: 'Pipeline', desc: 'Πωλήσεις, στάδια, ροή & αυτοματισμοί' },
  { icon: BarChart3, label: 'Analytics', desc: 'Μετρήσεις, reports & insights' },
  { icon: Activity, label: 'Automation', desc: 'Email, backups, ροές εργασίας' },
  { icon: Cpu, label: 'Knowledge', desc: 'Τεκμηρίωση, blueprints & ops' },
];

const industries = [
  { icon: Stethoscope, label: 'Ψυχολόγος', tags: ['Ιστοσελίδα', 'Blog', 'Κριτικές', 'Πιστοποιήσεις'], img: 'https://images.unsplash.com/photo-1573497620053-e61932f9e096?w=600&q=60' },
  { icon: HeartHandshake, label: 'Κλινική', tags: ['Ραντεβού', 'Ασθενείς', 'Ιατρικά αρχεία'], img: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=60' },
  { icon: Hotel, label: 'Ξενοδοχείο', tags: ['Κρατήσεις', 'Δωμάτια', 'Κριτικές'], img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=60' },
  { icon: UtensilsCrossed, label: 'Εστιατόριο', tags: ['Μενού', 'Παραγγελίες', 'Κρατήσεις'], img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=60' },
  { icon: Scale, label: 'Δικηγόρος', tags: ['Υποθέσεις', 'Έγγραφα', 'Ημερολόγιο'], img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=60' },
  { icon: ShoppingBag, label: 'Retail', tags: ['Προϊόντα', 'Απόθεμα', 'e-Shop'], img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=60' },
];

const problemPills = [
  'Excel', 'Email', 'Messenger', 'WordPress',
  'Google Drive', 'Notes', 'CRM', 'Social Media',
  'Calendar', 'WhatsApp', 'Trello', 'PDFs',
];

const timelineSteps = [
  { label: 'Launch', sub: 'Website & presence' },
  { label: 'Care', sub: 'Πελάτες & επικοινωνία' },
  { label: 'CRM', sub: 'Ιστορικό & σχέσεις' },
  { label: 'Automation', sub: 'Ροές & backups' },
  { label: 'Insights', sub: 'Αποφάσεις & ανάπτυξη' },
];

/* ─── PAGE ───────────────────── */
export default function LandingPageNewV3() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const docH = typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1;
  const progress = Math.min((scrollY / docH) * 100, 100);
  const navSolid = scrollY > 100;

  useEffect(() => {
    document.title = 'AION FLOW | Το Operating System της επιχείρησής σας';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Το AION FLOW είναι μια σύγχρονη Business Platform που ενοποιεί website, CRM, περιεχόμενο, analytics και αυτοματισμούς σε ένα σύστημα.';
    document.head.appendChild(meta);
    return () => { document.title = 'AION FLOW Project Merge'; meta.remove(); };
  }, []);

  const scrollTo = useCallback((href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }, []);

  const navLinks = [
    { href: '#modules', label: 'Modules' },
    { href: '#industries', label: 'Industries' },
    { href: '#growth', label: 'Growth' },
  ];

  const activityFeed = [
    { icon: Globe, text: 'Σελίδα ενημερώθηκε', time: '2λ πριν' },
    { icon: Users, text: 'New lead received', time: '15λ πριν' },
    { icon: Image, text: 'Media uploaded', time: '1ω πριν' },
    { icon: Shield, text: 'Backup completed', time: '3ω πριν' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-gray-900 overflow-x-hidden">
      <style>{customCSS}</style>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-gray-200/60">
        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* ═══ NAVBAR ════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${
        navSolid ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION FLOW</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={scrollTo(l.href)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l.label}</a>
          ))}
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-4 py-2">Σύνδεση</Link>
          <Link to="/dashboard" className="magnetic-btn bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm shadow-lg shadow-blue-500/25">
            Δείτε Demo <ArrowRight size={14} />
          </Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-stone-50 pt-20 px-6 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={scrollTo(l.href)} className="text-lg text-gray-700 hover:text-gray-900 py-2 border-b border-gray-200">{l.label}</a>
            ))}
            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-lg text-gray-700 hover:text-gray-900 py-2 border-b border-gray-200">Σύνδεση</Link>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="bg-blue-600 text-white text-center font-medium px-5 py-3 rounded-xl mt-4">Δείτε Demo →</Link>
          </div>
        </div>
      )}

      {/* ═══ HERO ═══════════════════════ */}
      <section className="relative min-h-screen flex items-center px-6 pt-24 pb-16 overflow-hidden bg-stone-50">
        {/* Subtle background gradient */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/80 to-transparent pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200/50 px-4 py-1.5 text-sm mb-8 text-blue-600">
              <Cpu size={14} />
              <span>Business Platform · Industry Blueprints</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Το Operating System της{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                δικής σου
              </span>
              <br />
              επιχείρησης.
            </h1>

            <p className="text-lg text-gray-500 mb-3 max-w-lg leading-relaxed">
              Σχεδιασμένο γύρω από τον τρόπο που δουλεύεις.
            </p>
            <p className="text-base text-gray-400 mb-10 max-w-md">
              Δεν αγοράζεις λογισμικό. Αποκτάς το λειτουργικό σύστημα της επιχείρησής σου. <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent font-medium">Εξελίσσεται</span> μαζί σου.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <MagneticBtn to="/login">
                Σύνδεση <ArrowRight size={16} />
              </MagneticBtn>
              <MagneticBtn to="/dashboard" primary={false}>
                Δείτε Demo <ChevronRight size={16} />
              </MagneticBtn>
            </div>
          </div>

          {/* Right: Glass Card + Photo */}
          <div className="relative">
            {/* Photo behind */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-30">
              <div className="absolute inset-0 bg-cover bg-center scale-110" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=60)', filter: 'blur(12px)' }} />
            </div>

            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl blur-2xl" />

            {/* Floating glass card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/60"
              style={{ animation: 'floatCard 8s ease-in-out infinite' }}
            >
              <div className="flex items-center gap-2 mb-5">
                <LayoutDashboard size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Platform Overview</span>
                <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Live</span>
              </div>
              <div className="flex gap-4 mb-5 text-xs">
                {['Website', 'CRM', 'Media', 'Analytics'].map((label, i) => (
                  <span key={label} className={`px-3 py-1 rounded-full bg-gray-100 text-gray-600 ${i === 0 ? 'bg-blue-100 text-blue-600' : ''}`}>
                    {label}
                  </span>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-[11px] text-gray-400 font-medium mb-2">Live Activity</p>
                {activityFeed.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <Icon size={12} className="text-blue-500" />
                      <span className="text-gray-600">{item.text}</span>
                      <span className="ml-auto text-gray-400 text-xs">{item.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fill="#fafaf9" height={60} />

      {/* ═══ PROBLEM ════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden bg-gray-950"
        style={{ clipPath: 'polygon(0 2%, 100% 0, 100% 98%, 0 100%)' }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <Reveal>
                <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4 block">The Problem</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Η επιχείρησή σου δεν χρειάζεται άλλο ένα εργαλείο.
                </h2>
                <p className="text-gray-400 text-base leading-relaxed max-w-md">
                  Χρειάζεται ένα σύστημα που ενώνει όσα ήδη κάνεις: website, περιεχόμενο, πελάτες, επικοινωνία, analytics και ανάπτυξη.
                </p>
              </Reveal>
            </div>

            {/* Right: Floating pills */}
            <div className="relative h-[400px] md:h-[500px]">
              {/* Center: AION FLOW */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-20 md:size-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 z-10">
                  <Zap size={32} className="text-white" />
                </div>
              </div>

              {/* Pills */}
              {problemPills.map((pill, i) => {
                const angle = (i / problemPills.length) * Math.PI * 2;
                const radius = 150 + Math.random() * 20;
                const x = 50 + Math.cos(angle) * (radius / 400) * 100;
                const y = 50 + Math.sin(angle) * (radius / 470) * 100;
                return (
                  <div
                    key={pill}
                    className="absolute z-0"
                    style={{
                      left: `${x}%`, top: `${y}%`,
                      animation: `floatPill ${6 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
                    }}
                  >
                    <span className="inline-block px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-300 text-xs font-medium whitespace-nowrap backdrop-blur-sm">
                      {pill}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fill="#030712" height={60} />

      {/* ═══ MODULES ════════════════════ */}
      <section id="modules" className="py-28 px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3 block">Modules</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Όσα χρειάζεστε, τίποτα περισσότερο
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Ενεργοποιείτε μόνο τα modules που θέλετε. Προσθέτετε όταν μεγαλώνετε.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {modules.map((m, i) => {
              const Icon = m.icon;
              return (
                <Reveal key={i} delay={i * 80}>
                  <div className="card-lift bg-white border border-gray-200/80 p-6 rounded-2xl cursor-default">
                    <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                      <Icon size={18} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1 text-gray-900">{m.label}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{m.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ PARALLAX BAND ═════════════ */}
      <section className="relative py-36 px-6 overflow-hidden">
        <ParallaxBg src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=80" speed={0.12} />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-blue-800/75 to-cyan-900/85" />

        <div className="relative max-w-3xl mx-auto text-center z-10">
          <Reveal>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Η ίδια πλατφόρμα.<br />
              <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                Διαφορετικό αποτέλεσμα
              </span>
              <br />
              για κάθε επιχείρηση.
            </h2>
          </Reveal>
        </div>
      </section>

      {/* ═══ INDUSTRIES ═════════════════ */}
      <section id="industries" className="py-28 px-6 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3 block">Industry Blueprints</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Μία πλατφόρμα. Κάθε κλάδος.
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Προσαρμόζεται στη δουλειά σου. Δεν αλλάζεις εσύ τη δουλειά σου για να χωρέσει στο λογισμικό.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <Reveal key={i} delay={i * 100}>
                  <div className="card-lift bg-white border border-gray-200/80 rounded-2xl overflow-hidden">
                    {/* Photo crop */}
                    <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${ind.img})` }} />
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Icon size={16} className="text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{ind.label}</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ind.tags.map((tag, j) => (
                          <span key={j} className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-500">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ GROWTH ═════════════════════ */}
      <section id="growth" className="relative py-28 px-6 overflow-hidden bg-gray-950"
        style={{ clipPath: 'polygon(0 0, 100% 2%, 100% 100%, 0 98%)' }}
      >
        {/* Flow line SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]" viewBox="0 0 1440 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path
            d="M0,300 C200,100 400,500 720,300 C1040,100 1240,500 1440,300"
            stroke="url(#flowGrad)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="8 12"
            style={{ animation: 'waveFloat 8s ease-in-out infinite' }}
          />
        </svg>

        <div className="relative max-w-5xl mx-auto z-10">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3 block">Growth Path</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Εξελίσσεται μαζί με την επιχείρησή σου
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Κάθε στάδιο ξεκλειδώνει νέες δυνατότητες. Εσύ αποφασίζεις πότε.
              </p>
            </div>
          </Reveal>

          {/* Flowing Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Curved connecting line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400" preserveAspectRatio="none">
              <path
                d="M100,350 C250,200 400,50 700,80"
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                strokeOpacity="0.3"
                strokeDasharray="4 8"
              />
            </svg>

            <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-4">
              {timelineSteps.map((step, i) => {
                const even = i % 2 === 0;
                return (
                  <Reveal key={i} delay={i * 150}>
                    <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-3 relative">
                      {/* Step number */}
                      <div className={`size-12 md:size-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        i < 3
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-800 text-gray-500 border border-gray-700'
                      }`}>
                        {i + 1}
                      </div>
                      {/* Content */}
                      <div className={`md:text-center ${even ? 'md:pt-2' : 'md:pt-16'}`}>
                        <p className="font-semibold text-white text-sm">{step.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{step.sub}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* Stats row */}
          <Reveal delay={300}>
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { label: 'Modules', target: 8 },
                { label: 'Industries', target: 6 },
                { label: 'Blueprints', target: 24 },
                { label: 'Integrations', target: 12 },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    <Counter target={stat.target} suffix="+" />
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDivider fill="#030712" height={60} />

      {/* ═══ CTA ════════════════════════ */}
      <section className="py-28 px-6 bg-stone-50">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Έτοιμοι να οργανώσετε<br />την επιχείρησή σας;
            </h2>
            <p className="text-gray-500 mb-10 max-w-md mx-auto">
              Συνδεθείτε στο AION FLOW και ανακαλύψτε το Operating System της επιχείρησής σας.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <MagneticBtn to="/login">
                Σύνδεση στο AION FLOW <ArrowRight size={16} />
              </MagneticBtn>
              <MagneticBtn to="/dashboard" primary={false}>
                Δείτε Demo <ChevronRight size={16} />
              </MagneticBtn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═════════════════════ */}
      <footer className="py-12 px-6 border-t border-gray-200/60 text-center bg-stone-50">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-cyan-500 rounded flex items-center justify-center">
            <Zap size={11} className="text-white" />
          </div>
          <span className="font-bold text-gray-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION FLOW</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">Το Operating System της επιχείρησής σας.</p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span>Powered by</span>
          <span className="text-gray-500">React</span>
          <span>·</span>
          <span className="text-gray-500">Supabase</span>
          <span>·</span>
          <span className="text-gray-500">Vercel</span>
        </div>
      </footer>
    </div>
  );
}
