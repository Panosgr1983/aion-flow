import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Globe, FileText, Image, Users,
  TrendingUp, Activity, Cpu, Building2, HeartHandshake,
  Stethoscope, Hotel, UtensilsCrossed, Scale, ShoppingBag,
  LayoutDashboard, Layers, Shield, BarChart3,
  CheckCircle, Sparkles, Menu, X, ChevronRight,
  ArrowUp, Star
} from 'lucide-react';
import { useParallax } from '../hooks/useParallax';

/* ═══ COSMIC CSS ═══════════════ */
const customCSS = `
  @keyframes cosmicReveal {
    from { opacity: 0; transform: translateY(40px) scale(0.95); filter: blur(12px); }
    to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  }
  @keyframes heroRise {
    from { opacity: 0; transform: translateY(50px) rotateX(10deg); }
    to   { opacity: 1; transform: translateY(0) rotateX(0); }
  }
  @keyframes floatOrbit {
    0%, 100% { transform: translate(0,0) rotate(0deg); }
    25%      { transform: translate(12px,-18px) rotate(3deg); }
    50%      { transform: translate(-8px,-28px) rotate(-2deg); }
    75%      { transform: translate(-16px,-12px) rotate(4deg); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50%      { opacity: 0.8; transform: scale(1.15); }
  }
  @keyframes waveCrash {
    0%   { transform: translateX(-30px) scaleY(1); }
    25%  { transform: translateX(-15px) scaleY(1.1); }
    50%  { transform: translateX(0) scaleY(0.95); }
    75%  { transform: translateX(15px) scaleY(1.05); }
    100% { transform: translateX(30px) scaleY(1); }
  }
  @keyframes levitate {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-10px); }
  }
  @keyframes spinSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes constellationPulse {
    0%, 100% { stroke-opacity: 0.1; }
    50%      { stroke-opacity: 0.4; }
  }
  .cosmic-reveal { animation: cosmicReveal 1s cubic-bezier(.16,1,.3,1) forwards; }
  .hero-rise { animation: heroRise .9s cubic-bezier(.16,1,.3,1) both; }
  .levitate { animation: levitate 6s ease-in-out infinite; }
  .pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
  .card-3d { transition: all 0.4s cubic-bezier(.16,1,.3,1); }
  .card-3d:hover { transform: perspective(1000px) rotateY(2deg) rotateX(-2deg) translateY(-6px); }
  .text-shimmer { background-size: 200% auto; animation: shimmer 4s linear infinite; }
`;

/* ═══ HOOKS ════════════════════ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el); } }, { threshold: 0.06 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, className: vis ? 'cosmic-reveal' : 'opacity-0' };
}

function useImageReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el); } }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, className: vis ? 'cosmic-reveal' : '' };
}

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    };
    const onLeave = () => { el.style.transform = 'perspective(600px) rotateY(0) rotateX(0) translateY(0)'; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);
  return ref;
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, className: anim } = useReveal();
  return <div ref={ref} className={`${anim} ${className}`} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

/* ═══ COMPONENTS ═══════════════ */
function ParallaxBg({ src, speed = 0.12 }: { src: string; speed?: number }) {
  const { ref, style } = useParallax(speed);
  return <div ref={ref as any} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${src})`, ...style }} />;
}

function ParallaxLayer({ speed, children, className = '' }: { speed: number; children: React.ReactNode; className?: string }) {
  const { ref, style } = useParallax(speed);
  return <div ref={ref as any} className={`absolute inset-0 pointer-events-none ${className}`} style={style}>{children}</div>;
}

function CosmicParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    const particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; hue: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 120; i++) stars.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 1.8 + 0.3, speed: Math.random() * 0.3 + 0.05, opacity: Math.random() * 0.8 + 0.2,
    });
    for (let i = 0; i < 30; i++) particles.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1, speedX: (Math.random() - 0.5) * 0.3, speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.3 + 0.05, hue: 200 + Math.random() * 60,
    });
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.y -= s.speed;
        if (s.y < 0) { s.y = canvas.height; s.x = Math.random() * canvas.width; }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity * (0.5 + Math.sin(Date.now() * 0.001 + s.x) * 0.5)})`;
        ctx.fill();
      });
      particles.forEach(p => {
        p.x += p.speedX + Math.sin(Date.now() * 0.001 + p.x) * 0.1;
        p.y += p.speedY + Math.cos(Date.now() * 0.001 + p.y) * 0.1;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue + Date.now() * 0.02 % 360}, 80%, 60%, ${p.opacity})`;
        ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue + Date.now() * 0.02 % 360}, 80%, 60%, ${p.opacity * 0.1})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}

function WaveDividerTop({ fill, height = 60 }: { fill: string; height?: number }) {
  return (
    <div className="relative leading-[0] -mt-[1px] overflow-hidden z-10">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full" style={{ height }}>
        <path d="M0,40 C160,10 320,60 480,35 C640,10 800,55 960,30 C1120,5 1280,50 1440,25 L1440,0 L0,0 Z"
          fill={fill} style={{ animation: 'waveCrash 7s ease-in-out infinite' }} />
        <path d="M0,50 C180,30 360,70 540,45 C720,20 900,65 1080,40 C1260,15 1440,55 1440,35 L1440,0 L0,0 Z"
          fill={fill} opacity="0.3" style={{ animation: 'waveCrash 9s ease-in-out infinite reverse' }} />
      </svg>
    </div>
  );
}

function WaveDividerBottom({ fill, height = 60 }: { fill: string; height?: number }) {
  return (
    <div className="relative leading-[0] -mb-[2px] overflow-hidden z-10">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full" style={{ height }}>
        <path d="M0,25 C160,50 320,10 480,35 C640,60 800,15 960,40 C1120,65 1280,20 1440,45 L1440,80 L0,80 Z"
          fill={fill} style={{ animation: 'waveCrash 7s ease-in-out infinite' }} />
        <path d="M0,35 C180,55 360,20 540,40 C720,60 900,25 1080,45 C1260,65 1440,30 1440,50 L1440,80 L0,80 Z"
          fill={fill} opacity="0.3" style={{ animation: 'waveCrash 9s ease-in-out infinite reverse' }} />
      </svg>
    </div>
  );
}

function MagneticBtn({ to, primary = true, children }: { to: string; primary?: boolean; children: React.ReactNode }) {
  const Tag = to.startsWith('/') ? Link : 'a' as any;
  const props = to.startsWith('/') ? { to } : { href: to };
  return (
    <Tag {...props} className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-medium transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${
      primary
        ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
        : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10 hover:border-white/40 backdrop-blur-sm'
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

/* ═══ DATA ══════════════════════ */
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
  { icon: Stethoscope, label: 'Ψυχολόγος', tags: ['Ιστοσελίδα', 'Blog', 'Κριτικές', 'Πιστοποιήσεις'], img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=60' },
  { icon: HeartHandshake, label: 'Κλινική', tags: ['Ραντεβού', 'Ασθενείς', 'Ιατρικά αρχεία'], img: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=60' },
  { icon: Hotel, label: 'Ξενοδοχείο', tags: ['Κρατήσεις', 'Δωμάτια', 'Κριτικές'], img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=60' },
  { icon: UtensilsCrossed, label: 'Εστιατόριο', tags: ['Μενού', 'Παραγγελίες', 'Κρατήσεις'], img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=60' },
  { icon: Scale, label: 'Δικηγόρος', tags: ['Υποθέσεις', 'Έγγραφα', 'Ημερολόγιο'], img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=60' },
  { icon: ShoppingBag, label: 'Retail', tags: ['Προϊόντα', 'Απόθεμα', 'e-Shop'], img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=60' },
];

const pillars = [
  { icon: Layers,     title: 'Ένα σύστημα, όχι δέκα εφαρμογές',     desc: 'Website, CRM, Analytics, Media και Pipeline σε μία ενιαία πλατφόρμα. Χωρίς εναλλαγές tabs, χωρίς διπλότυπα δεδομένα.' },
  { icon: Sparkles,   title: 'Ξεκινά μικρό, μεγαλώνει μαζί σας',    desc: 'Ενεργοποιείτε μόνο τα modules που χρειάζεστε σήμερα. Προσθέτετε νέα δυνατότητα όταν η επιχείρησή σας μεγαλώνει.' },
  { icon: CheckCircle, title: 'Πραγματικά δεδομένα, πραγματικές αποφάσεις', desc: 'Usage telemetry και real-time analytics σας δείχνουν τι λειτουργεί. Αποφάσεις βασισμένες σε δεδομένα, όχι σε διαίσθηση.' },
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

const sectionIds = ['hero', 'problem', 'platform', 'modules', 'industries', 'growth', 'cta'];

/* ═══ PAGE ══════════════════════ */
export default function LandingPageNewDeathstar() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
    }, { threshold: 0.25 });
    sectionIds.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const docH = typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1;
  const progress = Math.min((scrollY / docH) * 100, 100);
  const navSolid = scrollY > 100;
  const showBackToTop = scrollY > 800;

  useEffect(() => {
    document.title = 'AION FLOW | Deathstar Edition';
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
    { href: '#platform', label: 'Platform' },
    { href: '#modules',  label: 'Modules' },
    { href: '#industries', label: 'Industries' },
    { href: '#growth',   label: 'Growth' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b1e] text-white overflow-x-hidden relative selection:bg-cyan-500/30 selection:text-white">
      <style>{customCSS}</style>

      {/* Glowing Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent">
        <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-500 transition-all duration-150 shadow-[0_0_12px_rgba(6,182,212,0.5)]" style={{ width: `${progress}%` }} />
      </div>

      {/* Cosmic Nav Dots */}
      <nav className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-3">
        {sectionIds.map(id => (
          <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
            className={`rounded-full transition-all duration-500 ${
              activeSection === id
                ? 'w-3 h-3 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.7)] ring-2 ring-cyan-400/30'
                : 'w-2 h-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={id}
          />
        ))}
      </nav>

      {/* Crystal Back to Top */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 size-12 rounded-2xl bg-gradient-to-br from-blue-600/80 to-purple-600/80 border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-500 ${
          showBackToTop ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75 pointer-events-none'
        }`}>
        <ArrowUp size={18} />
      </button>

      {/* ═══ NAVBAR ════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-500 ${
        navSolid
          ? 'bg-[#0a0b1e]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION<span className="text-cyan-400">FLOW</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={scrollTo(l.href)} className="text-sm text-white/50 hover:text-white transition-all hover:tracking-wider">{l.label}</a>
          ))}
          <Link to="/login" className="text-sm text-white/50 hover:text-white transition-colors px-4 py-2">Σύνδεση</Link>
          <Link to="/dashboard" className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-cyan-500/40">
            Δείτε Demo <ArrowRight size={14} />
          </Link>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors text-white/70">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0a0b1e]/95 backdrop-blur-xl pt-20 px-6 md:hidden">
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={scrollTo(l.href)} className="text-lg text-white/70 hover:text-white py-3 border-b border-white/5">{l.label}</a>
            ))}
            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-lg text-white/70 hover:text-white py-3 border-b border-white/5">Σύνδεση</Link>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center font-medium px-5 py-3 rounded-xl mt-4">Δείτε Demo →</Link>
          </div>
        </div>
      )}

      {/* ═══ HERO ═══════════════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center px-6 pt-24 pb-16 overflow-hidden bg-[#0a0b1e]">
        <CosmicParticles />
        <ParallaxLayer speed={-0.05} className="z-[1]">
          <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] right-[30%] w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px]" />
        </ParallaxLayer>
        <ParallaxBg src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=80" speed={0.15} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b1e]/95 via-[#0a0b1e]/80 to-transparent z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b1e] via-transparent to-[#0a0b1e]/30 z-[2]" />

        {/* Orbiting rings */}
        <div className="absolute top-1/2 right-[5%] w-[600px] h-[600px] -translate-y-1/2 z-[2] pointer-events-none hidden lg:block">
          <div className="absolute inset-0 border border-white/[0.03] rounded-full" style={{ animation: 'spinSlow 40s linear infinite' }} />
          <div className="absolute inset-[10%] border border-white/[0.02] rounded-full" style={{ animation: 'spinSlow 30s linear infinite reverse' }} />
          <div className="absolute inset-[20%] border border-cyan-500/[0.04] rounded-full" style={{ animation: 'spinSlow 20s linear infinite' }} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <div key={i} className="absolute w-1.5 h-1.5 bg-cyan-400/30 rounded-full" style={{
              top: `calc(50% + ${300 * Math.cos(deg * Math.PI / 180)}px)`,
              left: `calc(50% + ${300 * Math.sin(deg * Math.PI / 180)}px)`,
            }} />
          ))}
        </div>

        <div className="relative w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur border border-white/10 px-4 py-1.5 text-sm mb-8 text-cyan-300 shadow-sm">
              <Star size={14} />
              <span>Deathstar Edition · Ultimate Platform</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <span className="hero-rise inline-block" style={{ animationDelay: heroReady ? '0s' : '9s', opacity: heroReady ? 1 : 0 }}>Το Operating System</span><br />
              <span className="hero-rise inline-block text-shimmer bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent" style={{ animationDelay: heroReady ? '.15s' : '9s', opacity: heroReady ? 1 : 0 }}>
                της δικής σου
              </span><br />
              <span className="hero-rise inline-block" style={{ animationDelay: heroReady ? '.3s' : '9s', opacity: heroReady ? 1 : 0 }}>επιχείρησης.</span>
            </h1>

            <p className="text-lg text-white/50 mt-6 mb-3 max-w-lg leading-relaxed hero-rise" style={{ animationDelay: heroReady ? '.45s' : '9s', opacity: heroReady ? 1 : 0 }}>
              Σχεδιασμένο γύρω από τον τρόπο που δουλεύεις. <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-medium">Εξελίσσεται</span> μαζί σου.
            </p>
            <p className="text-base text-white/30 mb-10 max-w-md hero-rise" style={{ animationDelay: heroReady ? '.55s' : '9s', opacity: heroReady ? 1 : 0 }}>
              Από διάσπαρτα εργαλεία… σε μία οργανωμένη επιχείρηση.
            </p>

            <div className="flex items-center gap-4 flex-wrap hero-rise" style={{ animationDelay: heroReady ? '.65s' : '9s', opacity: heroReady ? 1 : 0 }}>
              <MagneticBtn to="/login">Σύνδεση <ArrowRight size={16} /></MagneticBtn>
              <MagneticBtn to="/dashboard" primary={false}>Δείτε Demo <ChevronRight size={16} /></MagneticBtn>
            </div>
          </div>

          <div className="relative hero-rise" style={{ animationDelay: heroReady ? '.35s' : '9s', opacity: heroReady ? 1 : 0 }}>
            <div className="absolute -inset-6 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-purple-500/20 rounded-3xl blur-3xl" />
            <div className="relative bg-white/[0.04] backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/10 levitate">
              <div className="flex items-center gap-2 mb-5">
                <div className="size-5 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <LayoutDashboard size={12} className="text-white" />
                </div>
                <span className="text-sm font-medium text-white/80">Platform Overview</span>
                <span className="ml-auto text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">Live</span>
              </div>
              <div className="flex gap-4 mb-5 text-xs flex-wrap">
                {['Website', 'CRM', 'Media', 'Analytics'].map((label, i) => (
                  <span key={label} className={`px-3 py-1 rounded-full ${i === 0 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/5 text-white/50 border border-white/10'}`}>{label}</span>
                ))}
              </div>
              <div className="border-t border-white/5 pt-4 space-y-3">
                {[
                  { icon: Globe, text: 'Σελίδα ενημερώθηκε', time: '2λ πριν' },
                  { icon: Users, text: 'New lead received',   time: '15λ πριν' },
                  { icon: Shield, text: 'Backup completed',    time: '3ω πριν' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <Icon size={12} className="text-cyan-400" />
                      <span className="text-white/60">{item.text}</span>
                      <span className="ml-auto text-white/30 text-xs">{item.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDividerBottom fill="#0a0b1e" height={60} />

      {/* ═══ PROBLEM ════════════════════ */}
      <section id="problem" className="relative py-28 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1128 0%, #1a0a2e 50%, #0a0b1e 100%)' }}>
        <ParallaxLayer speed={-0.08}>
          <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-purple-600/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-blue-600/5 rounded-full blur-[120px]" />
        </ParallaxLayer>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-6xl mx-auto z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Reveal>
                <span className="text-xs font-semibold tracking-[0.25em] text-cyan-400 uppercase mb-4 block">The Problem</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Η επιχείρησή σου δεν χρειάζεται άλλο ένα εργαλείο.
                </h2>
                <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 rounded-full mb-6" />
                <p className="text-white/40 text-base leading-relaxed max-w-md">
                  Χρειάζεται ένα σύστημα που ενώνει όσα ήδη κάνεις: website, περιεχόμενο, πελάτες, επικοινωνία, analytics και ανάπτυξη.
                </p>
              </Reveal>
            </div>

            <div className="relative h-[420px] md:h-[500px]">
              {/* Constellation lines */}
              <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 500 500">
                {problemPills.map((_, i) => {
                  const angle = (i / problemPills.length) * Math.PI * 2;
                  const r = 200; const x = 250 + Math.cos(angle) * r; const y = 250 + Math.sin(angle) * r;
                  const angle2 = ((i + 1) % problemPills.length / problemPills.length) * Math.PI * 2;
                  const x2 = 250 + Math.cos(angle2) * r; const y2 = 250 + Math.sin(angle2) * r;
                  return <line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke="rgba(6,182,212,0.15)" strokeWidth="0.5" style={{ animation: 'constellationPulse 4s ease-in-out infinite' }} />;
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-20 md:size-24 bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30 z-10 pulse-glow">
                  <Zap size={32} className="text-white" />
                </div>
              </div>
              {problemPills.map((pill, i) => {
                const angle = (i / problemPills.length) * Math.PI * 2;
                const rx = 165 + (i % 3) * 12;
                const ry = 180 + (i % 2) * 10;
                return (
                  <div key={pill} className="absolute z-[1] pointer-events-none"
                    style={{
                      left: `calc(50% + ${Math.cos(angle) * rx}px - 40px)`,
                      top: `calc(50% + ${Math.sin(angle) * ry}px - 16px)`,
                      animation: `floatOrbit ${6.5 + (i % 4) * 0.4}s ease-in-out ${i * 0.2}s infinite`,
                    }}>
                    <span className="inline-block px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/50 text-xs font-medium whitespace-nowrap backdrop-blur-sm hover:border-cyan-500/30 hover:text-cyan-300 transition-all">
                      {pill}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <WaveDividerTop fill="#0f1128" height={50} />

      {/* ═══ PLATFORM ═══════════════════ */}
      <section id="platform" className="relative py-28 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0f1128 0%, #0a0b1e 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.25em] text-cyan-400 uppercase mb-3 block">The Platform</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                One Platform. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Built Around Your Business.</span>
              </h2>
              <p className="text-white/40 max-w-2xl mx-auto">
                Η επιχείρησή σου είναι μοναδική. Γιατί να χρησιμοποιεί το ίδιο λογισμικό με όλες;
              </p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={i} delay={i * 150}>
                  <div ref={useTilt()} className="card-3d bg-white/[0.03] border border-white/10 p-7 rounded-2xl backdrop-blur-sm hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 border border-cyan-500/10">
                      <Icon size={22} className="text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-white">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-white/40">{p.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ MODULES ════════════════════ */}
      <section id="modules" className="relative py-28 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0a0b1e 0%, #0f1128 100%)' }}>
        <ParallaxLayer speed={0.06}>
          <div className="absolute top-[30%] right-[20%] w-72 h-72 bg-cyan-500/3 rounded-full blur-[100px]" />
        </ParallaxLayer>
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.25em] text-cyan-400 uppercase mb-3 block">Modules</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Όσα χρειάζεστε, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">τίποτα περισσότερο</span>
              </h2>
              <p className="text-white/40 max-w-xl mx-auto">
                Ενεργοποιείτε μόνο τα modules που θέλετε. Προσθέτετε όταν μεγαλώνετε.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {modules.map((m, i) => {
              const Icon = m.icon;
              return (
                <Reveal key={i} delay={i * 80}>
                  <div className="card-3d bg-white/[0.03] border border-white/[0.06] p-6 rounded-2xl cursor-default backdrop-blur-sm hover:border-cyan-500/20 hover:bg-white/[0.05]">
                    <div className="size-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 border border-cyan-500/10">
                      <Icon size={18} className="text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1 text-white/90">{m.label}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{m.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={200}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { label: 'core modules',  target: 8 },
                { label: 'industry profiles', target: 6 },
                { label: 'blueprint patterns', target: 24 },
                { label: 'integration points', target: 12 },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                    <Counter target={stat.target} />
                  </p>
                  <p className="text-xs text-white/40 mt-1 tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ PARALLAX BAND ═════════════ */}
      <section className="relative py-36 px-6 overflow-hidden">
        <ParallaxBg src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=80" speed={0.10} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b1e]/90 via-[#0f1128]/80 to-[#1a0a2e]/90" />
        <ParallaxLayer speed={-0.05}>
          <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[15%] w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />
        </ParallaxLayer>
        <div className="relative max-w-3xl mx-auto text-center z-10">
          <Reveal>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Η ίδια πλατφόρμα.<br />
              <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Διαφορετικό αποτέλεσμα
              </span>
              <br />
              για κάθε επιχείρηση.
            </h2>
          </Reveal>
        </div>
      </section>

      <WaveDividerTop fill="#0a0b1e" height={50} />

      {/* ═══ INDUSTRIES ═════════════════ */}
      <section id="industries" className="relative py-28 px-6 overflow-hidden bg-[#0a0b1e]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.25em] text-cyan-400 uppercase mb-3 block">Industry Blueprints</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Μία πλατφόρμα. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Κάθε κλάδος.</span>
              </h2>
              <p className="text-white/40 max-w-xl mx-auto">
                Προσαρμόζεται στη δουλειά σου. Δεν αλλάζεις εσύ τη δουλειά σου για να χωρέσει στο λογισμικό.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <Reveal key={i} delay={i * 100}>
                  <div className="card-3d bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-cyan-500/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.08)]">
                    <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url(${ind.img})` }} />
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-cyan-500/10">
                          <Icon size={16} className="text-cyan-400" />
                        </div>
                        <h3 className="font-semibold text-white">{ind.label}</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ind.tags.map((tag, j) => (
                          <span key={j} className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/40 border border-white/5">{tag}</span>
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

      <WaveDividerBottom fill="#0a0b1e" height={50} />

      {/* ═══ GROWTH ═════════════════════ */}
      <section id="growth" className="relative py-28 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1128 0%, #1a0a2e 50%, #0a0b1e 100%)' }}>
        <ParallaxLayer speed={-0.07}>
          <div className="absolute top-[15%] right-[10%] w-80 h-80 bg-purple-600/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] left-[5%] w-60 h-60 bg-cyan-500/5 rounded-full blur-[80px]" />
        </ParallaxLayer>
        <ParallaxBg src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80" speed={0.11} />
        <div className="absolute inset-0 bg-[#0a0b1e]/90 backdrop-blur-[1px]" />

        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08] z-0" viewBox="0 0 1440 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="flowG2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path d="M0,300 C200,100 400,500 720,300 C1040,100 1240,500 1440,300" stroke="url(#flowG2)" strokeWidth="2" fill="none" strokeDasharray="6 12"
            style={{ animation: 'levitate 8s ease-in-out infinite' }} />
          <path d="M0,320 C200,120 400,520 720,320 C1040,120 1240,520 1440,320" stroke="url(#flowG2)" strokeWidth="0.5" fill="none" strokeDasharray="3 8" opacity="0.3"
            style={{ animation: 'levitate 10s ease-in-out infinite reverse' }} />
        </svg>

        <div className="relative max-w-5xl mx-auto z-10">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-[0.25em] text-cyan-400 uppercase mb-3 block">Growth Path</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Εξελίσσεται μαζί με την επιχείρησή σου
              </h2>
              <p className="text-white/40 max-w-xl mx-auto">
                Κάθε στάδιο ξεκλειδώνει νέες δυνατότητες. Εσύ αποφασίζεις πότε.
              </p>
            </div>
          </Reveal>

          <div className="relative max-w-4xl mx-auto">
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 800 400" preserveAspectRatio="none">
              <path d="M100,350 C250,200 400,50 700,80" stroke="url(#flowG2)" strokeWidth="1.5" fill="none" strokeOpacity="0.3" strokeDasharray="4 8"
                style={{ animation: 'constellationPulse 5s ease-in-out infinite' }} />
            </svg>
            <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-4">
              {timelineSteps.map((step, i) => (
                <Reveal key={i} delay={i * 150}>
                  <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-3 relative">
                    <div className={`size-12 md:size-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      i < 3
                        ? 'bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>
                      {i + 1}
                    </div>
                    <div className={`md:text-center ${i % 2 === 0 ? 'md:pt-2' : 'md:pt-16'}`}>
                      <p className="font-semibold text-white text-sm">{step.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{step.sub}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={300}>
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-white/5 pt-12">
              {[
                { label: 'modules', target: 8 },
                { label: 'profiles', target: 6 },
                { label: 'patterns', target: 24 },
                { label: 'integrations', target: 12 },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                    <Counter target={stat.target} />
                  </p>
                  <p className="text-xs text-white/40 mt-1 tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDividerTop fill="#0f1128" height={50} />

      {/* ═══ CTA ════════════════════════ */}
      <section id="cta" className="relative py-32 px-6 overflow-hidden bg-[#0a0b1e]">
        <ParallaxLayer speed={0.08}>
          <div className="absolute top-[30%] left-[20%] w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />
        </ParallaxLayer>
        <div className="relative max-w-3xl mx-auto text-center z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur border border-white/10 px-4 py-1.5 text-sm mb-8 text-cyan-300">
              <Star size={14} />
              <span>Ready for Launch</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Έτοιμοι να οργανώσετε<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                την επιχείρησή σας
              </span>
              <br />σε κοσμικό επίπεδο;
            </h2>
            <p className="text-white/40 mb-10 max-w-md mx-auto">
              Συνδεθείτε στο AION FLOW και ανακαλύψτε το Operating System της επιχείρησής σας.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <MagneticBtn to="/login">Σύνδεση <ArrowRight size={16} /></MagneticBtn>
              <MagneticBtn to="/dashboard" primary={false}>Δείτε Demo <ChevronRight size={16} /></MagneticBtn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═════════════════════ */}
      <footer className="py-12 px-6 border-t border-white/5 text-center bg-[#0a0b1e]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap size={12} className="text-white" />
          </div>
          <span className="font-bold text-white/70" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION<span className="text-cyan-400">FLOW</span></span>
        </div>
        <p className="text-sm text-white/30 mb-4">Deathstar Edition · Το Operating System της επιχείρησής σας.</p>
        <p className="text-xs text-white/20 mb-4">
          © {new Date().getFullYear()} — <a href="https://www.aionweb.gr" target="_blank" rel="noopener noreferrer" className="text-cyan-400/60 hover:text-cyan-400 transition-colors">Παναγιώτης Χολιασμένος</a> — Web Designer & Digital Marketer
        </p>
      </footer>
    </div>
  );
}
