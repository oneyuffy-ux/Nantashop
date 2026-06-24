import { useEffect, useRef } from "react";

interface ParticlesProps {
  type: 'snow' | 'ember' | 'none';
}

export default function Particles({ type }: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type === 'none' || !containerRef.current) return;
    const container = containerRef.current;
    const count = 50;
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 6 + 2;
      const left = Math.random() * 100;
      const delay = Math.random() * 8;
      const duration = Math.random() * 6 + 6;
      const opacity = Math.random() * 0.6 + 0.2;

      p.style.cssText = `
        position: absolute;
        left: ${left}%;
        top: -10px;
        width: ${size}px;
        height: ${size}px;
        border-radius: ${type === 'snow' ? '50%' : '2px'};
        background: ${type === 'snow' ? 'rgba(255,255,255,0.8)' : 'rgba(255,120,20,0.9)'};
        opacity: ${opacity};
        animation: particle-fall ${duration}s ${delay}s linear infinite;
        pointer-events: none;
        transform: ${type === 'ember' ? `rotate(${Math.random() * 360}deg)` : 'none'};
        box-shadow: ${type === 'ember' ? '0 0 4px rgba(255,100,0,0.6)' : 'none'};
      `;
      container.appendChild(p);
      particles.push(p);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, [type]);

  if (type === 'none') return null;

  return (
    <>
      <style>{`
        @keyframes particle-fall {
          0% { transform: translateY(-10px) translateX(0) ${type === 'ember' ? 'rotate(0deg)' : ''}; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(100vh) translateX(${type === 'snow' ? '30px' : '60px'}) ${type === 'ember' ? 'rotate(360deg)' : ''}; opacity: 0; }
        }
      `}</style>
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      />
    </>
  );
}
