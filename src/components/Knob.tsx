import { useRef, useState, useCallback, useEffect } from 'react';
import type { PointerEvent as ReactPointerEvent, KeyboardEvent, ChangeEvent } from 'react';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  sensitivity?: number;
  fineSensitivityMultiplier?: number;
  format?: (v: number) => string;
  resetValue?: number;
  onChange: (value: number) => void;
  color?: string;
}

const ARC_DEG = 270;
const START_DEG = 135;

export default function Knob({
  label, value, min, max, step = 1, sensitivity = 160,
  fineSensitivityMultiplier = 0.16, format, resetValue, onChange,
  color = '#c084fc',
}: KnobProps) {
  const dragRef = useRef<{ startY: number; startValue: number; shiftKey: boolean } | null>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [savedValue, setSavedValue] = useState<number>(value);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setEditText(format ? format(value) : String(value));
  }, [value, format, editing]);

  const norm = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = START_DEG + norm * ARC_DEG;
  const rad = (angle * Math.PI) / 180;
  const cx = 18 + 13 * Math.cos(rad);
  const cy = 18 + 13 * Math.sin(rad);

  const arcRad = (deg: number) => (deg * Math.PI) / 180;
  const ax = (deg: number) => 18 + 14 * Math.cos(arcRad(deg));
  const ay = (deg: number) => 18 + 14 * Math.sin(arcRad(deg));
  const largeArc = norm * ARC_DEG > 180 ? 1 : 0;
  const trackPath = `M ${ax(START_DEG).toFixed(2)} ${ay(START_DEG).toFixed(2)} A 14 14 0 ${largeArc} 1 ${ax(angle).toFixed(2)} ${ay(angle).toFixed(2)}`;
  const fullPath = `M ${ax(START_DEG).toFixed(2)} ${ay(START_DEG).toFixed(2)} A 14 14 0 1 1 ${ax(START_DEG + ARC_DEG).toFixed(2)} ${ay(START_DEG + ARC_DEG).toFixed(2)}`;

  const apply = useCallback((clientY: number, shiftKey: boolean) => {
    const d = dragRef.current;
    if (!d) return;
    const dy = d.startY - clientY;
    const effectiveS = shiftKey ? sensitivity / fineSensitivityMultiplier : sensitivity;
    let next = d.startValue + (dy / effectiveS) * (max - min);
    next = Math.round(next / step) * step;
    next = Math.max(min, Math.min(max, next));
    if (next !== value) onChange(next);
  }, [value, min, max, step, sensitivity, fineSensitivityMultiplier, onChange]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (editing) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startValue: value, shiftKey: e.shiftKey };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    apply(e.clientY, dragRef.current.shiftKey);
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
  };

  const handleDoubleClick = () => resetValue !== undefined && onChange(resetValue);
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (editing) return;
    e.preventDefault();
    let next = value + (e.deltaY > 0 ? -step : step);
    next = Math.round(next / step) * step;
    next = Math.max(min, Math.min(max, next));
    if (next !== value) onChange(next);
  };

  const startEditing = () => { setEditing(true); setSavedValue(value); setEditText(format ? format(value) : String(value)); setTimeout(() => editInputRef.current?.select(), 0); };
  const commitEdit = () => {
    setEditing(false);
    const parsed = Number(editText);
    if (isNaN(parsed)) { onChange(savedValue); return; }
    let clamped = Math.round(Math.max(min, Math.min(max, parsed)) / step) * step;
    onChange(Math.max(min, Math.min(max, clamped)));
  };
  const cancelEdit = () => { setEditing(false); onChange(savedValue); };

  return (
    <div className="knob" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
      onDoubleClick={handleDoubleClick} onWheel={handleWheel}
      onKeyDown={(e) => { if (editing) return; if (e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(max, value + step)); } if (e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(min, value - step)); } }}
      role="slider" aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} tabIndex={0}
      title={`${label}: ${format ? format(value) : value}`} style={{ userSelect: 'none', cursor: 'grab' }}>
      <svg className="knob-dial" viewBox="0 0 36 36" aria-hidden="true">
        <path className="knob-track" d={fullPath} stroke="#3a3d48" strokeWidth="3" fill="none" />
        <path className="knob-fill" d={trackPath} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle className="knob-dot" cx={cx.toFixed(2)} cy={cy.toFixed(2)} r="2.8" fill={color} />
      </svg>
      <span className="knob-label" style={{ color: '#7b7f8c', fontSize: 10, textAlign: 'center', display: 'block', marginTop: 2 }}>{label}</span>
      <span className="knob-value" style={{ color: '#c7c9d1', fontSize: 11, textAlign: 'center', display: 'block' }}
        onDoubleClick={(e) => { e.stopPropagation(); startEditing(); }}>
        {editing ? <input ref={editInputRef} type="text" value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }} onBlur={commitEdit} style={{ width: 40, background: '#1f2129', border: '1px solid #c084fc', color: '#fff', fontSize: 11, textAlign: 'center' }} /> : (format ? format(value) : value)}
      </span>
    </div>
  );
}
