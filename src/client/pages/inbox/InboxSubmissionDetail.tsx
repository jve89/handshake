import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ensureToken, fetchInboxSubmissionDetail, Submission } from '../../utils/inbox';

export default function InboxSubmissionDetail() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [searchParams] = useSearchParams();
  const [item, setItem] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (!submissionId || isNaN(Number(submissionId))) {
          throw new Error('Invalid submission id');
        }
        const token = ensureToken(searchParams.toString());
        const data = await fetchInboxSubmissionDetail(Number(submissionId), token);
        setItem(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load submission');
      } finally {
        setLoading(false);
      }
    })();
  }, [submissionId, searchParams]);

  if (loading) return <div className="p-4">Loading submission…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!item) return <div className="p-4">Not found.</div>;

  const token = searchParams.get('token')!;
  const backHandshakeId = searchParams.get('handshakeId');

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Submission #{item.submission_id}</h1>
        {backHandshakeId ? (
          <Link
            to={`/inbox/handshakes/${encodeURIComponent(backHandshakeId)}?token=${encodeURIComponent(token)}`}
            className="text-blue-600 hover:underline"
          >
            ← Back to list
          </Link>
        ) : (
          <span className="text-sm text-gray-400"> </span>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {new Date(item.submitted_at).toLocaleString()}
      </p>

      <div className="space-y-2">
        {item.responses.map((r, i) => (
          <div key={i} className="border rounded p-3">
            <div className="text-sm text-gray-500">{r.request_id}</div>
            <div className="font-medium">{r.label}</div>
            <div className="text-sm break-words">{r.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          to={`/inbox/submissions/${item.submission_id}?token=${encodeURIComponent(token)}${
            backHandshakeId ? `&handshakeId=${encodeURIComponent(backHandshakeId)}` : ''
          }`}
          className="text-blue-600 hover:underline"
        >
          Permalink
        </Link>
      </div>
    </div>
  );
}
