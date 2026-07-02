'use client';

import * as React from 'react';
import { useDreams, Dream } from '../../hooks/use-dreams';
import { Calendar, TrendingUp, HelpCircle, Activity, Star } from 'lucide-react';

export function EmotionalTimelineView() {
  const { dreams } = useDreams();
  const [activeDreamId, setActiveDreamId] = React.useState<string | null>(null);

  // Parse chronological data for SVG chart
  const timelineData = React.useMemo(() => {
    return [...dreams]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((d, index) => {
        // Map emotional score
        let score = 50;
        if (d.mood === 'Wonder') score = 90;
        if (d.mood === 'Calm') score = 75;
        if (d.mood === 'Vague') score = 40;
        if (d.mood === 'Eerie') score = 30;
        if (d.mood === 'Chaos') score = 15;

        return {
          id: d.id,
          title: d.title,
          date: d.date,
          score,
          mood: d.mood,
          summary: d.summary
        };
      });
  }, [dreams]);

  const activeDream = React.useMemo(() => {
    return dreams.find(d => d.id === activeDreamId) || dreams[0] || null;
  }, [dreams, activeDreamId]);

  // SVG Area calculation
  const width = 800;
  const height = 250;
  const padding = 40;

  const points = React.useMemo(() => {
    if (timelineData.length < 2) return [];

    const xStep = (width - padding * 2) / (timelineData.length - 1);
    return timelineData.map((d, idx) => {
      const x = padding + idx * xStep;
      // Flip Y since SVG (0,0) is top-left
      const y = height - padding - ((d.score - 0) / 100) * (height - padding * 2);
      return { x, y, ...d };
    });
  }, [timelineData]);

  const pathD = React.useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Use cubic bezier curves for highly premium fluid feeling
      const prev = points[i - 1];
      const curr = points[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [points]);

  const areaD = React.useMemo(() => {
    if (points.length === 0) return '';
    return `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }, [points, pathD]);

  // Render mood calendar heatmap (a 7x15 grid of the last 100 days)
  const heatmapDays = React.useMemo(() => {
    const days = [];
    const baseDate = new Date();
    for (let i = 83; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Match with dreams logged on this day
      const matchedDream = dreams.find(d => d.date === dateString);
      let intensity = 0; // default empty
      if (matchedDream) {
        if (matchedDream.mood === 'Wonder') intensity = 4;
        else if (matchedDream.mood === 'Calm') intensity = 3;
        else if (matchedDream.mood === 'Vague') intensity = 2;
        else intensity = 1;
      }

      days.push({
        date: dateString,
        intensity,
        dream: matchedDream
      });
    }
    return days;
  }, [dreams]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="space-y-1">
        <h2 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <span>Emotional Timeline Analyst</span>
        </h2>
        <p className="text-[#ccc3d8]/60 text-sm max-w-xl">
          Track long-term emotional trajectories, circadian mood shifts, and lucidity variables across space.
        </p>
      </div>

      {/* Main SVG Area Chart Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center pb-2">
          <span className="font-mono text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#7c3aed]" />
            PSYCHO-EMOTIONAL SPECTRUM ARC
          </span>
          <div className="flex items-center gap-4 text-[10px] font-mono text-[#ccc3d8]/60">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#7c3aed]"></span>Wonder (90%)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22d3ee]"></span>Calm (75%)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Chaos (15%)</span>
          </div>
        </div>

        {timelineData.length < 2 ? (
          <div className="h-64 flex items-center justify-center text-[#ccc3d8]/40 text-sm">
            Not enough dream logs chronologically to chart. Write more dreams in the Journal to build a trajectory.
          </div>
        ) : (
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="min-w-[760px] h-64 relative">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full block overflow-visible">
                <defs>
                  {/* Glowing linear gradient for Area */}
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                  </linearGradient>
                  {/* Border Stroke Gradient */}
                  <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="50%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference gridlines */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.06)" />

                {/* Shaded Area */}
                <path d={areaD} fill="url(#chartGradient)" />

                {/* Floating Wave Path */}
                <path d={pathD} fill="none" stroke="url(#strokeGradient)" strokeWidth="3" strokeLinecap="round" />

                {/* Interactive coordinate nodes */}
                {points.map((pt, idx) => {
                  const isActive = activeDreamId === pt.id;
                  return (
                    <g key={idx} className="cursor-pointer group" onClick={() => setActiveDreamId(pt.id)}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isActive ? 8 : 4}
                        fill={isActive ? '#22d3ee' : '#7c3aed'}
                        stroke="#09090b"
                        strokeWidth="2"
                        style={{ filter: isActive ? 'drop-shadow(0 0 8px #22d3ee)' : 'none' }}
                        className="transition-all"
                      />
                      {/* Invisible hover helper */}
                      <circle cx={pt.x} cy={pt.y} r="15" fill="transparent" />
                    </g>
                  );
                })}

                {/* Labels */}
                {points.map((pt, idx) => {
                  // Only label first, middle, last to avoid overlapping
                  if (idx === 0 || idx === points.length - 1 || (points.length > 4 && idx === Math.floor(points.length / 2))) {
                    return (
                      <text
                        key={idx}
                        x={pt.x}
                        y={height - 12}
                        fill="rgba(255,255,255,0.35)"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {pt.date}
                      </text>
                    );
                  }
                  return null;
                })}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Left side Active Node Focus Inspector, Right side Mood Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active node inspector details */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col justify-between h-full">
          {activeDream ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-mono text-[10px] text-[#22d3ee] tracking-widest uppercase">NODE FOCUS INSPECTOR</span>
                <span className="font-mono text-[10px] text-[#ccc3d8]/40">{activeDream.date}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-white">{activeDream.title}</h3>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono bg-[#7c3aed]/10 text-[#d2bbff] border border-[#7c3aed]/20 px-2 py-0.5 rounded-full">
                  Mood: {activeDream.mood}
                </span>
                <span className="text-[10px] font-mono bg-white/5 text-[#ccc3d8]/80 border border-white/5 px-2 py-0.5 rounded-full">
                  Lucidity: {activeDream.lucidity || 'High'}
                </span>
              </div>
              <p className="text-[#ccc3d8]/80 text-xs leading-relaxed bg-[#1c1b1d]/40 p-4 rounded-xl border border-white/5 line-clamp-4">
                {activeDream.summary}
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-[#ccc3d8]/30 text-xs">
              Select a timeline node above.
            </div>
          )}

          <div className="mt-6 flex gap-2 items-center text-[10px] font-mono text-[#ccc3d8]/40 border-t border-white/5 pt-4">
            <HelpCircle className="w-4 h-4 text-[#7c3aed]" />
            <span>Hover / tap coordinates on the wave to inspect.</span>
          </div>
        </div>

        {/* Mood calendar Heatmap */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1 pb-4 border-b border-white/5">
            <span className="font-mono text-xs text-white uppercase tracking-wider block">Subconscious Heatmap</span>
            <p className="text-[#ccc3d8]/40 text-[10px] font-mono">12-WEEK PATTERN ANALYSIS MATRIX</p>
          </div>

          <div className="py-6 flex justify-center">
            <div className="grid grid-flow-col grid-rows-7 gap-1.5">
              {heatmapDays.map((d, idx) => {
                let colorClass = 'bg-white/5 border border-white/[0.02]';
                if (d.intensity === 1) colorClass = 'bg-[#7c3aed]/25 border border-[#7c3aed]/10'; // chaotic/low
                else if (d.intensity === 2) colorClass = 'bg-[#7c3aed]/50 border border-[#7c3aed]/20';
                else if (d.intensity === 3) colorClass = 'bg-[#22d3ee]/60 border border-[#22d3ee]/20 glow-cyan';
                else if (d.intensity === 4) colorClass = 'bg-[#7c3aed] border border-[#d2bbff]/30 glow-violet'; // wonder!

                return (
                  <div
                    key={idx}
                    title={`${d.date} ${d.dream ? `: ${d.dream.title} (${d.dream.mood})` : ''}`}
                    className={`w-4 h-4 rounded-sm transition-all duration-300 hover:scale-125 cursor-pointer ${colorClass}`}
                    onClick={() => d.dream && setActiveDreamId(d.dream.id)}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center text-[9px] font-mono text-[#ccc3d8]/40 border-t border-white/5 pt-4">
            <span>LESS ACTIVE</span>
            <div className="flex gap-1.5 items-center">
              <span className="w-2.5 h-2.5 rounded bg-white/5 border border-white/10" />
              <span className="w-2.5 h-2.5 rounded bg-[#7c3aed]/25" />
              <span className="w-2.5 h-2.5 rounded bg-[#7c3aed]/50" />
              <span className="w-2.5 h-2.5 rounded bg-[#22d3ee]/60" />
              <span className="w-2.5 h-2.5 rounded bg-[#7c3aed]" />
            </div>
            <span>DOMINANT WONDER</span>
          </div>
        </div>

      </div>
    </div>
  );
}
