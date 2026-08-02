import React, { useState, useEffect } from 'react';
import { Search, Terminal, Zap, GitBranch, ArrowRight, Code2, Database, Cpu, Globe, Shield } from 'lucide-react';

const ROLES = [
  { label: 'Backend Developer',    icon: <Code2 size={13}/>,    tag: 'backend'    },
  { label: 'Frontend Developer',   icon: <Globe size={13}/>,    tag: 'frontend'   },
  { label: 'Full Stack Developer', icon: <Zap size={13}/>,      tag: 'fullstack'  },
  { label: 'Data Scientist',       icon: <Database size={13}/>, tag: 'data'       },
  { label: 'DevOps Engineer',      icon: <Terminal size={13}/>, tag: 'devops'     },
  { label: 'ML Engineer',          icon: <Cpu size={13}/>,      tag: 'ml'         },
  { label: 'AI Engineer',          icon: <Cpu size={13}/>,      tag: 'ai'         },
  { label: 'Cloud Engineer',       icon: <Globe size={13}/>,    tag: 'cloud'      },
  { label: 'Cybersecurity Engineer', icon: <Shield size={13}/>, tag: 'security'   },
  { label: 'Android Developer',    icon: <Code2 size={13}/>,    tag: 'android'    },
  { label: 'iOS Developer',        icon: <Code2 size={13}/>,    tag: 'ios'        },
  { label: 'Data Engineer',        icon: <Database size={13}/>, tag: 'dataeng'    },
  { label: 'Blockchain Developer', icon: <GitBranch size={13}/>,tag: 'blockchain' },
  { label: 'Game Developer',       icon: <Zap size={13}/>,      tag: 'game'       },
  { label: 'QA Engineer',          icon: <Shield size={13}/>,   tag: 'qa'         },
  { label: 'SRE',                  icon: <Terminal size={13}/>, tag: 'sre'        },
  { label: 'UI/UX Designer',       icon: <Globe size={13}/>,    tag: 'design'     },
  { label: 'Product Manager',      icon: <Zap size={13}/>,      tag: 'pm'         },
];

const TERMINAL_LINES = [
  { text: '$ careerpathmap generate --role "Backend Developer"', color: '#8b949e' },
  { text: '✓ Fetching role data via Groq LLM...', color: '#3fb950' },
  { text: '✓ Building skill graph (16 nodes)', color: '#3fb950' },
  { text: '✓ Generating roadmap with tech stack choices', color: '#3fb950' },
  { text: '→ Ready. Select a node to view full syllabus.', color: '#3b82f6' },
];

export default function LandingPage({ onSearch }) {
  const [query, setQuery]           = useState('');
  const [termIdx, setTermIdx]       = useState(0);
  const [shownLines, setShownLines] = useState([]);

  // Terminal typewriter
  useEffect(() => {
    if (termIdx >= TERMINAL_LINES.length) return;
    const t = setTimeout(() => {
      setShownLines(l => [...l, TERMINAL_LINES[termIdx]]);
      setTermIdx(i => i + 1);
    }, 700);
    return () => clearTimeout(t);
  }, [termIdx]);

  const submit = (role) => {
    const r = role || query.trim();
    if (r) onSearch(r);
  };

  return (
    <div
      className="min-h-[calc(100vh-48px)] flex flex-col"
      style={{ background: 'var(--color-base)' }}
    >
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-3xl mx-auto w-full">

        {/* Eyebrow badge */}
        <div
          className="flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full text-xs font-mono"
          style={{ background: '#231805', border: '1px solid #f59e0b40', color: '#fbbf24' }}
        >
          <Zap size={11} />
          <span>AI-powered · Groq LLM · Any role · Realtime</span>
        </div>

        {/* Title */}
        <h1
          className="font-display text-center mb-4 tracking-tight leading-tight"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, color: 'var(--color-text)' }}
        >
          Career Roadmap{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #f59e0b, #fef08a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Generator
          </span>
        </h1>

        <p
          className="text-center text-sm mb-8 leading-relaxed max-w-xl"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Type any engineering role. Get an AI-generated skill graph, tech stack choices,
          and a detailed syllabus for each skill — from scratch to job-ready.
        </p>

        {/* Search bar */}
        <div
          className="w-full flex items-center gap-0 mb-4 rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--color-border-muted)', background: 'var(--color-elevated)' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = '#f59e0b'}
          onBlurCapture={e  => e.currentTarget.style.borderColor = 'var(--color-border-muted)'}
        >
          <Search size={15} color="var(--color-text-subtle)" className="ml-3.5 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder='e.g. "Backend Developer", "AI Engineer", "DevOps"...'
            className="flex-1 px-3 py-3 text-sm bg-transparent outline-none"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-sans)' }}
          />
          <button
            onClick={() => submit()}
            disabled={!query.trim()}
            className="flex items-center gap-1.5 px-4 py-3 text-sm font-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: query.trim() ? '#231805' : 'transparent',
              color: query.trim() ? '#fbbf24' : 'var(--color-text-subtle)',
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            Generate <ArrowRight size={14} />
          </button>
        </div>

        {/* Role chips */}
        <div className="flex flex-wrap gap-1.5 justify-center mb-10">
          {ROLES.map(r => (
            <button
              key={r.tag}
              onClick={() => submit(r.label)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs cursor-pointer font-mono"
              style={{
                background: 'var(--color-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f660'; e.currentTarget.style.color = '#93c5fd'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        {/* Terminal card */}
        <div className="terminal-card w-full">
          <div className="terminal-bar">
            <span className="terminal-dot" style={{ background: '#f85149' }} />
            <span className="terminal-dot" style={{ background: '#d29922' }} />
            <span className="terminal-dot" style={{ background: '#3fb950' }} />
            <span className="font-mono text-[11px] ml-2" style={{ color: 'var(--color-text-subtle)' }}>
              careerpathmap — bash
            </span>
          </div>
          <div className="terminal-body" style={{ minHeight: 100 }}>
            {shownLines.map((line, i) => (
              <div key={i} style={{ color: line.color }}>{line.text}</div>
            ))}
            {termIdx < TERMINAL_LINES.length && (
              <span style={{ color: '#3b82f6' }}>█</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-8">
          {[
            { v: '20+', l: 'Roles' },
            { v: '∞', l: 'Tech Stacks' },
            { v: 'AI', l: 'Generated' },
            { v: 'Free', l: 'No Signup' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <div
                className="font-display font-700 text-lg"
                style={{ color: 'var(--color-text)' }}
              >
                {s.v}
              </div>
              <div className="font-mono text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
