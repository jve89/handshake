export interface SubmissionResponse {
  request_id: number;
  label: string;
  value: string;
}

export interface Submission {
  submission_id: number;
  submitted_at: string;
  responses: SubmissionResponse[];
}

export function ensureToken(search: string): string {
  const params = new URLSearchParams(search);
  const token = params.get('token');
  if (!token) throw new Error('Missing inbox token in URL (?token=...)');
  return token;
}

export async function fetchInboxSubmissions(handshakeId: number, token: string): Promise<Submission[]> {
  const res = await fetch(`/api/inbox/handshakes/${handshakeId}/submissions?token=${encodeURIComponent(token)}`);
  if (!res.ok) {
    const msg = await safeMessage(res);
    throw new Error(msg || `Failed to load inbox submissions (${res.status})`);
  }
  const data = await res.json();
  return data.submissions as Submission[];
}

export async function fetchInboxSubmissionDetail(submissionId: number, token: string): Promise<Submission> {
  const res = await fetch(`/api/inbox/submissions/${submissionId}?token=${encodeURIComponent(token)}`);
  if (!res.ok) {
    const msg = await safeMessage(res);
    throw new Error(msg || `Failed to load submission (${res.status})`);
  }
  const data = await res.json();
  return data.submission as Submission;
}

async function safeMessage(res: Response): Promise<string | null> {
  try {
    const j = await res.json();
    return (j && (j.error || j.message)) ?? null;
  } catch {
    return null;
  }
}
