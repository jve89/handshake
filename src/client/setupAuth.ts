// src/client/setupAuth.ts
// Automatically attach Authorization header from localStorage to all /api requests.

(() => {
  const getToken = () =>
    localStorage.getItem('token') || localStorage.getItem('authToken');

  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      // Figure out the request URL as a string
      const urlStr =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url;

      // Only touch our API calls
      const isApi =
        urlStr.startsWith('/api') ||
        urlStr.startsWith(`${window.location.origin}/api`);

      const token = getToken();
      if (isApi && token) {
        init = init ?? {};
        const headers = new Headers(init.headers ?? {});
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        init.headers = headers;
      }
    } catch {
      // never block the request on our helper
    }

    return originalFetch(input as any, init);
  };
})();
