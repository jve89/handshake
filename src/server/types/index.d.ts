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
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // add other handshake-specific fields here
}
