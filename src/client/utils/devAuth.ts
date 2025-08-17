// src/client/utils/devAuth.ts
// Dev-only helper: ensures a token exists in localStorage.
// - Reads VITE_DEV_EMAIL / VITE_DEV_PASSWORD
// - Tries login; if 401, tries signup; then login again.
// - No effect outside Vite dev (import.meta.env.DEV must be true).

/// <reference types="vite/client" />

export default async function initDevAuth(): Promise<void> {
  if (!import.meta.env.DEV) return;

  const existing = localStorage.getItem("authToken");
  if (existing) return;

  const email = import.meta.env.VITE_DEV_EMAIL as string | undefined;
  const password = import.meta.env.VITE_DEV_PASSWORD as string | undefined;

  console.debug(
    "[devAuth]",
    JSON.stringify({
      dev: import.meta.env.DEV === true,
      hasToken: Boolean(existing),
      hasEmail: Boolean(email),
      hasPassword: Boolean(password),
    }),
  );

  if (!email || !password) {
    console.warn(
      "[devAuth] Missing VITE_DEV_EMAIL or VITE_DEV_PASSWORD; skipping.",
    );
    return;
  }

  const login = async (): Promise<string | null> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const txt = await safeText(res);
      console.warn("[devAuth] Login failed", res.status, txt);
      return null;
    }
    const data = await safeJson(res);
    return data?.token ?? null;
  };

  const signup = async (): Promise<boolean> => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) return true;
    if (res.status === 409) {
      // User already exists -> not an error for our flow
      return true;
    }
    const txt = await safeText(res);
    console.warn("[devAuth] Signup failed", res.status, txt);
    return false;
  };

  // 1) Try login
  let token = await login();

  // 2) If login failed with 401 (or token missing), try signup then login again
  if (!token) {
    const ok = await signup();
    if (ok) {
      token = await login();
    }
  }

  if (token) {
    localStorage.setItem("authToken", token);
    console.info("[devAuth] Token set in localStorage");
  } else {
    console.warn("[devAuth] Could not obtain token");
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
