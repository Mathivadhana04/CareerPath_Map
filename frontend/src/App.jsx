import React, { useState, useCallback } from 'react';
import { Terminal, GitBranch, Cpu, Layers } from 'lucide-react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import './index.css';

export default function App() {
  const [view, setView] = useState('landing');
  const [currentRole, setCurrentRole] = useState('');

  const handleRoleSearch = useCallback((role) => {
    setCurrentRole(role);
    setView('dashboard');
  }, []);

  const handleBack = useCallback(() => {
    setView('landing');
    setCurrentRole('');
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-base)' }}>
      {/* ── Top Navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-12"
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-6 h-6 rounded"
            style={{ background: '#231805', border: '1px solid #f59e0b40' }}
          >
            <GitBranch size={13} color="#f59e0b" />
          </div>
          <span className="font-display text-sm font-700 tracking-tight" style={{ color: 'var(--color-text)' }}>
            CareerPathMap
          </span>
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'var(--color-elevated)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
          >
            v1.0
          </span>
        </div>

        {/* Center status */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="pulse-dot" />
            <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              Groq LLM connected
            </span>
          </div>
          <span style={{ color: 'var(--color-border-muted)', fontSize: 14 }}>|</span>
          <div className="flex items-center gap-1.5">
            <Cpu size={11} color="var(--color-text-subtle)" />
            <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>
              llama-3.3-70b-versatile
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {view === 'dashboard' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium cursor-pointer"
              style={{
                background: 'var(--color-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-muted)'; e.currentTarget.style.color = 'var(--color-text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              ← Back
            </button>
          )}
          <div className="flex items-center gap-1">
            <kbd>⌘</kbd><kbd>K</kbd>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <div className="pt-12">
        {view === 'landing'
          ? <LandingPage onSearch={handleRoleSearch} />
          : <Dashboard role={currentRole} onBack={handleBack} />
        }
      </div>
    </div>
  );
}
