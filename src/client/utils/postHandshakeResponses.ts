import axios from 'axios';

interface HandshakeResponse {
  request_id: number;
  value: string;
}

export async function submitResponses(slug: string, responses: HandshakeResponse[]) {
  try {
    const res = await axios.post(`/api/handshake/${slug}/submit`, { responses });
    return res.data; // { submission_id }
  } catch (err: any) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error('Submission failed. Please try again.');
  }
}
