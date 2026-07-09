'use client';

import * as React from 'react';
import { useDreams, Dream } from '../../hooks/use-dreams';
import { Search, Compass, Info, Maximize2, Shield, Settings, HelpCircle } from 'lucide-react';

interface NetworkNode {
  id: string;
  label: string;
  type: 'dream' | 'symbol' | 'archetype' | 'emotion';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  originalData?: any;
}

interface NetworkEdge {
  source: string;
  target: string;
}

export function PatternNetworkView() {
  const { dreams } = useDreams();
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  
  const [selectedNode, setSelectedNode] = React.useState<NetworkNode | null>(null);
  const [search, setSearch] = React.useState('');

  // Setup reactive Nodes and Edges based on dreams context
  const networkData = React.useMemo(() => {
    const nodes: NetworkNode[] = [];
    const edges: NetworkEdge[] = [];
    
    // Track added ids to avoid duplicate nodes
    const addedIds = new Set<string>();

    const width = 800;
    const height = 500;

    // 1. Add Dream Nodes
    dreams.forEach((d, idx) => {
      const angle = (idx / Math.max(1, dreams.length)) * Math.PI * 2;
      const r = 150;
      const x = width / 2 + Math.cos(angle) * r;
      const y = height / 2 + Math.sin(angle) * r;

      const node: NetworkNode = {
        id: d.id,
        label: d.title,
        type: 'dream',
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 12,
        color: '#7c3aed',
        originalData: d
      };
      
      nodes.push(node);
      addedIds.add(d.id);

      // 2. Add Symbol Nodes linked to this dream
      d.symbols.forEach((s, sIdx) => {
        const symbolId = `symbol-${s.name.replace(/\s+/g, '-').toLowerCase()}`;
        if (!addedIds.has(symbolId)) {
          const sAngle = angle + (sIdx + 1) * 0.4;
          const sR = 240;
          nodes.push({
            id: symbolId,
            label: s.name,
            type: 'symbol',
            x: width / 2 + Math.cos(sAngle) * sR,
            y: height / 2 + Math.sin(sAngle) * sR,
            vx: 0,
            vy: 0,
            radius: 8,
            color: '#22d3ee',
            originalData: s
          });
          addedIds.add(symbolId);
        }

        // Create connection edge
        edges.push({ source: d.id, target: symbolId });
      });

      // 3. Add Archetype Nodes linked to this dream
      d.archetypes.forEach((a, aIdx) => {
        const archetypeId = `archetype-${a.name.replace(/\s+/g, '-').toLowerCase()}`;
        if (!addedIds.has(archetypeId)) {
          const aAngle = angle - (aIdx + 1) * 0.5;
          const aR = 200;
          nodes.push({
            id: archetypeId,
            label: a.name,
            type: 'archetype',
            x: width / 2 + Math.cos(aAngle) * aR,
            y: height / 2 + Math.sin(aAngle) * aR,
            vx: 0,
            vy: 0,
            radius: 10,
            color: '#f9bd22',
            originalData: a
          });
          addedIds.add(archetypeId);
        }

        edges.push({ source: d.id, target: archetypeId });
      });
    });

    return { nodes, edges };
  }, [dreams]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Copy memoized nodes to mutable state array to let physics simulation alter coordinates
    const localNodes = networkData.nodes.map(n => ({
      ...n,
      x: Math.random() * (width - 100) + 50,
      y: Math.random() * (height - 100) + 50
    }));
    
    const localEdges = networkData.edges;

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let hoveredNode: NetworkNode | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Detect hover
      hoveredNode = null;
      for (const node of localNodes) {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < node.radius + 5) {
          hoveredNode = node;
          break;
        }
      }
    };

    const handleMouseClick = () => {
      if (hoveredNode) {
        setSelectedNode(hoveredNode);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);

    // Dynamic Physics Loop (simple spring and pull forces)
    const render = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, width, height);

      // 1. Physics Calculations: attraction to center and node repulsions
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < localNodes.length; i++) {
        const n1 = localNodes[i];
        
        // Pull towards center gently
        n1.vx += (centerX - n1.x) * 0.001;
        n1.vy += (centerY - n1.y) * 0.001;

        // Repel from other nodes
        for (let j = i + 1; j < localNodes.length; j++) {
          const n2 = localNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = n1.radius + n2.radius + 60;

          if (dist < minDist) {
            const force = (minDist - dist) * 0.015;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }

        // Apply friction and cap velocities
        n1.vx *= 0.85;
        n1.vy *= 0.85;

        // Limit velocity
        const maxV = 2;
        const speed = Math.sqrt(n1.vx * n1.vx + n1.vy * n1.vy);
        if (speed > maxV) {
          n1.vx = (n1.vx / speed) * maxV;
          n1.vy = (n1.vy / speed) * maxV;
        }

        // Update positions
        n1.x += n1.vx;
        n1.y += n1.vy;

        // Keep inside bounds
        n1.x = Math.max(n1.radius, Math.min(width - n1.radius, n1.x));
        n1.y = Math.max(n1.radius, Math.min(height - n1.radius, n1.y));
      }

      // 2. Draw Edges (connections)
      localEdges.forEach((edge) => {
        const sourceNode = localNodes.find(n => n.id === edge.source);
        const targetNode = localNodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // 3. Draw Nodes with soft glows
      localNodes.forEach((node) => {
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;

        // Node Glow shadow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isHovered || isSelected ? 4 : 0), 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = isHovered || isSelected ? 15 : 2;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset

        // White center accent
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Node Label
        ctx.fillStyle = isHovered || isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - node.radius - 6);
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('click', handleMouseClick);
      }
    };
  }, [networkData, selectedNode]);

  return (
    <div className="space-y-6">
      
      {/* Header info */}
      <div className="space-y-1">
        <h2 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <span>Pattern Relationship Network</span>
        </h2>
        <p className="text-mist/60 text-sm max-w-xl">
          A multidimensional vector graph mapping co-occurrences of recurring symbols, mood archetypes, and logged dreams.
        </p>
      </div>

      {/* Main Canvas + Inspector column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Canvas Graph */}
        <div className="lg:col-span-8 glass-panel rounded-2xl overflow-hidden relative flex flex-col min-h-[500px]">
          <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-surface/40 backdrop-blur-xl">
            <span className="font-mono text-xs text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-aurora-cyan animate-ping" />
              Interactive Subconscious Starfield
            </span>
            <div className="flex gap-2 text-[10px] font-mono text-mist/50">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span>Dream</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-aurora-cyan"></span>Symbol</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-moon-gold"></span>Archetype</span>
            </div>
          </div>
          <div className="flex-1 bg-background relative">
            <canvas ref={canvasRef} className="w-full h-full block absolute inset-0 cursor-crosshair" />
            
            {/* Top controls info overlay */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <div className="bg-surface/80 text-mist/80 px-3 py-1.5 rounded-lg border border-white/5 font-mono text-[9px] backdrop-blur-md">
                🎯 Click individual stars to inspect nodes
              </div>
            </div>
          </div>
        </div>

        {/* Side Inspector column */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col justify-between h-full min-h-[500px]">
          {selectedNode ? (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-3">
                <span className="font-mono text-[9px] text-aurora-cyan tracking-widest uppercase">NODE INSPECTOR DETAILED</span>
                <h3 className="font-display text-2xl font-bold text-white mt-1">{selectedNode.label}</h3>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border border-current mt-2 inline-block ${selectedNode.type === 'dream' ? 'text-primary' : selectedNode.type === 'symbol' ? 'text-aurora-cyan' : 'text-moon-gold'}`}>
                  {selectedNode.type.toUpperCase()}
                </span>
              </div>

              {selectedNode.type === 'dream' && selectedNode.originalData && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-mist/40 block">DREAM SUMMARY</span>
                    <p className="text-xs text-mist/80 leading-relaxed bg-white/[0.01] p-3 rounded-lg border border-white/5 mt-1">
                      {selectedNode.originalData.summary}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-mist/40 block">DOMINANT EMOTION</span>
                    <p className="text-xs font-semibold text-white mt-1">{selectedNode.originalData.dominantEmotion}</p>
                  </div>
                </div>
              )}

              {selectedNode.type === 'symbol' && selectedNode.originalData && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-mist/40 block">SYMBOL INTERPRETATION</span>
                    <p className="text-xs text-mist/80 leading-relaxed bg-white/[0.01] p-3 rounded-lg border border-white/5 mt-1">
                      {selectedNode.originalData.description}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-mist/40 block">FREQUENCY SCORE</span>
                    <p className="text-xs font-semibold text-aurora-cyan mt-1">{selectedNode.originalData.frequency || 82}%</p>
                  </div>
                </div>
              )}

              {selectedNode.type === 'archetype' && selectedNode.originalData && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-mist/40 block">ARCHETYPE BEHAVIOR</span>
                    <p className="text-xs text-mist/80 leading-relaxed bg-white/[0.01] p-3 rounded-lg border border-white/5 mt-1">
                      {selectedNode.originalData.description}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-mist/40 block">ACTIVATION LEVEL</span>
                    <p className="text-xs font-semibold text-moon-gold mt-1">{selectedNode.originalData.score}%</p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-24 space-y-3 my-auto">
              <HelpCircle className="w-10 h-10 text-white/10 mx-auto" />
              <p className="text-xs text-mist/30">No active constellation node selected. Click stars on the left to analyze.</p>
            </div>
          )}

          <div className="border-t border-white/5 pt-4 mt-6 flex items-center gap-2 text-[10px] font-mono text-mist/40">
            <Info className="w-4 h-4 text-aurora-cyan" />
            <span>Interactive physics nodes respond to cursor drags.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
