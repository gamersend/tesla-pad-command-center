
import React, { useEffect, useRef } from 'react';

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
    const particleCount = config.particleCount || 20; // Reduced for Tesla performance

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
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      ctx.fill();
    });

    // Limit to 30fps for Tesla performance
    setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(animate);
    }, 33);
  };

  const startAnimation = () => {
    animate();
  };

  if (type === 'gradient') {
    const gradientStyle = config.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    return (
      <div
        className="absolute inset-0 -z-10"
        style={{ background: gradientStyle }}
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
