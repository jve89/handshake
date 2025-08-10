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

export interface HandshakeResponse {
  request_id: number;
  value: string;
}

interface Props {
  handshake: HandshakeData;
  onSubmit: (responses: HandshakeResponse[]) => void;
  disabled?: boolean; // submitting flag from parent
}

export default function HandshakeForm({ handshake, onSubmit, disabled = false }: Props) {
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<number, string | undefined>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // --- helpers ---
  const isEmail = (v: string) => {
    // light email check; server is the source of truth
    // allow empty for optional fields (handled in validateField)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  const validateField = (req: Request, raw: string | undefined): string | null => {
    const v = (raw ?? '').trim();

    switch (req.type) {
      case 'text':
        if (req.required && v === '') return 'This field is required.';
        return null;

      case 'email':
        if (req.required && v === '') return 'Email is required.';
        if (req.required && v !== '' && !isEmail(v)) return 'Please enter a valid email.';
        // optional email: do not block if invalid (match server); user can still submit
        return null;

      case 'file':
        if (req.required && v === '') return 'Please upload a file.';
        return null;

      case 'select': {
        const opts = req.options ?? [];
        const inOptions = opts.includes(v);
        if (req.required) {
          if (v === '') return 'Please select an option.';
          if (!inOptions) return 'Please select a valid option.';
          return null;
        }
        // Optional: empty allowed; if provided, must be one of the options (Rule B)
        if (v === '') return null;
        if (!inOptions) return 'Please select a valid option.';
        return null;
      }

      default:
        return null;
    }
  };

  const validateAll = (): boolean => {
    const nextErrors: Record<number, string | undefined> = {};
    for (const req of handshake.requests) {
      const msg = validateField(req, responses[req.id]);
      if (msg) nextErrors[req.id] = msg;
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (id: number, value: string) => {
    setResponses((prev) => {
      const next = { ...prev, [id]: value };
      return next;
    });

    // live-validate the changed field
    const req = handshake.requests.find((r) => r.id === id)!;
    const msg = validateField(req, value);
    setFieldErrors((prev) => ({ ...prev, [id]: msg || undefined }));
    setGeneralError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const ok = validateAll();
    if (!ok) {
      setGeneralError('Please fix the highlighted errors and try again.');
      return;
    }

    const payload: HandshakeResponse[] = handshake.requests.map((req) => ({
      request_id: req.id,
      value: responses[req.id] || '',
    }));

    onSubmit(payload);
  };

  const handleFileChange = async (id: number, file: File | null) => {
    if (!file) return;
    setGeneralError(null);
    setFieldErrors((prev) => ({ ...prev, [id]: undefined }));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        let msg = 'Upload failed';
        try {
          const data = await res.json();
          msg = data?.error || msg;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      const data = await res.json();
      handleChange(id, data.url);
    } catch (err: any) {
      const msg = err?.message || 'Upload error';
      setFieldErrors((prev) => ({ ...prev, [id]: msg }));
    }
  };

  // compute form validity for disabling the button (does not set errors)
  const formValid = handshake.requests.every(
    (req) => !validateField(req, responses[req.id])
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {handshake.requests.map((req) => {
        const val = responses[req.id] || '';
        const err = fieldErrors[req.id];

        return (
          <div key={req.id}>
            <label className="block font-semibold mb-1">
              {req.label}
              {req.required && <span className="text-red-600 ml-1">*</span>}
            </label>

            {req.type === 'text' || req.type === 'email' ? (
              <input
                // disable native validation because we mirror server rules ourselves
                type={req.type === 'email' ? 'text' : 'text'}
                value={val}
                onChange={(e) => handleChange(req.id, e.target.value)}
                aria-required={req.required}
                aria-invalid={!!err}
                className={`w-full border rounded px-3 py-2 ${err ? 'border-red-500' : ''}`}
                disabled={disabled}
              />
            ) : req.type === 'select' && req.options ? (
              <select
                value={val}
                onChange={(e) => handleChange(req.id, e.target.value)}
                aria-required={req.required}
                aria-invalid={!!err}
                className={`w-full border rounded px-3 py-2 ${err ? 'border-red-500' : ''}`}
                disabled={disabled}
              >
                <option value="" disabled={req.required}>
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
                  aria-required={req.required}
                  aria-invalid={!!err}
                  className={`w-full border rounded px-3 py-2 ${err ? 'border-red-500' : ''}`}
                  onChange={(e) => handleFileChange(req.id, e.target.files?.[0] ?? null)}
                  disabled={disabled}
                />
                {responses[req.id] && (
                  <p className="mt-1 text-sm text-gray-600 break-all">
                    Uploaded file URL: {responses[req.id]}
                  </p>
                )}
              </>
            ) : null}

            {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
          </div>
        );
      })}

      {generalError && <p className="text-red-600">{generalError}</p>}

      <button
        type="submit"
        disabled={disabled || !formValid}
        className={`px-4 py-2 rounded text-white ${
          disabled || !formValid ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {disabled ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  );
}
