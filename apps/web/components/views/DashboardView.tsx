'use client';

import * as React from 'react';
import { useDreams } from '../../hooks/use-dreams';
import { GenerativeVisualizer } from '../GenerativeVisualizer';
import {
  Sparkles,
  Flame,
  Moon,
  Eye,
  Smile,
  Brain,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Image as ImageIcon,
  Zap,
  Activity,
  User,
  ExternalLink
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenArtworkDetail: (dream: any) => void;
}

export function DashboardView({ onNavigate, onOpenArtworkDetail }: DashboardViewProps) {
  const { dreams, isOnline } = useDreams();

  // Pick the latest dream for the artwork preview and greeting summary
  const latestDream = dreams[0] || null;

  // Calculate statistics
  const totalDreams = dreams.length;
  const totalSymbols = React.useMemo(() => {
    const all = new Set<string>();
    dreams.forEach(d => d.symbols.forEach(s => all.add(s.name)));
    return all.size;
  }, [dreams]);

  const activeArchetypesCount = React.useMemo(() => {
    const all = new Set<string>();
    dreams.forEach(d => d.archetypes.forEach(a => all.add(a.name)));
    return all.size;
  }, [dreams]);

  // Find recurring symbols
  const symbolFrequencies = React.useMemo(() => {
    const freqs: Record<string, { count: number; name: string; trend: 'up' | 'down'; desc: string }> = {};
    dreams.forEach(d => {
      d.symbols.forEach(s => {
        if (!freqs[s.name]) {
          freqs[s.name] = { count: 0, name: s.name, trend: s.trend, desc: s.description };
        }
        freqs[s.name].count += 1;
      });
    });
    return Object.values(freqs).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [dreams]);

  // Dominant emotion calculation
  const dominantEmotion = latestDream?.dominantEmotion || 'Wonder';
  const averageConfidence = latestDream ? 91 : 0;

  return (
    <div className="space-y-8 p-1 md:p-2">
      {/* Hero Header Greeting */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-8 rounded-2xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#7c3aed]/10 rounded-full blur-[100px] group-hover:bg-[#7c3aed]/20 transition-all duration-700"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#22d3ee]/5 rounded-full blur-[100px] group-hover:bg-[#22d3ee]/10 transition-all duration-700"></div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-[#d2bbff] text-sm font-mono">
              <Sparkles className="w-4 h-4 text-[#d2bbff] animate-pulse" />
              <span>DIGITAL OBSERVATORY OF THE SUBCONSCIOUS</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Good Evening, Crenaz.
            </h1>
            <p className="text-[#ccc3d8]/80 text-lg max-w-xl">
              Your subconscious activity has increased by <span className="text-[#22d3ee] font-semibold">14%</span> this week. The dream cycles are stabilizing.
            </p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-[#7c3aed] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-mono text-xs text-[#d2bbff] tracking-widest uppercase">Weekly AI Synthesis</span>
            <Activity className="w-5 h-5 text-[#d2bbff] animate-pulse" />
          </div>
          <div className="space-y-3 mt-4">
            <h2 className="text-3xl font-display font-bold text-white">
              {totalDreams * 4} <span className="text-sm font-sans text-[#ccc3d8]/60 font-normal">threads logged</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#22d3ee] w-[91%]" style={{ boxShadow: '0 0 10px #7c3aed' }}></div>
              </div>
              <span className="text-xs font-mono text-[#d2bbff]">91%</span>
            </div>
            <p className="text-xs font-mono text-[#ccc3d8]/60 italic">Analysis confidence level</p>
          </div>
        </div>
      </section>

      {/* Statistics Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl text-center flex flex-col items-center gap-2 hover:border-[#adc6ff]/30 transition-all">
          <Moon className="w-6 h-6 text-[#adc6ff] opacity-80" />
          <p className="font-mono text-[10px] text-[#ccc3d8]/60 uppercase tracking-wider">Dreams Logged</p>
          <h3 className="font-display text-2xl font-bold text-white">{totalDreams}</h3>
        </div>
        <div className="glass-panel p-5 rounded-xl text-center flex flex-col items-center gap-2 hover:border-[#f9bd22]/30 transition-all">
          <Brain className="w-6 h-6 text-[#f9bd22] opacity-80" />
          <p className="font-mono text-[10px] text-[#ccc3d8]/60 uppercase tracking-wider">Symbols Found</p>
          <h3 className="font-display text-2xl font-bold text-white">{totalSymbols}</h3>
        </div>
        <div className="glass-panel p-5 rounded-xl text-center flex flex-col items-center gap-2 hover:border-[#22d3ee]/30 transition-all border-b-2 border-b-[#22d3ee]/30">
          <Smile className="w-6 h-6 text-[#22d3ee] opacity-80" />
          <p className="font-mono text-[10px] text-[#ccc3d8]/60 uppercase tracking-wider">Dominant Emotion</p>
          <h3 className="font-display text-2xl font-bold text-white truncate max-w-[120px]">{dominantEmotion}</h3>
        </div>
        <div className="glass-panel p-5 rounded-xl text-center flex flex-col items-center gap-2 hover:border-[#d2bbff]/30 transition-all border-b-2 border-b-[#d2bbff]/30">
          <Eye className="w-6 h-6 text-[#d2bbff] opacity-80" />
          <p className="font-mono text-[10px] text-[#ccc3d8]/60 uppercase tracking-wider">Active Archetypes</p>
          <h3 className="font-display text-2xl font-bold text-white">{activeArchetypesCount}</h3>
        </div>
      </section>

      {/* Main Dashboard Section: Latest Artwork & Recurring Symbols */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Latest Generated Artwork Preview */}
        <div className="xl:col-span-2 glass-panel rounded-2xl overflow-hidden flex flex-col group">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <span className="font-mono text-xs text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7c3aed] animate-ping"></span>
              LATEST PROCEDURAL ARTWORK
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('Gallery')}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-[#ccc3d8] hover:text-[#d2bbff]"
                title="Open Gallery"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="aspect-video relative overflow-hidden bg-black flex-1 min-h-[300px]">
            {latestDream ? (
              <GenerativeVisualizer seed={latestDream.artworkSeed} mood={latestDream.mood} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#ccc3d8]/40">
                <span>Write a dream in the Journal to generate procedural art</span>
              </div>
            )}
            
            {latestDream && (
              <div
                onClick={() => onOpenArtworkDetail(latestDream)}
                className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8 cursor-pointer"
              >
                <div className="space-y-1">
                  <h4 className="font-display text-2xl font-bold text-white">
                    {latestDream.title} #092
                  </h4>
                  <p className="text-sm text-white/60">
                    Procedural quantum shader based on &apos;{latestDream.mood}&apos; emotional timeline. Click to expand.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recurring Symbols Panel */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-mono text-xs text-white uppercase tracking-wider">Recurring Symbols</h3>
            <span className="text-[10px] font-mono text-[#ccc3d8]/40">BY FREQUENCY</span>
          </div>

          <div className="space-y-6 overflow-y-auto max-h-[320px] custom-scrollbar pr-1 flex-1">
            {symbolFrequencies.length > 0 ? (
              symbolFrequencies.map((sym, idx) => {
                const percentage = Math.min(100, Math.max(15, sym.count * 20));
                return (
                  <div key={idx} className="flex items-center gap-4 group cursor-pointer" onClick={() => onNavigate('Symbol Library')}>
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[#7c3aed]/50 transition-colors">
                      <span className="material-symbols-outlined text-lg text-[#ccc3d8] group-hover:text-[#d2bbff]">
                        {idx === 0 ? 'dark_mode' : idx === 1 ? 'water' : idx === 2 ? 'visibility' : 'pets'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans font-medium text-white group-hover:text-[#22d3ee] transition-colors truncate">
                        {sym.name}
                      </p>
                      <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#7c3aed] to-[#22d3ee] rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs text-[#22d3ee]">{percentage}%</span>
                        {sym.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3 text-[#22c55e]" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-[#ec4899]" />
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-[#ccc3d8]/40">Active</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-[#ccc3d8]/40 text-sm">
                No symbols analyzed yet.
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('Symbol Library')}
            className="mt-6 w-full py-3 text-xs font-mono text-[#ccc3d8]/60 hover:text-[#d2bbff] transition-colors border-t border-white/5 bg-white/[0.01] hover:bg-white/[0.03] rounded-lg"
          >
            Explore Complete Library
          </button>
        </div>
      </section>

      {/* Quick Actions Panel */}
      <section className="glass-panel p-6 rounded-2xl">
        <h3 className="font-mono text-xs text-white uppercase tracking-wider mb-4">Quick Navigation</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('Journal')}
            className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#7c3aed]/40 hover:bg-[#7c3aed]/5 transition-all text-left group"
          >
            <BookOpen className="w-5 h-5 text-[#d2bbff] mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-sans font-semibold text-white text-sm">New Dream Entry</h4>
            <p className="text-xs text-[#ccc3d8]/60 mt-1">Access the sandbox editor</p>
          </button>

          <button
            onClick={() => onNavigate('Gallery')}
            className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#22d3ee]/40 hover:bg-[#22d3ee]/5 transition-all text-left group"
          >
            <ImageIcon className="w-5 h-5 text-[#22d3ee] mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-sans font-semibold text-white text-sm">Generate Artwork</h4>
            <p className="text-xs text-[#ccc3d8]/60 mt-1">Render subconscious logs</p>
          </button>

          <button
            onClick={() => onNavigate('Pattern Network')}
            className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#f9bd22]/40 hover:bg-[#f9bd22]/5 transition-all text-left group"
          >
            <Brain className="w-5 h-5 text-[#f9bd22] mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-sans font-semibold text-white text-sm">Explore Networks</h4>
            <p className="text-xs text-[#ccc3d8]/60 mt-1">Visualize co-occurrences</p>
          </button>

          <button
            onClick={() => onNavigate('Agent Console')}
            className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#ec4899]/40 hover:bg-[#ec4899]/5 transition-all text-left group"
          >
            <Zap className="w-5 h-5 text-[#ec4899] mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-sans font-semibold text-white text-sm">Agent Orchestration</h4>
            <p className="text-xs text-[#ccc3d8]/60 mt-1">Expose telemetry logs</p>
          </button>
        </div>
      </section>
    </div>
  );
}
