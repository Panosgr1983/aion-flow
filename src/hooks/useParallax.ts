import { useRef, useEffect, useState } from 'react';

export function useParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el!.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const center = rect.top + rect.height / 2;
        const offset = (center - viewportH / 2) * speed;
        setStyle({ transform: `translate3d(0, ${offset}px, 0)` });
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return { ref, style };
}
