export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

export interface Handshake {
  id: number;
  user_id: number;
  slug: string;
  title: string;
  description?: string | null;
  created_at: string;
  expires_at?: string | null;
  updated_at: string | null;
  archived: boolean;
}

