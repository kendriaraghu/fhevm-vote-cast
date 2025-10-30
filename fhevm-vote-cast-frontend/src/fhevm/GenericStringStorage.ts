import { GenericStringStorage } from './fhevmTypes';

export class GenericStringStorageImpl implements GenericStringStorage {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  // Keep backward compatibility
  async get(key: string): Promise<string | null> {
    return this.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    return this.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    return this.removeItem(key);
  }
}
