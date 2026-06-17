import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { GrooveOrganism, GrooveDNA, PercussionEvent, BassEvent } from './engine/types';
import type { PercussionVoice } from './engine/types';
import { getBuiltInPresets } from './engine/presets';
import { computeDNA } from './engine/dna';
import { mutateOrganism } from './engine/mutation';
import { generateBassFromRhythmGenotype } from './engine/bassLinkage';
import type { MutationConfig } from './engine/mutation';
import { audioEngine, AudioState } from './engine/audioEngine';
import { downloadMidi, downloadMidiStems } from './engine/midi';
import { storage } from './engine/persistence';
import type { PresetRecord } from './engine/persistence';
import { generateFromGenotype, inferGenotype, DEFAULT_GENOTYPE, GENOTYPE_LABELS, GENOTYPE_OPTIONS } from './engine/genotype';
import type { GrooveGenotype } from './engine/genotype';
import Knob from './components/Knob';
import './App.css';

// ─── DNA Colors & Labels ──────────────────────────────────────────────────────

const DNA_COLORS: Record<keyof GrooveDNA, string> = {
  density: '#28FF6A', syncopation: '#FF7A00', complexity: '#FF00C8',
  swing: '#00AAFF', ghostFactor: '#f472b6', aggression: '#f87171',
  repetition: '#fbbf24', randomness: '#60a5fa',
};

const DNA_LABELS: Record<keyof GrooveDNA, string> = {
  density: 'Density', syncopation: 'Syncop.', complexity: 'Complex.',
  swing: 'Swing', ghostFactor: 'Ghost', aggression: 'Aggress.',
  repetition: 'Repeat.', randomness: 'Random.',
};

// ─── Voice colors ────────────────────────────────────────────────────────────

const VOICE_COLORS: Record<string, string> = {
  kick: '#d07028', snare: '#e05820', closedHat: '#3878a0', openHat: '#3878a0',
  perc: '#60a5fa', ghostPerc: '#60a5fa', bass: '#48b838',
};

// ─── Note name helpers ───────────────────────────────────────────────────────

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTES[midi % 12]}${octave}`;
}

// ─── DNA Bar Chart ───────────────────────────────────────────────────────────

function DnaChart({ dna }: { dna: GrooveDNA }) {
  return (
    <div className="dna-chart">
      {(Object.entries(dna) as [keyof GrooveDNA, number][]).map(([key, val]) => (
        <div key={key} className="dna-bar-row" title={`${DNA_LABELS[key]}: ${(val * 100).toFixed(0)}%`}>
          <span className="dna-label" style={{ color: DNA_COLORS[key] }}>{DNA_LABELS[key]}</span>
          <div className="dna-bar-track">
            <div className="dna-bar-fill" style={{ width: `${val * 100}%`, backgroundColor: DNA_COLORS[key] }} />
          </div>
          <span className="dna-value">{(val * 100).toFixed(0)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Radar Chart ─────────────────────────────────────────────────────────────

function DnaRadar({ dna }: { dna: GrooveDNA }) {
  const keys = Object.keys(dna) as (keyof GrooveDNA)[];
  const n = keys.length;
  const cx = 80, cy = 80, r = 60;
  const angleStep = (2 * Math.PI) / n;
  const point = (i: number, value: number): [number, number] => [
    cx + r * value * Math.sin(i * angleStep - Math.PI / 2),
    cy - r * value * Math.cos(i * angleStep - Math.PI / 2),
  ];
  const grid = [0.25, 0.5, 0.75, 1].map((level) => keys.map((_, i) => point(i, level).join(',')).join(' '));
  const dataPolygon = keys.map((k, i) => point(i, dna[k]).join(',')).join(' ');
  return (
    <svg viewBox="0 0 160 160" className="dna-radar">
      {grid.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="#3a3d48" strokeWidth={1} strokeDasharray={i < 3 ? '2,2' : '0'} />
      ))}
      {keys.map((_, i) => { const [x, y] = point(i, 1); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#3a3d48" strokeWidth={1} />; })}
      <polygon points={dataPolygon} fill="rgba(192,132,252,0.15)" stroke="#c084fc" strokeWidth={2} />
      {keys.map((k, i) => { const [x, y] = point(i, dna[k]); return <circle key={i} cx={x} cy={y} r={3} fill={DNA_COLORS[k]} />; })}
      {keys.map((k, i) => { const [x, y] = point(i, 1.25); return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={DNA_COLORS[k]} fontSize={8} fontFamily="system-ui">{DNA_LABELS[k]}</text>; })}
    </svg>
  );
}

// ─── Taxonomy Data ────────────────────────────────────────────────────────────

const TAXONOMY_DATA: Record<string, Record<string, Record<string, string[]>>> = {
  'Electronic Music': {
    'House': { 'Deep House': ['Foundations', 'Sunset', 'Ghost Drift'], 'Micro House': ['M1', 'Texture', 'Ratcheted', 'Perc 9'], 'Minimal House': ['Groove'], 'Tech House': ['Drive'], 'Dub House': ['Stepper'], 'Chicago House': ['Jack'] },
    'Techno': { 'Dub Techno': ['Deep', 'Space', 'Texture'], 'Deep Techno': ['Pulse'], 'Detroit Techno': ['Foundation'], 'Hypnotic Techno': ['Cycle', 'Hat 13', 'Bass 11'], 'Industrial Techno': ['Minimal'] },
    'UK Garage': { '2-Step': ['Foundation', 'Swing', 'Max Swing'], 'Future Garage': ['Atmosphere'], 'Speed Garage': ['Vibe'], 'Breakstep': ['Roller'] },
    'Breakbeat': { 'Breakbeat': ['Classic'], 'Drum and Bass': ['Stepper'], 'Jungle': ['Rhythm'], 'Nu Skool': ['Funk'] },
    'IDM': { 'Experimental': ['Glitch Study', 'Rhythm', 'Glitch Hop'], 'Ambient Rhythms': ['Atmospheric'], 'Generative': ['Core'] },
    'Minimal': { 'Micro House': ['Deep'], 'Dub Techno (Minimal)': ['Pure'], 'Reductionist': ['One'] },
  },
};

// ─── Event Grid (interactive) ────────────────────────────────────────────────

function EventGrid({
  events, color, trackId, onToggleCell, onCellClick, maxSteps = 16, selectedCell, currentStep, cycleLength,
}: {
  events: { position: number; velocity: number; accent?: boolean }[];
  color: string; trackId: string;
  onToggleCell?: (trackId: string, position: number) => void;
  onCellClick?: (trackId: string, position: number) => void;
  maxSteps?: number; selectedCell?: string | null;
  currentStep?: number; cycleLength?: number;
}) {
  const cells = Array.from({ length: maxSteps }, (_, i) => {
    const evt = events.find(e => e.position === i);
    return { filled: !!evt, velocity: evt?.velocity ?? 0, accent: evt?.accent ?? false, position: i };
  });

  // Which cell represents the current playback position?
  const playPosition = currentStep !== undefined && currentStep >= 0 && cycleLength
    ? currentStep % cycleLength
    : -1;

  return (
    <div className="event-grid">
      {cells.map(c => {
        const key = `${trackId}-${c.position}`;
        const isSelected = selectedCell === key;
        const isPlaying = playPosition >= 0 && c.position === playPosition;
        return (
          <div key={key}
            className={`event-cell ${c.filled ? 'filled' : ''} ${c.accent ? 'accent' : ''} ${isSelected ? 'selected' : ''} ${isPlaying ? 'playing' : ''}`}
            style={{
              backgroundColor: c.filled ? color : undefined,
              opacity: c.filled ? 0.5 + (c.velocity / 100) * 0.5 : 0.12,
            }}
            onClick={() => onCellClick?.(trackId, c.position)}
            onDoubleClick={() => onToggleCell?.(trackId, c.position)}
            title={`Step ${c.position}: ${c.filled ? `vel=${c.velocity}${c.accent ? ' accent' : ''} (dbl-click to remove)` : 'rest (dbl-click to add)'}${isPlaying ? ' [PLAYING]' : ''}`}
          />
        );
      })}
    </div>
  );
}

// ─── Event Detail Popup ──────────────────────────────────────────────────────

function EventDetailPopup({
  trackId, event, position, voice, color, onUpdate, onClose, onDelete,
}: {
  trackId: string; event: { velocity: number; probability: number; accent: boolean; timingOffset: number; humanization: number; ratchet: number; swing: number; pitch?: number; duration?: number; tie?: boolean; slide?: boolean; ghost?: boolean; mute?: boolean } | null;
  position: number; voice: string; color: string;
  onUpdate: (trackId: string, position: number, updates: Partial<any>) => void;
  onClose: () => void; onDelete: (trackId: string, position: number) => void;
}) {
  const isBass = voice === 'bass';
  return (
    <div className="event-popup-overlay" onClick={onClose}>
      <div className="event-popup" onClick={e => e.stopPropagation()} style={{ borderColor: color }}>
        <div className="popup-header" style={{ borderBottomColor: color }}>
          <span style={{ color }}>{voice.toUpperCase()} @ step {position}</span>
          <button className="popup-close" onClick={onClose}>✕</button>
        </div>
        <div className="popup-body">
          <div className="popup-knobs">
            <Knob label="Velocity" value={event?.velocity ?? 50} min={0} max={100} step={5} resetValue={80}
              onChange={v => onUpdate(trackId, position, { velocity: v })} color={color} />
            <Knob label="Prob." value={Math.round((event?.probability ?? 1) * 100)} min={0} max={100} step={5} resetValue={100}
              format={v => `${v}%`} onChange={v => onUpdate(trackId, position, { probability: v / 100 })} color={color} />
            <Knob label="Swing" value={event?.swing ?? 0} min={0} max={100} step={5} resetValue={0}
              format={v => `${v}%`} onChange={v => onUpdate(trackId, position, { swing: v })} color={color} />
            <Knob label="Human." value={event?.humanization ?? 5} min={0} max={100} step={5} resetValue={5}
              format={v => `${v}%`} onChange={v => onUpdate(trackId, position, { humanization: v })} color={color} />
            <Knob label="Ratchet" value={event?.ratchet ?? 1} min={1} max={8} step={1} resetValue={1}
              onChange={v => onUpdate(trackId, position, { ratchet: v })} color={color} />
            <Knob label="Offset" value={Math.round((event?.timingOffset ?? 0) * 100)} min={-50} max={50} step={5} resetValue={0}
              format={v => `${v > 0 ? '+' : ''}${v}`} onChange={v => onUpdate(trackId, position, { timingOffset: v / 100 })} color={color} />
          </div>
          {isBass && (
            <div className="popup-bass-controls">
              <Knob label="Pitch" value={event?.pitch ?? 36} min={24} max={72} step={1} resetValue={36}
                format={v => midiToNote(v)} onChange={v => onUpdate(trackId, position, { pitch: v })} color={color} />
              <Knob label="Duration" value={event?.duration ?? 2} min={1} max={16} step={1} resetValue={2}
                format={v => `${v} 16th`} onChange={v => onUpdate(trackId, position, { duration: v })} color={color} />
            </div>
          )}
          {isBass && (
            <div className="popup-toggles">
              {(['accent', 'tie', 'slide', 'ghost', 'mute'] as const).map(flag => (
                <button key={flag} className={`toggle-btn ${event?.[flag] ? 'active' : ''}`}
                  onClick={() => onUpdate(trackId, position, { [flag]: !event?.[flag] })}>
                  {flag}
                </button>
              ))}
            </div>
          )}
          {!isBass && (
            <div className="popup-toggles">
              <button className={`toggle-btn ${event?.accent ? 'active' : ''}`}
                onClick={() => onUpdate(trackId, position, { accent: !event?.accent })}>
                Accent
              </button>
            </div>
          )}
        </div>
        <div className="popup-footer">
          <button className="btn btn-danger-sm" onClick={() => { onDelete(trackId, position); onClose(); }}>✕ Delete Event</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const presets = useMemo(() => getBuiltInPresets(), []);
  const [currentPreset, setCurrentPreset] = useState<GrooveOrganism>(presets[0]);
  const [selectedKingdom, setSelectedKingdom] = useState('Electronic Music');
  const [selectedFamily, setSelectedFamily] = useState('House');
  const [selectedGenus, setSelectedGenus] = useState('Deep House');
  const [mutationConfig, setMutationConfig] = useState<MutationConfig>({
    preserveStyle: true, preserveBass: false, preserveRhythm: false,
    preserveComplexity: false, preserveAccents: false, strength: 0.3,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [mutatedPreview, setMutatedPreview] = useState<GrooveOrganism | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [bassGenerated, setBassGenerated] = useState(false);
  const [playState, setPlayState] = useState<AudioState>(AudioState.Stopped);
  const [currentStep, setCurrentStep] = useState(-1);
  const [savedPresets, setSavedPresets] = useState<PresetRecord[]>([]);
  const [persistMsg, setPersistMsg] = useState('');
  const [saveName, setSaveName] = useState('');
  const [showGenes, setShowGenes] = useState(false);
  const [currentGenotype, setCurrentGenotype] = useState<GrooveGenotype>(DEFAULT_GENOTYPE);
  const [inferredGenotype, setInferredGenotype] = useState<GrooveGenotype | null>(null);

  // Infer genotype when preset changes
  useState(() => {
    setCurrentGenotype(prev => {
      const inferred = inferGenotype(currentPreset);
      setInferredGenotype(inferred);
      return prev; // keep previous genotype edits until user edits again
    });
  });

  // Load saved presets + session on mount
  useState(() => {
    storage.init().then(() => {
      storage.loadAllPresets().then(records => setSavedPresets(records));
      storage.loadSession().then(session => {
        if (session?.organism) {
          setCurrentPreset(session.organism);
        }
        if (session?.selectedTaxonomy) {
          setSelectedKingdom(session.selectedTaxonomy.kingdom);
          setSelectedFamily(session.selectedTaxonomy.family);
          setSelectedGenus(session.selectedTaxonomy.genus);
        }
        if (session?.mutationConfig) {
          setMutationConfig(session.mutationConfig);
        }
      });
    });
  });

  // Auto-save session on changes (debounced)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      storage.saveSession({
        organism: currentPreset,
        selectedTaxonomy: { kingdom: selectedKingdom, family: selectedFamily, genus: selectedGenus },
        mutationConfig,
        version: 1,
      });
    }, 2000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [currentPreset, selectedKingdom, selectedFamily, selectedGenus, mutationConfig]);

  const handleSavePreset = useCallback(async () => {
    const name = saveName.trim() || currentPreset.name;
    const record = storage.createRecord(currentPreset, name);
    await storage.savePreset(record);
    const all = await storage.loadAllPresets();
    setSavedPresets(all);
    setSaveName('');
    setPersistMsg(`\u2713 Saved "${name}"`);
    setTimeout(() => setPersistMsg(''), 2000);
  }, [currentPreset, saveName]);

  const handleLoadPreset = useCallback((record: PresetRecord) => {
    setCurrentPreset(record.organism);
    setSelectedCell(null);
    setPersistMsg(`Loaded "${record.name}"`);
    setTimeout(() => setPersistMsg(''), 1500);
  }, []);

  const handleDeletePreset = useCallback(async (id: string) => {
    await storage.deletePreset(id);
    const all = await storage.loadAllPresets();
    setSavedPresets(all);
  }, []);

  // Update a single event in the current organism (immutable)
  const updateEvent = useCallback((trackId: string, position: number, updates: Partial<any>) => {
    setCurrentPreset(prev => {
      const updateInList = <T extends { position: number }>(events: T[]): T[] =>
        events.map(e => e.position === position ? { ...e, ...updates } : e);
      const tracksA = prev.wheelA.tracks.map(t =>
        t.id === trackId ? { ...t, events: updateInList(t.events) } : t
      );
      const tracksB = prev.wheelB.tracks.map(t =>
        t.id === trackId ? { ...t, events: updateInList(t.events) } : t
      );
      return { ...prev, wheelA: { tracks: tracksA }, wheelB: { tracks: tracksB } };
    });
  }, []);

  // Toggle event on/off at a position
  const toggleCell = useCallback((trackId: string, position: number) => {
    setCurrentPreset(prev => {
      const hasEvent = (events: { position: number }[]) => events.some(e => e.position === position);
      const removeEvent = <T extends { position: number }>(events: T[]): T[] => events.filter(e => e.position !== position);
      const addEvent = (events: PercussionEvent[], voice: PercussionVoice): PercussionEvent[] => {
        if (events.some(e => e.position === position)) return events;
        return [...events, { voice, position, velocity: 80, probability: 1, accent: false, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0 }];
      };
      const addBassEvent = (events: BassEvent[]): BassEvent[] => {
        if (events.some(e => e.position === position)) return events;
        return [...events, { position, pitch: 36, velocity: 75, duration: 2, probability: 1, accent: false, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, tie: false, slide: false, ghost: false, mute: false }];
      };

      const tracksA = prev.wheelA.tracks.map(t =>
        t.id === trackId
          ? { ...t, events: hasEvent(t.events) ? removeEvent(t.events) : addEvent(t.events as PercussionEvent[], t.voice) }
          : t
      );
      const tracksB = prev.wheelB.tracks.map(t =>
        t.id === trackId
          ? { ...t, events: hasEvent(t.events) ? removeEvent(t.events as BassEvent[]) : addBassEvent(t.events as BassEvent[]) }
          : t
      );
      return { ...prev, wheelA: { tracks: tracksA }, wheelB: { tracks: tracksB } };
    });
  }, []);

  // Delete an event
  const deleteEvent = useCallback((trackId: string, position: number) => {
    setCurrentPreset(prev => ({
      ...prev,
      wheelA: { tracks: prev.wheelA.tracks.map(t => t.id === trackId ? { ...t, events: t.events.filter(e => e.position !== position) } : t) },
      wheelB: { tracks: prev.wheelB.tracks.map(t => t.id === trackId ? { ...t, events: t.events.filter(e => e.position !== position) } : t) },
    }));
  }, []);

  // Generate bass from rhythm (genotype-aware)
  const handleGenerateBass = useCallback(() => {
    const genotype = inferredGenotype ?? DEFAULT_GENOTYPE;
    const bassEvents = generateBassFromRhythmGenotype(
      currentPreset.wheelA.tracks,
      16,
      {
        kickSnare: genotype.kickSnare,
        kickHat: genotype.kickHat,
        register: genotype.register,
        noteLength: genotype.noteLength,
        timingFeel: genotype.timingFeel,
      }
    );
    const updated = {
      ...currentPreset,
      wheelB: {
        tracks: [{
          ...currentPreset.wheelB.tracks[0],
          events: bassEvents,
        }],
      },
    };
    setCurrentPreset(updated);
    setBassGenerated(true);
    setTimeout(() => setBassGenerated(false), 2000);
  }, [currentPreset, inferredGenotype]);

  // Filter presets
  const filteredPresets = useMemo(() => presets.filter(p => {
    if (p.taxonomy.kingdom !== selectedKingdom || p.taxonomy.family !== selectedFamily || p.taxonomy.genus !== selectedGenus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.taxonomy.species.toLowerCase().includes(q);
  }), [presets, selectedKingdom, selectedFamily, selectedGenus, search]);

  // DNA computation
  const dna = useMemo(() => {
    const allPerc = currentPreset.wheelA.tracks.flatMap(t => t.events);
    const allBass = currentPreset.wheelB.tracks.flatMap(t => t.events);
    const maxCl = Math.max(...currentPreset.wheelA.tracks.map(t => t.cycleLength), ...currentPreset.wheelB.tracks.map(t => t.cycleLength));
    return computeDNA(allPerc, allBass, maxCl);
  }, [currentPreset]);

  // Mutation
  const handleMutate = useCallback(() => {
    const mutated = mutateOrganism(currentPreset, mutationConfig);
    const newDNA = computeDNA(
      mutated.wheelA.tracks.flatMap(t => t.events), mutated.wheelB.tracks.flatMap(t => t.events),
      Math.max(...mutated.wheelA.tracks.map(t => t.cycleLength), ...mutated.wheelB.tracks.map(t => t.cycleLength)),
    );
    setMutatedPreview({ ...mutated, dna: newDNA });
    setShowPreview(true);
  }, [currentPreset, mutationConfig]);

  const applyMutation = useCallback(() => {
    if (mutatedPreview) setCurrentPreset(mutatedPreview);
    setShowPreview(false); setMutatedPreview(null);
  }, [mutatedPreview]);

  // ── Audio Playback ───────────────────────────────────────────────────

  const handlePlayStop = useCallback(async () => {
    if (playState === AudioState.Playing || playState === AudioState.Starting) {
      audioEngine.stop();
      setPlayState(AudioState.Stopped);
      setCurrentStep(-1);
      return;
    }
    // Load current organism into engine
    audioEngine.load(currentPreset);
    audioEngine.onStep = (step) => {
      setCurrentStep(step);
    };
    audioEngine.onStateChange = (state) => {
      setPlayState(state);
    };
    await audioEngine.start();
  }, [playState, currentPreset]);

  // Find event at position for popup
  const handleRegenerate = useCallback(() => {
    const org = generateFromGenotype(currentGenotype, `${currentPreset.name} (Gen)`);
    setCurrentPreset(org);
    setShowGenes(false);
    const inferred = inferGenotype(org);
    setCurrentGenotype(inferred);
  }, [currentGenotype, currentPreset.name]);

  const handleInferGenotype = useCallback(() => {
    const inferred = inferGenotype(currentPreset);
    setInferredGenotype(inferred);
    setCurrentGenotype(inferred);
    setShowGenes(true);
  }, [currentPreset]);

  // ── Keyboard shortcuts ────────────────────────────────────────────
  // Declared AFTER all handlers above so that JS temporal-dead-zone
  // doesn't trip the useEffect closure on first render.

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayStop();
          break;
        case 'KeyM': {
          // Toggle mute on selected track (try bass, else first perc track)
          const firstPerc = currentPreset.wheelA.tracks.find(t => t.voice === 'kick');
          if (firstPerc) {
            const newMute = !firstPerc.mute;
            setCurrentPreset(prev => ({
              ...prev, wheelA: { tracks: prev.wheelA.tracks.map(t =>
                t.id === firstPerc.id ? { ...t, mute: newMute } : t) }
            }));
            audioEngine.muteVoice(firstPerc.id, newMute);
          }
          break;
        }
        case 'KeyS': {
          // Save preset
          const name = currentPreset.name;
          const record = storage.createRecord(currentPreset, name);
          storage.savePreset(record).then(() => {
            storage.loadAllPresets().then(records => setSavedPresets(records));
            setPersistMsg(`✓ Saved "${name}"`);
            setTimeout(() => setPersistMsg(''), 2000);
          });
          break;
        }
        case 'KeyB':
          handleGenerateBass();
          break;
        case 'KeyR':
          handleMutate();
          break;
        case 'KeyG':
          setShowGenes(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayStop, handleGenerateBass, handleMutate, currentPreset]);

  const findEvent = (trackId: string, pos: number) => {
    const allEvents = [...currentPreset.wheelA.tracks.flatMap(t => t.events.map(e => ({ ...e, originalVoice: t.voice, trackId: t.id }))),
      ...currentPreset.wheelB.tracks.flatMap(t => t.events.map(e => ({ ...e, originalVoice: 'bass' as const, trackId: t.id })))];
    return allEvents.find(e => e.trackId === trackId && e.position === pos) ?? null;
  };

  const handleCellClick = useCallback((trackId: string, pos: number) => {
    setSelectedCell(prev => prev === `${trackId}-${pos}` ? null : `${trackId}-${pos}`);
  }, []);

  const cellData = selectedCell ? (() => {
    const [tid, posStr] = selectedCell.split('-');
    const pos = Number(posStr);
    const event = findEvent(tid, pos);
    const trackA = currentPreset.wheelA.tracks.find(t => t.id === tid);
    const voice = trackA?.voice ?? 'bass';
    const color = VOICE_COLORS[voice] || VOICE_COLORS[tid] || '#c084fc';
    return { trackId: tid, position: pos, event, voice, color };
  })() : null;

  const activeDNA = showPreview && mutatedPreview ? mutatedPreview.dna : dna;

  return (
    <div className="app">
      <header className="top-bar">
        <h1 className="app-title">Groove Container</h1>
        <span className="app-subtitle">Groove Intelligence System</span>
        <div className="top-controls">
          <div className="metronome" title={`Step ${currentStep >= 0 ? currentStep : '-'}`}>
            <div className={`metro-dot ${playState === AudioState.Playing && currentStep % 16 === 0 ? 'downbeat' : ''} ${playState === AudioState.Playing ? 'active' : ''}`} />
            <div className="metro-label">{currentStep >= 0 ? `${currentStep}` : '--'}</div>
          </div>
          <button className={`btn btn-play ${playState === AudioState.Playing ? 'playing' : ''}`} onClick={handlePlayStop}>
            {playState === AudioState.Playing || playState === AudioState.Starting ? '■ STOP' : '▶ PLAY'}
          </button>
          <button className={`btn btn-generate-bass ${bassGenerated ? 'flash' : ''}`} onClick={handleGenerateBass}>
            ⚡ Generate Bass
          </button>
          <button className="btn btn-midi" onClick={() => downloadMidi(currentPreset, 4)}>
            ♪ MIDI
          </button>
          <button className="btn btn-stems" onClick={() => downloadMidiStems(currentPreset)}>
            ♪ Stems
          </button>
          <div className="live-controls">
            <div className="live-group">
              <span className="live-label">Swing</span>
              <input type="range" className="live-slider" min={0} max={100} value={currentPreset.swing}
                onChange={e => {
                  const v = Number(e.target.value);
                  setCurrentPreset(prev => ({ ...prev, swing: v }));
                  audioEngine.updateSwing(v);
                }} />
              <span className="live-value">{currentPreset.swing}%</span>
            </div>
            <div className="live-group">
              <span className="live-label">Vol</span>
              <input type="range" className="live-slider" min={0} max={100} value={Math.round(audioEngine['masterGain']?.gain?.value ?? 70)}
                onChange={e => audioEngine.setMasterVolume(Number(e.target.value) / 100)} />
              <span className="live-value">{Math.round(audioEngine['masterGain']?.gain?.value ?? 70)}</span>
            </div>
            <div className="live-group">
              <span className="live-label">BPM</span>
              <input type="range" className="live-slider" min={60} max={200} value={currentPreset.bpm}
                onChange={e => {
                  const v = Number(e.target.value);
                  setCurrentPreset(prev => ({ ...prev, bpm: v }));
                  audioEngine.updateBpm(v);
                }} />
              <span className="live-value">{currentPreset.bpm}</span>
            </div>
          </div>
          <span className="badge">{selectedGenus}</span>
          <span className="badge-sm">{currentPreset.name}</span>
          <span className="shortcuts-hint" title="Space=Play/Stop · M=Mute kick · S=Save · B=Bass · R=Mutate · G=Genes">⌨</span>
        </div>
      </header>

      <div className="main-layout">
        <div className="content-area">
          {/* ── Dual Wheels ── */}
          <div className="dual-wheels">
            <div className="wheel-panel wheel-a">
              <div className="wheel-header">
                <span className="wheel-icon">◉</span>
                <span className="wheel-title">Wheel A — Rhythm Container</span>
                <span className="wheel-voices">{currentPreset.wheelA.tracks.length} voices</span>
                <span className="wheel-hint">dbl-click cells to toggle</span>
              </div>
              <div className="wheel-body">
                {currentPreset.wheelA.tracks.map(track => (
                  <div key={track.id} className="track-strip">
                    <div className="track-strip-label" style={{ color: VOICE_COLORS[track.voice] }}>
                      <span className="voice-dot" style={{ backgroundColor: VOICE_COLORS[track.voice] }} />
                      {track.name}
                      <span className="cycle-badge">{track.cycleLength}</span>
                      <div className="track-controls">
                        <button className={`track-btn ${track.solo ? 'active' : ''}`} title="Solo"
                          onClick={() => {
                            setCurrentPreset(prev => ({
                              ...prev, wheelA: { tracks: prev.wheelA.tracks.map(t =>
                                t.id === track.id ? { ...t, solo: !t.solo } : t) }
                            }));
                            audioEngine.muteVoice(track.id, track.mute);
                          }}>S</button>
                        <button className={`track-btn track-mute ${track.mute ? 'active' : ''}`} title="Mute"
                          onClick={() => {
                            const newMute = !track.mute;
                            setCurrentPreset(prev => ({
                              ...prev, wheelA: { tracks: prev.wheelA.tracks.map(t =>
                                t.id === track.id ? { ...t, mute: newMute } : t) }
                            }));
                            audioEngine.muteVoice(track.id, newMute);
                          }}>M</button>
                      </div>
                    </div>
                    <EventGrid events={track.events} color={VOICE_COLORS[track.voice]} trackId={track.id}
                      onToggleCell={toggleCell} onCellClick={handleCellClick}
                      selectedCell={selectedCell} maxSteps={Math.min(track.cycleLength, 32)}
                      currentStep={playState === AudioState.Playing ? currentStep : -1} cycleLength={track.cycleLength} />
                    <div className="track-params">
                      <input type="range" className="track-slider" min={0} max={100} value={track.volume}
                        onChange={e => {
                          const v = Number(e.target.value);
                          setCurrentPreset(prev => ({
                            ...prev, wheelA: { tracks: prev.wheelA.tracks.map(t =>
                              t.id === track.id ? { ...t, volume: v } : t) }
                          }));
                        }}
                        title={`Volume: ${track.volume}`} />
                      <span className="param-vol">{track.volume}</span>
                      <span className="param">Pan {track.pan}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="wheel-arrow">
              <div className="arrow-line" />
              <div className="arrow-label">Rhythm → Bass</div>
            </div>

            <div className="wheel-panel wheel-b">
              <div className="wheel-header">
                <span className="wheel-icon">◉</span>
                <span className="wheel-title">Wheel B — Bass Container</span>
                <span className="wheel-voices">{currentPreset.wheelB.tracks.length} tracks</span>
                <span className="wheel-hint">generated from rhythm</span>
              </div>
              <div className="wheel-body">
                {currentPreset.wheelB.tracks.map(track => (
                  <div key={track.id} className="track-strip">
                    <div className="track-strip-label" style={{ color: '#48b838' }}>
                      <span className="voice-dot" style={{ backgroundColor: '#48b838' }} />
                      <span>{track.name}</span>
                      <span className="cycle-badge">{track.cycleLength}</span>
                      <span className="note-display">
                        {track.events.slice(0, 8).map(e => midiToNote(e.pitch)).join(' ')}
                      </span>
                      <div className="track-controls">
                        <button className={`track-btn ${track.mute ? 'active' : ''}`} title="Mute"
                          onClick={() => {
                            const newMute = !track.mute;
                            setCurrentPreset(prev => ({
                              ...prev, wheelB: { tracks: prev.wheelB.tracks.map(t =>
                                t.id === track.id ? { ...t, mute: newMute } : t) }
                            }));
                            audioEngine.muteVoice(track.id, newMute);
                          }}>M</button>
                      </div>
                    </div>
                    <EventGrid events={track.events} color="#48b838" trackId={track.id}
                      onToggleCell={toggleCell} onCellClick={handleCellClick}
                      selectedCell={selectedCell} maxSteps={Math.min(track.cycleLength, 32)}
                      currentStep={playState === AudioState.Playing ? currentStep : -1} cycleLength={track.cycleLength} />
                    <div className="track-params">
                      <input type="range" className="track-slider" min={0} max={100} value={track.volume}
                        onChange={e => {
                          const v = Number(e.target.value);
                          setCurrentPreset(prev => ({
                            ...prev, wheelB: { tracks: prev.wheelB.tracks.map(t =>
                              t.id === track.id ? { ...t, volume: v } : t) }
                          }));
                        }}
                        title={`Volume: ${track.volume}`} />
                      <span className="param-vol">{track.volume}</span>
                      <span className="param">Pitch range</span>
                      <span className="param">{track.events.length > 0 ? `${midiToNote(Math.min(...track.events.map(e => e.pitch)))}-${midiToNote(Math.max(...track.events.map(e => e.pitch)))}` : '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Polymeter ── */}
          <div className="polymeter-bar">
            <span className="polymeter-title">Polymeter — Cycle Lengths</span>
            <div className="cycle-display">
              {currentPreset.wheelA.tracks.map(t => (
                <span key={t.id} className="cycle-chip" style={{ borderColor: VOICE_COLORS[t.voice] }}>
                  {t.name} <strong style={{ color: VOICE_COLORS[t.voice] }}>{t.cycleLength}</strong>
                </span>
              ))}
              {currentPreset.wheelB.tracks.map(t => (
                <span key={t.id} className="cycle-chip" style={{ borderColor: '#48b838' }}>
                  {t.name} <strong style={{ color: '#48b838' }}>{t.cycleLength}</strong>
                </span>
              ))}
              {(() => {
                const lcms = [...currentPreset.wheelA.tracks.map(t => t.cycleLength), ...currentPreset.wheelB.tracks.map(t => t.cycleLength)].filter(Boolean);
                const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
                return (
                  <span className="cycle-chip convergence">
                    Convergence: <strong>{Math.round(lcms.reduce((a, b) => a * b / gcd(a, b), 1))}</strong> steps
                  </span>
                );
              })()}
            </div>
          </div>

          {/* ── Taxonomy ── */}
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
                  <div key={k} className={`taxonomy-node ${k === selectedKingdom ? 'active' : ''}`}
                    onClick={() => { setSelectedKingdom(k); const f = Object.keys(TAXONOMY_DATA[k])[0]; setSelectedFamily(f); setSelectedGenus(Object.keys(TAXONOMY_DATA[k][f])[0]); }}>
                    ▶ {k}
                  </div>
                ))}
              </div>
              <div className="taxonomy-column">
                <div className="taxonomy-col-label">Family</div>
                {Object.keys(TAXONOMY_DATA[selectedKingdom] || {}).map(f => (
                  <div key={f} className={`taxonomy-node ${f === selectedFamily ? 'active' : ''}`}
                    onClick={() => { setSelectedFamily(f); setSelectedGenus(Object.keys(TAXONOMY_DATA[selectedKingdom][f])[0]); }}>
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
                <div className="taxonomy-col-label">Species ({filteredPresets.length})</div>
                <div className="species-list">
                  {filteredPresets.length === 0 && <div className="empty-species">No presets match</div>}
                  {filteredPresets.map(p => (
                    <div key={p.id} className={`species-node ${p.id === currentPreset.id ? 'active' : ''}`}
                      onClick={() => { setCurrentPreset(p); setShowPreview(false); setMutatedPreview(null); setSelectedCell(null); }}>
                      <span className="species-dot" /> {p.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* DNA */}
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
                        <span style={{ color: Number(delta) > 0 ? '#28FF6A' : '#f87171' }}>{Number(delta) > 0 ? '+' : ''}{delta}%</span>
                      </div>
                    );
                  })}
                </div>
                <button className="btn btn-apply" onClick={applyMutation}>✓ Apply Mutation</button>
                <button className="btn btn-cancel" onClick={() => { setShowPreview(false); setMutatedPreview(null); }}>✗ Discard</button>
              </>
            )}
          </div>

          {/* Genes */}
          <div className="panel genes-panel">
            <div className="panel-header">
              <span className="section-icon">🧬</span>
              <span className="panel-title">Groove Genes</span>
              {currentGenotype && showGenes && <span className="preview-badge">Editing</span>}
            </div>
            <div className="genes-content">
              {showGenes ? (
                <>
                  <div className="genes-grid">
                    {(Object.keys(GENOTYPE_LABELS) as (keyof GrooveGenotype)[]).map(key => (
                      <div key={key} className="gene-row">
                        <span className="gene-label">{GENOTYPE_LABELS[key]}</span>
                        <select className="gene-select" value={currentGenotype[key]}
                          onChange={e => setCurrentGenotype(prev => ({ ...prev, [key]: e.target.value as any }))}>
                          {GENOTYPE_OPTIONS[key].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="genes-actions">
                    <button className="btn btn-apply" onClick={handleRegenerate}>⟳ Generate from Genes</button>
                    <button className="btn btn-cancel" onClick={() => setShowGenes(false)}>✗ Close</button>
                  </div>
                </>
              ) : (
                <div className="genes-info">
                  <p className="genes-desc">Groove Genes describe the <em>intent</em> of a groove — not what it sounds like, but what it <em>aims</em> to sound like.</p>
                  <p className="genes-status">
                    {inferredGenotype ? (
                      <>Current: <span className="gene-pills">
                        {(['motion', 'silence', 'polymeter'] as const).map(k => (
                          <span key={k} className="gene-pill">{inferredGenotype[k]}</span>
                        ))}
                      </span></>
                    ) : 'Select a groove to infer genes'}
                  </p>
                  <button className="btn btn-mutate" onClick={handleInferGenotype} style={{ margin: '8px 12px 10px' }}>
                    🔬 Infer & Edit Genes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mutation */}
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
                      onClick={() => setMutationConfig(prev => ({ ...prev, [key]: !prev[key] }))}>{label}</button>
                  );
                })}
              </div>
            </div>
            <div className="mutation-strength">
              <span className="mutation-label">Strength</span>
              <input type="range" min={0} max={100} value={Math.round(mutationConfig.strength * 100)}
                onChange={e => setMutationConfig(prev => ({ ...prev, strength: Number(e.target.value) / 100 }))} className="strength-slider" />
              <span className="strength-value">{Math.round(mutationConfig.strength * 100)}%</span>
            </div>
            <div className="mutation-info">
              <span className="mutation-hint">
                {mutationConfig.preserveStyle ? '✓ Style' : '✗ Full'}
                {mutationConfig.preserveBass ? ' · Bass' : ''}
                {mutationConfig.preserveRhythm ? ' · Rhythm' : ''}
              </span>
            </div>
            <button className="btn btn-mutate" onClick={handleMutate}>⟳ MUTATE</button>
          </div>

          {/* Organism Info */}
          <div className="panel info-panel">
            <div className="panel-header">
              <span className="section-icon">ℹ</span>
              <span className="panel-title">Organism</span>
            </div>
            <div className="info-content">
              <div className="info-row"><span className="info-key">Name</span><span className="info-val">{currentPreset.name}</span></div>
              <div className="info-row"><span className="info-key">BPM</span><span className="info-val">{currentPreset.bpm}</span></div>
              <div className="info-row"><span className="info-key">Swing</span><span className="info-val">{currentPreset.swing}%</span></div>
              <div className="info-row"><span className="info-key">Perc voices</span><span className="info-val">{currentPreset.wheelA.tracks.length}</span></div>
              <div className="info-row"><span className="info-key">Taxonomy</span><span className="info-val">{currentPreset.taxonomy.genus}</span></div>
              <div className="info-row"><span className="info-key">Events</span><span className="info-val">
                {currentPreset.wheelA.tracks.reduce((s, t) => s + t.events.length, 0) + currentPreset.wheelB.tracks.reduce((s, t) => s + t.events.length, 0)}
              </span></div>
              <button className="btn btn-apply" style={{ marginTop: 8, width: '100%' }}
                onClick={handleGenerateBass}>⚡ Generate Bass from Rhythm</button>
              <button className="btn btn-midi-panel" style={{ marginTop: 4, width: '100%' }}
                onClick={() => downloadMidi(currentPreset, 4)}>♪ Export MIDI (4 bars)</button>
            </div>
          </div>

          {/* Save/Load Presets */}
          <div className="panel persist-panel">
            <div className="panel-header">
              <span className="section-icon">💾</span>
              <span className="panel-title">Presets</span>
              {persistMsg && <span className="persist-msg">{persistMsg}</span>}
            </div>
            <div className="persist-content">
              <div className="save-row">
                <input className="persist-input" type="text" placeholder="Preset name..."
                  value={saveName} onChange={e => setSaveName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSavePreset()} />
                <button className="btn btn-save" onClick={handleSavePreset}>Save</button>
              </div>
              {savedPresets.length > 0 && (
                <div className="saved-list">
                  <div className="saved-label">Saved ({savedPresets.length})</div>
                  <div className="saved-scroll">
                    {savedPresets.map(r => (
                      <div key={r.id} className="saved-item" title={r.description || r.name}>
                        <span className="saved-name" onClick={() => handleLoadPreset(r)}>{r.name}</span>
                        <span className="saved-time">{new Date(r.updatedAt).toLocaleDateString()}</span>
                        <button className="saved-delete" onClick={() => handleDeletePreset(r.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {savedPresets.length === 0 && (
                <div className="saved-empty">No saved presets yet. Play with the wheels and save your groove!</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Popup */}
      {cellData && cellData.event && (
        <EventDetailPopup
          trackId={cellData.trackId} position={cellData.position}
          event={cellData.event} voice={cellData.voice} color={cellData.color}
          onUpdate={updateEvent} onClose={() => setSelectedCell(null)} onDelete={deleteEvent}
        />
      )}
    </div>
  );
}
