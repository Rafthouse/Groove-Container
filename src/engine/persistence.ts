/**
 * Persistence Layer — IndexedDB storage for Groove Organisms.
 *
 * Stores two collections:
 *   - 'presets': user-saved organisms (full GrooveOrganism + metadata)
 *   - 'sessions': auto-saved session state (last loaded organism + UI state)
 *
 * API is async/Promise-based. All operations return Promises.
 * Falls back to in-memory storage if IndexedDB is unavailable.
 */

import type { GrooveOrganism } from './types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PresetRecord {
  id: string;
  kind: 'factory' | 'user';
  name: string;
  description: string;
  tags: string[];
  organism: GrooveOrganism;
  createdAt: number;
  updatedAt: number;
}

export interface SessionState {
  organism: GrooveOrganism | null;
  selectedTaxonomy: { kingdom: string; family: string; genus: string };
  mutationConfig: {
    preserveStyle: boolean;
    preserveBass: boolean;
    preserveRhythm: boolean;
    preserveComplexity: boolean;
    preserveAccents: boolean;
    strength: number;
  };
  version: number;
}

// ─── ID Generation ──────────────────────────────────────────────────────────

let idCounter = Date.now();

export function generateId(): string {
  return `gc-${(++idCounter).toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Database Setup ─────────────────────────────────────────────────────────

const DB_NAME = 'GrooveContainer';
const DB_VERSION = 1;
const PRESETS_STORE = 'presets';
const SESSION_STORE = 'sessions';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PRESETS_STORE)) {
        const store = db.createObjectStore(PRESETS_STORE, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('kind', 'kind', { unique: false });
        store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
      }
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── In-Memory Fallback ─────────────────────────────────────────────────────

class InMemoryStore {
  private presets: Map<string, PresetRecord> = new Map();
  private sessions: Map<string, SessionState> = new Map();

  async savePreset(record: PresetRecord): Promise<void> {
    this.presets.set(record.id, { ...record });
  }

  async loadPreset(id: string): Promise<PresetRecord | null> {
    return this.presets.get(id) ?? null;
  }

  async loadAllPresets(): Promise<PresetRecord[]> {
    return Array.from(this.presets.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async deletePreset(id: string): Promise<void> {
    this.presets.delete(id);
  }

  async searchPresets(query: string): Promise<PresetRecord[]> {
    const q = query.toLowerCase();
    return Array.from(this.presets.values())
      .filter(p => p.name.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async saveSession(state: SessionState): Promise<void> {
    this.sessions.set('current', { ...state });
  }

  async loadSession(): Promise<SessionState | null> {
    return this.sessions.get('current') ?? null;
  }

  async deleteSession(): Promise<void> {
    this.sessions.delete('current');
  }
}

// ─── Persistence Class ──────────────────────────────────────────────────────

export class Storage {
  private db: IDBDatabase | null = null;
  private fallback: InMemoryStore | null = null;
  private ready = false;

  async init(): Promise<void> {
    if (this.ready) return;
    try {
      if (typeof indexedDB !== 'undefined') {
        this.db = await openDB();
      } else {
        this.fallback = new InMemoryStore();
      }
    } catch {
      this.fallback = new InMemoryStore();
    }
    this.ready = true;
  }

  // ── Presets ──────────────────────────────────────────────────────────

  async savePreset(record: PresetRecord): Promise<void> {
    await this.init();
    if (this.fallback) return this.fallback.savePreset(record);

    const db = this.db!;
    const tx = db.transaction(PRESETS_STORE, 'readwrite');
    const store = tx.objectStore(PRESETS_STORE);
    store.put(record);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async loadPreset(id: string): Promise<PresetRecord | null> {
    await this.init();
    if (this.fallback) return this.fallback.loadPreset(id);

    const db = this.db!;
    const tx = db.transaction(PRESETS_STORE, 'readonly');
    const store = tx.objectStore(PRESETS_STORE);
    const req = store.get(id) as IDBRequest<PresetRecord | undefined>;
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  async loadAllPresets(): Promise<PresetRecord[]> {
    await this.init();
    if (this.fallback) return this.fallback.loadAllPresets();

    const db = this.db!;
    const tx = db.transaction(PRESETS_STORE, 'readonly');
    const store = tx.objectStore(PRESETS_STORE);
    const req = store.index('updatedAt').openCursor(null, 'prev');
    const results: PresetRecord[] = [];

    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async deletePreset(id: string): Promise<void> {
    await this.init();
    if (this.fallback) return this.fallback.deletePreset(id);

    const db = this.db!;
    const tx = db.transaction(PRESETS_STORE, 'readwrite');
    const store = tx.objectStore(PRESETS_STORE);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async searchPresets(query: string): Promise<PresetRecord[]> {
    await this.init();
    if (this.fallback) return this.fallback.searchPresets(query);

    const all = await this.loadAllPresets();
    const q = query.toLowerCase();
    return all.filter(p => p.name.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
  }

  // ── Sessions (auto-save) ──────────────────────────────────────────────

  async saveSession(state: SessionState): Promise<void> {
    await this.init();
    if (this.fallback) return this.fallback.saveSession(state);

    const record = { id: 'current', ...state };
    const db = this.db!;
    const tx = db.transaction(SESSION_STORE, 'readwrite');
    const store = tx.objectStore(SESSION_STORE);
    store.put(record);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async loadSession(): Promise<SessionState | null> {
    await this.init();
    if (this.fallback) return this.fallback.loadSession();

    const db = this.db!;
    const tx = db.transaction(SESSION_STORE, 'readonly');
    const store = tx.objectStore(SESSION_STORE);
    const req = store.get('current') as IDBRequest<any>;
    return new Promise((resolve, reject) => {
      req.onsuccess = () => {
        const result = req.result;
        if (!result) return resolve(null);
        const { id, ...state } = result;
        resolve(state as SessionState);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async deleteSession(): Promise<void> {
    await this.init();
    if (this.fallback) return this.fallback.deleteSession();

    const db = this.db!;
    const tx = db.transaction(SESSION_STORE, 'readwrite');
    const store = tx.objectStore(SESSION_STORE);
    store.delete('current');
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // ── Utility ──────────────────────────────────────────────────────────

  /** Create a PresetRecord from a GrooveOrganism with auto-generated id. */
  createRecord(
    organism: GrooveOrganism,
    name: string,
    description: string = '',
    tags: string[] = [],
  ): PresetRecord {
    const now = Date.now();
    return {
      id: generateId(),
      kind: 'user',
      name: name || organism.name,
      description,
      tags,
      organism: JSON.parse(JSON.stringify(organism)), // deep clone
      createdAt: now,
      updatedAt: now,
    };
  }
}

// ─── Singleton ─────────────────────────────────────────────────────────────

export const storage = new Storage();
export default storage;
