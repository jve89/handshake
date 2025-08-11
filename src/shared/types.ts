// src/shared/types.ts

// Canonical Handshake type used by both client and server.
// Mirrors DB schema (numbers for ids; ISO strings for timestamps).
export type Handshake = {
  id: number;
  user_id: number;
  slug: string;
  title: string;
  description?: string | null;
  created_at: string;
  expires_at?: string | null;
  updated_at: string | null;
  archived: boolean;
};

// Keeping existing Submission export as-is to avoid scope creep.
// We can revisit later if needed.
export type Submission = {
  handshake_id: string;
  responses: Record<string, string>;
};
