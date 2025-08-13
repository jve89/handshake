// src/client/pages/AuthPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const navigate = useNavigate();

  // 🔁 If a token already exists, bounce straight to the dashboard
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const token: string | undefined =
        data?.token || data?.accessToken || data?.jwt;

      if (!token) throw new Error('No token in response');

      // Store token and go to dashboard
      localStorage.setItem('token', token);
      navigate('/dashboard', { replace: true });
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-lg p-6 space-y-4">
        <h1 className="text-2xl font-semibold">
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </h1>

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
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded px-3 py-2 border bg-black text-white disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <div className="text-sm">
          {mode === 'login' ? (
            <button className="underline" onClick={() => setMode('signup')}>
              Need an account? Sign up
            </button>
          ) : (
            <button className="underline" onClick={() => setMode('login')}>
              Already have an account? Log in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
