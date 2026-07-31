import React, { useState, useEffect } from 'react';
import { fetchChoices } from '../api/roadmapApi';
import ChoicesGrid from './ChoicesGrid';
import FlowchartView from './FlowchartView';
import { TrendingUp, DollarSign, Layers } from 'lucide-react';

export default function Dashboard({ role }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [chosen,  setChosen]  = useState(null);

  useEffect(() => {
    setLoading(true); setError(null); setChosen(null); setData(null);
    fetchChoices(role)
      .then(d  => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [role]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
      <p className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Generating career paths for <span style={{ color: 'var(--color-blue)' }}>{role}</span>…
      </p>
      <p className="font-mono text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>
        Powered by Groq · llama-3.3-70b-versatile
      </p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-4">
      <div
        className="w-full max-w-md p-5 rounded-lg text-sm"
        style={{ background: '#1a0a0a', border: '1px solid #f8514920', color: '#f87171' }}
      >
        <p className="font-mono font-600 mb-1">Error: fetch failed</p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{error}</p>
        <p className="font-mono text-[11px] mt-3" style={{ color: 'var(--color-text-subtle)' }}>
          Make sure the backend is running on port 8080
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--color-base)' }}>
      {/* ── Role header ── */}
      <div
        className="px-6 py-5"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <p className="font-mono text-[11px] mb-2" style={{ color: 'var(--color-text-subtle)' }}>
            / roles / <span style={{ color: 'var(--color-text-muted)' }}>{(data?.role || role).toLowerCase().replace(/ /g, '-')}</span>
          </p>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1
                className="font-display font-800 tracking-tight mb-1.5"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: 'var(--color-text)' }}
              >
                {data?.role || role}
              </h1>
              <p className="text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {data?.summary}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap shrink-0">
              {data?.avgSalary && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono"
                  style={{ background: '#0d1f17', border: '1px solid #3fb95030', color: '#86efac' }}
                >
                  <DollarSign size={11} /> {data.avgSalary}
                </div>
              )}
              {data?.demandLevel && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono"
                  style={{ background: '#1a1400', border: '1px solid #d2992230', color: '#fcd34d' }}
                >
                  <TrendingUp size={11} /> {data.demandLevel} Demand
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Choices section ── */}
      <div className="max-w-6xl mx-auto px-6 py-7">
        <div className="flex items-center gap-3 mb-4">
          <Layers size={14} color="var(--color-blue)" />
          <span className="font-display font-600 text-sm" style={{ color: 'var(--color-text)' }}>
            Choose your tech stack
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>
            {data?.choices?.length || 0} paths available
          </span>
        </div>
        <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
          Select a technology path to generate your personalized skill flowchart
        </p>

        <ChoicesGrid choices={data?.choices || []} selectedId={chosen?.id} onSelect={setChosen} />
      </div>

      {/* ── Flowchart section ── */}
      {chosen && (
        <div className="max-w-6xl mx-auto px-6 pb-10">
          <FlowchartView role={data?.role || role} choice={chosen} />
        </div>
      )}
    </div>
  );
}
