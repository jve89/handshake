import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ArchiveFilter from '../../components/ArchiveFilter';

interface Handshake {
  id: number;
  slug: string;
  title: string;
  description?: string;
  created_at: string;
  expires_at?: string | null;
  archived: boolean;
}

export default function HandshakeList() {
  const [handshakes, setHandshakes] = useState<Handshake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'false' | 'true' | 'all'>('false'); // Active by default

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`/api/outbox/handshakes?archived=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error fetching handshakes: ${res.statusText}`);
      const data = await res.json();
      setHandshakes(data.handshakes);
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function publicUrl(slug: string) {
    return `${window.location.origin}/handshake/${encodeURIComponent(slug)}`;
  }

  async function copyLink(id: number, slug: string) {
    const url = publicUrl(slug);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
    } catch {
      alert(`Copy failed. Here’s the link:\n\n${url}`);
    }
  }

  async function handleDelete(id: number, title: string) {
    const confirmed = window.confirm(`Delete “${title}”? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    const prev = handshakes; // optimistic
    setHandshakes((list) => list.filter((h) => h.id !== id));

    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`/api/outbox/handshakes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setHandshakes(prev); // revert
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Failed to delete (status ${res.status})`);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to delete handshake');
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleArchive(id: number, next: boolean) {
    try {
      const token = localStorage.getItem('authToken') || '';
      const url = next
        ? `/api/outbox/handshakes/${id}/archive`
        : `/api/outbox/handshakes/${id}/unarchive`;
      const res = await fetch(url, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Failed (status ${res.status})`);
      }
      await load(); // refetch to honor current filter
    } catch (e: any) {
      setError(e?.message || 'Failed to toggle archive');
    }
  }

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

      <ArchiveFilter value={filter} onChange={setFilter} />

      {handshakes.length === 0 ? (
        <p>No handshakes found. Create one to get started!</p>
      ) : (
        <ul className="space-y-4">
          {handshakes.map(({ id, slug, title, created_at, expires_at, archived }) => (
            <li
              key={id}
              className="border rounded p-4 flex flex-wrap gap-3 justify-between items-center"
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
                {archived && (
                  <p className="text-xs mt-1 inline-block px-2 py-0.5 rounded bg-gray-100 border">
                    Archived
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/handshake/${encodeURIComponent(slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700"
                  title="Open public page in a new tab"
                >
                  View public
                </a>

                <button
                  onClick={() => copyLink(id, slug)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  title="Copy public link"
                >
                  {copiedId === id ? 'Copied!' : 'Copy link'}
                </button>

                {archived ? (
                  <button
                    onClick={() => toggleArchive(id, false)}
                    className="px-3 py-1 border rounded"
                    title="Unarchive"
                  >
                    Unarchive
                  </button>
                ) : (
                  <button
                    onClick={() => toggleArchive(id, true)}
                    className="px-3 py-1 border rounded"
                    title="Archive"
                  >
                    Archive
                  </button>
                )}

                <Link
                  to={`/dashboard/handshakes/${id}/edit`}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(id, title)}
                  disabled={deletingId === id}
                  className={`px-3 py-1 text-white rounded ${
                    deletingId === id
                      ? 'bg-red-400 opacity-70 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  aria-label={`Delete handshake ${title}`}
                >
                  {deletingId === id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
