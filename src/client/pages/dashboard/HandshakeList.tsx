import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Handshake {
  id: number;
  slug: string;
  title: string;
  description?: string;
  created_at: string;
  expires_at?: string | null;
}

export default function HandshakeList() {
  const [handshakes, setHandshakes] = useState<Handshake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHandshakes() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/handshakes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error fetching handshakes: ${res.statusText}`);
        }

        const data = await res.json();
        setHandshakes(data.handshakes);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchHandshakes();
  }, []);

  if (loading) return <div className="p-4">Loading handshakes...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Your Handshakes</h1>
        <Link
          to="/dashboard/handshakes/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New
        </Link>
      </div>

      {handshakes.length === 0 ? (
        <p>No handshakes found. Create one to get started!</p>
      ) : (
        <ul className="space-y-4">
          {handshakes.map(({ id, slug, title, created_at, expires_at }) => (
            <li
              key={id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-medium">{title}</h2>
                <p className="text-sm text-gray-500">Slug: {slug}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(created_at).toLocaleDateString()}
                </p>
                {expires_at && (
                  <p className="text-sm text-gray-500">
                    Expires: {new Date(expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="space-x-2">
                <Link
                  to={`/dashboard/handshakes/${id}/edit`}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Edit
                </Link>
                {/* Placeholder buttons disabled */}
                <button
                  disabled
                  title="View (coming soon)"
                  className="px-3 py-1 bg-blue-400 text-white rounded cursor-not-allowed opacity-50"
                >
                  View
                </button>
                <button
                  disabled
                  title="Delete (coming soon)"
                  className="px-3 py-1 bg-red-400 text-white rounded cursor-not-allowed opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
