import React, { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  MarkerType, BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { fetchRoadmap } from '../api/roadmapApi';
import SyllabusPanel from './SyllabusPanel';
import CustomNode from './CustomNode';
import { GitBranch, CheckSquare } from 'lucide-react';

const CAT_COLORS = {
  fundamentals: '#8b5cf6',
  frameworks:   '#3b82f6',
  tools:        '#22d3ee',
  databases:    '#3fb950',
  advanced:     '#ec4899',
  devops:       '#f59e0b',
  testing:      '#a78bfa',
};

const nodeTypes = { custom: CustomNode };

/* ─── Layered layout: group nodes by level, space them out ─── */
function buildLayout(rawNodes) {
  if (!rawNodes?.length) return { nodes: [], edges: [] };

  // Group by level
  const byLevel = {};
  rawNodes.forEach(n => {
    const lvl = n.level ?? 0;
    byLevel[lvl] = byLevel[lvl] || [];
    byLevel[lvl].push(n);
  });

  const NODE_W = 230;   // node width budget (wider = more readable)
  const NODE_H = 100;   // approximate rendered height
  const COL_GAP = 80;   // horizontal gap between nodes
  const ROW_GAP = 90;   // vertical gap between rows

  const posMap = {};
  const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);

  levels.forEach(lvl => {
    const items = byLevel[lvl];
    const totalW = items.length * NODE_W + (items.length - 1) * COL_GAP;
    const startX = -totalW / 2;
    items.forEach((n, i) => {
      posMap[n.id] = {
        x: startX + i * (NODE_W + COL_GAP),
        y: lvl * (NODE_H + ROW_GAP),
      };
    });
  });

  const nodes = rawNodes.map(n => ({
    id:   n.id,
    type: 'custom',
    position: posMap[n.id] || { x: 0, y: 0 },
    data: {
      label:          n.label,
      category:       n.category,
      difficulty:     n.difficulty,
      estimatedWeeks: n.estimatedWeeks,
      description:    n.description,
    },
  }));

  const edges = [];
  rawNodes.forEach(n => {
    (n.children || []).forEach(childId => {
      edges.push({
        id: `${n.id}→${childId}`,
        source: n.id,
        target: childId,
        type: 'smoothstep',
        style: { stroke: '#3b82f640', strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f660',
          width: 14, height: 14,
        },
      });
    });
  });

  return { nodes, edges };
}

export default function FlowchartView({ role, choice }) {
  const [rawData,   setRawData]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selected,  setSelected]  = useState(null);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('completedNodes') || '{}'); }
    catch { return {}; }
  });

  // Fetch
  useEffect(() => {
    setLoading(true); setError(null); setSelected(null);
    fetchRoadmap(role, choice.label)
      .then(d => {
        setRawData(d);
        const { nodes: ln, edges: le } = buildLayout(d.nodes || []);
        setNodes(ln);
        setEdges(le);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [role, choice]);

  // Sync completed state onto nodes
  useEffect(() => {
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, completed: !!completed[`${role}||${choice.id}||${n.id}`] },
    })));
  }, [completed, role, choice]);

  const onNodeClick = useCallback((_, node) => {
    setSelected({
      id:             node.id,
      label:          node.data.label,
      category:       node.data.category,
      difficulty:     node.data.difficulty,
      estimatedWeeks: node.data.estimatedWeeks,
    });
  }, []);

  const toggleComplete = useCallback(nodeId => {
    const key = `${role}||${choice.id}||${nodeId}`;
    setCompleted(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('completedNodes', JSON.stringify(next));
      return next;
    });
  }, [role, choice]);

  const isCompleted = id => !!completed[`${role}||${choice.id}||${id}`];
  const completedCount = rawData?.nodes?.filter(n => isCompleted(n.id)).length || 0;
  const totalCount = rawData?.nodes?.length || 0;

  const presentCats = rawData?.nodes
    ? [...new Set(rawData.nodes.map(n => n.category).filter(Boolean))]
    : [];

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 rounded-lg"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="spinner" />
      <p className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Building roadmap for <span style={{ color: 'var(--color-blue)' }}>{choice.label}</span>…
      </p>
    </div>
  );

  if (error) return (
    <div className="p-5 rounded-lg" style={{ background: '#1a0a0a', border: '1px solid #f8514925' }}>
      <p className="font-mono text-xs" style={{ color: '#f87171' }}>Error: {error}</p>
    </div>
  );

  return (
    <>
      {/* ── Flowchart header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-t-lg"
        style={{ background: 'var(--color-elevated)', border: '1px solid var(--color-border)', borderBottom: 'none' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-7 h-7 rounded text-lg"
            style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
          >
            {choice.icon}
          </div>
          <div>
            <p className="font-display font-700 text-sm" style={{ color: 'var(--color-text)' }}>
              {choice.label} · Skill Graph
            </p>
            <p className="font-mono text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>
              {totalCount} skills · Click any node to view syllabus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress */}
          <div className="flex items-center gap-1.5">
            <CheckSquare size={12} color="var(--color-success)" />
            <span className="font-mono text-[11px]" style={{ color: 'var(--color-success)' }}>
              {completedCount}/{totalCount}
            </span>
          </div>
          {/* Git branch */}
          <div className="flex items-center gap-1">
            <GitBranch size={11} color="var(--color-text-subtle)" />
            <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>
              {choice.label.toLowerCase().replace(/[ +]/g, '-')}
            </span>
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      {presentCats.length > 0 && (
        <div
          className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-2"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderBottom: 'none' }}
        >
          {presentCats.map(cat => (
            <div key={cat} className="flex items-center gap-1.5">
              <span
                className="status-dot"
                style={{ background: CAT_COLORS[cat] || '#3b82f6' }}
              />
              <span className="font-mono text-[10px] capitalize" style={{ color: 'var(--color-text-subtle)' }}>
                {cat}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="status-dot" style={{ background: '#3fb950' }} />
            <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>completed</span>
          </div>
        </div>
      )}

      {/* ── React Flow Canvas — taller so nodes visible without zoom ── */}
      <div
        style={{
          height: Math.max(680, (rawData?.nodes ? Math.ceil(Math.max(...rawData.nodes.map(n => n.level || 0)) + 1) * 190 + 120 : 680)),
          border: '1px solid var(--color-border)',
          borderRadius: '0 0 8px 8px',
          overflow: 'hidden',
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15, minZoom: 0.6, maxZoom: 1.5 }}
          minZoom={0.4}
          maxZoom={2}
          defaultEdgeOptions={{ type: 'smoothstep' }}
          attributionPosition="bottom-right"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#21262d"
          />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={n => CAT_COLORS[n.data?.category] || '#3b82f6'}
            maskColor="rgba(8,12,18,0.85)"
            style={{ height: 90 }}
          />
        </ReactFlow>
      </div>
    </>
  );
}
