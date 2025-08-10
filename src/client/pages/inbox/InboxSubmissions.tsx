import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ensureToken, fetchInboxSubmissions, Submission } from '../../utils/inbox';

export default function InboxSubmissions() {
  const { handshakeId } = useParams<{ handshakeId: string }>();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (!handshakeId || isNaN(Number(handshakeId))) {
          throw new Error('Invalid handshake id');
        }
        const token = ensureToken(searchParams.toString());
        const data = await fetchInboxSubmissions(Number(handshakeId), token);
        setItems(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load inbox submissions');
      } finally {
        setLoading(false);
      }
    })();
  }, [handshakeId, searchParams]);

  if (loading) return <div className="p-4">Loading inbox…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  const token = searchParams.get('token')!;
  const hid = handshakeId!;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Inbox — Submissions</h1>

      {items.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((s) => (
            <li key={s.submission_id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {new Date(s.submitted_at).toLocaleString()}
                </p>
                <p className="text-sm">
                  {s.responses.length > 0 ? (
                    <>
                      <strong>{s.responses[0].label}:</strong> {s.responses[0].value}
                      {s.responses.length > 1 ? ' …' : ''}
                    </>
                  ) : (
                    'No fields captured'
                  )}
                </p>
              </div>
              <Link
                to={`/inbox/submissions/${s.submission_id}?token=${encodeURIComponent(token)}&handshakeId=${encodeURIComponent(
                  hid
                )}`}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
