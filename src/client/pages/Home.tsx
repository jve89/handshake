// src/client/pages/Home.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Home() {
  const navigate = useNavigate();

  // Initialize from localStorage to avoid UI flash
  const [hasToken, setHasToken] = useState<boolean>(() => {
    const t = localStorage.getItem('token') || localStorage.getItem('authToken');
    return !!t;
  });

  // Keep state in sync across tabs/windows
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'token' || e.key === 'authToken') {
        const t = localStorage.getItem('token') || localStorage.getItem('authToken');
        setHasToken(!!t);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    setHasToken(false);
    navigate(0); // hard refresh to clear state
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-6">
        <h1 className="text-3xl font-bold">Handshake</h1>
        <p className="text-gray-600">
          Collect and manage handshakes, submissions, and requests — all in one dashboard.
        </p>

        <div className="flex gap-3">
          {hasToken ? (
            <>
              <Link to="/outbox" className="px-4 py-2 rounded bg-black text-white">
                 Go to Dashboard
              </Link>
              <button onClick={logout} className="px-4 py-2 rounded border">
                Log out
              </button>
            </>
          ) : (
            <Link to="/auth" className="px-4 py-2 rounded border">
              Log in / Sign up
            </Link>
          )}
        </div>

        {hasToken && (
          <div className="pt-4 border-t mt-4 text-sm text-gray-600">You’re logged in.</div>
        )}
      </div>
    </div>
  );
}
