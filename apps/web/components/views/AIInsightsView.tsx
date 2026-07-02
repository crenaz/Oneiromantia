'use client';

import * as React from 'react';
import { useDreams } from '../../hooks/use-dreams';
import { Sparkles, TrendingUp, Compass, Heart, AlertCircle, RefreshCw, Calendar, Eye } from 'lucide-react';

export function AIInsightsView() {
  const { dreams } = useDreams();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const triggerRecalculate = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h2 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <span>AI Subconscious Insights</span>
          </h2>
          <p className="text-[#ccc3d8]/60 text-sm max-w-xl">
            Deep narrative assessments, long-term dream pattern discovery, and predictive forecasts synthesized from your timeline.
          </p>
        </div>

        <button
          onClick={triggerRecalculate}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-mono text-[#ccc3d8] transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Recalculating...' : 'Re-Run Analytics'}</span>
        </button>
      </div>

      {/* Grid of Analytical Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Emotional Cycle Analysis */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex gap-3 items-start border-b border-white/5 pb-3">
            <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center border border-[#7c3aed]/30 shrink-0">
              <Heart className="w-5 h-5 text-[#d2bbff]" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-[#ccc3d8]/40 block">PSYCHO-EMOTIONAL REPORT</span>
              <h3 className="font-display text-lg font-bold text-white">Active Emotional Cycles</h3>
            </div>
          </div>
          <p className="text-xs text-[#ccc3d8]/80 leading-relaxed font-sans">
            Your subconscious emotional landscape is showing a steady transition towards <span className="text-[#22d3ee] font-semibold">Integrative Serenity</span>. The active frequency of anxiety-laden dreamscapes has declined by <span className="text-red-400 font-semibold">24%</span>, replaced by expansion and geometric awe (Wonder), usually associated with resolution of awake-world stressors.
          </p>
          <div className="flex justify-between items-center text-[10px] font-mono text-[#ccc3d8]/40 pt-2 border-t border-white/5">
            <span>STABILITY INDEX: 84%</span>
            <span className="text-[#22d3ee] flex items-center gap-1">UPWARDS TREND <TrendingUp className="w-3 h-3" /></span>
          </div>
        </div>

        {/* Card 2: Emerging Archetype Alerts */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex gap-3 items-start border-b border-white/5 pb-3">
            <div className="w-10 h-10 rounded-xl bg-[#f9bd22]/10 flex items-center justify-center border border-[#f9bd22]/30 shrink-0">
              <Eye className="w-5 h-5 text-[#f9bd22]" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-[#ccc3d8]/40 block">EMERGENT ARCHETYPE ALERTS</span>
              <h3 className="font-display text-lg font-bold text-white">Activation of The Sage</h3>
            </div>
          </div>
          <p className="text-xs text-[#ccc3d8]/80 leading-relaxed font-sans">
            The multi-agent swarm has detected a sudden surge in the <span className="text-[#f9bd22] font-semibold">Sage Archetype</span>, triggered primarily by your cathedral and crystal-based recurring dream motifs. This indicates a strong mental orientation towards objective problem solving, hidden truths, and long-term synthesis of knowledge.
          </p>
          <div className="flex justify-between items-center text-[10px] font-mono text-[#ccc3d8]/40 pt-2 border-t border-white/5">
            <span>ACTIVATION CONFIDENCE: 91%</span>
            <span className="text-[#f9bd22]">ACCUMULATING</span>
          </div>
        </div>

        {/* Card 3: Seasonal/Weekly Dream Trends */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex gap-3 items-start border-b border-white/5 pb-3">
            <div className="w-10 h-10 rounded-xl bg-[#22d3ee]/10 flex items-center justify-center border border-[#22d3ee]/30 shrink-0">
              <Calendar className="w-5 h-5 text-[#22d3ee]" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-[#ccc3d8]/40 block">CHRONOMETRIC TREND DISCOVERY</span>
              <h3 className="font-display text-lg font-bold text-white">Circadian Dream Synchrony</h3>
            </div>
          </div>
          <p className="text-xs text-[#ccc3d8]/80 leading-relaxed font-sans">
            Analysis of the logging times indicates that your most vivid, high-lucidity dreams occur during the late-REM cycle, specifically between <span className="text-white font-semibold">04:00 AM and 06:00 AM</span>. Dreams logged during this period demonstrate a much higher complexity index, with an average of <span className="text-[#22d3ee] font-semibold">4.2 symbols</span> identified per entry.
          </p>
          <div className="flex justify-between items-center text-[10px] font-mono text-[#ccc3d8]/40 pt-2 border-t border-white/5">
            <span>PEAK LOG HOURS: 04:30 AM</span>
            <span className="text-[#ccc3d8]/60">SYNCHRONIZED</span>
          </div>
        </div>

        {/* Card 4: Long-term Subconscious Recommendations */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex gap-3 items-start border-b border-white/5 pb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/30 shrink-0">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-[#ccc3d8]/40 block">INTELLIGENCE RECOMMENDATION</span>
              <h3 className="font-display text-lg font-bold text-white">Shadow Integration Work</h3>
            </div>
          </div>
          <p className="text-xs text-[#ccc3d8]/80 leading-relaxed font-sans">
            While your Wonder and Calm cycles are flourishing, the unresolved <span className="text-red-400 font-semibold">Locked Door</span> symbol remains present. The AI recommendation engine suggests performing focused reflection or journaling on boundary resolution before sleep, aimed at unlocking and integrating these hidden dream threads.
          </p>
          <div className="flex justify-between items-center text-[10px] font-mono text-[#ccc3d8]/40 pt-2 border-t border-white/5">
            <span>RECOM_CODE: JUNG-902</span>
            <span className="text-red-400 font-medium">HIGH ACTIONABLE</span>
          </div>
        </div>

      </div>
    </div>
  );
}
