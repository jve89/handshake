// src/client/utils/getSubmissions.ts
import { apiGet } from "./api";

export interface Submission {
  submission_id: number;
  submitted_at: string;
  responses: {
    request_id: number;
    label: string;
    value: string;
  }[];
}

export async function getSubmissions(
  handshakeId: number,
): Promise<Submission[]> {
  const data = await apiGet<{ submissions: Submission[] }>(
    `/api/outbox/handshakes/${handshakeId}/submissions`,
  );
  return data.submissions;
}
