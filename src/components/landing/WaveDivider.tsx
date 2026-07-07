import { useId } from 'react';

interface WaveDividerProps {
  fill: string;
  height?: number;
  flip?: boolean;
}

export default function WaveDivider({ fill, height = 100, flip = false }: WaveDividerProps) {
  const id = useId();

  return (
    <div className={`relative leading-[0] -mb-[1px] ${flip ? '' : ''}`}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height, transform: flip ? 'rotate(180deg) scaleX(-1)' : undefined }}
      >
        <defs>
          <linearGradient id={`wvg-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={fill} stopOpacity="1" />
            <stop offset="50%" stopColor={fill} stopOpacity="0.95" />
            <stop offset="100%" stopColor={fill} stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <path
          d="M0,40 C240,110 480,10 720,60 C960,110 1200,20 1440,60 L1440,120 L0,120 Z"
          fill={`url(#wvg-${id})`}
          className="origin-center"
          style={{ animation: 'waveFloat 4s ease-in-out infinite' }}
        />
      </svg>
    </div>
  );
}
