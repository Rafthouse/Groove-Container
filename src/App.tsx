import { useState, useMemo, useCallback } from 'react';
import type { GrooveOrganism, GrooveDNA, PercussionEvent, BassEvent, TaxonomyPath } from './engine/types';
import { getBuiltInPresets } from './engine/presets';
import { computeDNA } from './engine/dna';
import { mutateOrganism } from './engine/mutation';
import type { MutationConfig } from './engine/mutation';
import './App.css';

// ─── DNA Bar Chart ───────────────────────────────────────────────────────────

const DNA_COLORS: Record<keyof GrooveDNA, string> = {
  density: '#28FF6A',
  syncopation: '#FF7A00',
  complexity: '#FF00C8',
  swing: '#00AAFF',
  ghostFactor: '#f472b6',
  aggression: '#f87171',
  repetition: '#fbbf24',
  randomness: '#60a5fa',
};

const DNA_LABELS: Record<keyof GrooveDNA, string> = {
  density: 'Density',
  syncopation: 'Syncop.',
  complexity: 'Complex.',
  swing: 'Swing',
  ghostFactor: 'Ghost',
  aggression: 'Aggress.',
  repetition: 'Repeat.',
  randomness: 'Random.',
};

function DnaChart({ dna, compact }: { dna: GrooveDNA; compact?: boolean }) {
  const entries = Object.entries(dna) as [keyof GrooveDNA, number][];
  return (
    <div className={`dna-chart ${compact ? 'compact' : ''}`}>
      {entries.map(([key, val]) => (
        <div key={key} className="dna-bar-row" title={`${DNA_LABELS[key]}: ${(val * 100).toFixed(0)}%`}>
          {!compact && <span className="dna-label" style={{ color: DNA_COLORS[key] }}>{DNA_LABELS[key]}</span>}
          <div className="dna-bar-track">
            <div className="dna-bar-fill" style={{ width: `${val * 100}%`, backgroundColor: DNA_COLORS[key] }} />
          </div>
          <span className="dna-value">{compact ? '' : (val * 100).toFixed(0)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Radar Chart (SVG) ───────────────────────────────────────────────────────

function DnaRadar({ dna }: { dna: GrooveDNA }) {
  const keys = Object.keys(dna) as (keyof GrooveDNA)[];
  const n = keys.length;
  const cx = 80, cy = 80, r = 60;
  const angleStep = (2 * Math.PI) / n;

  const point = (i: number, value: number): [number, number] => [
    cx + r * value * Math.sin(i * angleStep - Math.PI / 2),
    cy - r * value * Math.cos(i * angleStep - Math.PI / 2),
  ];

  const grid = [0.25, 0.5, 0.75, 1].map((level) =>
    keys.map((_, i) => point(i, level).join(',')).join(' ')
  );

  const dataPolygon = keys.map((k, i) => point(i, dna[k]).join(',')).join(' ');

  return (
    <svg viewBox="0 0 160 160" className="dna-radar">
      {grid.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="#3a3d48" strokeWidth={1} strokeDasharray={i < 3 ? '2,2' : '0'} />
      ))}
      {/* Axis lines */}
      {keys.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#3a3d48" strokeWidth={1} />;
      })}
      {/* Data polygon */}
      <polygon points={dataPolygon} fill="rgba(192,132,252,0.15)" stroke="#c084fc" strokeWidth={2} />
      {/* Data points */}
      {keys.map((k, i) => {
        const [x, y] = point(i, dna[k]);
        return <circle key={i} cx={x} cy={y} r={3} fill={DNA_COLORS[k]} />;
      })}
      {/* Labels */}
      {keys.map((k, i) => {
        const [x, y] = point(i, 1.25);
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={DNA_COLORS[k]} fontSize={8} fontFamily="system-ui">{DNA_LABELS[k]}</text>;
      })}
    </svg>
  );
}

// ─── Taxonomy Tree ───────────────────────────────────────────────────────────

const TAXONOMY_DATA: Record<string, Record<string, Record<string, string[]>>> = {
  'Electronic Music': {
    'House': {
      'Deep House': ['Foundations', 'Sunset', 'Ghost Drift'],
      'Micro House': ['M1', 'Texture', 'Ratcheted', 'Perc 9'],
      'Minimal House': ['Groove'],
      'Tech House': ['Drive'],
      'Dub House': ['Stepper'],
      'Chicago House': ['Jack'],
    },
    'Techno': {
      'Dub Techno': ['Deep', 'Space', 'Texture'],
      'Deep Techno': ['Pulse'],
      'Detroit Techno': ['Foundation'],
      'Hypnotic Techno': ['Cycle', 'Hat 13', 'Bass 11'],
      'Industrial Techno': ['Minimal'],
    },
    'UK Garage': {
      '2-Step': ['Foundation', 'Swing', 'Max Swing'],
      'Future Garage': ['Atmosphere'],
      'Speed Garage': ['Vibe'],
      'Breakstep': ['Roller'],
    },
    'Breakbeat': {
      'Breakbeat': ['Classic'],
      'Drum and Bass': ['Stepper'],
      'Jungle': ['Rhythm'],
      'Nu Skool': ['Funk'],
    },
    'IDM': {
      'Experimental': ['Glitch Study', 'Rhythm', 'Glitch Hop'],
      'Ambient Rhythms': ['Atmospheric'],
      'Generative': ['Core'],
    },
    'Minimal': {
      'Micro House': ['Deep'],
      'Dub Techno (Minimal)': ['Pure'],
      'Reductionist': ['One'],
    },
  },
};

type PresetWithTax = GrooveOrganism & { _taxName?: string };

// ─── Event Grid ──────────────────────────────────────────────────────────────

function EventGrid({ events, color, maxSteps = 16 }: { events: { position: number; velocity: number; accent?: boolean }[]; color: string; maxSteps?: number }) {
  const cells: { filled: boolean; velocity: number; accent: boolean }[] = Array.from({ length: maxSteps }, (_, i) => {
    const evt = events.find(e => e.position === i);
    return { filled: !!evt, velocity: evt?.velocity ?? 0, accent: evt?.accent ?? false };
  });

  return (
    <div className="event-grid">
      {cells.map((c, i) => (
        <div key={i} className={`event-cell ${c.filled ? 'filled' : ''} ${c.accent ? 'accent' : ''}`}
          style={{ backgroundColor: c.filled ? color : undefined, opacity: c.filled ? c.velocity / 100 : 0.15 }}
          title={`Step ${i}: ${c.filled ? `vel=${c.velocity}${c.accent ? ' accent' : ''}` : 'rest'}`}
        />
      ))}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const presets = useMemo(() => getBuiltInPresets(), []);
  const [currentPreset, setCurrentPreset] = useState<GrooveOrganism>(presets[0]);
  const [selectedKingdom, setSelectedKingdom] = useState<string>('Electronic Music');
  const [selectedFamily, setSelectedFamily] = useState<string>('House');
  const [selectedGenus, setSelectedGenus] = useState<string>('Deep House');
  const [mutationConfig, setMutationConfig] = useState<MutationConfig>({
    preserveStyle: true, preserveBass: false, preserveRhythm: false,
    preserveComplexity: false, preserveAccents: false, strength: 0.3,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [mutatedPreview, setMutatedPreview] = useState<GrooveOrganism | null>(null);
  const [search, setSearch] = useState('');

  // Filter presets by taxonomy
  const filteredPresets = useMemo(() => {
    return presets.filter(p => {
      const t = p.taxonomy;
      const taxMatch = t.kingdom === selectedKingdom && t.family === selectedFamily && t.genus === selectedGenus;
      if (!taxMatch) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || t.species.toLowerCase().includes(q);
    });
  }, [presets, selectedKingdom, selectedFamily, selectedGenus, search]);

  // Recompute DNA when preset changes
  const dna = useMemo(() => {
    const allPerc = currentPreset.wheelA.tracks.flatMap(t => t.events);
    const allBass = currentPreset.wheelB.tracks.flatMap(t => t.events);
    const maxCl = Math.max(
      ...currentPreset.wheelA.tracks.map(t => t.cycleLength),
      ...currentPreset.wheelB.tracks.map(t => t.cycleLength),
    );
    return computeDNA(allPerc, allBass, maxCl);
  }, [currentPreset]);

  const handleMutate = useCallback(() => {
    const mutated = mutateOrganism(currentPreset, mutationConfig);
    const newDNA = computeDNA(
      mutated.wheelA.tracks.flatMap(t => t.events),
      mutated.wheelB.tracks.flatMap(t => t.events),
      Math.max(...mutated.wheelA.tracks.map(t => t.cycleLength), ...mutated.wheelB.tracks.map(t => t.cycleLength)),
    );
    setMutatedPreview({ ...mutated, dna: newDNA });
    setShowPreview(true);
  }, [currentPreset, mutationConfig]);

  const applyMutation = useCallback(() => {
    if (mutatedPreview) setCurrentPreset(mutatedPreview);
    setShowPreview(false);
    setMutatedPreview(null);
  }, [mutatedPreview]);

  // ─── Wheel Voice Colors ──────────────────────────────────────────────────
  const voiceColors: Record<string, string> = {
    kick: '#d07028', snare: '#e05820', closedHat: '#3878a0', openHat: '#3878a0',
    perc: '#60a5fa', ghostPerc: '#60a5fa', bass: '#48b838',
  };

  const activeDNA = showPreview && mutatedPreview ? mutatedPreview.dna : dna;

  return (
    <div className="app">
      {/* Top Bar */}
      <header className="top-bar">
        <h1 className="app-title">Groove Container</h1>
        <span className="app-subtitle">Groove Intelligence System</span>
        <div className="top-controls">
          <span className="badge">{selectedGenus}</span>
          <span className="badge-sm">{currentPreset.name}</span>
        </div>
      </header>

      <div className="main-layout">
        {/* Left: Wheel A + B + Taxonomy */}
        <div className="content-area">
          {/* ── Dual Wheels (Wheel A + B side by side) ── */}
          <div className="dual-wheels">
            {/* Wheel A: Rhythm Container */}
            <div className="wheel-panel wheel-a">
              <div className="wheel-header">
                <span className="wheel-icon">◉</span>
                <span className="wheel-title">Wheel A — Rhythm Container</span>
                <span className="wheel-voices">{currentPreset.wheelA.tracks.length} voices</span>
              </div>
              <div className="wheel-body">
                {currentPreset.wheelA.tracks.map(track => (
                  <div key={track.id} className="track-strip">
                    <div className="track-strip-label" style={{ color: voiceColors[track.voice] || '#7b7f8c' }}>
                      <span className="voice-dot" style={{ backgroundColor: voiceColors[track.voice] }} />
                      {track.name}
                      <span className="cycle-badge">{track.cycleLength}</span>
                    </div>
                    <EventGrid events={track.events} color={voiceColors[track.voice] || '#c084fc'} maxSteps={Math.min(track.cycleLength, 32)} />
                    <div className="track-params">
                      <span className="param">Vol {track.volume}</span>
                      <span className="param">Pan {track.pan}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow connecting wheels */}
            <div className="wheel-arrow">
              <div className="arrow-line" />
              <div className="arrow-label">Rhythm → Bass</div>
            </div>

            {/* Wheel B: Bass Container */}
            <div className="wheel-panel wheel-b">
              <div className="wheel-header">
                <span className="wheel-icon">◉</span>
                <span className="wheel-title">Wheel B — Bass Container</span>
                <span className="wheel-voices">{currentPreset.wheelB.tracks.length} tracks</span>
              </div>
              <div className="wheel-body">
                {currentPreset.wheelB.tracks.map(track => (
                  <div key={track.id} className="track-strip">
                    <div className="track-strip-label" style={{ color: '#48b838' }}>
                      <span className="voice-dot" style={{ backgroundColor: '#48b838' }} />
                      <span>{track.name}</span>
                      <span className="cycle-badge">{track.cycleLength}</span>
                      <span className="note-display">
                        {track.events.slice(0, 8).map(e => {
                          const octave = Math.floor(e.pitch / 12) - 1;
                          const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                          return `${notes[e.pitch % 12]}${octave}`;
                        }).join(' ')}
                      </span>
                    </div>
                    <EventGrid events={track.events} color="#48b838" maxSteps={Math.min(track.cycleLength, 32)} />
                    <div className="track-params">
                      <span className="param">Pitch range</span>
                      <span className="param">{Math.min(...track.events.map(e => e.pitch))}-{Math.max(...track.events.map(e => e.pitch))}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Polymeter Display ── */}
          <div className="polymeter-bar">
            <span className="polymeter-title">Polymeter — Cycle Lengths</span>
            <div className="cycle-display">
              {currentPreset.wheelA.tracks.map(t => (
                <span key={t.id} className="cycle-chip" style={{ borderColor: voiceColors[t.voice] || '#3a3d48' }}>
                  {t.name} <strong style={{ color: voiceColors[t.voice] }}>{t.cycleLength}</strong>
                </span>
              ))}
              {currentPreset.wheelB.tracks.map(t => (
                <span key={t.id} className="cycle-chip" style={{ borderColor: '#48b838' }}>
                  {t.name} <strong style={{ color: '#48b838' }}>{t.cycleLength}</strong>
                </span>
              ))}
              {/* Convergence visualization */}
              {(() => {
                const lcms = currentPreset.wheelA.tracks.map(t => t.cycleLength).concat(currentPreset.wheelB.tracks.map(t => t.cycleLength)).filter(Boolean);
                const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
                const lcm = lcms.reduce((a, b) => a * b / gcd(a, b), 1);
                return (
                  <span className="cycle-chip convergence" style={{ borderColor: '#c084fc' }}>
                    Convergence every <strong style={{ color: '#c084fc' }}>{Math.round(lcm)}</strong> steps
                  </span>
                );
              })()}
            </div>
          </div>

          {/* ── Taxonomy Browser ── */}
          <div className="taxonomy-section">
            <div className="taxonomy-header">
              <span className="section-icon">🔬</span>
              <span className="section-title">Taxonomy Browser</span>
              <input className="search-input" type="text" placeholder="Search presets..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="taxonomy-tree">
              <div className="taxonomy-column">
                <div className="taxonomy-col-label">Kingdom</div>
                {Object.keys(TAXONOMY_DATA).map(k => (
                  <div key={k} className={`taxonomy-node ${k === selectedKingdom ? 'active' : ''}`} onClick={() => { setSelectedKingdom(k); setSelectedFamily(Object.keys(TAXONOMY_DATA[k])[0]); setSelectedGenus(Object.keys(TAXONOMY_DATA[k][Object.keys(TAXONOMY_DATA[k])[0]])[0]); }}>
                    ▶ {k}
                  </div>
                ))}
              </div>
              <div className="taxonomy-column">
                <div className="taxonomy-col-label">Family</div>
                {Object.keys(TAXONOMY_DATA[selectedKingdom] || {}).map(f => (
                  <div key={f} className={`taxonomy-node ${f === selectedFamily ? 'active' : ''}`} onClick={() => { setSelectedFamily(f); setSelectedGenus(Object.keys(TAXONOMY_DATA[selectedKingdom][f])[0]); }}>
                    ▶ {f}
                  </div>
                ))}
              </div>
              <div className="taxonomy-column">
                <div className="taxonomy-col-label">Genus</div>
                {Object.keys(TAXONOMY_DATA[selectedKingdom]?.[selectedFamily] || {}).map(g => (
                  <div key={g} className={`taxonomy-node ${g === selectedGenus ? 'active' : ''}`} onClick={() => setSelectedGenus(g)}>
                    ▶ {g}
                  </div>
                ))}
              </div>
              <div className="taxonomy-column species-column">
                <div className="taxonomy-col-label">Species / Presets ({filteredPresets.length})</div>
                <div className="species-list">
                  {filteredPresets.length === 0 && <div className="empty-species">No presets match</div>}
                  {filteredPresets.map(p => (
                    <div key={p.id} className={`species-node ${p.id === currentPreset.id ? 'active' : ''}`}
                      onClick={() => { setCurrentPreset(p); setShowPreview(false); setMutatedPreview(null); }}>
                      <span className="species-dot" /> {p.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: DNA + Mutation */}
        <div className="sidebar">
          {/* ── Groove DNA ── */}
          <div className="panel dna-panel">
            <div className="panel-header">
              <span className="section-icon">🧬</span>
              <span className="panel-title">Groove DNA</span>
              {showPreview && <span className="preview-badge">Preview</span>}
            </div>
            <DnaRadar dna={activeDNA} />
            <DnaChart dna={activeDNA} />
            {showPreview && mutatedPreview && (
              <>
                <div className="dna-diff">
                  <div className="diff-title">DNA Changes</div>
                  {(Object.keys(dna) as (keyof GrooveDNA)[]).map(key => {
                    const delta = ((mutatedPreview.dna[key] - dna[key]) * 100).toFixed(0);
                    if (Math.abs(Number(delta)) < 1) return null;
                    return (
                      <div key={key} className="diff-row">
                        <span style={{ color: DNA_COLORS[key] }}>{DNA_LABELS[key]}</span>
                        <span style={{ color: Number(delta) > 0 ? '#28FF6A' : '#f87171' }}>
                          {Number(delta) > 0 ? '+' : ''}{delta}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button className="btn btn-apply" onClick={applyMutation}>✓ Apply Mutation</button>
                <button className="btn btn-cancel" onClick={() => { setShowPreview(false); setMutatedPreview(null); }}>✗ Discard</button>
              </>
            )}
          </div>

          {/* ── Mutation Engine ── */}
          <div className="panel mutation-panel">
            <div className="panel-header">
              <span className="section-icon">⟳</span>
              <span className="panel-title">Mutation Engine</span>
            </div>
            <div className="mutation-preserves">
              <span className="mutation-label">Preserve</span>
              <div className="preserve-grid">
                {(['preserveStyle', 'preserveBass', 'preserveRhythm', 'preserveComplexity', 'preserveAccents'] as (keyof MutationConfig)[]).map(key => {
                  const label = key.replace('preserve', '');
                  return (
                    <button key={key} className={`toggle-btn ${mutationConfig[key] ? 'active' : ''}`}
                      onClick={() => setMutationConfig(prev => ({ ...prev, [key]: !prev[key] }))}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mutation-strength">
              <span className="mutation-label">Strength</span>
              <input type="range" min={0} max={100} value={Math.round(mutationConfig.strength * 100)}
                onChange={e => setMutationConfig(prev => ({ ...prev, strength: Number(e.target.value) / 100 }))}
                className="strength-slider" />
              <span className="strength-value">{Math.round(mutationConfig.strength * 100)}%</span>
            </div>
            <div className="mutation-info">
              <span className="mutation-hint">
                {mutationConfig.preserveStyle ? '✓ Style preserved' : '✗ Full mutation'}
                {mutationConfig.preserveBass ? ' · Bass frozen' : ''}
                {mutationConfig.preserveRhythm ? ' · Rhythm frozen' : ''}
              </span>
            </div>
            <button className="btn btn-mutate" onClick={handleMutate}>⟳ MUTATE</button>
          </div>

          {/* ── Organism Info ── */}
          <div className="panel info-panel">
            <div className="panel-header">
              <span className="section-icon">ℹ</span>
              <span className="panel-title">Organism</span>
            </div>
            <div className="info-content">
              <div className="info-row"><span className="info-key">Name</span><span className="info-val">{currentPreset.name}</span></div>
              <div className="info-row"><span className="info-key">BPM</span><span className="info-val">{currentPreset.bpm}</span></div>
              <div className="info-row"><span className="info-key">Swing</span><span className="info-val">{currentPreset.swing}%</span></div>
              <div className="info-row"><span className="info-key">Voices</span><span className="info-val">{currentPreset.wheelA.tracks.length} + {currentPreset.wheelB.tracks.length}</span></div>
              <div className="info-row"><span className="info-key">Taxonomy</span><span className="info-val">{currentPreset.taxonomy.genus}</span></div>
              <div className="info-row"><span className="info-key">Events</span><span className="info-val">{currentPreset.wheelA.tracks.reduce((s, t) => s + t.events.length, 0) + currentPreset.wheelB.tracks.reduce((s, t) => s + t.events.length, 0)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
