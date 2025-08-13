// src/client/utils/handshakeRequests.ts
import { apiDelete, apiGet, apiPost, apiPut } from './api';

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

const API_BASE = '/api/outbox/handshakes';

export async function fetchRequests(handshakeId: number): Promise<HandshakeRequest[]> {
  const data = await apiGet<{ requests: HandshakeRequest[] }>(`${API_BASE}/${handshakeId}/requests`);
  return data.requests;
}

export async function createRequest(
  handshakeId: number,
  request: RequestInput
): Promise<HandshakeRequest> {
  const data = await apiPost<{ request: HandshakeRequest }>(
    `${API_BASE}/${handshakeId}/requests`,
    request
  );
  return data.request;
}

export async function updateRequest(
  handshakeId: number,
  requestId: number,
  updates: Partial<RequestInput>
): Promise<HandshakeRequest> {
  const data = await apiPut<{ request: HandshakeRequest }>(
    `${API_BASE}/${handshakeId}/requests/${requestId}`,
    updates
  );
  return data.request;
}

export async function deleteRequest(handshakeId: number, requestId: number): Promise<void> {
  await apiDelete(`${API_BASE}/${handshakeId}/requests/${requestId}`);
}
