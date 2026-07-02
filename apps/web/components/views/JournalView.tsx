'use client';

import * as React from 'react';
import { useDreams, Dream } from '../../hooks/use-dreams';
import {
  Sparkles,
  Smile,
  Eye,
  Calendar,
  Save,
  Trash2,
  CloudLightning,
  AlertTriangle,
  Send,
  Wand2,
  Bookmark,
  Plus,
  Compass,
  Clock,
  CheckCircle,
  Menu,
  Heart,
  ChevronRight
} from 'lucide-react';

export function JournalView() {
  const { dreams, addDream, deleteDream, isOnline, syncAllPending, syncQueueLength } = useDreams();

  // Active state
  const [selectedDreamId, setSelectedDreamId] = React.useState<string | null>(null);
  
  // Form states
  const [title, setTitle] = React.useState('');
  const [date, setDate] = React.useState('');
  const [text, setText] = React.useState('');
  const [mood, setMood] = React.useState<'Wonder' | 'Eerie' | 'Calm' | 'Chaos' | 'Vague'>('Wonder');
  
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(true);

  // Loaded active dream info
  const activeDream = React.useMemo(() => {
    return dreams.find(d => d.id === selectedDreamId) || null;
  }, [dreams, selectedDreamId]);

  // Set default values on loaded dream change or reset
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (activeDream) {
        setTitle(activeDream.title);
        setDate(activeDream.date);
        setText(activeDream.text);
        setMood(activeDream.mood);
      } else {
        // Set default new dream values
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]);
        setText('');
        setMood('Wonder');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedDreamId, activeDream]);

  // Handle Save Entry
  const handleSave = async () => {
    if (!text.trim()) {
      alert('Please fill in the dream content before saving.');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const created = await addDream(title, text, mood, date);
      setSelectedDreamId(created.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger manual analysis / regeneration
  const handleAnalyze = async () => {
    if (!selectedDreamId) {
      // If not saved yet, save it first
      await handleSave();
    } else {
      setIsAnalyzing(true);
      try {
        // Run analysis manually
        const dream = dreams.find(d => d.id === selectedDreamId);
        if (dream) {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: dream.title,
              text: dream.text,
              mood: dream.mood,
              date: dream.date
            }),
          });
          if (res.ok) {
            const analysis = await res.json();
            // Wait, use useDreams context method to save or we can just call context method.
            // Our use-dreams context already has analyseExistingDream! Let's trigger it directly.
            await syncAllPending();
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  // Group dreams for history pane
  const groupedDreams = React.useMemo(() => {
    const today: Dream[] = [];
    const yesterday: Dream[] = [];
    const older: Dream[] = [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    dreams.forEach(d => {
      if (d.date === todayStr) {
        today.push(d);
      } else if (d.date === yesterdayStr) {
        yesterday.push(d);
      } else {
        older.push(d);
      }
    });

    return { today, yesterday, older };
  }, [dreams]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden relative">
      
      {/* Sidebar collapsible Panel: Left panel history */}
      <aside className={`w-64 h-full border-r border-white/5 flex flex-col bg-[#131315]/40 backdrop-blur-xl shrink-0 transition-all duration-300 ${showHistory ? 'translate-x-0 w-64' : '-translate-x-full w-0 overflow-hidden border-none'}`}>
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
          <span className="font-mono text-[10px] text-[#ccc3d8]/60 uppercase tracking-widest">Dream History</span>
          <button
            onClick={() => setSelectedDreamId(null)}
            className="flex items-center gap-1 text-xs text-[#22d3ee] font-mono hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Today Group */}
          {groupedDreams.today.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[#d2bbff]/60 px-2 uppercase">Today</label>
              {groupedDreams.today.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDreamId(d.id)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all truncate border-l block ${selectedDreamId === d.id ? 'bg-[#7c3aed]/15 text-white border-l-[#d2bbff]' : 'text-[#ccc3d8]/70 hover:bg-white/5 border-l-transparent'}`}
                >
                  {d.title || 'Untitled Dream'}
                </button>
              ))}
            </div>
          )}

          {/* Yesterday Group */}
          {groupedDreams.yesterday.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[#ccc3d8]/40 px-2 uppercase">Yesterday</label>
              {groupedDreams.yesterday.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDreamId(d.id)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all truncate border-l block ${selectedDreamId === d.id ? 'bg-[#7c3aed]/15 text-white border-l-[#d2bbff]' : 'text-[#ccc3d8]/70 hover:bg-white/5 border-l-transparent'}`}
                >
                  {d.title || 'Untitled Dream'}
                </button>
              ))}
            </div>
          )}

          {/* Older Group */}
          {groupedDreams.older.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[#ccc3d8]/40 px-2 uppercase">Older Threads</label>
              {groupedDreams.older.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDreamId(d.id)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all truncate border-l block ${selectedDreamId === d.id ? 'bg-[#7c3aed]/15 text-white border-l-[#d2bbff]' : 'text-[#ccc3d8]/70 hover:bg-white/5 border-l-transparent'}`}
                >
                  {d.title || 'Untitled Dream'}
                </button>
              ))}
            </div>
          )}

          {dreams.length === 0 && (
            <div className="text-center py-12 text-[#ccc3d8]/30 text-xs">
              No entries saved.
            </div>
          )}
        </div>
      </aside>

      {/* Main Panel Sandbox Editor */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        
        {/* Connection status notification */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-white/5 rounded-lg border border-white/5 text-[#ccc3d8] hover:text-[#d2bbff] transition-colors"
              title="Toggle History Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <span>{selectedDreamId ? 'Edit Entry' : 'New Subconscious Ingest'}</span>
              {selectedDreamId && activeDream?.syncStatus === 'pending' && (
                <span className="text-[10px] font-mono bg-[#f9bd22]/10 text-[#f9bd22] border border-[#f9bd22]/20 px-2 py-0.5 rounded-full">
                  Offline Queue
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {!isOnline && (
              <div className="flex items-center gap-2 text-[#f9bd22] text-xs font-mono bg-[#f9bd22]/5 px-3 py-1.5 rounded-full border border-[#f9bd22]/20">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                <span>Offline Mode (Auto-sync enabled)</span>
              </div>
            )}
            {isOnline && syncQueueLength > 0 && (
              <button
                onClick={syncAllPending}
                className="flex items-center gap-2 text-[#22d3ee] text-xs font-mono bg-[#22d3ee]/5 px-3 py-1.5 rounded-full border border-[#22d3ee]/20 hover:bg-[#22d3ee]/10 transition-colors"
              >
                <CloudLightning className="w-3.5 h-3.5 animate-bounce" />
                <span>Sync Pending ({syncQueueLength})</span>
              </button>
            )}

            {selectedDreamId && (
              <button
                onClick={() => {
                  deleteDream(selectedDreamId);
                  setSelectedDreamId(null);
                }}
                className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-[#ccc3d8]/60 transition-colors border border-white/5"
                title="Delete Entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white font-semibold text-xs rounded-full shadow-lg hover:brightness-110 active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Entry</span>
            </button>
          </div>
        </div>

        {/* Editor Fields */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8 space-y-2">
            <label className="text-xs font-mono text-[#ccc3d8]/60 uppercase tracking-wider block">Dream Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Glass Cathedral"
              className="w-full bg-[#1c1b1d]/40 border border-white/10 rounded-xl px-4 py-3 text-lg font-display focus:outline-none focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee]/50 transition-all placeholder:text-white/10 text-white"
            />
          </div>
          <div className="col-span-12 md:col-span-4 space-y-2">
            <label className="text-xs font-mono text-[#ccc3d8]/60 uppercase tracking-wider block">Ingest Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#ccc3d8]/50 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1c1b1d]/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#22d3ee] focus:ring-1 focus:ring-[#22d3ee]/50 transition-all text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Mood Selector block */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-[#ccc3d8]/60 uppercase tracking-wider block">Dream Mood Signature</label>
          <div className="flex flex-wrap gap-2.5">
            {[
              { name: 'Wonder', icon: 'auto_awesome', color: 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#d2bbff] glow-violet' },
              { name: 'Eerie', icon: 'explore', color: 'border-[#ec4899] bg-[#ec4899]/10 text-[#f9bd22]' },
              { name: 'Calm', icon: 'waves', color: 'border-[#22d3ee] bg-[#22d3ee]/10 text-[#adc6ff]' },
              { name: 'Chaos', icon: 'bolt', color: 'border-red-500 bg-red-500/10 text-red-300' },
              { name: 'Vague', icon: 'cloud', color: 'border-[#958da1] bg-[#958da1]/10 text-[#e5e1e4]' }
            ].map((m) => {
              const isActive = mood === m.name;
              return (
                <button
                  key={m.name}
                  onClick={() => setMood(m.name as any)}
                  className={`flex flex-col items-center justify-center gap-1 px-5 py-3.5 rounded-xl border transition-all duration-300 cursor-pointer min-w-[76px] ${isActive ? m.color : 'border-white/5 bg-white/[0.01] text-[#ccc3d8]/70 hover:border-[#22d3ee]/40 hover:bg-[#22d3ee]/5'}`}
                >
                  <span className="material-symbols-outlined text-2xl">{m.icon}</span>
                  <span className="text-[10px] font-mono font-medium">{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Input area */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono text-[#ccc3d8]/60 uppercase tracking-wider">Dream Transcript</label>
            <div className="flex gap-4 text-[10px] font-mono text-[#ccc3d8]/40">
              <span>Words: {text.trim() ? text.trim().split(/\s+/).length : 0}</span>
              <span>Lucidity: {activeDream?.lucidity || 'High'}</span>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your subconscious landscape in raw detail... E.g. 'I was standing in the center of a cathedral made entirely of vibrant refracting glass...'"
            className="w-full min-h-[300px] bg-[#1c1b1d]/20 border border-white/10 rounded-2xl p-6 font-sans text-[#FAFAFA]/90 text-base leading-relaxed focus:outline-none focus:border-[#7c3aed]/50 transition-all resize-none placeholder:text-white/5"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex-1 relative overflow-hidden px-6 py-4 rounded-2xl bg-gradient-to-br from-[#7c3aed]/80 to-[#6d28d9]/80 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
          >
            <Wand2 className={`w-5 h-5 group-hover:rotate-12 transition-transform ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing dream threads...' : 'Analyze Subconscious Entry'}</span>
          </button>
        </div>

        {/* Real-time Analysis Preview (Bottom Cards) */}
        {activeDream && (
          <div className="pt-6 space-y-4">
            <h3 className="font-display text-lg text-[#ccc3d8] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#22d3ee] animate-pulse" />
              <span>Real-time Multi-Agent Trace</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Symbols */}
              <div className="glass-card p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="font-mono text-[10px] text-[#d2bbff] tracking-widest uppercase">Detected Symbols</span>
                  <Compass className="w-4 h-4 text-[#d2bbff]" />
                </div>
                <div className="space-y-3">
                  {activeDream.symbols.map((sym, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white font-medium">{sym.name}</span>
                        <span className="font-mono text-[#ccc3d8]/60">{sym.frequency || sym.score}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#d2bbff] rounded-full" style={{ width: `${sym.frequency || sym.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emotions */}
              <div className="glass-card p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="font-mono text-[10px] text-[#22d3ee] tracking-widest uppercase">Emotional Resonances</span>
                  <Heart className="w-4 h-4 text-[#22d3ee]" />
                </div>
                <div className="space-y-3">
                  {activeDream.emotions.map((em, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white font-medium">{em.name}</span>
                        <span className="font-mono text-[#ccc3d8]/60">{em.score}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#22d3ee] rounded-full" style={{ width: `${em.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Archetypes */}
              <div className="glass-card p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="font-mono text-[10px] text-[#f9bd22] tracking-widest uppercase">Active Archetypes</span>
                  <Eye className="w-4 h-4 text-[#f9bd22]" />
                </div>
                <div className="space-y-3">
                  {activeDream.archetypes.map((arch, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white font-medium">{arch.name}</span>
                        <span className="font-mono text-[#ccc3d8]/60">{arch.score}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#f9bd22] rounded-full" style={{ width: `${arch.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
