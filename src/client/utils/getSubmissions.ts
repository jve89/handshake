import axios from 'axios';

export interface Submission {
  submission_id: number;
  submitted_at: string;
  responses: {
    request_id: number;
    label: string;
    value: string;
  }[];
}

export async function getSubmissions(handshakeId: number): Promise<Submission[]> {
  try {
    const res = await axios.get(`/api/user/handshake/${handshakeId}/submissions`);
    return res.data.submissions;
  } catch (err: any) {
    const message = err.response?.data?.error || 'Failed to load submissions';
    throw new Error(message);
  }
}
