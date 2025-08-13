// src/client/pages/outbox/HandshakeRequests.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissions, Submission } from '../../utils/getSubmissions';
import {
  fetchRequests,
  createRequest,
  updateRequest,
  deleteRequest,
  RequestInput,
  HandshakeRequest,
} from '../../utils/handshakeRequests';

export default function HandshakeRequests() {
  const { handshakeId } = useParams<{ handshakeId: string }>();
  const hid = useMemo(() => (handshakeId ? Number(handshakeId) : NaN), [handshakeId]);

  const [requests, setRequests] = useState<HandshakeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState<string | null>(null);

  const [newRequest, setNewRequest] = useState<RequestInput>({
    label: '',
    type: 'text',
    required: false,
    options: [],
  });

  useEffect(() => {
    if (!Number.isFinite(hid)) return;

    setLoading(true);
    setSubLoading(true);
    setError(null);
    setSubError(null);

    fetchRequests(hid)
      .then(setRequests)
      .catch(() => setError('Failed to load requests'))
      .finally(() => setLoading(false));

    getSubmissions(hid)
      .then(setSubmissions)
      .catch(() => setSubError('Failed to load submissions'))
      .finally(() => setSubLoading(false));
  }, [hid]);

  const handleCreate = async () => {
    if (!Number.isFinite(hid)) return;
    try {
      const req = await createRequest(hid, newRequest);
      setRequests((prev) => [...prev, req]);
      setNewRequest({ label: '', type: 'text', required: false, options: [] });
      setError(null);
    } catch {
      setError('Failed to create request');
    }
  };

  const handleDelete = async (id: number) => {
    if (!Number.isFinite(hid)) return;
    try {
      await deleteRequest(hid, id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setError(null);
    } catch {
      setError('Failed to delete request');
    }
  };

  const handleUpdate = async (id: number, updates: Partial<RequestInput>) => {
    if (!Number.isFinite(hid)) return;
    try {
      const updated = await updateRequest(hid, id, updates);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setError(null);
    } catch {
      setError('Failed to update request');
    }
  };

  function optionsToString(options?: string[]) {
    return options ? options.join(', ') : '';
  }

  function stringToOptions(str: string): string[] {
    return str
      .split(',')
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0);
  }

  if (!Number.isFinite(hid)) {
    return <div className="p-4 text-red-600">Invalid handshake id.</div>;
  }

  if (loading) return <div className="p-4">Loading requests...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Composer-like toolbar */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link to="/outbox" className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50">
          ← Back to Dashboard
        </Link>

        {/* Tabs mirror the Composer */}
        <div className="flex items-center gap-1 text-sm">
          <Link
            to={`/outbox/handshakes/${hid}/edit`}
            className="px-3 py-1.5 rounded border hover:bg-gray-50"
            title="Edit details"
          >
            Details
          </Link>
          <span className="px-3 py-1.5 rounded bg-gray-900 text-white select-none">Fields</span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // Preview uses slug; we don’t have it here without another fetch.
              // Open the composer (edit) in a new tab; user can hit Preview there.
              window.open(`/outbox/handshakes/${hid}/edit`, '_blank', 'noopener');
            }}
            className="px-3 py-1.5 rounded border hover:bg-gray-50"
            title="Open preview"
          >
            Preview
          </a>
        </div>

        <Link
          to={`/outbox/handshakes/${hid}/edit`}
          className="px-3 py-1.5 rounded bg-black text-white text-sm hover:opacity-90"
        >
          Edit Handshake
        </Link>
      </div>

      <h2 className="text-2xl font-semibold mb-2">Handshake Requests</h2>

      {/* Empty state when no fields yet */}
      {requests.length === 0 ? (
        <div className="border rounded p-4 bg-gray-50 text-sm text-gray-700 mb-4">
          <p className="mb-2 font-medium">No fields yet.</p>
          <p>Add your first field below. You can choose type, set it as required, and add options for selects.</p>
        </div>
      ) : (
        <ul className="space-y-4 mb-4">
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2 border p-3 rounded">
              <input
                type="text"
                value={r.label}
                onChange={(e) => handleUpdate(r.id, { label: e.target.value })}
                className="border rounded px-2 py-1 flex-grow min-w-[150px]"
                placeholder="Label"
              />
              <select
                value={r.type}
                onChange={(e) => handleUpdate(r.id, { type: e.target.value as RequestInput['type'] })}
                className="border rounded px-2 py-1"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="select">Select</option>
                <option value="file">File</option>
              </select>
              {r.type === 'select' && (
                <input
                  type="text"
                  value={optionsToString(r.options)}
                  onChange={(e) => handleUpdate(r.id, { options: stringToOptions(e.target.value) })}
                  placeholder="Options (comma separated)"
                  className="border rounded px-2 py-1 flex-grow min-w-[150px]"
                />
              )}
              <label className="flex items-center gap-1 select-none">
                <input
                  type="checkbox"
                  checked={r.required}
                  onChange={(e) => handleUpdate(r.id, { required: e.target.checked })}
                />
                Required
              </label>
              <button
                onClick={() => handleDelete(r.id)}
                className="ml-auto bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                aria-label={`Delete request ${r.label}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3 className="text-xl font-semibold mb-2">Add New Request</h3>
      <div className="flex flex-wrap items-center gap-2 border p-3 rounded">
        <input
          type="text"
          placeholder="Label"
          value={newRequest.label}
          onChange={(e) => setNewRequest({ ...newRequest, label: e.target.value })}
          className="border rounded px-2 py-1 flex-grow min-w-[150px]"
        />
        <select
          value={newRequest.type}
          onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value as RequestInput['type'] })}
          className="border rounded px-2 py-1"
        >
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="select">Select</option>
          <option value="file">File</option>
        </select>
        {newRequest.type === 'select' && (
          <input
            type="text"
            placeholder="Options (comma separated)"
            value={optionsToString(newRequest.options)}
            onChange={(e) => setNewRequest({ ...newRequest, options: stringToOptions(e.target.value) })}
            className="border rounded px-2 py-1 flex-grow min-w-[150px]"
          />
        )}
        <label className="flex items-center gap-1 select-none">
          <input
            type="checkbox"
            checked={newRequest.required}
            onChange={(e) => setNewRequest({ ...newRequest, required: e.target.checked })}
          />
          Required
        </label>
        <button
          onClick={handleCreate}
          disabled={!newRequest.label.trim()}
          className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 transition disabled:opacity-50"
        >
          Add Request
        </button>
      </div>

      <h3 className="mt-8 text-xl font-semibold mb-2">Submitted Responses</h3>

      {subLoading ? (
        <p>Loading submissions...</p>
      ) : subError ? (
        <p className="text-red-600">{subError}</p>
      ) : submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <div className="space-y-6 mt-2">
          {submissions.map((submission) => (
            <div key={submission.submission_id} className="border p-4 rounded bg-gray-50">
              <p className="text-sm text-gray-500 mb-2">
                Submission ID: {submission.submission_id} –{' '}
                {new Date(submission.submitted_at).toLocaleString()}
              </p>
              <ul className="list-disc ml-4 text-sm">
                {submission.responses.map((r, i) => (
                  <li key={i}>
                    <strong>{r.label}:</strong> {r.value}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
