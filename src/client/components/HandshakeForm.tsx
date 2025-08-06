import React, { useState } from 'react';

export interface Request {
  id: number;
  label: string;
  type: 'text' | 'file' | 'email' | 'select';
  required: boolean;
  options?: string[];
}

export interface HandshakeData {
  id: number;
  slug: string;
  title: string;
  description?: string;
  created_at: string;
  expires_at?: string | null;
  requests: Request[];
}

interface Props {
  handshake: HandshakeData;
}

interface Response {
  request_id: number;
  value: string;
}

export default function HandshakeForm({ handshake }: Props) {
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validate required fields
  const isValid = handshake.requests.every((req) =>
    !req.required || (responses[req.id]?.trim().length ?? 0) > 0
  );

  const handleChange = (id: number, value: string) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const payload = {
      responses: handshake.requests.map((req) => ({
        request_id: req.id,
        value: responses[req.id] || '',
      })),
    };

    try {
      const res = await fetch(`/api/handshake/${handshake.slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      setSuccess(true);
      setResponses({});
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (id: number, file: File | null) => {
    if (!file) return;

    setError(null);
    setSuccess(false);
    setSubmitting(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      handleChange(id, data.url);
    } catch (err: any) {
      setError(err.message || 'Upload error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {handshake.requests.map((req) => (
        <div key={req.id}>
          <label className="block font-semibold mb-1">
            {req.label}
            {req.required && <span className="text-red-600 ml-1">*</span>}
          </label>

          {req.type === 'text' || req.type === 'email' ? (
            <input
              type={req.type}
              value={responses[req.id] || ''}
              onChange={(e) => handleChange(req.id, e.target.value)}
              required={req.required}
              className="w-full border rounded px-3 py-2"
              disabled={submitting}
            />
          ) : req.type === 'select' && req.options ? (
            <select
              value={responses[req.id] || ''}
              onChange={(e) => handleChange(req.id, e.target.value)}
              required={req.required}
              className="w-full border rounded px-3 py-2"
              disabled={submitting}
            >
              <option value="" disabled>
                Select...
              </option>
              {req.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : req.type === 'file' ? (
            <>
              <input
                type="file"
                required={req.required}
                className="w-full border rounded px-3 py-2"
                onChange={(e) => handleFileChange(req.id, e.target.files?.[0] ?? null)}
                disabled={submitting}
              />
              {responses[req.id] && (
                <p className="mt-1 text-sm text-gray-600">Uploaded file URL: {responses[req.id]}</p>
              )}
            </>
          ) : null}
        </div>
      ))}

      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Submission successful!</p>}

      <button
        type="submit"
        disabled={submitting || !isValid}
        className={`px-4 py-2 rounded text-white ${
          submitting || !isValid ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
