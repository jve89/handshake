// src/server/types/index.d.ts
export interface User {
  id: number;
  email: string;
  name?: string | null;
  password_hash: string;
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

// Re-export canonical Handshake type from shared to prevent drift.
export type { Handshake } from '../../shared/types';
