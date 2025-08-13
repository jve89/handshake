// src/client/pages/AuthPage.tsx
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

async function postJSON(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState(''); // only used for signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body =
        mode === 'login'
          ? { email, password }
          : { name: name || 'User', email, password };

      const result = await postJSON(url, body);
      const token = result?.token;
      if (token) {
        // store under both keys for compatibility with your setupAuth
        localStorage.setItem('token', token);
        localStorage.setItem('authToken', token);
      }
      navigate('/dashboard');
    } catch (e: any) {
      setErr(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold">Log in / Sign up</h1>

        <div className="flex gap-2">
          <button
            className={`px-3 py-1.5 rounded border ${mode === 'login' ? 'bg-black text-white' : ''}`}
            onClick={() => setMode('login')}
          >
            Log in
          </button>
          <button
            className={`px-3 py-1.5 rounded border ${mode === 'signup' ? 'bg-black text-white' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-sm">Name</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm">Email</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Password</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {err && <div className="text-red-600 text-sm">{err}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded bg-black text-white disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
