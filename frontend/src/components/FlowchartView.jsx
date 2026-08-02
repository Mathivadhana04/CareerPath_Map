import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { fetchRoadmap, fetchSyllabus } from '../api/roadmapApi';
import { ChevronDown, ChevronUp, CheckSquare, Square, GitBranch, X, Book, MonitorPlay, FileText, Wrench, Zap } from 'lucide-react';

// ── Category Cyber-Amber/Gold colour map ──────────────────────────────────
const CAT = {
  fundamentals: { accent: '#f59e0b', bg: '#231805', light: '#fbbf24' },
  frameworks:   { accent: '#eab308', bg: '#221c04', light: '#fef08a' },
  tools:        { accent: '#d97706', bg: '#211303', light: '#fcd34d' },
  databases:    { accent: '#10b981', bg: '#081f17', light: '#6ee7b7' },
  advanced:     { accent: '#f97316', bg: '#241205', light: '#fdba74' },
  devops:       { accent: '#84cc16', bg: '#182405', light: '#bef264' },
  testing:      { accent: '#a855f7', bg: '#1b0a2a', light: '#d8b4fe' },
};
const DIFF_C = { Beginner: '#10b981', Intermediate: '#f59e0b', Advanced: '#ef4444' };

const SYLLABUS_CACHE = new Map();

function Label({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 8px' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
  );
}

// ── Drawer Syllabus Panel (No layout shifting on main page!) ─────────────────
function SyllabusDrawer({ role, choice, node, isCompleted, onToggleComplete, onClose }) {
  const [syl,    setSyl]    = useState(null);
  const [load,   setLoad]   = useState(true);
  const [err,    setErr]    = useState(null);
  const [open,   setOpen]   = useState({ 0: true });

  useEffect(() => {
    const cacheKey = `${role}::${choice.label}::${node.label}`;
    if (SYLLABUS_CACHE.has(cacheKey)) {
      setSyl(SYLLABUS_CACHE.get(cacheKey));
      setLoad(false);
      return;
    }

    let active = true;
    setLoad(true); setErr(null); setSyl(null);

    fetchSyllabus(role, choice.label, node.label)
      .then(d => {
        if (!active) return;
        SYLLABUS_CACHE.set(cacheKey, d);
        setSyl(d);
        setLoad(false);
      })
      .catch(e => {
        if (!active) return;
        setErr(e.message || 'Failed to load syllabus');
        setLoad(false);
      });

    return () => { active = false; };
  }, [role, choice.label, node.label]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const cat = CAT[node.category] || CAT.frameworks;

  return (
    <div className="syllabus-drawer-container">
      {/* Backdrop overlay */}
      <div className="syllabus-drawer-overlay" onClick={onClose} />

      {/* Drawer content */}
      <div className="syllabus-drawer-content">
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--color-elevated)',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', width: '100%', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-subtle)' }}>
              {role} / {choice.label}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'var(--color-overlay)', border: '1px solid var(--color-border)',
                borderRadius: 4, color: 'var(--color-text-muted)', cursor: 'pointer',
                width: 24, height: 24, display: 'flex', alignItems: 'center', justifyCenter: 'center', marginLeft: 'auto'
              }}
            >
              <X size={13} />
            </button>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--color-text)', margin: '0 0 10px' }}>
            {node.label}
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px', borderRadius: 4,
              background: `${cat.accent}20`, border: `1px solid ${cat.accent}40`, color: cat.light, fontWeight: 600
            }}>
              {node.category}
            </span>
            {node.difficulty && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px', borderRadius: 4,
                background: `${DIFF_C[node.difficulty] || '#f59e0b'}18`,
                border: `1px solid ${DIFF_C[node.difficulty] || '#f59e0b'}35`,
                color: DIFF_C[node.difficulty] || '#f59e0b', fontWeight: 600
              }}>
                {node.difficulty}
              </span>
            )}
            {isCompleted && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#0d1f17', border: '1px solid #10b98135', color: '#6ee7b7' }}>
                ✓ Completed
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {load && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', gap: 10, padding: '3rem 0' }}>
              <div className="spinner" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>
                Generating syllabus for <strong style={{ color: '#f59e0b' }}>{node.label}</strong>…
              </span>
            </div>
          )}

          {err && (
            <div style={{ padding: 14, borderRadius: 6, background: '#1a0a0a', border: '1px solid #ef444430', color: '#f87171', fontSize: 12 }}>
              ⚠️ {err}
            </div>
          )}

          {syl && !load && (<>
            {/* Overview */}
            {syl.overview && (
              <p style={{
                fontSize: 12.5, color: 'var(--color-text-muted)', lineHeight: 1.7,
                padding: '12px 14px', borderRadius: 6,
                background: 'var(--color-base)',
                borderLeft: `3px solid ${cat.accent}`,
                margin: '0 0 12px',
              }}>
                {syl.overview}
              </p>
            )}

            {/* Prerequisites */}
            {syl.prerequisites?.length > 0 && (<>
              <Label>Prerequisites</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {syl.prerequisites.map((p, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    padding: '3px 8px', borderRadius: 4,
                    background: 'var(--color-overlay)', border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                  }}>{p}</span>
                ))}
              </div>
            </>)}

            {/* Topics accordion (expands safely inside drawer without touching main page!) */}
            {syl.topics?.length > 0 && (<>
              <Label>Topics to Cover ({syl.topics.length})</Label>
              {syl.topics.map((t, i) => (
                <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 6, marginBottom: 6, overflow: 'hidden' }}>
                  <div
                    onClick={() => setOpen(p => ({ ...p, [i]: !p[i] }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                      background: 'var(--color-elevated)', cursor: 'pointer', userSelect: 'none'
                    }}
                  >
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: `${cat.accent}20`, border: `1px solid ${cat.accent}40`,
                      display: 'flex', alignItems: 'center', justifyCenter: 'center',
                      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: cat.light,
                    }}>{t.order || i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{t.name}</p>
                      {t.estimatedHours && (
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-subtle)', margin: 0 }}>
                          ⏱ {t.estimatedHours}h · {t.subtopics?.length || 0} subtopics
                        </p>
                      )}
                    </div>
                    {open[i] ? <ChevronUp size={13} color="var(--color-text-subtle)" /> : <ChevronDown size={13} color="var(--color-text-subtle)" />}
                  </div>

                  {open[i] && (
                    <div style={{ padding: '12px 14px', background: 'var(--color-base)', borderTop: '1px solid var(--color-border)' }}>
                      {t.description && (
                        <p style={{ fontSize: 11.5, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 8 }}>{t.description}</p>
                      )}
                      {t.subtopics?.map((sub, j) => (
                        <div key={j} style={{
                          marginBottom: 8, padding: '8px 10px', borderRadius: 5,
                          background: 'var(--color-elevated)', border: '1px solid var(--color-border)',
                        }}>
                          <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px' }}>📌 {sub.name}</p>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {sub.keyPoints?.map((kp, k) => (
                              <li key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
                                <span style={{ color: '#f59e0b', fontSize: 10, marginTop: 2, flexShrink: 0 }}>→</span>
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
                  padding: '10px 14px', borderRadius: 6, marginBottom: 6,
                  background: 'var(--color-elevated)', border: '1px solid var(--color-border)',
                }}>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px' }}>🛠 {p.title}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>{p.description}</p>
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
                  <span style={{ flex: 1, fontSize: 11.5, color: 'var(--color-text-muted)' }}>{r.title}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 7px', borderRadius: 3,
                    ...(r.isFree
                      ? { background: '#0d1f17', border: '1px solid #10b98130', color: '#6ee7b7' }
                      : { background: '#251800', border: '1px solid #f59e0b30', color: '#fcd34d' })
                  }}>{r.isFree ? 'Free' : 'Paid'}</span>
                </div>
              ))}
            </>)}

            {/* Mark complete button */}
            <button
              onClick={onToggleComplete}
              style={{
                marginTop: 16, width: '100%', padding: '11px 16px', borderRadius: 6, cursor: 'pointer',
                background: isCompleted ? '#0d1f17' : '#231805',
                border: `1px solid ${isCompleted ? '#10b98140' : '#f59e0b40'}`,
                color: isCompleted ? '#6ee7b7' : '#fbbf24',
                fontFamily: 'var(--font-sans)', fontSize: 12.5, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: 8,
              }}
            >
              {isCompleted ? <CheckSquare size={14}/> : <Square size={14}/>}
              {isCompleted ? 'Marked Complete · Click to undo' : 'Mark as Complete'}
            </button>
          </>)}
        </div>
      </div>
    </div>
  );
}

// ── Node Card ──────────────────────────────────
function NodeCard({ node, isSelected, isCompleted, onSelect, nodeRef }) {
  const cat    = CAT[node.category] || CAT.frameworks;
  const dColor = DIFF_C[node.difficulty] || '#9ca3af';

  return (
    <div
      ref={nodeRef}
      onClick={onSelect}
      style={{
        minWidth: 175, maxWidth: 210, width: 190,
        background: isSelected ? cat.bg : 'var(--color-elevated)',
        border: `1px solid ${isSelected ? cat.accent : isCompleted ? '#10b98155' : 'var(--color-border-muted)'}`,
        borderRadius: 8,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isSelected ? `0 0 0 1px ${cat.accent}50, 0 4px 18px ${cat.accent}20` : 'none',
      }}
    >
      {/* Top accent strip */}
      <div style={{
        height: 2.5, borderRadius: '8px 8px 0 0',
        background: isCompleted ? '#10b981' : cat.accent,
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
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#fef08a' }}>
              ⏱ {node.estimatedWeeks}w
            </span>
          )}

          {isCompleted && (
            <span style={{ fontSize: 10, color: '#10b981', marginLeft: 'auto' }}>✓</span>
          )}

          <div style={{ marginLeft: isCompleted ? 0 : 'auto' }}>
            <Zap size={11} color={isSelected ? cat.light : 'var(--color-text-subtle)'} />
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
  const [selectedNode, setSelectedNode] = useState(null);
  const [lines,    setLines]    = useState([]);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('completedNodes') || '{}'); }
    catch { return {}; }
  });

  const containerRef = useRef(null);
  const nodeRefs     = useRef({});

  // Fetch roadmap
  useEffect(() => {
    setLoading(true); setError(null); setSelectedNode(null); setLines([]);
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

  // Measure SVG connectors accurately (strictly fixed coordinates, zero shifting!)
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

    const t = setTimeout(draw, 50);
    return () => clearTimeout(t);
  }, [rawData]);

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

  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '3rem',
      background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8,
    }}>
      <div className="spinner" />
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>
        Building roadmap for <span style={{ color: '#f59e0b' }}>{choice.label}</span>…
      </p>
    </div>
  );

  if (error) return (
    <div style={{ padding: 16, borderRadius: 8, background: '#1a0a0a', border: '1px solid #ef444420' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#f87171' }}>Error: {error}</p>
    </div>
  );

  return (
    <div>
      {/* Header bar */}
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
              {total} skills · Click any card to view detailed syllabus drawer
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#10b981' }}>
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

      {/* Category legend */}
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

      {/* Flowchart canvas (STABLE, fixed card slots, zero layout jumping!) */}
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
              <path d="M0,1 L6,3.5 L0,6 Z" fill="#f59e0b50" />
            </marker>
          </defs>
          {lines.map(l => {
            const my = (l.y1 + l.y2) / 2;
            return (
              <path
                key={l.id}
                d={`M ${l.x1} ${l.y1} C ${l.x1} ${my}, ${l.x2} ${my}, ${l.x2} ${l.y2}`}
                stroke="#f59e0b40"
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
            <div key={lvl} style={{ marginBottom: lvlIdx < levels.length - 1 ? 48 : 0 }}>
              <div style={{
                display: 'flex', justifyContent: 'center',
                alignItems: 'center',
                gap: 20, flexWrap: 'wrap',
              }}>
                {byLevel[lvl].map(node => (
                  <NodeCard
                    key={node.id}
                    node={node}
                    isSelected={selectedNode?.id === node.id}
                    isCompleted={isCompleted(node.id)}
                    onSelect={() => setSelectedNode(node)}
                    nodeRef={el => { nodeRefs.current[node.id] = el; }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drawer Syllabus Modal — Slides open on right, zero page layout shifting! */}
      {selectedNode && (
        <SyllabusDrawer
          role={role}
          choice={choice}
          node={selectedNode}
          isCompleted={isCompleted(selectedNode.id)}
          onToggleComplete={() => toggleComplete(selectedNode.id)}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
