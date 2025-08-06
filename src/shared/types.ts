export type Handshake = {
  id: string;
  title: string;
  created_at: string;
  expires_at?: string;
};

export type Submission = {
  handshake_id: string;
  responses: Record<string, string>;
};
