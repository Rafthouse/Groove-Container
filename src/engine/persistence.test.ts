import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Storage, generateId } from './persistence';
import type { GrooveOrganism } from './types';

// Mock IndexedDB
const mockStore = new Map<string, any>();
const mockIndex = {
  openCursor: vi.fn(() => ({
    result: null,
    onsuccess: null as any,
    onerror: null as any,
  })),
};

const mockObjectStore = {
  put: vi.fn((val: any) => { mockStore.set(val.id, val); }),
  get: vi.fn((id: string) => ({ result: mockStore.get(id) ?? null, onsuccess: null as any, onerror: null as any })),
  delete: vi.fn((id: string) => { mockStore.delete(id); }),
  index: vi.fn(() => mockIndex),
  openCursor: vi.fn(),
};

const mockTransaction = {
  objectStore: vi.fn(() => mockObjectStore),
  oncomplete: null as any,
  onerror: null as any,
};

const mockDB = {
  transaction: vi.fn(() => mockTransaction),
  objectStoreNames: { contains: vi.fn(() => true) },
};

describe('generateId', () => {
  it('produces a string starting with gc-', () => {
    const id = generateId();
    expect(id).toMatch(/^gc-/);
  });

  it('produces unique ids', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe('Storage (in-memory fallback)', () => {
  let s: Storage;

  beforeEach(() => {
    mockStore.clear();
    // Force fallback by making indexedDB undefined
    vi.stubGlobal('indexedDB', undefined);
    s = new Storage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initialises without error', async () => {
    await expect(s.init()).resolves.toBeUndefined();
  });

  it('saves and loads a preset record', async () => {
    const organism: any = {
      id: 'test', name: 'Test', bpm: 130, swing: 0,
      wheelA: { tracks: [] }, wheelB: { tracks: [] },
      dna: null, taxonomy: { kingdom: 'K', family: 'F', genus: 'G', species: 'S' },
    };
    const record = s.createRecord(organism, 'My Groove', 'Test description', ['house', 'techno']);
    await s.savePreset(record);

    const loaded = await s.loadPreset(record.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.name).toBe('My Groove');
    expect(loaded!.description).toBe('Test description');
    expect(loaded!.tags).toEqual(['house', 'techno']);
    expect(loaded!.organism.bpm).toBe(130);
  });

  it('loadAllPresets returns sorted by updatedAt', async () => {
    const organism: any = { id: 't', name: 'T', bpm: 120, swing: 0, wheelA: { tracks: [] }, wheelB: { tracks: [] }, dna: null, taxonomy: { kingdom: 'K', family: 'F', genus: 'G', species: 'S' } };
    const r1 = s.createRecord(organism, 'Old', '', []);
    const r2 = s.createRecord(organism, 'New', '', []);
    await s.savePreset(r1);
    await s.savePreset(r2);

    const all = await s.loadAllPresets();
    expect(all.length).toBe(2);
    // Sorted by updatedAt descending
    expect(all[0].updatedAt).toBeGreaterThanOrEqual(all[1].updatedAt);
  });

  it('deletes a preset', async () => {
    const organism: any = { id: 't', name: 'T', bpm: 120, swing: 0, wheelA: { tracks: [] }, wheelB: { tracks: [] }, dna: null, taxonomy: { kingdom: 'K', family: 'F', genus: 'G', species: 'S' } };
    const record = s.createRecord(organism, 'Delete Me');
    await s.savePreset(record);
    await s.deletePreset(record.id);
    const loaded = await s.loadPreset(record.id);
    expect(loaded).toBeNull();
  });

  it('searchPresets filters by name', async () => {
    const organism: any = { id: 't', name: 'T', bpm: 120, swing: 0, wheelA: { tracks: [] }, wheelB: { tracks: [] }, dna: null, taxonomy: { kingdom: 'K', family: 'F', genus: 'G', species: 'S' } };
    const r1 = s.createRecord(organism, 'Deep House Found', '', []);
    const r2 = s.createRecord(organism, 'Techno Pulse', '', []);
    await s.savePreset(r1);
    await s.savePreset(r2);

    const results = await s.searchPresets('deep');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Deep House Found');
  });

  it('searchPresets filters by tags', async () => {
    const organism: any = { id: 't', name: 'T', bpm: 120, swing: 0, wheelA: { tracks: [] }, wheelB: { tracks: [] }, dna: null, taxonomy: { kingdom: 'K', family: 'F', genus: 'G', species: 'S' } };
    const r1 = s.createRecord(organism, 'A', '', ['minimal', 'dub']);
    const r2 = s.createRecord(organism, 'B', '', ['acid']);
    await s.savePreset(r1);
    await s.savePreset(r2);

    const results = await s.searchPresets('dub');
    expect(results.length).toBe(1);
  });

  it('saves and loads session state', async () => {
    const state = {
      organism: null,
      selectedTaxonomy: { kingdom: 'EM', family: 'House', genus: 'Deep House' },
      mutationConfig: { preserveStyle: true, preserveBass: false, preserveRhythm: false, preserveComplexity: false, preserveAccents: false, strength: 0.3 },
      version: 1,
    };
    await s.saveSession(state);
    const loaded = await s.loadSession();
    expect(loaded).not.toBeNull();
    expect(loaded!.selectedTaxonomy.genus).toBe('Deep House');
  });

  it('deleteSession removes session', async () => {
    const state = {
      organism: null,
      selectedTaxonomy: { kingdom: 'EM', family: 'House', genus: 'Deep House' },
      mutationConfig: { preserveStyle: true, preserveBass: false, preserveRhythm: false, preserveComplexity: false, preserveAccents: false, strength: 0.3 },
      version: 1,
    };
    await s.saveSession(state);
    await s.deleteSession();
    const loaded = await s.loadSession();
    expect(loaded).toBeNull();
  });

  it('createRecord deep-clones the organism', async () => {
    const organism: GrooveOrganism = {
      id: 't', name: 'T', bpm: 120, swing: 0,
      wheelA: { tracks: [] }, wheelB: { tracks: [] },
      dna: null as any,
      taxonomy: { kingdom: 'K', family: 'F', genus: 'G', species: 'S' },
    };
    const record = s.createRecord(organism, 'Clone Test');
    // Mutate original
    organism.bpm = 999;
    expect(record.organism.bpm).toBe(120);
  });

  it('storage singleton is defined', async () => {
    const { storage } = await import('./persistence');
    expect(storage).toBeDefined();
  });
});
