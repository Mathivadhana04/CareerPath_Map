import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { fetchRoadmap, fetchSyllabus } from '../api/roadmapApi';
import {
  ChevronDown, ChevronUp, CheckSquare, Square, GitBranch,
  X, Zap, BookOpen, Clock, Layers, ChevronRight, Target
} from 'lucide-react';

/* ── Category colour map ── */
const CAT = {
  fundamentals: { accent: '#f59e0b', bg: '#221504', light: '#fbbf24' },
  frameworks:   { accent: '#eab308', bg: '#1c1900', light: '#fef08a' },
  tools:        { accent: '#d97706', bg: '#1e1000', light: '#fcd34d' },
  databases:    { accent: '#10b981', bg: '#071a12', light: '#6ee7b7' },
  advanced:     { accent: '#f97316', bg: '#1e0e00', light: '#fdba74' },
  devops:       { accent: '#84cc16', bg: '#101e00', light: '#bef264' },
  testing:      { accent: '#a855f7', bg: '#160822', light: '#d8b4fe' },
};
const DIFF_C = { Beginner: '#10b981', Intermediate: '#f59e0b', Advanced: '#ef4444' };
const SYLLABUS_CACHE = new Map();

/* ── Section divider ── */
function Label({ children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, margin:'14px 0 8px' }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--color-text-subtle)' }}>
        {children}
      </span>
      <div style={{ flex:1, height:1, background:'var(--color-border)' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CREATIVE SYLLABUS SECTION — Full-width sticky reveal panel
   placed *below* the entire flowchart. The flowchart tree never
   shifts or jumps. A glowing beam connects the selected card to
   this panel using a pulsing accent line.
   ═══════════════════════════════════════════════════════════════ */
function SyllabusSection({ role, choice, node, isCompleted, onToggleComplete, onClose }) {
  const [syl,  setSyl]  = useState(null);
  const [load, setLoad] = useState(true);
  const [err,  setErr]  = useState(null);
  const [open, setOpen] = useState({ 0: true });

  useEffect(() => {
    const key = `${role}::${choice.label}::${node.label}`;
    if (SYLLABUS_CACHE.has(key)) { setSyl(SYLLABUS_CACHE.get(key)); setLoad(false); return; }
    let alive = true;
    setLoad(true); setErr(null); setSyl(null);
    fetchSyllabus(role, choice.label, node.label)
      .then(d  => { if (!alive) return; SYLLABUS_CACHE.set(key, d); setSyl(d); setLoad(false); })
      .catch(e => { if (!alive) return; setErr(e.message || 'Failed'); setLoad(false); });
    return () => { alive = false; };
  }, [role, choice.label, node.label]);

  const cat = CAT[node.category] || CAT.frameworks;

  return (
    <div
      style={{
        marginTop: 32,
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid ${cat.accent}30`,
        animation: 'syllabusReveal 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: `0 0 40px ${cat.accent}10, inset 0 0 0 1px ${cat.accent}15`,
      }}
    >
      {/* ── Connector beam (visual link to the flowchart above) ── */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, transparent 10%, ${cat.accent}80 50%, transparent 90%)`,
        animation: 'beamPulse 2s ease-in-out infinite',
      }} />

      {/* ── Panel header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '16px 20px 14px',
        background: `linear-gradient(135deg, ${cat.bg}, var(--color-surface))`,
        borderBottom: `1px solid ${cat.accent}20`,
      }}>
        <div style={{ flex: 1 }}>
          {/* breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, fontFamily:'var(--font-mono)', fontSize:9, color:'var(--color-text-subtle)' }}>
            <span>{role}</span>
            <ChevronRight size={9} />
            <span>{choice.label}</span>
            <ChevronRight size={9} />
            <span style={{ color: cat.light }}>{node.label}</span>
          </div>

          {/* title row */}
          <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 8, flexShrink: 0,
              background: `${cat.accent}15`,
              border: `1px solid ${cat.accent}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Target size={18} color={cat.accent} />
            </div>
            <div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:800, color:'var(--color-text)', margin:0, lineHeight:1.2 }}>
                {node.label}
              </h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:5 }}>
                {[
                  { label: node.category,   color: cat.accent,               bg: `${cat.accent}18`  },
                  { label: node.difficulty, color: DIFF_C[node.difficulty],  bg: `${DIFF_C[node.difficulty]}18` },
                  node.estimatedWeeks && { label: `${node.estimatedWeeks} weeks`, color:'#fef08a', bg:'#221504' },
                  isCompleted && { label:'✓ Completed', color:'#6ee7b7', bg:'#071a12' },
                ].filter(Boolean).map((b, i) => (
                  <span key={i} style={{
                    fontFamily:'var(--font-mono)', fontSize:9, fontWeight:600,
                    padding:'2px 7px', borderRadius:3, background:b.bg, color:b.color,
                    border:`1px solid ${b.color}35`,
                  }}>{b.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* close button */}
        <button
          onClick={onClose}
          style={{
            background:'var(--color-overlay)', border:'1px solid var(--color-border)', borderRadius:6,
            color:'var(--color-text-muted)', cursor:'pointer', width:28, height:28,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}
        ><X size={13} /></button>
      </div>

      {/* ── Panel body ── */}
      <div style={{ background:'var(--color-surface)', padding:'0 20px 20px' }}>

        {load && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'2.5rem 0' }}>
            <div className="spinner" style={{ borderTopColor: cat.accent }} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--color-text-muted)' }}>
              Generating syllabus for <strong style={{ color:cat.light }}>{node.label}</strong>…
            </span>
          </div>
        )}

        {err && (
          <div style={{ margin:'16px 0', padding:'12px 14px', borderRadius:6, background:'#1a0a0a', border:'1px solid #ef444330', color:'#f87171', fontSize:12 }}>
            ⚠ {err}
          </div>
        )}

        {syl && !load && (<>
          {/* Overview */}
          {syl.overview && (
            <p style={{
              fontSize:12.5, color:'var(--color-text-muted)', lineHeight:1.75,
              padding:'12px 14px', borderRadius:6,
              background:'var(--color-base)', borderLeft:`3px solid ${cat.accent}`,
              margin:'16px 0 4px',
            }}>{syl.overview}</p>
          )}

          {/* 2-col layout: topics on left, sidebar on right */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16, marginTop:16, alignItems:'start' }}>

            {/* ── LEFT: Topics ── */}
            <div>
              {syl.prerequisites?.length > 0 && (<>
                <Label>Prerequisites</Label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:4 }}>
                  {syl.prerequisites.map((p,i) => (
                    <span key={i} style={{
                      fontFamily:'var(--font-mono)', fontSize:10, padding:'3px 8px', borderRadius:4,
                      background:'var(--color-overlay)', border:'1px solid var(--color-border)', color:'var(--color-text-muted)',
                    }}>{p}</span>
                  ))}
                </div>
              </>)}

              {syl.topics?.length > 0 && (<>
                <Label>Topics ({syl.topics.length})</Label>
                {syl.topics.map((t, i) => (
                  <div key={i} style={{
                    border:`1px solid ${open[i] ? cat.accent+'30' : 'var(--color-border)'}`,
                    borderRadius:6, marginBottom:5, overflow:'hidden',
                    boxShadow: open[i] ? `0 0 12px ${cat.accent}08` : 'none',
                  }}>
                    <div
                      onClick={() => setOpen(p => ({ ...p, [i]: !p[i] }))}
                      style={{
                        display:'flex', alignItems:'center', gap:10, padding:'9px 13px',
                        background: open[i] ? cat.bg : 'var(--color-elevated)',
                        cursor:'pointer', userSelect:'none',
                      }}
                    >
                      <span style={{
                        width:22, height:22, borderRadius:'50%', flexShrink:0,
                        background:`${cat.accent}20`, border:`1px solid ${cat.accent}40`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, color:cat.light,
                      }}>{t.order ?? i+1}</span>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:12.5, fontWeight:600, color:'var(--color-text)', margin:0 }}>{t.name}</p>
                        {t.estimatedHours && (
                          <p style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--color-text-subtle)', margin:0 }}>
                            ⏱ {t.estimatedHours}h · {t.subtopics?.length||0} subtopics
                          </p>
                        )}
                      </div>
                      {open[i] ? <ChevronUp size={12} color={cat.accent}/> : <ChevronDown size={12} color="var(--color-text-subtle)"/>}
                    </div>
                    {open[i] && (
                      <div style={{ padding:'10px 13px', background:'var(--color-base)', borderTop:`1px solid ${cat.accent}20` }}>
                        {t.description && <p style={{ fontSize:11.5, color:'var(--color-text-muted)', lineHeight:1.6, marginBottom:8 }}>{t.description}</p>}
                        {t.subtopics?.map((sub,j) => (
                          <div key={j} style={{ marginBottom:6, padding:'7px 10px', borderRadius:5, background:'var(--color-elevated)', border:'1px solid var(--color-border)' }}>
                            <p style={{ fontSize:11.5, fontWeight:600, color:'var(--color-text)', margin:'0 0 4px' }}>📌 {sub.name}</p>
                            <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                              {sub.keyPoints?.map((kp,k) => (
                                <li key={k} style={{ display:'flex', gap:6, marginBottom:3 }}>
                                  <span style={{ color:cat.accent, fontSize:10, marginTop:2, flexShrink:0 }}>→</span>
                                  <span style={{ fontSize:11, color:'var(--color-text-muted)', lineHeight:1.5 }}>{kp}</span>
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
            </div>

            {/* ── RIGHT: Sidebar ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

              {/* Practice Projects */}
              {syl.practiceProjects?.length > 0 && (
                <div style={{ border:`1px solid ${cat.accent}25`, borderRadius:8, overflow:'hidden' }}>
                  <div style={{
                    padding:'8px 12px', background:cat.bg,
                    borderBottom:`1px solid ${cat.accent}20`,
                    fontFamily:'var(--font-mono)', fontSize:9, color:cat.light,
                    textTransform:'uppercase', letterSpacing:'0.08em',
                  }}>🛠 Practice Projects</div>
                  {syl.practiceProjects.map((p,i) => (
                    <div key={i} style={{ padding:'9px 12px', borderBottom: i < syl.practiceProjects.length-1 ? '1px solid var(--color-border)' : 'none', background:'var(--color-elevated)' }}>
                      <p style={{ fontSize:11.5, fontWeight:600, color:'var(--color-text)', margin:'0 0 3px' }}>{p.title}</p>
                      <p style={{ fontSize:10.5, color:'var(--color-text-muted)', lineHeight:1.5, margin:0 }}>{p.description}</p>
                      {p.difficulty && (
                        <span style={{
                          fontFamily:'var(--font-mono)', fontSize:9, marginTop:5, display:'inline-block',
                          padding:'1px 6px', borderRadius:3,
                          background:`${DIFF_C[p.difficulty]||'#f59e0b'}18`,
                          color:DIFF_C[p.difficulty]||'#f59e0b',
                          border:`1px solid ${DIFF_C[p.difficulty]||'#f59e0b'}35`,
                        }}>{p.difficulty}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Resources */}
              {syl.resources?.length > 0 && (
                <div style={{ border:'1px solid var(--color-border)', borderRadius:8, overflow:'hidden' }}>
                  <div style={{
                    padding:'8px 12px', background:'var(--color-elevated)',
                    borderBottom:'1px solid var(--color-border)',
                    fontFamily:'var(--font-mono)', fontSize:9, color:'var(--color-text-subtle)',
                    textTransform:'uppercase', letterSpacing:'0.08em',
                  }}>📚 Resources</div>
                  {syl.resources.map((r,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderBottom: i < syl.resources.length-1 ? '1px solid var(--color-border)' : 'none', background:'var(--color-base)' }}>
                      <span style={{ fontSize:14 }}>{r.type==='book'?'📗':r.type==='course'?'🎓':r.type==='documentation'?'📄':'🔗'}</span>
                      <span style={{ flex:1, fontSize:11, color:'var(--color-text-muted)', lineHeight:1.4 }}>{r.title}</span>
                      <span style={{
                        fontFamily:'var(--font-mono)', fontSize:9, padding:'2px 6px', borderRadius:3, flexShrink:0,
                        ...(r.isFree
                          ? { background:'#071a12', border:'1px solid #10b98130', color:'#6ee7b7' }
                          : { background:'#1e1000', border:'1px solid #f59e0b30', color:'#fcd34d' })
                      }}>{r.isFree?'Free':'Paid'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Progress button */}
              <button
                onClick={onToggleComplete}
                style={{
                  width:'100%', padding:'10px 14px', borderRadius:8, cursor:'pointer',
                  background: isCompleted ? '#071a12' : cat.bg,
                  border: `1px solid ${isCompleted ? '#10b98140' : cat.accent+'40'}`,
                  color: isCompleted ? '#6ee7b7' : cat.light,
                  fontFamily:'var(--font-sans)', fontSize:12.5, fontWeight:600,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow: isCompleted ? '0 0 16px #10b98112' : `0 0 16px ${cat.accent}10`,
                }}
              >
                {isCompleted ? <CheckSquare size={14}/> : <Square size={14}/>}
                {isCompleted ? 'Completed ✓ — click to undo' : 'Mark as Complete'}
              </button>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

/* ── Node Card ── */
function NodeCard({ node, isSelected, isCompleted, onSelect, nodeRef }) {
  const cat   = CAT[node.category] || CAT.frameworks;
  const dClr  = DIFF_C[node.difficulty] || '#9ca3af';
  return (
    <div
      ref={nodeRef}
      onClick={onSelect}
      style={{
        width: 185, flexShrink: 0,
        background: isSelected ? cat.bg : 'var(--color-elevated)',
        border: `1px solid ${isSelected ? cat.accent : isCompleted ? '#10b98155' : 'var(--color-border-muted)'}`,
        borderRadius: 8, cursor: 'pointer', position: 'relative', overflow: 'hidden',
        boxShadow: isSelected ? `0 0 0 1.5px ${cat.accent}60, 0 4px 22px ${cat.accent}20` : 'none',
        transform: isSelected ? 'translateY(-2px)' : 'none',
        transition: 'all 180ms ease',
      }}
    >
      <div style={{ height: 2.5, background: isCompleted ? '#10b981' : cat.accent, borderRadius:'8px 8px 0 0' }} />
      <div style={{ padding:'10px 12px' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:cat.light, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 }}>
          {node.category}
        </div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'var(--color-text)', lineHeight:1.3, marginBottom:8 }}>
          {node.label}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:9, padding:'1px 5px', borderRadius:3, background:`${dClr}18`, color:dClr, border:`1px solid ${dClr}30` }}>
            {node.difficulty}
          </span>
          {node.estimatedWeeks && (
            <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#fef08a' }}>⏱ {node.estimatedWeeks}w</span>
          )}
          {isCompleted && <span style={{ marginLeft:'auto', fontSize:11, color:'#10b981' }}>✓</span>}
        </div>
        {isSelected && (
          <div style={{
            marginTop: 8, display:'flex', alignItems:'center', gap:5,
            fontFamily:'var(--font-mono)', fontSize:9, color:cat.light,
          }}>
            <Zap size={9} color={cat.accent} />
            <span>syllabus below ↓</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function FlowchartView({ role, choice }) {
  const [rawData,  setRawData]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [lines,    setLines]    = useState([]);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('completedNodes') || '{}'); }
    catch { return {}; }
  });

  const containerRef = useRef(null);
  const nodeRefs     = useRef({});
  const syllabusRef  = useRef(null);

  useEffect(() => {
    setLoading(true); setError(null); setSelected(null); setLines([]);
    fetchRoadmap(role, choice.label)
      .then(d  => { setRawData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [role, choice]);

  const isCompleted = id => !!completed[`${role}||${choice.id}||${id}`];
  const toggleComplete = useCallback(id => {
    const key = `${role}||${choice.id}||${id}`;
    setCompleted(prev => {
      const n = { ...prev, [key]: !prev[key] };
      localStorage.setItem('completedNodes', JSON.stringify(n));
      return n;
    });
  }, [role, choice]);

  const handleSelectNode = useCallback((node) => {
    setSelected(prev => prev?.id === node.id ? null : node);
    // Smooth scroll to syllabus after short delay
    setTimeout(() => syllabusRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 80);
  }, []);

  useLayoutEffect(() => {
    if (!rawData?.nodes || !containerRef.current) return;
    const draw = () => {
      const cRect = containerRef.current?.getBoundingClientRect();
      if (!cRect) return;
      const nl = [];
      rawData.nodes.forEach(node => {
        (Array.isArray(node.children) ? node.children : []).forEach(childId => {
          const pEl = nodeRefs.current[node.id];
          const cEl = nodeRefs.current[childId];
          if (!pEl || !cEl) return;
          const pR = pEl.getBoundingClientRect();
          const cR = cEl.getBoundingClientRect();
          nl.push({
            id: `${node.id}-${childId}`,
            x1: pR.left + pR.width/2 - cRect.left,
            y1: pR.bottom - cRect.top,
            x2: cR.left + cR.width/2 - cRect.left,
            y2: cR.top - cRect.top,
          });
        });
      });
      setLines(nl);
    };
    const t = setTimeout(draw, 60);
    return () => clearTimeout(t);
  }, [rawData]);

  /* Group by level */
  const byLevel = {};
  (rawData?.nodes || []).forEach(n => {
    const l = n.level ?? 0;
    byLevel[l] = byLevel[l] || [];
    byLevel[l].push(n);
  });
  const levels = Object.keys(byLevel).map(Number).sort((a,b)=>a-b);
  const total  = rawData?.nodes?.length || 0;
  const done   = (rawData?.nodes || []).filter(n => isCompleted(n.id)).length;

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'3rem', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:8 }}>
      <div className="spinner" />
      <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--color-text-muted)' }}>
        Building roadmap for <span style={{ color:'#f59e0b' }}>{choice.label}</span>…
      </p>
    </div>
  );

  if (error) return (
    <div style={{ padding:16, borderRadius:8, background:'#1a0a0a', border:'1px solid #ef444420' }}>
      <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#f87171' }}>Error: {error}</p>
    </div>
  );

  return (
    <div>
      {/* ── Header bar ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background:'var(--color-elevated)', border:'1px solid var(--color-border)', borderRadius:'8px 8px 0 0', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:'1.35rem' }}>{choice.icon}</span>
          <div>
            <p style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--color-text)', margin:0 }}>{choice.label} Roadmap</p>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--color-text-subtle)', margin:0 }}>
              {total} skills · Click any card → syllabus loads below
            </p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#10b981' }}>✓ {done}/{total}</span>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <GitBranch size={11} color="var(--color-text-subtle)" />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--color-text-subtle)' }}>
              {choice.label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}
            </span>
          </div>
        </div>
      </div>

      {/* ── Category legend ── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'5px 14px', padding:'7px 16px', background:'var(--color-surface)', border:'1px solid var(--color-border)', borderTop:'none' }}>
        {[...new Set((rawData?.nodes||[]).map(n=>n.category).filter(Boolean))].map(cat => (
          <div key={cat} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:2, background:(CAT[cat]||CAT.frameworks).accent }} />
            <span style={{ fontFamily:'var(--font-mono)', fontSize:9, textTransform:'capitalize', color:'var(--color-text-subtle)' }}>{cat}</span>
          </div>
        ))}
      </div>

      {/* ── Flowchart canvas (never moves when syllabus opens) ── */}
      <div
        ref={containerRef}
        style={{
          position:'relative',
          background:'var(--color-surface)',
          border:'1px solid var(--color-border)',
          borderTop:'none',
          borderRadius:'0 0 8px 8px',
          padding:'32px 24px 40px',
          overflowX:'auto',
        }}
      >
        {/* SVG connectors */}
        <svg style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0, overflow:'visible' }}>
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
                stroke="#f59e0b40" strokeWidth="1.5" fill="none" markerEnd="url(#arr)"
              />
            );
          })}
        </svg>

        {/* Level rows */}
        <div style={{ position:'relative', zIndex:1 }}>
          {levels.map((lvl, idx) => (
            <div key={lvl} style={{ marginBottom: idx < levels.length-1 ? 48 : 0 }}>
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:18, flexWrap:'wrap' }}>
                {byLevel[lvl].map(node => (
                  <NodeCard
                    key={node.id}
                    node={node}
                    isSelected={selected?.id === node.id}
                    isCompleted={isCompleted(node.id)}
                    onSelect={() => handleSelectNode(node)}
                    nodeRef={el => { nodeRefs.current[node.id] = el; }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Syllabus section anchor ── */}
      <div ref={syllabusRef}>
        {selected && (
          <SyllabusSection
            role={role}
            choice={choice}
            node={selected}
            isCompleted={isCompleted(selected.id)}
            onToggleComplete={() => toggleComplete(selected.id)}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
