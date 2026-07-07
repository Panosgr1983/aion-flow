import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Globe, FileText, Image, Users,
  TrendingUp, Activity, Cpu, Building2, HeartHandshake,
  Stethoscope, Hotel, UtensilsCrossed, Scale, ShoppingBag,
  LayoutDashboard, Layers, Shield, Clock, BarChart3,
  CheckCircle, Sparkles, Menu, X
} from 'lucide-react';
import { useParallax } from '../hooks/useParallax';

/* ─── CUSTOM CSS ─────────────── */
const customCSS = `
  @keyframes particle1 {
    0%, 100% { transform: translate(0,0) rotate(0deg); opacity: .15; }
    25%  { transform: translate(25px,-18px) rotate(90deg); opacity: .25; }
    50%  { transform: translate(-10px,-35px) rotate(180deg); opacity: .1; }
    75%  { transform: translate(-30px,-8px) rotate(270deg); opacity: .2; }
  }
  @keyframes particle2 {
    0%, 100% { transform: translate(0,0) rotate(0deg); opacity: .1; }
    33%  { transform: translate(-22px,-28px) rotate(120deg); opacity: .22; }
    66%  { transform: translate(18px,-12px) rotate(240deg); opacity: .15; }
  }
  @keyframes particle3 {
    0%, 100% { transform: translate(0,0) scale(1); opacity: .08; }
    50%  { transform: translate(-35px,-22px) scale(1.25); opacity: .18; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .reveal-up { animation: fadeSlideUp .8s cubic-bezier(.16,1,.3,1) forwards; }
  .tilt-card {
    transform: perspective(600px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));
    transition: transform .15s ease-out;
  }
`;

/* ─── HOOKS ──────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, className: `${visible ? 'reveal-up' : 'opacity-0'}` };
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, className: anim } = useReveal();
  return <div ref={ref} className={`${anim} ${className}`} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

/* ─── CORE COMPONENTS ────────── */
function ParallaxBg({ src, speed = 0.2 }: { src: string; speed?: number }) {
  const { ref, style } = useParallax(speed);
  return (
    <div
      ref={ref as any}
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${src})`, ...style }}
    />
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
      let cur = 0;
      const inc = target / 40;
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
  { icon: Globe, label: 'Website', desc: 'Περιεχόμενο, σελίδες, SEO' },
  { icon: FileText, label: 'Content', desc: 'Blog, υπηρεσίες, κείμενα' },
  { icon: Image, label: 'Media', desc: 'Εικόνες, gallery, αρχεία' },
  { icon: Users, label: 'CRM', desc: 'Επικοινωνία, leads, πελάτες' },
  { icon: TrendingUp, label: 'Pipeline', desc: 'Πωλήσεις, στάδια, ροή' },
  { icon: BarChart3, label: 'Analytics', desc: 'Μετρήσεις, reports' },
  { icon: Activity, label: 'Automation', desc: 'Email, backups, ροές' },
  { icon: Cpu, label: 'Knowledge', desc: 'Τεκμηρίωση, blueprints' },
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
  { icon: Layers,     title: 'Ένα σύστημα, όχι δέκα εφαρμογές',     desc: 'Website, CRM, Analytics, Media και Pipeline σε μία ενιαία πλατφόρμα. Χωρίς εναλλαγές tabs, χωρίς διπλότυπα δεδομένα.' },
  { icon: Sparkles,   title: 'Ξεκινά μικρό, μεγαλώνει μαζί σας',    desc: 'Ενεργοποιείτε μόνο τα modules που χρειάζεστε σήμερα. Προσθέτετε νέα δυνατότητα όταν η επιχείρησή σας μεγαλώνει.' },
  { icon: CheckCircle, title: 'Πραγματικά δεδομένα, πραγματικές αποφάσεις', desc: 'Usage telemetry και real-time analytics σας δείχνουν τι λειτουργεί. Αποφάσεις βασισμένες σε δεδομένα.' },
];

const badgeData = [
  { icon: LayoutDashboard, label: 'Modular',   count: 8 },
  { icon: Building2,       label: 'Multi-Tenant', count: 99 },
  { icon: Shield,          label: 'Role-based', count: 3 },
  { icon: Clock,           label: 'Real-time',  count: 1 },
  { icon: Activity,        label: 'Telemetry',  count: 24 },
];

const steps = ['Website', 'Customers', 'Operations', 'Growth', 'Insights'];

function genParticles(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 8 + 3, shape: i % 3,
    duration: Math.random() * 4 + 6, delay: Math.random() * 5, anim: (i % 3) + 1,
  }));
}

/* ─── PAGE ───────────────────── */
export default function LandingPageNewV2() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const particles = useMemo(() => genParticles(9), []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const docH = typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1;
  const progress = Math.min((scrollY / docH) * 100, 100);
  const navSolid = scrollY > 80;

  useEffect(() => {
    document.title = 'AION FLOW | Το Operating System της επιχείρησής σας';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Το AION FLOW είναι μια σύγχρονη Business Platform που ενοποιεί website, CRM, περιεχόμενο, analytics και αυτοματισμούς σε ένα σύστημα.';
    document.head.appendChild(meta);
    return () => { document.title = 'AION FLOW Project Merge'; meta.remove(); };
  }, []);

  const tilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - .5) * -10}deg`);
    c.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * 10}deg`);
  }, []);

  const untilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  }, []);

  const scrollTo = useCallback((href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }, []);

  const navLinks = [
    { href: '#platform',   label: 'Platform' },
    { href: '#modules',    label: 'Modules' },
    { href: '#industries', label: 'Industries' },
    { href: '#growth',     label: 'Growth' },
  ];

  const activityFeed = [
    { icon: Globe,  text: 'Σελίδα ενημερώθηκε',  time: '2λ πριν', color: 'text-blue-400' },
    { icon: Users,  text: 'New lead received',    time: '15λ πριν', color: 'text-cyan-400' },
    { icon: Image,  text: 'Media uploaded',       time: '1ω πριν',  color: 'text-emerald-400' },
    { icon: Shield, text: 'Backup completed',      time: '3ω πριν',  color: 'text-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <style>{customCSS}</style>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-gray-200">
        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* ═══ NAVBAR ════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${
        navSolid ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm' : 'bg-transparent'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION FLOW</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={scrollTo(l.href)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l.label}</a>
          ))}
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-4 py-2">Σύνδεση</Link>
          <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
            Δείτε Demo <ArrowRight size={14} />
          </Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={scrollTo(l.href)} className="text-lg text-gray-700 hover:text-gray-900 py-2 border-b border-gray-100">{l.label}</a>
            ))}
            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-lg text-gray-700 hover:text-gray-900 py-2 border-b border-gray-100">Σύνδεση</Link>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="bg-blue-600 text-white text-center font-medium px-5 py-3 rounded-xl mt-4">Δείτε Demo →</Link>
          </div>
        </div>
      )}

      {/* ═══ HERO ═══════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        <ParallaxBg src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80" speed={0.2} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map(p => (
            <div key={p.id} className="absolute bg-white/20"
              style={{
                left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
                borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? '4px' : '0',
                clipPath: p.shape === 2 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
                animation: `particle${p.anim} ${p.duration}s ease-in-out ${p.delay}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative text-center max-w-4xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-500/30 px-4 py-1.5 text-sm mb-8 text-blue-200 backdrop-blur-sm">
            <Cpu size={14} />
            <span>Business Platform · Industry Blueprints</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-white"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Το Operating System<br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              της δικής σου
            </span>
            <br />
            επιχείρησης.
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            Δεν αγοράζεις λογισμικό. Αποκτάς το λειτουργικό σύστημα της επιχείρησής σου.
          </p>
          <p className="text-base text-gray-400 mb-10 max-w-xl mx-auto">
            Από διάσπαρτα εργαλεία… σε μία οργανωμένη επιχείρηση.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/login" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-base border border-white/20 hover:border-white/40">
              Σύνδεση <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="bg-white text-blue-600 hover:bg-gray-100 font-medium px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-base shadow-xl">
              Δείτε Demo →
            </Link>
          </div>

          <div className="mt-16 max-w-lg mx-auto bg-white/5 backdrop-blur-md rounded-2xl p-6 text-left border border-white/10 shadow-2xl"
            style={{ animation: 'fadeSlideUp .8s cubic-bezier(.16,1,.3,1) forwards', animationDelay: '.3s', opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <LayoutDashboard size={14} className="text-blue-400" />
              <span className="text-xs font-medium text-gray-200">Platform Overview</span>
              <span className="ml-auto text-[10px] text-gray-500">Live</span>
            </div>
            <div className="flex gap-3 mb-4 text-xs text-gray-400">
              <span className="text-blue-400">● Website</span>
              <span className="text-cyan-400">● CRM</span>
              <span className="text-emerald-400">● Media</span>
              <span className="text-purple-400">● Analytics</span>
            </div>
            <div className="border-t border-white/10 pt-3 space-y-2">
              <p className="text-[11px] text-gray-500 font-medium mb-2">Live Activity</p>
              {activityFeed.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Icon size={10} className={item.color} />
                    <span className="text-gray-400">{item.text}</span>
                    <span className="ml-auto text-gray-500">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM ═══════════════════ */}
      <section id="platform" className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <ParallaxBg src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=80" speed={0.18} />
        </div>
        <div className="absolute inset-0 bg-white/90" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3 block">The Platform</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                One Platform. Built Around Your Business.
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Η επιχείρησή σου είναι μοναδική. Γιατί να χρησιμοποιεί το ίδιο λογισμικό με όλες;
              </p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={i} delay={i * 150}>
                  <div className="bg-white border border-gray-200/60 p-7 rounded-2xl transition-all duration-300 group hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300">
                      <Icon size={22} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{p.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ MODULES ════════════════════ */}
      <section id="modules" className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <ParallaxBg src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80" speed={0.18} />
        </div>
        <div className="absolute inset-0 bg-gray-950/92" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3 block">Modules</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Όσα χρειάζεστε, τίποτα περισσότερο
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Ενεργοποιείτε μόνο τα modules που θέλετε. Προσθέτετε αργότερα.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modules.map((m, i) => {
              const Icon = m.icon;
              return (
                <Reveal key={i} delay={i * 80}>
                  <div className="tilt-card bg-gray-900/60 border border-gray-800 p-5 rounded-2xl transition-all duration-300 group cursor-default"
                    onMouseMove={tilt} onMouseLeave={untilt}
                  >
                    <div className="size-12 rounded-xl bg-blue-500/15 flex items-center justify-center mb-3 group-hover:bg-blue-500/25 group-hover:scale-110 transition-all duration-300">
                      <Icon size={20} className="text-blue-400" />
                    </div>
                    <h3 className="font-medium text-sm mb-1 text-gray-200">{m.label}</h3>
                    <p className="text-xs text-gray-500">{m.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ INDUSTRIES ═════════════════ */}
      <section id="industries" className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <ParallaxBg src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80" speed={0.15} />
        </div>
        <div className="absolute inset-0 bg-blue-900/90" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest text-blue-300 uppercase mb-3 block">Industry Blueprints</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Μία πλατφόρμα. Κάθε κλάδος.
              </h2>
              <p className="text-blue-200/70 max-w-xl mx-auto">
                Η ίδια πλατφόρμα προσαρμόζεται σε κάθε επάγγελμα.
                Δεν αλλάζεις εσύ τη δουλειά σου για να χωρέσει στο λογισμικό.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <Reveal key={i} delay={i * 100}>
                  <div className="tilt-card bg-white/10 backdrop-blur-sm border border-white/10 p-6 rounded-2xl transition-all duration-300 group hover:bg-white/15"
                    onMouseMove={tilt} onMouseLeave={untilt}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-11 rounded-xl bg-gradient-to-br from-blue-400/30 to-cyan-400/20 flex items-center justify-center">
                        <Icon size={18} className="text-blue-300" />
                      </div>
                      <h3 className="font-semibold text-white">{ind.label}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ind.tags.map((tag, j) => (
                        <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-blue-200/80">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ GROWTH ═════════════════════ */}
      <section id="growth" className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <ParallaxBg src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80" speed={0.18} />
        </div>
        <div className="absolute inset-0 bg-white/90" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3 block">Growth</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Εξελίσσεται μαζί με την επιχείρησή σου
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto mb-12">
                Modules όταν τα χρειάζεστε. Όχι όταν θέλει ο vendor.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
              {badgeData.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div key={i} className="bg-white border border-gray-200/60 p-5 rounded-2xl transition-all duration-300 group hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5">
                    <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                      <Icon size={16} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      <Counter target={b.count} suffix={b.label === 'Multi-Tenant' ? '+' : ''} />
                    </p>
                    <p className="text-xs font-medium text-gray-500 mt-1">{b.label}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="max-w-2xl mx-auto">
              <div className="relative flex items-start justify-between">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center relative z-10">
                    <div className={`size-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                      i < 3 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i + 1}
                    </div>
                    <p className={`text-xs mt-2 ${i < 3 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{step}</p>
                  </div>
                ))}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
                  <div className="h-full w-3/5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA ════════════════════════ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <ParallaxBg src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80" speed={0.12} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

        <div className="relative max-w-3xl mx-auto text-center z-10">
          <Reveal>
            <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-12 md:p-16 rounded-3xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Έτοιμοι να οργανώσετε<br />την επιχείρησή σας;
              </h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Συνδεθείτε στο AION FLOW και ανακαλύψτε το Operating System της επιχείρησής σας.
              </p>
              <Link to="/login" className="inline-flex bg-white text-blue-600 hover:bg-gray-100 font-medium px-10 py-4 rounded-xl transition-all duration-200 items-center gap-2 text-base shadow-2xl">
                Σύνδεση <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═════════════════════ */}
      <footer className="py-12 px-6 border-t border-gray-200/60 text-center bg-white">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded flex items-center justify-center">
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
