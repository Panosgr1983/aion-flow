import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Globe, FileText, Image, Users,
  TrendingUp, Activity, Cpu, Building2, HeartHandshake,
  Stethoscope, Hotel, UtensilsCrossed, Scale, ShoppingBag,
  LayoutDashboard, Layers, Shield, BarChart3,
  CheckCircle, Sparkles, Menu, X, ChevronRight,
  ArrowUp, Star, MessageSquare, Phone, FileSpreadsheet,
  Facebook, Instagram, BookOpen, Coffee
} from 'lucide-react';
import { useParallax } from '../hooks/useParallax';

const customCSS = `
  @keyframes cosmicReveal {
    from { opacity: 0; transform: translateY(40px) scale(0.95); filter: blur(12px); }
    to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  }
  @keyframes heroRise {
    from { opacity: 0; transform: translateY(50px) rotateX(8deg); }
    to   { opacity: 1; transform: translateY(0) rotateX(0); }
  }
  @keyframes floatChaos {
    0%, 100% { transform: translate(0,0) rotate(0deg); }
    20%      { transform: translate(8px,-12px) rotate(2deg); }
    40%      { transform: translate(-6px,-20px) rotate(-3deg); }
    60%      { transform: translate(12px,-8px) rotate(1deg); }
    80%      { transform: translate(-10px,-16px) rotate(-1deg); }
  }
  @keyframes floatChaos2 {
    0%, 100% { transform: translate(0,0) rotate(0deg); }
    25%      { transform: translate(-14px,8px) rotate(-4deg); }
    50%      { transform: translate(6px,-12px) rotate(2deg); }
    75%      { transform: translate(-8px,14px) rotate(-2deg); }
  }
  @keyframes floatChaos3 {
    0%, 100% { transform: translate(0,0); }
    33%      { transform: translate(10px,10px); }
    66%      { transform: translate(-8px,-6px); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50%      { opacity: 0.7; transform: scale(1.2); }
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
  @keyframes drawLine {
    from { stroke-dashoffset: 1000; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes fadeGlow {
    0%, 100% { opacity: 0.15; }
    50%      { opacity: 0.35; }
  }
  .cosmic-reveal { animation: cosmicReveal 1s cubic-bezier(.16,1,.3,1) forwards; }
  .hero-rise { animation: heroRise .9s cubic-bezier(.16,1,.3,1) both; }
  .levitate { animation: levitate 6s ease-in-out infinite; }
  .pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
  .card-3d { transition: all 0.4s cubic-bezier(.16,1,.3,1); }
  .card-3d:hover { transform: perspective(1000px) rotateY(2deg) rotateX(-2deg) translateY(-6px); }
  .text-shimmer { background-size: 200% auto; animation: shimmer 4s linear infinite; }
  .float-1 { animation: floatChaos 7s ease-in-out infinite; }
  .float-2 { animation: floatChaos2 9s ease-in-out infinite; }
  .float-3 { animation: floatChaos3 11s ease-in-out infinite; }
  .draw-line { stroke-dasharray: 1000; animation: drawLine 2s ease-out forwards; }
`;

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

function ParallaxBg({ src, speed = 0.12 }: { src: string; speed?: number }) {
  const { ref, style } = useParallax(speed);
  return <div ref={ref as any} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${src})`, ...style }} />;
}

function ParallaxLayer({ speed, children, className = '' }: { speed: number; children: React.ReactNode; className?: string }) {
  const { ref, style } = useParallax(speed);
  return <div ref={ref as any} className={`absolute inset-0 pointer-events-none ${className}`} style={style}>{children}</div>;
}

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    const stars: { x: number; y: number; size: number; speed: number; twinkle: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 150; i++) stars.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      size: Math.random() * 1.8 + 0.2, speed: Math.random() * 0.2 + 0.02, twinkle: Math.random() * 1000,
    });
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.y -= s.speed;
        if (s.y < 0) { s.y = canvas.height; s.x = Math.random() * canvas.width; }
        const glow = 0.3 + Math.sin(Date.now() * 0.002 + s.twinkle) * 0.7;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${glow * (0.3 + s.size / 3)})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}

function WaveDividerBottom({ fill, height = 60 }: { fill: string; height?: number }) {
  return (
    <div className="relative leading-[0] -mb-[1px] overflow-hidden z-10">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full" style={{ height }}>
        <path d="M0,25 C160,50 320,10 480,35 C640,60 800,15 960,40 C1120,65 1280,20 1440,45 L1440,80 L0,80 Z" fill={fill} style={{ animation: 'waveCrash 7s ease-in-out infinite' }} />
        <path d="M0,35 C180,55 360,20 540,40 C720,60 900,25 1080,45 C1260,65 1440,30 1440,50 L1440,80 L0,80 Z" fill={fill} opacity="0.25" style={{ animation: 'waveCrash 9s ease-in-out infinite reverse' }} />
      </svg>
    </div>
  );
}

function WaveDividerTop({ fill, height = 60 }: { fill: string; height?: number }) {
  return (
    <div className="relative leading-[0] -mt-[1px] overflow-hidden z-10">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full" style={{ height }}>
        <path d="M0,40 C160,10 320,60 480,35 C640,10 800,55 960,30 C1120,5 1280,50 1440,25 L1440,0 L0,0 Z" fill={fill} style={{ animation: 'waveCrash 7s ease-in-out infinite' }} />
        <path d="M0,50 C180,30 360,70 540,45 C720,20 900,65 1080,40 C1260,15 1440,55 1440,35 L1440,0 L0,0 Z" fill={fill} opacity="0.25" style={{ animation: 'waveCrash 9s ease-in-out infinite reverse' }} />
      </svg>
    </div>
  );
}

function MagneticBtn({ to, primary = true, children }: { to: string; primary?: boolean; children: React.ReactNode }) {
  const Tag = to.startsWith('/') ? Link : 'a' as any;
  const props = to.startsWith('/') ? { to } : { href: to };
  return (
    <Tag {...props} className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-medium transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${
      primary
        ? 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
        : 'bg-white/5 text-white/70 border border-white/15 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm'
    }`}>
      {children}
    </Tag>
  );
}

const sectionIds = ['chaos', 'not-your-fault', 'recognize', 'reveal', 'day-with-aion', 'transformation', 'what-not', 'built-on-you', 'cockpit', 'evolution', 'future'];

const chaosTools = [
  { icon: MessageSquare, label: 'Messenger', color: '#0084ff', anim: 'float-1', x: '8%', y: '22%', size: 'text-2xl', delay: '0s' },
  { icon: MailIcon, label: 'Email', color: '#ea4335', anim: 'float-2', x: '72%', y: '15%', size: 'text-2xl', delay: '0.3s' },
  { icon: FileSpreadsheet, label: 'Excel', color: '#34a853', anim: 'float-3', x: '85%', y: '55%', size: 'text-2xl', delay: '0.6s' },
  { icon: FileText, label: 'Word', color: '#4285f4', anim: 'float-1', x: '15%', y: '65%', size: 'text-2xl', delay: '0.9s' },
  { icon: Facebook, label: 'Facebook', color: '#1877f2', anim: 'float-2', x: '60%', y: '75%', size: 'text-2xl', delay: '0.4s' },
  { icon: Instagram, label: 'Instagram', color: '#e4405f', anim: 'float-3', x: '45%', y: '10%', size: 'text-2xl', delay: '0.7s' },
  { icon: Phone, label: 'Τηλέφωνα', color: '#34a853', anim: 'float-1', x: '25%', y: '40%', size: 'text-2xl', delay: '0.2s' },
  { icon: BookOpen, label: 'Σημειώσεις', color: '#f9ab00', anim: 'float-2', x: '75%', y: '40%', size: 'text-2xl', delay: '0.5s' },
];

function MailIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const industries = [
  { label: 'Ψυχολόγος', desc: 'Χάνεις χρόνο σε τηλεφωνήματα.', icon: Stethoscope },
  { label: 'Ξενοδοχείο', desc: 'Οι κρατήσεις είναι παντού.', icon: Hotel },
  { label: 'Εστιατόριο', desc: 'Οι παραγγελίες χάνονται σε χαρτάκια.', icon: UtensilsCrossed },
  { label: 'Λογιστής', desc: 'Τα email δεν τελειώνουν ποτέ.', icon: Scale },
  { label: 'Retail', desc: 'Ψάχνεις προϊόντα σε Excel.', icon: ShoppingBag },
  { label: 'Κομμωτής', desc: 'Ξεχνάς ραντεβού.', icon: Sparkles },
  { label: 'Δικηγόρος', desc: 'Τα αρχεία είναι διάσπαρτα.', icon: Building2 },
  { label: 'Σύμβουλος', desc: 'Ο χρόνος σου δεν φτάνει.', icon: HeartHandshake },
];

const evolutionSteps = [
  { label: 'Website', icon: Globe },
  { label: '+ CRM', icon: Users },
  { label: '+ Analytics', icon: BarChart3 },
  { label: '+ Automation', icon: Activity },
  { label: '+ AI', icon: Cpu },
];

export default function LandingPageNewSales() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [heroReady, setHeroReady] = useState(false);
  const [revealTriggered, setRevealTriggered] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 200); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setRevealTriggered(true); },
      { threshold: 0.15 }
    );
    const el = document.getElementById('reveal-section');
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
    }, { threshold: 0.25 });
    sectionIds.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const docH = typeof document !== 'undefined' ? document.body.scrollHeight - window.innerHeight : 1;
  const progress = Math.min((scrollY / docH) * 100, 100);
  const navSolid = scrollY > 180;
  const showBackToTop = scrollY > 800;

  useEffect(() => {
    document.title = 'AION FLOW | Η επιχείρησή σου, επιτέλους οργανωμένη.';
  }, []);

  const scrollTo = useCallback((href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }, []);

  const navLinks = [
    { href: '#not-your-fault', label: 'Το πρόβλημα' },
    { href: '#reveal', label: 'Η λύση' },
    { href: '#day-with-aion', label: 'Η μέρα σου' },
    { href: '#cockpit', label: 'Το μέλλον' },
  ];

  /* ─── Dashboard metrics ─── */
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 500); return () => clearTimeout(t); }, []);

  return (
    <div className="min-h-screen bg-[#08091a] text-white overflow-x-hidden relative selection:bg-cyan-500/20 selection:text-white">
      <style>{customCSS}</style>

      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent">
        <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-500 transition-all duration-150 shadow-[0_0_10px_rgba(6,182,212,0.4)]" style={{ width: `${progress}%` }} />
      </div>

      {/* Nav Dots */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-2.5">
        {sectionIds.map(id => (
          <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
            className={`rounded-full transition-all duration-500 ${
              activeSection === id
                ? 'w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)] ring-2 ring-cyan-400/30'
                : 'w-1.5 h-1.5 bg-white/15 hover:bg-white/35'
            }`}
            aria-label={id}
          />
        ))}
      </nav>

      {/* Back to Top */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 size-11 rounded-xl bg-gradient-to-br from-blue-600/70 to-purple-600/70 border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center justify-center text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-500 ${
          showBackToTop ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75 pointer-events-none'
        }`}>
        <ArrowUp size={16} />
      </button>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-500 ${
        navSolid ? 'bg-[#08091a]/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white/70" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION</span>
        </div>
        <div className="hidden md:flex items-center gap-5">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={scrollTo(l.href)} className="text-xs text-white/40 hover:text-white/80 transition-all tracking-wider uppercase">{l.label}</a>
          ))}
          <Link to="/login" className="text-xs text-white/40 hover:text-white/80 transition-colors px-3 py-1.5 uppercase tracking-wider">Σύνδεση</Link>
          <Link to="/dashboard" className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.03] uppercase tracking-wider">
            Θέλω να δω <ArrowRight size={12} />
          </Link>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#08091a]/95 backdrop-blur-xl pt-20 px-6 md:hidden">
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={scrollTo(l.href)} className="text-base text-white/60 hover:text-white py-3 border-b border-white/5">{l.label}</a>
            ))}
            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-base text-white/60 hover:text-white py-3 border-b border-white/5">Σύνδεση</Link>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center font-medium px-5 py-3 rounded-lg mt-4">Θέλω να δω →</Link>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          ACT 1 — CHAOS
          ═══════════════════════════════════════ */}
      <section id="chaos" className="relative min-h-screen flex items-center px-6 pt-20 pb-16 overflow-hidden bg-[#08091a]">
        <Starfield />
        <ParallaxLayer speed={-0.06}>
          <div className="absolute top-[15%] left-[10%] w-80 h-80 bg-blue-600/4 rounded-full blur-[100px]" />
          <div className="absolute bottom-[25%] right-[15%] w-96 h-96 bg-purple-600/4 rounded-full blur-[120px]" />
        </ParallaxLayer>

        {/* Floating chaos tools */}
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          {chaosTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <div
                key={i}
                className={`absolute ${tool.anim} opacity-60 hover:opacity-100 transition-opacity duration-500`}
                style={{ left: tool.x, top: tool.y, animationDelay: tool.delay }}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md flex items-center justify-center" style={{ borderColor: `${tool.color}20` }}>
                    <Icon size={22} className="md:w-[26px] md:h-[26px]" style={{ color: tool.color }} />
                  </div>
                  <span className="text-[10px] text-white/30 tracking-wider uppercase">{tool.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="hero-rise" style={{ animationDelay: heroReady ? '0s' : '9s', opacity: heroReady ? 1 : 0 }}>
            <p className="text-sm md:text-base text-white/30 tracking-[0.3em] uppercase mb-8">
              ACT I · The Problem
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white/90" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Η επιχείρησή σου λειτουργεί…
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mt-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ή απλώς προσπαθεί να προλάβει<br />την καθημερινότητα;
            </h2>
          </div>

          <div className="hero-rise mt-12" style={{ animationDelay: heroReady ? '.5s' : '9s', opacity: heroReady ? 1 : 0 }}>
            <p className="text-white/25 text-sm max-w-xl mx-auto leading-relaxed tracking-wide">
              Scroll για να δεις την εικόνα που ζεις κάθε μέρα.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center p-1.5">
                <div className="w-1 h-2 rounded-full bg-cyan-400/50" style={{ animation: 'levitate 2s ease-in-out infinite' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaveDividerBottom fill="#08091a" height={50} />

      {/* ═══════════════════════════════════════
          ACT 2 — IT'S NOT YOUR FAULT
          ═══════════════════════════════════════ */}
      <section id="not-your-fault" className="relative py-28 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0c0d24 0%, #11071f 50%, #08091a 100%)' }}>
        <ParallaxLayer speed={-0.05}>
          <div className="absolute top-[30%] right-[10%] w-72 h-72 bg-purple-600/5 rounded-full blur-[100px]" />
        </ParallaxLayer>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Reveal>
            <p className="text-xs text-cyan-400/60 tracking-[0.3em] uppercase mb-6">ACT II · Η Αλήθεια</p>
            <div className="space-y-6">
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light">
                Οι περισσότερες επιχειρήσεις <span className="text-red-400/60">δεν</span> έχουν πρόβλημα
              </p>
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed font-light">
                επειδή οι άνθρωποί τους <span className="text-red-400/60">δεν δουλεύουν αρκετά</span>.
              </p>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mx-auto my-8" />
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-medium">
                Έχουν πρόβλημα επειδή οι πληροφορίες<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-semibold">βρίσκονται παντού</span>.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDividerTop fill="#0c0d24" height={40} />

      {/* ═══════════════════════════════════════
          ACT 2b — RECOGNIZE YOUR BUSINESS
          ═══════════════════════════════════════ */}
      <section id="recognize" className="relative py-24 px-6 overflow-hidden bg-[#08091a]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-xs text-white/20 tracking-[0.3em] uppercase mb-4">Αναγνωρίζεις την επιχείρησή σου;</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white/80" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Αν είσαι…
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <Reveal key={i} delay={i * 80}>
                  <div className="card-3d bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-cyan-500/20 hover:bg-white/[0.04]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center border border-cyan-500/10">
                        <Icon size={14} className="text-cyan-400" />
                      </div>
                      <h3 className="font-semibold text-sm text-white/80">{ind.label}</h3>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">«{ind.desc}»</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <WaveDividerBottom fill="#08091a" height={50} />

      {/* ═══════════════════════════════════════
          ACT 3 — THE REVEAL
          ═══════════════════════════════════════ */}
      <section id="reveal-section" className="relative py-32 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #08091a 0%, #0c0d24 50%, #08091a 100%)' }}>
        <ParallaxLayer speed={0.05}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.06)_0%,_transparent_60%)]" />
        </ParallaxLayer>

        {/* Animated connecting lines — appear on scroll */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-30" viewBox="0 0 1440 600" preserveAspectRatio="none">
          {revealTriggered && (
            <>
              <path d="M200,100 C300,200 400,300 720,300" stroke="#3b82f6" strokeWidth="1.5" fill="none" className="draw-line" style={{ animationDelay: '0.2s' }} />
              <path d="M1200,150 C1000,250 800,300 720,300" stroke="#06b6d4" strokeWidth="1.5" fill="none" className="draw-line" style={{ animationDelay: '0.5s' }} />
              <path d="M100,400 C250,350 500,320 720,300" stroke="#8b5cf6" strokeWidth="1.5" fill="none" className="draw-line" style={{ animationDelay: '0.8s' }} />
              <path d="M1300,450 C1100,380 900,330 720,300" stroke="#3b82f6" strokeWidth="1" fill="none" className="draw-line" style={{ animationDelay: '1.1s' }} />
              <path d="M400,500 C500,400 600,350 720,300" stroke="#06b6d4" strokeWidth="1" fill="none" className="draw-line" style={{ animationDelay: '1.4s' }} />
            </>
          )}
        </svg>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal>
            <p className="text-xs text-white/20 tracking-[0.3em] uppercase mb-8">ACT III · Η Αποκάλυψη</p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-light text-white/60 mb-10 leading-relaxed">
              Υπάρχει <span className="text-white font-medium">καλύτερος τρόπος</span>.
            </p>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mb-10" />
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 rounded-md flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Zap size={14} className="text-white" />
              </div>
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Το όνομά του είναι AION.
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDividerTop fill="#0c0d24" height={50} />

      {/* ═══════════════════════════════════════
          ACT 4 — A DAY WITH AION
          ═══════════════════════════════════════ */}
      <section id="day-with-aion" className="relative py-28 px-6 overflow-hidden bg-[#0c0d24]">
        <ParallaxLayer speed={-0.04}>
          <div className="absolute top-[20%] left-[15%] w-64 h-64 bg-cyan-500/4 rounded-full blur-[100px]" />
        </ParallaxLayer>
        <div className="max-w-4xl mx-auto relative z-10">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-xs text-cyan-400/60 tracking-[0.3em] uppercase mb-4">Μία ημέρα με το AION</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Πώς ξεκινά το πρωί σου<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">όταν όλα λειτουργούν μαζί</span>
              </h2>
            </div>
          </Reveal>

          <div className="space-y-6">
            {[
              { time: '08:30', icon: Coffee, title: 'Ανοίγεις τον υπολογιστή.', desc: 'Χωρίς panic. Χωρίς 10 tabs ανοιχτά. Χωρίς να θυμάσαι τι έπρεπε να κάνεις.' },
              { time: '08:31', icon: Zap, title: 'Το AION ήδη γνωρίζει τι έγινε.', desc: 'Τα μηνύματα, οι κρατήσεις, τα email — όλα συγκεντρωμένα.' },
              { time: '08:32', icon: CheckCircle, title: 'Βλέπεις την εικόνα.', desc: '✓ 2 νέοι πελάτες  ✓ 3 νέα μηνύματα  ✓ 1 κράτηση  ✓ 1 προσφορά που έληγε.' },
              { time: '08:35', icon: Sparkles, title: 'Ξεκινάς να δουλεύεις.', desc: 'Όχι να ψάχνεις. Όχι να θυμάσαι. Όχι να αλλάζεις εφαρμογές.' },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={i} delay={i * 150}>
                  <div className="flex items-start gap-5 md:gap-8 group">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:border-cyan-400/40 transition-all">
                        <span className="text-xs font-bold text-cyan-400">{step.time}</span>
                      </div>
                      {i < 3 && <div className="w-px h-8 bg-gradient-to-b from-cyan-500/20 to-transparent" />}
                    </div>
                    <div className="pt-1.5 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={14} className="text-cyan-400/60" />
                        <h3 className="text-sm font-semibold text-white/90">{step.title}</h3>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={300}>
            <div className="mt-12 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm text-center">
              <p className="text-sm text-white/60 leading-relaxed font-light">
                «Δεν άνοιξες email. Δεν μπήκες Facebook. Δεν έψαξες σε Excel.
              </p>
              <p className="text-sm text-white/80 font-medium mt-1">
                Όλα είναι ήδη εκεί.»
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDividerBottom fill="#0c0d24" height={40} />

      {/* ═══════════════════════════════════════
          ACT 4b — TRANSFORMATION (Before / After)
          ═══════════════════════════════════════ */}
      <section id="transformation" className="relative py-28 px-6 overflow-hidden bg-[#08091a]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-xs text-white/20 tracking-[0.3em] uppercase mb-4">Πριν · Μετά</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Από το χάος…<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">στο κέντρο ελέγχου</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Before */}
            <Reveal>
              <div className="rounded-xl border border-red-500/10 bg-red-500/[0.02] p-6 md:p-8">
                <p className="text-xs text-red-400/60 tracking-[0.2em] uppercase mb-6">Σήμερα</p>
                <div className="space-y-4">
                  {[
                    { icon: MessageSquare, label: 'Messenger', color: '#0084ff' },
                    { icon: MailIcon, label: 'Email', color: '#ea4335' },
                    { icon: FileSpreadsheet, label: 'Excel', color: '#34a853' },
                    { icon: BookOpen, label: 'Σημειώσεις', color: '#f9ab00' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <Icon size={14} style={{ color: item.color }} />
                        <span className="text-sm text-white/50">{item.label}</span>
                        <span className="ml-auto text-xs text-red-400/40">✕ Ξεχωριστά</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* After */}
            <Reveal delay={150}>
              <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.03] p-6 md:p-8">
                <p className="text-xs text-cyan-400/60 tracking-[0.2em] uppercase mb-6">Με το AION</p>
                <div className="space-y-4">
                  {[
                    { icon: LayoutDashboard, label: 'AION FLOW' },
                    { icon: CheckCircle, label: 'Όλα σε ένα σημείο' },
                    { icon: CheckCircle, label: 'Αυτόματη οργάνωση' },
                    { icon: CheckCircle, label: 'Κανένα διπλότυπο' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <Icon size={14} className="text-cyan-400" />
                        <span className="text-sm text-white/80">{item.label}</span>
                        <span className="ml-auto text-xs text-cyan-400/50">✓</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <div className="text-center mt-10">
              <p className="text-sm text-white/40 max-w-xl mx-auto font-light">
                Δεν χρειάζεται να αλλάξεις τον τρόπο που δουλεύεις.
              </p>
              <p className="text-base text-white/80 font-medium mt-1">
                Το AION προσαρμόζεται σε εσένα. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Όχι το αντίστροφο.</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDividerTop fill="#08091a" height={40} />

      {/* ═══════════════════════════════════════
          ACT 4c — WHAT AION IS NOT
          ═══════════════════════════════════════ */}
      <section id="what-not" className="relative py-24 px-6 overflow-hidden bg-[#08091a]">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <p className="text-xs text-white/20 tracking-[0.3em] uppercase mb-6">Τι ΔΕΝ είναι το AION</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {[
                'Δεν είναι ακόμα ένα CRM.',
                'Δεν είναι ακόμα ένα website builder.',
                'Δεν είναι ακόμα μία εφαρμογή.',
                'Δεν θα σου ζητήσει να αλλάξεις τον τρόπο που δουλεύεις.',
                'Δεν θα σε γεμίσει λειτουργίες που δεν χρειάζεσαι.',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-red-400/40 mt-0.5">✕</span>
                  <span className="text-sm text-white/50">{text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDividerBottom fill="#08091a" height={40} />

      {/* ═══════════════════════════════════════
          ACT 4d — BUILT ON YOU (Trust)
          ═══════════════════════════════════════ */}
      <section id="built-on-you" className="relative py-24 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0c0d24 0%, #08091a 100%)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <p className="text-xs text-cyan-400/60 tracking-[0.3em] uppercase mb-6">Χτίζεται πάνω στην επιχείρησή σου</p>
            <h2 className="text-xl md:text-2xl font-bold text-white/80 mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Δεν έχει σημασία αν είσαι…
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {industries.map((ind, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-white/50 hover:border-cyan-500/20 hover:text-cyan-300 transition-all">
                  {ind.label}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="max-w-2xl mx-auto p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-sm text-white/60 leading-relaxed font-light">
                «Δεν αλλάζεις τον τρόπο που δουλεύεις.
              </p>
              <p className="text-base text-white/90 font-medium mt-1">
                Το AION προσαρμόζεται σε εσένα.»
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDividerTop fill="#0c0d24" height={50} />

      {/* ═══════════════════════════════════════
          ACT 5 — THE COCKPIT (Reward)
          ═══════════════════════════════════════ */}
      <section id="cockpit" className="relative py-28 px-6 overflow-hidden bg-[#0c0d24]">
        <ParallaxLayer speed={0.04}>
          <div className="absolute top-[10%] right-[20%] w-96 h-96 bg-cyan-500/4 rounded-full blur-[120px]" />
        </ParallaxLayer>
        <div className="max-w-5xl mx-auto relative z-10">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-xs text-cyan-400/60 tracking-[0.3em] uppercase mb-4">Το Κέντρο Ελέγχου</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Δεν αγοράζεις άλλη μία εφαρμογή.
              </h2>
              <p className="text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 font-bold mt-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Χτίζεις το κέντρο ελέγχου της επιχείρησής σου.
              </p>
            </div>
          </Reveal>

          {/* Big Dashboard */}
          <Reveal delay={150}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-purple-500/15 rounded-2xl blur-2xl" />
              <div className="relative bg-white/[0.04] backdrop-blur-2xl rounded-2xl p-6 md:p-8 border border-white/[0.08] shadow-2xl overflow-hidden">
                {/* Dashboard header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="size-5 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <LayoutDashboard size={11} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-white/70">AION Control Center</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
                    <span className="text-[10px] text-white/30">Live</span>
                  </div>
                </div>

                {/* Dashboard grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Πελάτες', value: ready ? '247' : '—', change: '+12', color: 'from-blue-500 to-cyan-500' },
                    { label: 'Μηνύματα', value: ready ? '18' : '—', change: '+5', color: 'from-cyan-500 to-teal-500' },
                    { label: 'Κρατήσεις', value: ready ? '9' : '—', change: '+3', color: 'from-purple-500 to-pink-500' },
                    { label: 'Σελίδες', value: ready ? '14' : '—', change: '+2', color: 'from-amber-500 to-orange-500' },
                  ].map((m, i) => (
                    <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                      <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">{m.label}</p>
                      <p className="text-xl md:text-2xl font-bold text-white">{m.value}</p>
                      <span className={`text-[10px] text-green-400/60`}>{m.change} αύξηση</span>
                    </div>
                  ))}
                </div>

                {/* Activity feed rows */}
                <div className="space-y-2">
                  {[
                    { icon: Globe, text: 'Νέα σελίδα δημοσιεύτηκε', time: '2λ πριν', color: 'text-blue-400' },
                    { icon: Users, text: 'Νέο lead από website', time: '15λ πριν', color: 'text-cyan-400' },
                    { icon: Image, text: 'Media gallery ενημερώθηκε', time: '1ω πριν', color: 'text-purple-400' },
                    { icon: Shield, text: 'Αυτόματο backup — ολοκληρώθηκε', time: '3ω πριν', color: 'text-green-400' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
                        <Icon size={12} className={`${item.color} shrink-0`} />
                        <span className="text-xs text-white/60 flex-1">{item.text}</span>
                        <span className="text-[10px] text-white/20">{item.time}</span>
                        <span className="text-[10px] text-cyan-400/50">✓</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDividerBottom fill="#0c0d24" height={50} />

      {/* ═══════════════════════════════════════
          ACT 5b — EVOLUTION
          ═══════════════════════════════════════ */}
      <section id="evolution" className="relative py-28 px-6 overflow-hidden bg-[#08091a]">
        <ParallaxLayer speed={-0.05}>
          <div className="absolute bottom-[10%] left-[10%] w-80 h-80 bg-purple-600/4 rounded-full blur-[100px]" />
        </ParallaxLayer>
        <div className="max-w-4xl mx-auto relative z-10">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-xs text-white/20 tracking-[0.3em] uppercase mb-4">Evolution</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Ξεκινάς με όσα χρειάζεσαι σήμερα.
              </h2>
              <p className="text-sm text-white/40 mt-3 max-w-lg mx-auto">
                Μεγαλώνεις όταν είσαι έτοιμος. Χωρίς επιπλέον κόστος. Χωρίς αναγκαστικές αναβαθμίσεις.
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6 md:gap-3">
            {evolutionSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={i} delay={i * 120}>
                  <div className="flex md:flex-col items-center gap-3 md:gap-2">
                    <div className={`size-12 md:size-14 rounded-xl flex items-center justify-center shrink-0 ${
                      i < 2
                        ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/25 text-cyan-400 shadow-lg shadow-cyan-500/10'
                        : 'bg-white/[0.03] border border-white/[0.06] text-white/30'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div className="md:text-center">
                      <p className={`text-sm font-semibold ${i < 2 ? 'text-white/90' : 'text-white/40'}`}>{step.label}</p>
                    </div>
                    {i < evolutionSteps.length - 1 && (
                      <div className="hidden md:block w-8 h-px bg-gradient-to-r from-cyan-500/30 to-transparent mb-4" />
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={300}>
            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-white/40">
                <Sparkles size={12} className="text-cyan-400" />
                Δεν πληρώνεις για όσα δεν χρειάζεσαι σήμερα.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDividerTop fill="#08091a" height={50} />

      {/* ═══════════════════════════════════════
          ACT 6 — THE FUTURE (CTA)
          ═══════════════════════════════════════ */}
      <section id="future" className="relative py-36 px-6 overflow-hidden bg-[#08091a]">
        <ParallaxLayer speed={0.06}>
          <div className="absolute top-[20%] left-[30%] w-96 h-96 bg-cyan-500/4 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-purple-500/4 rounded-full blur-[100px]" />
        </ParallaxLayer>
        <Starfield />
        <div className="relative max-w-3xl mx-auto text-center z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.03] border border-white/[0.06] px-4 py-1.5 text-xs text-cyan-300/60 mb-8 backdrop-blur-sm">
              <Star size={12} />
              <span>Το ταξίδι ξεκινά τώρα</span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white/90 leading-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Πώς θα ήταν η ζωή σου…
            </h2>
            <p className="text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 font-medium mb-10" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              αν κάθε πρωί ήξερες ακριβώς τι πρέπει να κάνεις;
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <MagneticBtn to="/dashboard">
                Θέλω να δω πώς θα ήταν η επιχείρησή μου με το AION <ArrowRight size={16} />
              </MagneticBtn>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5 text-center bg-[#08091a]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 rounded flex items-center justify-center shadow-lg shadow-cyan-500/15">
            <Zap size={11} className="text-white" />
          </div>
          <span className="font-bold text-white/50 text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AION</span>
        </div>
        <p className="text-xs text-white/20 max-w-md mx-auto mb-4">
          Η επιχείρησή σου. Επιτέλους οργανωμένη.
        </p>
        <p className="text-[10px] text-white/15">
          © {new Date().getFullYear()} — <a href="https://www.aionweb.gr" target="_blank" rel="noopener noreferrer" className="text-cyan-400/40 hover:text-cyan-400 transition-colors">Παναγιώτης Χολιασμένος</a> — Web Designer & Digital Marketer
        </p>
      </footer>
    </div>
  );
}
