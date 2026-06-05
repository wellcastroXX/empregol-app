import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Session, UserProfile } from '@/types';

const KEY = 'empregol.auth';

/** Persisted auth snapshot — JWT tokens + the resolved user profile. */
export interface AuthSnapshot {
  session: Session;
  user: UserProfile;
}

/** Persists the auth snapshot. Swappable interface (SecureStore native / localStorage web). */
export interface SessionStorage {
  save(snapshot: AuthSnapshot): Promise<void>;
  load(): Promise<AuthSnapshot | null>;
  clear(): Promise<void>;
}

class DeviceSessionStorage implements SessionStorage {
  async save(snapshot: AuthSnapshot): Promise<void> {
    const value = JSON.stringify(snapshot);
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(KEY, value);
      return;
    }
    await SecureStore.setItemAsync(KEY, value);
  }

  async load(): Promise<AuthSnapshot | null> {
    let raw: string | null;
    if (Platform.OS === 'web') {
      raw = globalThis.localStorage?.getItem(KEY) ?? null;
    } else {
      raw = await SecureStore.getItemAsync(KEY);
    }
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSnapshot;
    } catch {
      return null;
    }
  }

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(KEY);
      return;
    }
    await SecureStore.deleteItemAsync(KEY);
  }
}

export const sessionStorage: SessionStorage = new DeviceSessionStorage();
