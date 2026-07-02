'use client';

import * as React from 'react';

interface GenerativeVisualizerProps {
  seed: number;
  mood: 'Wonder' | 'Eerie' | 'Calm' | 'Chaos' | 'Vague';
  isPlaying?: boolean;
}

export function GenerativeVisualizer({ seed, mood, isPlaying = true }: GenerativeVisualizerProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    // Seed-based random generator to ensure reproducible visuals
    function randomFromSeed(s: number) {
      const x = Math.sin(s++) * 10000;
      return x - Math.floor(x);
    }

    // Set particle parameters based on mood and seed
    let particleCount = 120;
    let speedMultiplier = 1;
    let connectionDistance = 80;
    let colorPalette: string[] = [];

    switch (mood) {
      case 'Wonder':
        colorPalette = ['#d2bbff', '#7c3aed', '#22d3ee', '#ec4899'];
        particleCount = 140;
        speedMultiplier = 0.6;
        connectionDistance = 100;
        break;
      case 'Calm':
        colorPalette = ['#adc6ff', '#22d3ee', '#6366f1', '#e5e1e4'];
        particleCount = 100;
        speedMultiplier = 0.3;
        connectionDistance = 120;
        break;
      case 'Eerie':
        colorPalette = ['#4f46e5', '#3f008e', '#09090b', '#f9bd22'];
        particleCount = 80;
        speedMultiplier = 0.5;
        connectionDistance = 70;
        break;
      case 'Chaos':
        colorPalette = ['#ec4899', '#7c3aed', '#f9bd22', '#ffb4ab'];
        particleCount = 200;
        speedMultiplier = 1.8;
        connectionDistance = 60;
        break;
      case 'Vague':
        colorPalette = ['#e5e1e4', '#958da1', '#4a4455', '#adc6ff'];
        particleCount = 60;
        speedMultiplier = 0.2;
        connectionDistance = 150;
        break;
      default:
        colorPalette = ['#d2bbff', '#22d3ee', '#e5e1e4'];
    }

    // Initialize particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      phase: number;
    }> = [];

    let currentSeed = seed;
    for (let i = 0; i < particleCount; i++) {
      const rx = randomFromSeed(currentSeed++);
      const ry = randomFromSeed(currentSeed++);
      const rAngle = randomFromSeed(currentSeed++) * Math.PI * 2;
      const rSpeed = (randomFromSeed(currentSeed++) * 0.8 + 0.2) * speedMultiplier;
      const rRadius = randomFromSeed(currentSeed++) * 3 + 1;
      const colorIndex = Math.floor(randomFromSeed(currentSeed++) * colorPalette.length);

      particles.push({
        x: rx * width,
        y: ry * height,
        vx: Math.cos(rAngle) * rSpeed,
        vy: Math.sin(rAngle) * rSpeed,
        radius: rRadius,
        color: colorPalette[colorIndex],
        phase: randomFromSeed(currentSeed++) * Math.PI * 2
      });
    }

    let time = 0;

    const render = () => {
      if (!ctx || !canvas) return;

      // Create beautiful fluid fade trail for dynamic vector motion
      ctx.fillStyle = 'rgba(9, 9, 11, 0.15)';
      ctx.fillRect(0, 0, width, height);

      time += 0.01;

      // Draw subtle glowing background auroras
      const grad = ctx.createRadialGradient(
        width / 2 + Math.sin(time * 0.5) * 100,
        height / 2 + Math.cos(time * 0.3) * 100,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
      );
      
      if (mood === 'Wonder') {
        grad.addColorStop(0, 'rgba(124, 58, 237, 0.04)');
        grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.02)');
        grad.addColorStop(1, 'rgba(9, 9, 11, 0)');
      } else if (mood === 'Calm') {
        grad.addColorStop(0, 'rgba(34, 211, 238, 0.04)');
        grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.02)');
        grad.addColorStop(1, 'rgba(9, 9, 11, 0)');
      } else if (mood === 'Chaos') {
        grad.addColorStop(0, 'rgba(236, 72, 153, 0.06)');
        grad.addColorStop(0.5, 'rgba(249, 189, 34, 0.02)');
        grad.addColorStop(1, 'rgba(9, 9, 11, 0)');
      } else {
        grad.addColorStop(0, 'rgba(149, 141, 161, 0.03)');
        grad.addColorStop(1, 'rgba(9, 9, 11, 0)');
      }
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw constellation lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        p.phase += 0.02;
        
        // Add smooth wave fluctuations
        const offsetSpeed = speedMultiplier * 0.1;
        const waveX = Math.sin(p.phase) * offsetSpeed * 4;
        const waveY = Math.cos(p.phase) * offsetSpeed * 4;

        if (isPlaying) {
          p.x += p.vx + waveX;
          p.y += p.vy + waveY;

          // Wrap boundaries cleanly
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        // Draw particle glowing point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = mood === 'Wonder' || mood === 'Chaos' ? 8 : 2;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [seed, mood, isPlaying]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#09090B]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
