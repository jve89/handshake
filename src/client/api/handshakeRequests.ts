export interface RequestInput {
  label: string;
  type: 'text' | 'email' | 'select' | 'file';
  required: boolean;
  options?: string[];
}

export interface HandshakeRequest extends RequestInput {
  id: number;
  handshake_id: number;
}

const API_BASE = '/api/handshakes';

export async function fetchRequests(handshakeId: number): Promise<HandshakeRequest[]> {
  const res = await fetch(`${API_BASE}/${handshakeId}/requests`);
  if (!res.ok) throw new Error('Failed to fetch requests');
  const data = await res.json();
  return data.requests;
}

export async function createRequest(
  handshakeId: number,
  request: RequestInput
): Promise<HandshakeRequest> {
  const res = await fetch(`${API_BASE}/${handshakeId}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Failed to create request');
  const data = await res.json();
  return data.request;
}

export async function updateRequest(
  handshakeId: number,
  requestId: number,
  updates: Partial<RequestInput>
): Promise<HandshakeRequest> {
  const res = await fetch(`${API_BASE}/${handshakeId}/requests/${requestId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update request');
  const data = await res.json();
  return data.request;
}

export async function deleteRequest(handshakeId: number, requestId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/${handshakeId}/requests/${requestId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete request');
}
