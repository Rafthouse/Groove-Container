/**
 * HarmonyWheel — React component for Wheel C (Harmony Container) UI
 *
 * Renders harmony event grid, chord info, and links to event detail popup.
 * Extracted as a separate file to work around Rolldown/Vite 8 JSX parser
 * limitations with deeply nested ternary expressions inside JSX attributes.
 */

import React from 'react';
import type { GrooveOrganism, HarmonyEvent } from '../engine/types';

interface HarmonyWheelProps {
  organism: GrooveOrganism;
  selectedCell: string | null;
  playState: string;
  currentStep: number;
  onCellClick: (pos: number) => void;
}

/**
 * Compute cycle length from harmony events.
 */
function harmonyCycleLen(events: HarmonyEvent[]): number {
  if (!events || events.length === 0) return 16;
  var maxPos = 0;
  for (var i = 0; i < events.length; i++) {
    if (events[i].position > maxPos) maxPos = events[i].position;
  }
  return maxPos + 1;
}

/**
 * Flatten harmony events to the shape EventGrid expects.
 */
function harmonyGridEvents(events: HarmonyEvent[]): Array<{ position: number; velocity: number; accent: boolean }> {
  if (!events) return [];
  return events.map(function(ev) {
    return { position: ev.position, velocity: 80, accent: false };
  });
}

/**
 * Check if a cell is the playback highlight position.
 */
function isPlaying(step: number, currentStep: number, cycleLen: number, playState: string): boolean {
  if (playState !== 'playing') return false;
  if (currentStep < 0) return false;
  return (currentStep % cycleLen) === step;
}

export default function HarmonyWheel(props: HarmonyWheelProps) {
  var org = props.organism;
  var wc = org.wheelC;
  if (!wc || !wc.events || wc.events.length === 0) {
    return React.createElement('div', { className: 'harmony-empty empty-panel' },
      React.createElement('p', null, 'No harmony data. Generate from Genes to create chords.')
    );
  }

  var cl = harmonyCycleLen(wc.events);
  var cells = Array.from({ length: cl }, function(_, i) {
    var ev = null;
    for (var j = 0; j < wc.events.length; j++) {
      if (wc.events[j].position === i) { ev = wc.events[j]; break; }
    }
    var filled = !!ev;
    var playing = isPlaying(i, props.currentStep, cl, props.playState);
    var gridKey = 'harmony-grid-' + i;
    var selected = props.selectedCell === gridKey;
    return React.createElement('div', {
      key: gridKey,
      className: 'event-cell' + (filled ? ' filled' : '') + (playing ? ' playing' : '') + (selected ? ' selected' : ''),
      style: { backgroundColor: filled ? '#c084fc' : undefined, opacity: filled ? 0.7 : 0.12 },
      onClick: function() { props.onCellClick(i); },
      title: 'Step ' + i + ': ' + (filled ? 'chord' : 'rest') + (playing ? ' [PLAYING]' : '')
    });
  });

  return React.createElement('div', { className: 'harmony-strip' },
    React.createElement('div', { className: 'track-strip-label', style: { color: '#c084fc' } },
      React.createElement('span', { className: 'voice-dot', style: { backgroundColor: '#c084fc' } }),
      React.createElement('span', null, wc.behavior + ' - ' + wc.scaleFamily),
      React.createElement('span', { className: 'cycle-badge' }, '' + cl)
    ),
    React.createElement('div', { className: 'event-grid' }, cells),
    React.createElement('div', { className: 'track-params' },
      React.createElement('span', { className: 'param' }, wc.density + ' density'),
      React.createElement('span', { className: 'param' }, wc.complexity),
      React.createElement('span', { className: 'param' }, wc.events.length + ' chords')
    )
  );
}
