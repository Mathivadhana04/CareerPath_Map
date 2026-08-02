import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

const DIFF_STYLE = {
  Beginner:     { bg: '#0d1f17', border: '#3fb95030', text: '#86efac' },
  Intermediate: { bg: '#1a1400', border: '#d2992230', text: '#fcd34d' },
  Advanced:     { bg: '#1a0a0a', border: '#f8514930', text: '#fca5a5' },
};

export default function ChoicesGrid({ choices, selectedId, onSelect }) {
  if (!choices.length) return (
    <p className="text-xs font-mono" style={{ color: 'var(--color-text-subtle)' }}>
      No choices generated.
    </p>
  );

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {choices.map(ch => {
        const active  = selectedId === ch.id;
        const diff    = DIFF_STYLE[ch.difficulty] || DIFF_STYLE.Intermediate;

        return (
          <div
            key={ch.id}
            onClick={() => onSelect(ch)}
            className="relative p-4 rounded-lg cursor-pointer"
            style={{
              background: active ? '#231805' : 'var(--color-elevated)',
              border: `1px solid ${active ? '#f59e0b' : 'var(--color-border)'}`,
              boxShadow: active ? '0 0 0 1px #f59e0b40' : 'none',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--color-border-muted)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          >
            {/* Active indicator line */}
            {active && (
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-lg" style={{ background: 'var(--color-blue)' }} />
            )}

            {/* Icon + label */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-xl"
                  style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)' }}
                >
                  {ch.icon}
                </div>
                <div>
                  <p className="font-display font-700 text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
                    {ch.label}
                  </p>
                  <p className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>
                    {ch.skillCount} skills
                  </p>
                </div>
              </div>
              <ChevronRight
                size={14}
                color={active ? 'var(--color-blue)' : 'var(--color-text-subtle)'}
                style={{ transform: active ? 'translateX(2px)' : 'none' }}
              />
            </div>

            {/* Description */}
            <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {ch.description}
            </p>

            {/* Tags */}
            {ch.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {ch.tags.map(t => (
                  <span key={t} className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text-subtle)' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded"
                style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: diff.text }}
              >
                {ch.difficulty}
              </span>
              {active && (
                <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: 'var(--color-blue)' }}>
                  Selected <ArrowRight size={10} />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
