'use client';

import * as React from 'react';
import { useDreams, Dream, SymbolInfo } from '../../hooks/use-dreams';
import { Search, Compass, Eye, TrendingUp, TrendingDown, BookOpen, Clock, Sparkles } from 'lucide-react';

export function SymbolLibraryView() {
  const { dreams } = useDreams();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSymbol, setSelectedSymbol] = React.useState<SymbolInfo | null>(null);

  // Group and process all unique symbols from dreams
  const allSymbols = React.useMemo(() => {
    const symbolMap: Record<string, SymbolInfo & { dreamsCount: number; associatedDreams: Dream[] }> = {};
    
    dreams.forEach(d => {
      d.symbols.forEach(s => {
        if (!symbolMap[s.name]) {
          symbolMap[s.name] = {
            ...s,
            dreamsCount: 0,
            associatedDreams: []
          };
        }
        symbolMap[s.name].dreamsCount += 1;
        symbolMap[s.name].associatedDreams.push(d);
        // Consolidate frequencies/scores if they differ
        symbolMap[s.name].frequency = Math.max(symbolMap[s.name].frequency, s.frequency || 50);
      });
    });

    return Object.values(symbolMap).sort((a, b) => b.frequency - a.frequency);
  }, [dreams]);

  // Filter based on search term
  const filteredSymbols = React.useMemo(() => {
    return allSymbols.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allSymbols, searchTerm]);

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="space-y-1">
        <h2 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <span>Subconscious Symbol Library</span>
        </h2>
        <p className="text-mist/60 text-sm max-w-xl">
          An interactive encyclopedia of recurrences in your dreams, mapped back to Jungian archetypes and subconscious frequency.
        </p>
      </div>

      {/* Search Bar & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-mist/50 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symbols (e.g. glass, cathedral, sea...)"
            className="w-full bg-elevated/40 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-lilac focus:ring-1 focus:ring-lilac/50 transition-all text-white placeholder:text-white/20"
          />
        </div>
      </div>

      {/* Grid of Symbol Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSymbols.map((sym, idx) => {
          return (
            <div
              key={idx}
              onClick={() => setSelectedSymbol(sym)}
              className="glass-card p-5 rounded-2xl flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[10px] text-lilac tracking-widest uppercase">SYMBOL #{idx + 101}</span>
                  <div className="flex items-center gap-1 bg-aurora-cyan/5 px-2 py-0.5 rounded border border-aurora-cyan/20 text-aurora-cyan font-mono text-[10px]">
                    {sym.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-dream-pink" />
                    )}
                    <span>{sym.trend === 'up' ? 'ACCUMULATING' : 'DIVERGING'}</span>
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-white group-hover:text-aurora-cyan transition-colors">
                  {sym.name}
                </h3>
                <p className="text-mist/70 text-xs leading-relaxed line-clamp-2">
                  {sym.description}
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-6">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-mist/40">FREQUENCY</span>
                  <p className="font-display font-bold text-sm text-white">{sym.frequency || sym.score}%</p>
                </div>
                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] font-mono text-mist/40">ASSOCIATIONS</span>
                  <p className="font-mono text-[10px] text-lilac">Jungian Matrix</p>
                </div>
              </div>
            </div>
          );
        })}

        {filteredSymbols.length === 0 && (
          <div className="col-span-full text-center py-24 text-mist/40">
            No symbols found matching your filter criteria. Try typing a new dream in the Journal!
          </div>
        )}
      </div>

      {/* sliding modal for symbol detail */}
      {selectedSymbol && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-lg w-full rounded-2xl p-6 space-y-6 relative border border-white/10 glow-violet">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] text-lilac tracking-widest uppercase">SYMBOL METADATA DETAILED</span>
                <h3 className="font-display text-2xl font-bold text-white mt-1">{selectedSymbol.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSymbol(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-mist/60 uppercase">Subconscious Significance</span>
              <p className="text-mist text-sm leading-relaxed bg-elevated/40 p-4 rounded-xl border border-white/5">
                {selectedSymbol.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4">
              <div>
                <span className="text-[10px] font-mono text-mist/40 block">INTEGRATION INDEX</span>
                <span className="font-display font-bold text-lg text-white">{selectedSymbol.frequency}%</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-mist/40 block">TREND ARCH</span>
                <span className="font-mono text-xs text-aurora-cyan flex items-center gap-1 mt-1">
                  {selectedSymbol.trend === 'up' ? 'Ascending (Expanding)' : 'Descending (Fading)'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono text-mist/60 uppercase block">Associated Dream Threads</span>
              <div className="space-y-2">
                {(selectedSymbol as any).associatedDreams?.map((d: Dream, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-white/[0.01] px-4 py-2.5 rounded-lg border border-white/5">
                    <span className="text-xs text-white font-medium">{d.title}</span>
                    <span className="text-[10px] font-mono text-mist/40">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedSymbol(null)}
              className="w-full py-3 bg-primary hover:bg-primary-container text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Consolidate Analysis
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
