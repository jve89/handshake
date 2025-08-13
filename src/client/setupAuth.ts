// src/client/setupAuth.ts
import axios from 'axios';

export function applyAuthHeader() {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

// Run once on load
applyAuthHeader();

// Optional helper to re-apply without reload after login
// (window as any) so it compiles without a global type
// @ts-ignore
(window as any).refreshAuthHeader = applyAuthHeader;
