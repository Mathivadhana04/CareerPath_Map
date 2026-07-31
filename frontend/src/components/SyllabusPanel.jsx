import React, { useState, useEffect } from 'react';
import { fetchSyllabus } from '../api/roadmapApi';
import { X, ChevronDown, CheckSquare, Square, Book, MonitorPlay, FileText, Wrench } from 'lucide-react';

const RES_ICONS = { book: <Book size={13}/>, course: <MonitorPlay size={13}/>, documentation: <FileText size={13}/>, tutorial: <Wrench size={13}/> };

const DIFF_STYLE = {
  Beginner:     { bg: '#0d1f17', border: '#3fb95030', text: '#86efac' },
  Intermediate: { bg: '#1a1400', border: '#d2992230', text: '#fcd34d' },
  Advanced:     { bg: '#1a0a0a', border: '#f8514930', text: '#fca5a5' },
};

function TopicRow({ topic, idx }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <div className="topic-row">
      <div className="topic-row-header" onClick={() => setOpen(o => !o)}>
        <span
          className="font-mono text-[10px] font-700 w-5 h-5 flex items-center justify-center rounded shrink-0"
          style={{ background: 'var(--color-overlay)', color: 'var(--color-blue)', border: '1px solid var(--color-border)' }}
        >
          {topic.order || idx + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-600 truncate" style={{ color: 'var(--color-text)' }}>
            {topic.name}
          </p>
          <p className="font-mono text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>
            {topic.estimatedHours ? `${topic.estimatedHours}h` : ''}{topic.subtopics?.length ? ` · ${topic.subtopics.length} subtopics` : ''}
          </p>
        </div>
        <ChevronDown
          size={13}
          color="var(--color-text-subtle)"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms', flexShrink: 0 }}
        />
      </div>

      {open && (
        <div className="topic-row-body">
          {topic.description && (
            <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {topic.description}
            </p>
          )}
          {(topic.subtopics || []).map((sub, i) => (
            <div key={i} className="subtopic-card mb-2">
              <p className="text-xs font-600 mb-1.5" style={{ color: 'var(--color-text)' }}>
                {sub.name}
              </p>
              <ul className="space-y-1">
                {(sub.keyPoints || []).map((kp, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="font-mono text-[10px] mt-0.5 shrink-0" style={{ color: 'var(--color-blue)' }}>→</span>
                    <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{kp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SyllabusPanel({ role, choice, node, isCompleted, onMarkComplete, onClose }) {
  const [syllabus, setSyllabus] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    setLoading(true); setError(null); setSyllabus(null);
    fetchSyllabus(role, choice.label, node.label)
      .then(d  => { setSyllabus(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [role, choice, node]);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const diff   = DIFF_STYLE[syllabus?.difficulty || node.difficulty] || DIFF_STYLE.Intermediate;

  return (
    <div className="syllabus-slide" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="syllabus-backdrop" onClick={onClose} />

      <div className="syllabus-drawer">
        {/* Header */}
        <div className="syllabus-drawer-header">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>
              {role} / {choice.label} / <span style={{ color: 'var(--color-text-muted)' }}>{node.label}</span>
            </p>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-6 h-6 rounded cursor-pointer"
              style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1a0a0a'; e.currentTarget.style.color = '#f87171'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-overlay)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              <X size={12} />
            </button>
          </div>

          {/* Title */}
          <h2 className="font-display font-800 text-lg tracking-tight mb-3" style={{ color: 'var(--color-text)' }}>
            {node.label}
          </h2>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(syllabus?.difficulty || node.difficulty) && (
              <span
                className="font-mono text-[10px] px-2 py-0.5 rounded"
                style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: diff.text }}
              >
                {syllabus?.difficulty || node.difficulty}
              </span>
            )}
            {syllabus?.estimatedDuration && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded"
                style={{ background: '#062030', border: '1px solid #22d3ee30', color: '#67e8f9' }}>
                ⏱ {syllabus.estimatedDuration}
              </span>
            )}
            {isCompleted && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded"
                style={{ background: '#0d1f17', border: '1px solid #3fb95030', color: '#86efac' }}>
                ✓ Completed
              </span>
            )}
          </div>

          {/* Overview */}
          {syllabus?.overview && (
            <p
              className="text-xs leading-relaxed p-3 rounded"
              style={{ background: 'var(--color-base)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderLeft: '2px solid var(--color-blue)' }}
            >
              {syllabus.overview}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="syllabus-drawer-body">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-14">
              <div className="spinner" />
              <p className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Generating syllabus…
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded" style={{ background: '#1a0a0a', border: '1px solid #f8514925', color: '#f87171' }}>
              <p className="font-mono text-xs">{error}</p>
            </div>
          )}

          {syllabus && !loading && (
            <>
              {/* Prerequisites */}
              {syllabus.prerequisites?.length > 0 && (
                <>
                  <SectionLabel>Prerequisites</SectionLabel>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {syllabus.prerequisites.map((p, i) => (
                      <span key={i} className="font-mono text-[10px] px-2 py-0.5 rounded"
                        style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {/* Topics */}
              {syllabus.topics?.length > 0 && (
                <>
                  <SectionLabel>Topics ({syllabus.topics.length})</SectionLabel>
                  {syllabus.topics.map((t, i) => (
                    <TopicRow key={t.id || i} topic={t} idx={i} />
                  ))}
                </>
              )}

              {/* Projects */}
              {syllabus.practiceProjects?.length > 0 && (
                <>
                  <SectionLabel>Practice Projects</SectionLabel>
                  {syllabus.practiceProjects.map((p, i) => (
                    <div key={i} className="mb-2 p-3 rounded"
                      style={{ background: 'var(--color-elevated)', border: '1px solid var(--color-border)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-600" style={{ color: 'var(--color-text)' }}>
                          🛠 {p.title}
                        </p>
                        {p.difficulty && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0"
                            style={{ background: 'var(--color-overlay)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                            {p.difficulty}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                        {p.description}
                      </p>
                    </div>
                  ))}
                </>
              )}

              {/* Resources */}
              {syllabus.resources?.length > 0 && (
                <>
                  <SectionLabel>Resources</SectionLabel>
                  {syllabus.resources.map((r, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded mb-1.5"
                      style={{ background: 'var(--color-elevated)', border: '1px solid var(--color-border)' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        {RES_ICONS[r.type] || <FileText size={13}/>}
                      </span>
                      <span className="flex-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.title}</span>
                      <span
                        className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                        style={r.isFree
                          ? { background: '#0d1f17', border: '1px solid #3fb95030', color: '#86efac' }
                          : { background: '#1a1400', border: '1px solid #d2992230', color: '#fcd34d' }}
                      >
                        {r.isFree ? 'Free' : 'Paid'}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {/* Mark complete */}
              <button
                onClick={onMarkComplete}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded text-xs font-600 cursor-pointer"
                style={{
                  background: isCompleted ? '#0d1f17' : '#1d2f4a',
                  border: `1px solid ${isCompleted ? '#3fb95040' : '#3b82f640'}`,
                  color: isCompleted ? '#86efac' : '#93c5fd',
                }}
              >
                {isCompleted ? <CheckSquare size={13}/> : <Square size={13}/>}
                {isCompleted ? 'Marked Complete · Click to undo' : 'Mark as Complete'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 my-3">
      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
    </div>
  );
}
