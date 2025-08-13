// src/client/utils/api.ts
import { getAuthToken } from './getAuthToken';

async function handle<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) {
    let msg = '';
    try { msg = (await res.json())?.error || ''; } catch {}
    if (!msg) { try { msg = await res.text(); } catch {} }
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(path, { method: 'GET', headers: { ...authHeaders() }, credentials: 'include' });
  return handle<T>(res);
}

export async function apiPost<T = any>(path: string, body?: any): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  return handle<T>(res);
}

export async function apiPut<T = any>(path: string, body?: any): Promise<T> {
  const res = await fetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  return handle<T>(res);
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await fetch(path, { method: 'DELETE', headers: { ...authHeaders() }, credentials: 'include' });
  return handle<T>(res);
}
