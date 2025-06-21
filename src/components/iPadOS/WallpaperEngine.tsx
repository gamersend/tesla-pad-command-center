
import React, { useEffect, useRef } from 'react';
import { useSettingsContext } from '@/contexts/SettingsContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface WallpaperEngineProps {
  type: 'particles' | 'gradient' | 'static';
  config?: any;
}

export const WallpaperEngine: React.FC<WallpaperEngineProps> = ({ type, config = {} }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const { settings } = useSettingsContext();

  useEffect(() => {
    if (type === 'particles') {
      initializeParticles();
      startAnimation();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [type]);

  const initializeParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = config.particleCount || 20;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    particlesRef.current = particles;
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      ctx.fill();
    });

    setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(animate);
    }, 33);
  };

  const startAnimation = () => {
    animate();
  };

  const getBackgroundStyle = () => {
    if (settings.backgroundType === 'custom' && settings.customBackground) {
      return {
        backgroundImage: `url(${settings.customBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    if (settings.backgroundType === 'image' && settings.selectedBackground) {
      const backgroundMap: Record<string, string> = {
        'abstract-waves': '/lovable-uploads/6cef881e-f3cc-4c4f-83bc-ba6968202ef2.png',
        'paint-splash': '/lovable-uploads/ed4ca188-9e67-4812-b3f3-f3afa2f96da9.png',
        'blue-rings': '/lovable-uploads/278b6997-9d39-473d-9953-63e45bab8d96.png',
        'gradient-rings': '/lovable-uploads/eb3197ae-30f4-49a6-8788-de3a11e11dac.png',
        'smooth-curves': '/lovable-uploads/a148493c-11f8-460c-9988-63064b8dbe3b.png',
        'ocean-gradient': '/lovable-uploads/663bb1f7-6b1e-4e68-8401-c06f6bb8ff2d.png',
        'aurora-flow': '/lovable-uploads/f59314fa-336a-4a97-8ee6-12daded4372a.png'
      };
      
      const backgroundUrl = backgroundMap[settings.selectedBackground];
      if (backgroundUrl) {
        return {
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      }
    }
    
    // Default gradient based on settings or fallback
    const gradientStyle = settings.backgroundType === 'gradient' ? 
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
      config.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    return { background: gradientStyle };
  };

  if (type === 'gradient' || settings.backgroundType === 'image' || settings.backgroundType === 'custom') {
    return (
      <div
        className="absolute inset-0 -z-10"
        style={getBackgroundStyle()}
      />
    );
  }

  if (type === 'static') {
    return (
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${config.imageUrl})` }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    />
  );
};
