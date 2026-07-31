import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { fetchRoadmap, fetchSyllabus } from '../api/roadmapApi';
import { ChevronDown, ChevronUp, CheckSquare, Square, GitBranch } from 'lucide-react';

// ── Category colour map ──────────────────────────────────
const CAT = {
  fundamentals: { accent: '#8b5cf6', bg: '#13103a', light: '#a78bfa' },
  frameworks:   { accent: '#3b82f6', bg: '#0f1e38', light: '#93c5fd' },
  tools:        { accent: '#22d3ee', bg: '#071e2a', light: '#67e8f9' },
  databases:    { accent: '#3fb950', bg: '#0a1f14', light: '#86efac' },
  advanced:     { accent: '#ec4899', bg: '#2a0820', light: '#f9a8d4' },
  devops:       { accent: '#f59e0b', bg: '#251800', light: '#fcd34d' },
  testing:      { accent: '#a78bfa', bg: '#14103a', light: '#c4b5fd' },
};
const DIFF_C = { Beginner: '#3fb950', Intermediate: '#d29922', Advanced: '#f85149' };

// ── Tiny helpers ─────────────────────────────────────────
function Label({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 8px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
  );
}

// ── Inline Syllabus ───────────────────────────────────────
function InlineSyllabus({ role, choice, node, isCompleted, onToggleComplete }) {
  const [syl,    setSyl]    = useState(null);
  const [load,   setLoad]   = useState(true);
  const [err,    setErr]    = useState(null);
  const [open,   setOpen]   = useState({ 0: true });

  useEffect(() => {
    setLoad(true); setErr(null); setSyl(null);
    fetchSyllabus(role, choice.label, node.label)
      .then(d => { setSyl(d); setLoad(false); })
      .catch(e => { setErr(e.message); setLoad(false); });
  }, [role, choice.label, node.label]);

  const cat = CAT[node.category] || CAT.frameworks;

  return (
    <div style={{
      marginTop: 8,
      background: 'var(--color-base)',
      border: `1px solid ${cat.accent}35`,
      borderTop: `2px solid ${cat.accent}`,
      borderRadius: 8,
      padding: 16,
      width: 520,
      maxWidth: '90vw',
      textAlign: 'left',
    }}>
      {load && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
          <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)' }}>
            Generating syllabus…
          </span>
        </div>
      )}
      {err && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#f87171' }}>{err}</p>}

      {syl && !load && (<>
        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {[
            syl.difficulty && { label: syl.difficulty, color: DIFF_C[syl.difficulty] || '#8b949e' },
            syl.estimatedDuration && { label: `⏱ ${syl.estimatedDuration}`, color: '#22d3ee' },
          ].filter(Boolean).map((b, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px', borderRadius: 4,
              background: `${b.color}15`, border: `1px solid ${b.color}35`, color: b.color,
            }}>{b.label}</span>
          ))}
          {isCompleted && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#0d1f17', border: '1px solid #3fb95035', color: '#86efac' }}>
              ✓ Completed
            </span>
          )}
        </div>

        {/* Overview */}
        {syl.overview && (
          <p style={{
            fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.7,
            padding: '10px 12px', borderRadius: 6,
            background: 'var(--color-elevated)',
            borderLeft: `2px solid ${cat.accent}`,
            marginBottom: 4,
          }}>{syl.overview}</p>
        )}

        {/* Prerequisites */}
        {syl.prerequisites?.length > 0 && (<>
          <Label>Prerequisites</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 4 }}>
            {syl.prerequisites.map((p, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                padding: '2px 8px', borderRadius: 4,
                background: 'var(--color-overlay)', border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}>{p}</span>
            ))}
          </div>
        </>)}

        {/* Topics */}
        {syl.topics?.length > 0 && (<>
          <Label>Topics to Cover ({syl.topics.length})</Label>
          {syl.topics.map((t, i) => (
            <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 6, marginBottom: 5, overflow: 'hidden' }}>
              <div
                onClick={() => setOpen(p => ({ ...p, [i]: !p[i] }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                  background: 'var(--color-elevated)', cursor: 'pointer',
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: `${cat.accent}20`, border: `1px solid ${cat.accent}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: cat.light,
                }}>{t.order || i + 1}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{t.name}</p>
                  {t.estimatedHours && (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-subtle)', margin: 0 }}>
                      ⏱ {t.estimatedHours}h · {t.subtopics?.length || 0} subtopics
                    </p>
                  )}
                </div>
                {open[i] ? <ChevronUp size={12} color="var(--color-text-subtle)" /> : <ChevronDown size={12} color="var(--color-text-subtle)" />}
              </div>

              {open[i] && (
                <div style={{ padding: '10px 12px', background: 'var(--color-base)', borderTop: '1px solid var(--color-border)' }}>
                  {t.description && (
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 8 }}>{t.description}</p>
                  )}
                  {t.subtopics?.map((sub, j) => (
                    <div key={j} style={{
                      marginBottom: 6, padding: '8px 10px', borderRadius: 5,
                      background: 'var(--color-elevated)', border: '1px solid var(--color-border)',
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 5px' }}>📌 {sub.name}</p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {sub.keyPoints?.map((kp, k) => (
                          <li key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
                            <span style={{ color: cat.accent, fontSize: 10, marginTop: 2, flexShrink: 0 }}>→</span>
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>)}

        {/* Practice Projects */}
        {syl.practiceProjects?.length > 0 && (<>
          <Label>Practice Projects</Label>
          {syl.practiceProjects.map((p, i) => (
            <div key={i} style={{
              padding: '10px 12px', borderRadius: 6, marginBottom: 5,
              background: 'var(--color-elevated)', border: '1px solid var(--color-border)',
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px' }}>🛠 {p.title}</p>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>{p.description}</p>
            </div>
          ))}
        </>)}

        {/* Resources */}
        {syl.resources?.length > 0 && (<>
          <Label>Resources</Label>
          {syl.resources.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 6, marginBottom: 4,
              background: 'var(--color-elevated)', border: '1px solid var(--color-border)',
            }}>
              <span>{r.type === 'book' ? '📚' : r.type === 'course' ? '🎓' : r.type === 'documentation' ? '📄' : '🔗'}</span>
              <span style={{ flex: 1, fontSize: 11, color: 'var(--color-text-muted)' }}>{r.title}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 7px', borderRadius: 3,
                ...(r.isFree
                  ? { background: '#0d1f17', border: '1px solid #3fb95030', color: '#86efac' }
                  : { background: '#1a1400', border: '1px solid #d2992230', color: '#fcd34d' })
              }}>{r.isFree ? 'Free' : 'Paid'}</span>
            </div>
          ))}
        </>)}

        {/* Mark complete */}
        <button
          onClick={onToggleComplete}
          style={{
            marginTop: 12, width: '100%', padding: '10px 16px', borderRadius: 6, cursor: 'pointer',
            background: isCompleted ? '#0d1f17' : '#1a2f4a',
            border: `1px solid ${isCompleted ? '#3fb95040' : '#3b82f640'}`,
            color: isCompleted ? '#86efac' : '#93c5fd',
            fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {isCompleted ? '✅ Marked Complete — click to undo' : '🎯 Mark as Complete'}
        </button>
      </>)}
    </div>
  );
}

// ── Individual node card ──────────────────────────────────
function NodeCard({ node, isExpanded, isCompleted, onToggle, nodeRef }) {
  const cat   = CAT[node.category] || CAT.frameworks;
  const dColor = DIFF_C[node.difficulty] || '#8b949e';

  return (
    <div
      ref={nodeRef}
      onClick={onToggle}
      style={{
        minWidth: 175, maxWidth: 210, width: 190,
        background: isExpanded ? cat.bg : 'var(--color-elevated)',
        border: `1px solid ${isExpanded ? cat.accent : isCompleted ? '#3fb95055' : 'var(--color-border-muted)'}`,
        borderRadius: 8,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isExpanded ? `0 0 0 1px ${cat.accent}30, 0 4px 18px ${cat.accent}15` : 'none',
      }}
    >
      {/* Top accent strip */}
      <div style={{
        height: 2, borderRadius: '8px 8px 0 0',
        background: isCompleted ? '#3fb950' : cat.accent,
      }} />

      <div style={{ padding: '10px 13px' }}>
        {/* Category label */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, color: cat.light,
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5,
        }}>
          {node.category || 'skill'}
        </div>

        {/* Main label */}
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
          color: 'var(--color-text)', lineHeight: 1.3, marginBottom: 8,
        }}>
          {node.label}
        </div>

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
            padding: '2px 6px', borderRadius: 3,
            background: `${dColor}18`, color: dColor, border: `1px solid ${dColor}35`,
          }}>{node.difficulty}</span>

          {node.estimatedWeeks && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22d3ee' }}>
              ⏱ {node.estimatedWeeks}w
            </span>
          )}

          {isCompleted && (
            <span style={{ fontSize: 10, color: '#3fb950', marginLeft: 'auto' }}>✓</span>
          )}

          <div style={{ marginLeft: isCompleted ? 0 : 'auto' }}>
            {isExpanded
              ? <ChevronUp size={11} color={cat.light} />
              : <ChevronDown size={11} color="var(--color-text-subtle)" />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main FlowchartView ────────────────────────────────────
export default function FlowchartView({ role, choice }) {
  const [rawData,  setRawData]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [lines,    setLines]    = useState([]);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('completedNodes') || '{}'); }
    catch { return {}; }
  });

  const containerRef = useRef(null);
  const nodeRefs     = useRef({});

  // Fetch roadmap
  useEffect(() => {
    setLoading(true); setError(null); setExpanded(null); setLines([]);
    fetchRoadmap(role, choice.label)
      .then(d  => { setRawData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [role, choice]);

  const isCompleted = id => !!completed[`${role}||${choice.id}||${id}`];

  const toggleComplete = useCallback(id => {
    const key = `${role}||${choice.id}||${id}`;
    setCompleted(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('completedNodes', JSON.stringify(next));
      return next;
    });
  }, [role, choice]);

  const handleToggle = useCallback(id => {
    setExpanded(prev => prev === id ? null : id);
  }, []);

  // Draw SVG lines after DOM settles
  useLayoutEffect(() => {
    if (!rawData?.nodes || !containerRef.current) return;

    const draw = () => {
      const cRect = containerRef.current?.getBoundingClientRect();
      if (!cRect) return;

      const newLines = [];
      rawData.nodes.forEach(node => {
        const children = Array.isArray(node.children) ? node.children : [];
        children.forEach(childId => {
          const pEl = nodeRefs.current[node.id];
          const cEl = nodeRefs.current[childId];
          if (!pEl || !cEl) return;

          const pRect = pEl.getBoundingClientRect();
          const cRect2 = cEl.getBoundingClientRect();

          newLines.push({
            id: `${node.id}-${childId}`,
            x1: pRect.left + pRect.width / 2 - cRect.left,
            y1: pRect.bottom - cRect.top,
            x2: cRect2.left + cRect2.width / 2 - cRect.left,
            y2: cRect2.top - cRect.top,
          });
        });
      });
      setLines(newLines);
    };

    // Slight delay so DOM is measured after reflow
    const t = setTimeout(draw, 60);
    return () => clearTimeout(t);
  }, [rawData, expanded]);

  // Group by level
  const byLevel = {};
  (rawData?.nodes || []).forEach(n => {
    const lvl = n.level ?? 0;
    byLevel[lvl] = byLevel[lvl] || [];
    byLevel[lvl].push(n);
  });
  const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);
  const total = rawData?.nodes?.length || 0;
  const done  = rawData?.nodes?.filter(n => isCompleted(n.id)).length || 0;

  // ── Render ──
  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '3rem',
      background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8,
    }}>
      <div className="spinner" />
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>
        Building roadmap for <span style={{ color: '#3b82f6' }}>{choice.label}</span>…
      </p>
    </div>
  );

  if (error) return (
    <div style={{ padding: 16, borderRadius: 8, background: '#140a0a', border: '1px solid #f8514920' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f87171' }}>Error: {error}</p>
    </div>
  );

  return (
    <div>
      {/* ── Header bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'var(--color-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px 8px 0 0',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.4rem' }}>{choice.icon}</span>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--color-text)', margin: 0 }}>
              {choice.label} Roadmap
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-subtle)', margin: 0 }}>
              {total} skills · Click any card to see full syllabus inline
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3fb950' }}>
            ✓ {done}/{total}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <GitBranch size={11} color="var(--color-text-subtle)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-subtle)' }}>
              {choice.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
            </span>
          </div>
        </div>
      </div>

      {/* ── Category legend ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '6px 16px',
        padding: '8px 16px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderTop: 'none',
      }}>
        {[...new Set((rawData?.nodes || []).map(n => n.category).filter(Boolean))].map(cat => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: (CAT[cat] || CAT.frameworks).accent, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'capitalize', color: 'var(--color-text-subtle)' }}>
              {cat}
            </span>
          </div>
        ))}
      </div>

      {/* ── Flowchart canvas ── */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          padding: '32px 24px 40px',
          overflowX: 'auto',
        }}
      >
        {/* SVG connector lines */}
        <svg style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 0, overflow: 'visible',
        }}>
          <defs>
            <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M0,1 L6,3.5 L0,6 Z" fill="#3b82f650" />
            </marker>
          </defs>
          {lines.map(l => {
            const my = (l.y1 + l.y2) / 2;
            return (
              <path
                key={l.id}
                d={`M ${l.x1} ${l.y1} C ${l.x1} ${my}, ${l.x2} ${my}, ${l.x2} ${l.y2}`}
                stroke="#3b82f640"
                strokeWidth="1.5"
                fill="none"
                markerEnd="url(#arr)"
              />
            );
          })}
        </svg>

        {/* Level rows */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {levels.map((lvl, lvlIdx) => (
            <div key={lvl} style={{ marginBottom: lvlIdx < levels.length - 1 ? 44 : 0 }}>
              {/* Nodes in this level */}
              <div style={{
                display: 'flex', justifyContent: 'center',
                alignItems: 'flex-start',
                gap: 18, flexWrap: 'wrap',
              }}>
                {byLevel[lvl].map(node => (
                  <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    <NodeCard
                      node={node}
                      isExpanded={expanded === node.id}
                      isCompleted={isCompleted(node.id)}
                      onToggle={() => handleToggle(node.id)}
                      nodeRef={el => { nodeRefs.current[node.id] = el; }}
                    />

                    {/* Inline syllabus — expands below the card */}
                    {expanded === node.id && (
                      <InlineSyllabus
                        role={role}
                        choice={choice}
                        node={node}
                        isCompleted={isCompleted(node.id)}
                        onToggleComplete={() => toggleComplete(node.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
