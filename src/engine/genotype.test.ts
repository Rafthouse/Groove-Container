import { describe, it, expect } from 'vitest';
import { generateFromGenotype, inferGenotype, DEFAULT_GENOTYPE } from './genotype';
import type { GrooveGenotype, GrooveOrganism } from './genotype';

describe('generateFromGenotype', () => {
  it('generates a valid organism with default genotype', () => {
    const org = generateFromGenotype({}, 'Test Default');
    expect(org).toBeDefined();
    expect(org.name).toBe('Test Default');
    expect(org.wheelA.tracks.length).toBeGreaterThanOrEqual(2);
    expect(org.wheelB.tracks.length).toBeGreaterThanOrEqual(1);
    expect(org.dna).toBeDefined();
    expect(typeof org.dna.density).toBe('number');
    expect(org.bpm).toBeGreaterThan(0);
    expect(org.swing).toBeGreaterThanOrEqual(0);
  });

  it('generates different organisms with different genotypes', () => {
    const lowDensity = generateFromGenotype({ rhythmDensity: 'low' }, 'Low');
    const highDensity = generateFromGenotype({ rhythmDensity: 'high' }, 'High');

    // High density should have more events
    const lowCount = lowDensity.wheelA.tracks.reduce((s, t) => s + t.events.length, 0);
    const highCount = highDensity.wheelA.tracks.reduce((s, t) => s + t.events.length, 0);

    expect(highCount).toBeGreaterThan(lowCount);
  });

  it('polymeter fixed gives all 16 cycle lengths', () => {
    const org = generateFromGenotype({ polymeter: 'fixed' }, 'Fixed');
    const all16 = org.wheelA.tracks.every(t => t.cycleLength === 16);
    expect(all16).toBe(true);
  });

  it('polymeter rotating gives varied cycle lengths', () => {
    const org = generateFromGenotype({ polymeter: 'rotating' }, 'Rotating');
    const unique = new Set(org.wheelA.tracks.map(t => t.cycleLength));
    expect(unique.size).toBeGreaterThan(1);
  });

  it('timingFeel swung gives swing > 30', () => {
    const org = generateFromGenotype({ timingFeel: 'swung' }, 'Swung');
    expect(org.swing).toBeGreaterThanOrEqual(30);
  });

  it('timingFeel rigid gives swing 0', () => {
    const org = generateFromGenotype({ timingFeel: 'rigid' }, 'Rigid');
    expect(org.swing).toBe(0);
  });

  it('kickSnare bounce produces snare near kick positions', () => {
    const org = generateFromGenotype({ kickSnare: 'bounce' }, 'Bounce');
    const kickPos = org.wheelA.tracks.filter(t => t.voice === 'kick').flatMap(t => t.events.map(e => e.position));
    const snarePos = org.wheelA.tracks.filter(t => t.voice === 'snare').flatMap(t => t.events.map(e => e.position));
    // At least some snares are 1 step after kicks
    const matches = kickPos.some(k => snarePos.includes((k + 1) % 16));
    expect(matches).toBe(true);
  });

  it('kickHat locked produces many hat events', () => {
    const org = generateFromGenotype({ kickHat: 'locked' }, 'Locked');
    const hatEvents = org.wheelA.tracks
      .filter(t => t.voice === 'closedHat' || t.voice === 'openHat')
      .reduce((s, t) => s + t.events.length, 0);
    expect(hatEvents).toBeGreaterThan(4);
  });

  it('register high produces bass in upper range', () => {
    const org = generateFromGenotype({ register: 'high' }, 'High Bass');
    const bassEvents = org.wheelB.tracks.flatMap(t => t.events);
    expect(bassEvents.length).toBeGreaterThan(0);
    const avgPitch = bassEvents.reduce((a, e) => a + e.pitch, 0) / bassEvents.length;
    expect(avgPitch).toBeGreaterThanOrEqual(60);
  });

  it('register sub-harmonic produces bass in low range', () => {
    const org = generateFromGenotype({ register: 'sub-harmonic' }, 'Sub Bass');
    const bassEvents = org.wheelB.tracks.flatMap(t => t.events);
    if (bassEvents.length > 0) {
      const avgPitch = bassEvents.reduce((a, e) => a + e.pitch, 0) / bassEvents.length;
      expect(avgPitch).toBeLessThan(36);
    }
  });

  it('seed parameter produces deterministic output', () => {
    const org1 = generateFromGenotype({}, 'Seed Test', 42);
    const org2 = generateFromGenotype({}, 'Seed Test', 42);
    expect(org1.wheelA.tracks.length).toBe(org2.wheelA.tracks.length);
    // Compare first track events
    expect(org1.wheelA.tracks[0].events.map(e => e.position))
      .toEqual(org2.wheelA.tracks[0].events.map(e => e.position));
  });

  it('always generates at least a kick', () => {
    const org = generateFromGenotype({ rhythmDensity: 'low' }, 'Minimal');
    const kick = org.wheelA.tracks.find(t => t.voice === 'kick');
    expect(kick).toBeDefined();
    expect(kick!.events.length).toBeGreaterThan(0);
  });
});

describe('inferGenotype', () => {
  it('produces valid genotype from generated organism', () => {
    const org = generateFromGenotype({
      rhythmDensity: 'high',
      motion: 'chaotic',
      timingFeel: 'swung',
      kickSnare: 'bounce',
    }, 'Test Infer');
    const genotype = inferGenotype(org);

    // Validate all fields are present and correct type
    expect(genotype.rhythmDensity).toMatch(/^(low|medium-low|medium|medium-high|high)$/);
    expect(genotype.accentStrategy).toMatch(/^(flat|rotating|euclidean|fragmented)$/);
    expect(genotype.timingFeel).toMatch(/^(rigid|tight|loose|swung|heavy)$/);
    expect(genotype.motion).toMatch(/^(static|walking|rolling|pendulum|chaotic)$/);
    expect(genotype.silence).toMatch(/^(continuous|breathing|punctuated|fragmented|absent)$/);
    expect(genotype.polymeter).toMatch(/^(fixed|extended|rotating|polymetric)$/);
    expect(genotype.kickSnare).toMatch(/^(ignore|bounce|follow|anticipate)$/);
    expect(genotype.kickHat).toMatch(/^(independent|weak|medium|strong|locked)$/);
  });

  it('DNA axes correlate with genotype', () => {
    const org = generateFromGenotype({ rhythmDensity: 'high' }, 'Density Test');
    const g = inferGenotype(org);
    // High density genotype should produce density > 0.3
    expect(org.dna.density).toBeGreaterThan(0.3);
  });

  it('returns a complete GrooveGenotype with all 12 fields', () => {
    const org = generateFromGenotype({}, 'Complete');
    const g = inferGenotype(org);
    const keys = Object.keys(DEFAULT_GENOTYPE);
    expect(keys.length).toBe(12);
    for (const key of keys) {
      expect(g).toHaveProperty(key);
    }
  });

  it('can roundtrip: infer genotype from generated → generate again', () => {
    const org1 = generateFromGenotype({
      motion: 'rolling',
      silence: 'punctuated',
      register: 'low',
    }, 'Roundtrip', 12345);
    const g = inferGenotype(org1);
    const org2 = generateFromGenotype(g, 'Roundtrip 2', 12345);

    // Same seed + inferred genotype should produce similar character
    expect(org2.dna.density).toBeGreaterThan(0);
    expect(org2.wheelA.tracks.length).toBe(org1.wheelA.tracks.length);
  });
});
