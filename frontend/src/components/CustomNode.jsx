import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const CAT_COLORS = {
  fundamentals: { accent: '#8b5cf6', bg: '#1a1040' },
  frameworks:   { accent: '#3b82f6', bg: '#0f1e3a' },
  tools:        { accent: '#22d3ee', bg: '#062030' },
  databases:    { accent: '#3fb950', bg: '#0a2015' },
  advanced:     { accent: '#ec4899', bg: '#2a0820' },
  devops:       { accent: '#f59e0b', bg: '#2a1800' },
  testing:      { accent: '#a78bfa', bg: '#1a1040' },
  default:      { accent: '#3b82f6', bg: '#0f1e3a' },
};

const DIFF_COLORS = {
  Beginner:     '#3fb950',
  Intermediate: '#d29922',
  Advanced:     '#f85149',
};

function CustomNode({ data, selected }) {
  const cat  = CAT_COLORS[data.category] || CAT_COLORS.default;
  const diff = DIFF_COLORS[data.difficulty] || '#8b949e';

  return (
    <div
      className={`flow-node-card ${data.completed ? 'done' : ''}`}
      style={{
        '--node-accent': data.completed ? '#3fb950' : cat.accent,
        boxShadow: selected ? `0 0 0 2px ${cat.accent}80, 0 4px 20px ${cat.accent}20` : undefined,
        borderColor: selected ? cat.accent : undefined,
      }}
    >
      <Handle type="target" position={Position.Top}
        style={{ width: 8, height: 8, background: cat.accent, border: 'none', top: -4 }} />

      {/* Category label */}
      <div className="flow-node-cat">
        {data.category || 'skill'}
      </div>

      {/* Main label */}
      <div className="flow-node-label">{data.label}</div>

      {/* Row: difficulty + weeks */}
      <div className="flex items-center gap-1.5 flex-wrap mt-1">
        <span
          className="flow-node-badge"
          style={{ background: `${diff}18`, color: diff, border: `1px solid ${diff}35` }}
        >
          {data.difficulty}
        </span>
        {data.estimatedWeeks && (
          <span className="flow-node-weeks">⏱ {data.estimatedWeeks}w</span>
        )}
      </div>

      {/* Completed tick */}
      {data.completed && (
        <div
          className="absolute top-2 right-2 font-mono text-[10px] font-700"
          style={{ color: '#3fb950' }}
        >
          ✓
        </div>
      )}

      <Handle type="source" position={Position.Bottom}
        style={{ width: 8, height: 8, background: cat.accent, border: 'none', bottom: -4 }} />
    </div>
  );
}

export default memo(CustomNode);
