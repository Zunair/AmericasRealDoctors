export class InMemoryDistributedStore {
  constructor() {
    this.map = new Map();
    this.failMode = false;
    this.locks = new Map();
  }

  setFailMode(value) {
    this.failMode = value;
  }

  async get(key) {
    if (this.failMode) throw new Error('store unavailable');
    const value = this.map.get(key);
    if (!value) return null;
    if (value.expiresAt && value.expiresAt <= Date.now()) {
      this.map.delete(key);
      return null;
    }
    return value.value;
  }

  async set(key, value, ttlMs = 0) {
    if (this.failMode) throw new Error('store unavailable');
    this.map.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : null
    });
  }

  async del(key) {
    if (this.failMode) throw new Error('store unavailable');
    this.map.delete(key);
  }

  async withKeyLock(key, callback) {
    if (this.failMode) throw new Error('store unavailable');
    const previous = this.locks.get(key) ?? Promise.resolve();
    let release;
    const current = new Promise((resolve) => {
      release = resolve;
    });
    this.locks.set(key, previous.then(() => current));
    await previous;
    try {
      return await callback();
    } finally {
      release();
      if (this.locks.get(key) === current) {
        this.locks.delete(key);
      }
    }
  }
}
