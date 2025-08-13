// src/client/pages/AuthPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAuthToken } from '../utils/getAuthToken';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/outbox';

  // Redirect if a token is present (normalize legacy 'token' to 'authToken')
  useEffect(() => {
    const legacy = localStorage.getItem('token');
    const current = localStorage.getItem('authToken');
    if (legacy && !current) {
      localStorage.setItem('authToken', legacy);
      localStorage.removeItem('token');
    }
    const token = localStorage.getItem('authToken');
    if (token) navigate(from, { replace: true }); // ← go back to intended route
  }, [navigate, from]);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function validate(): string | null {
    if (!email.trim()) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address';
    if (!password || password.length < 8) return 'Password must be at least 8 characters';
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setBusy(true);
    setErr(null);

    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body =
        mode === 'login'
          ? { email, password }
          : { name: name || 'User', email, password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data?.error ||
          data?.message ||
          (res.status === 409 ? 'User already exists' : `HTTP ${res.status}`);
        throw new Error(message);
      }

      const token: string | undefined =
        data?.token || data?.accessToken || data?.jwt;

      if (!token) throw new Error('No token in response');

      setAuthToken(token);
      localStorage.removeItem('token');

      navigate(from, { replace: true }); // ← return to intended route
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md card space-y-5">
        <div className="flex gap-2">
          <button
            type="button"
            className={`px-3 py-2 rounded ${mode === 'login' ? 'bg-brand-yellow text-brand-navy' : 'border'}`}
            onClick={() => setMode('login')}
            disabled={busy}
          >
            Log in
          </button>
          <button
            type="button"
            className={`px-3 py-2 rounded ${mode === 'signup' ? 'bg-brand-yellow text-brand-navy' : 'border'}`}
            onClick={() => setMode('signup')}
            disabled={busy}
          >
            Sign up
          </button>
        </div>

        {err && (
          <div className="text-sm text-red-600 border border-red-200 rounded p-2">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                disabled={busy}
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              type="email"
              required
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              type="password"
              required
              disabled={busy}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters.</p>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full btn-primary disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
