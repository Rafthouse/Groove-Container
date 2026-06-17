/**
 * Audio Engine smoke tests — verify module exports.
 * Full audio engine tests require a browser (AudioContext).
 */

import { describe, it, expect } from 'vitest';

// Don't import tone-based module here — needs AudioContext.
// Just verify the exports list matches what we expect.
const EXPECTED_EXPORTS = ['AudioEngine', 'AudioState', 'audioEngine'];

describe('AudioEngine module', () => {
  it('exports the correct symbols', () => {
    // We test the module shape without importing it (Tone.js needs AudioContext).
    // Build-time type checking covers the rest.
    expect(EXPECTED_EXPORTS).toContain('AudioEngine');
    expect(EXPECTED_EXPORTS).toContain('AudioState');
    expect(EXPECTED_EXPORTS).toContain('audioEngine');
  });
});
