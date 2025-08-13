// src/client/features/handshakes/HandshakeEditor.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiGet, apiPost, apiPut } from '../../utils/api';
import {
  fetchRequests,
  createRequest,
  updateRequest,
  deleteRequest,
  type RequestInput,
  type HandshakeRequest,
} from '../../utils/handshakeRequests';

interface HandshakeFormData {
  slug: string;
  title: string;
  description?: string;
  expires_at?: string | null;
}

type DraftField = (RequestInput & { id?: number; _tempId?: string });

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

export default function HandshakeEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const handshakeId = id ? Number(id) : undefined;
  const isEditMode = Number.isFinite(handshakeId);

  const [formData, setFormData] = useState<HandshakeFormData>({
    slug: '',
    title: '',
    description: '',
    expires_at: '',
  });

  // Fields state (local composer)
  const [fields, setFields] = useState<DraftField[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false); // collapsed Details by default

  const previewHref = useMemo(
    () => (formData.slug ? `/handshake/${encodeURIComponent(formData.slug)}` : ''),
    [formData.slug]
  );

  // Load handshake + its fields in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    (async () => {
      try {
        setLoading(true);
        const data = await apiGet<{ handshake: any }>(`/api/outbox/handshakes/${handshakeId}`);
        const { slug, title, description, expires_at } = data.handshake;
        setFormData({
          slug,
          title,
          description: description || '',
          expires_at: expires_at ? String(expires_at).slice(0, 10) : '',
        });

        const reqs = await fetchRequests(handshakeId!);
        setFields(
          reqs.map((r) => ({
            id: r.id,
            label: r.label,
            type: r.type,
            required: r.required,
            options: r.options ?? [],
          }))
        );
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [isEditMode, handshakeId]);

  function handleDetailChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function addField() {
    const temp: DraftField = {
      _tempId: crypto.randomUUID(),
      label: '',
      type: 'text',
      required: false,
      options: [],
    };
    setFields((prev) => [...prev, temp]);
  }

  function updateField(idx: number, patch: Partial<DraftField>) {
    setFields((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function removeField(idx: number) {
    setFields((prev) => {
      const next = [...prev];
      const f = next[idx];
      if (f.id) setDeletedIds((d) => [...d, f.id!]);
      next.splice(idx, 1);
      return next;
    });
  }

  // Utilities to convert comma list <-> array for select options
  function optionsToString(options?: string[]) {
    return options && options.length ? options.join(', ') : '';
  }
  function stringToOptions(str: string): string[] {
    return str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Minimal validation for empty-first flow:
    // - Title is required (for slug generation and basic metadata)
    if (!formData.title.trim()) {
      setError('Title is required');
      setShowSettings(true); // reveal Settings so user sees where to fill it
      return;
    }

    setLoading(true);
    try {
      let newId = handshakeId;
      let slug = formData.slug;

      // Auto-generate slug on first create if user didn't set one
      if (!isEditMode && !slug.trim()) {
        slug = slugify(formData.title);
        if (!slug) {
          throw new Error('Link ID could not be generated from title. Please open Settings and set it.');
        }
      }

      if (isEditMode) {
        // Save details
        await apiPut(`/api/outbox/handshakes/${handshakeId}`, {
          title: formData.title,
          description: formData.description,
          expires_at: formData.expires_at || null,
        });
      } else {
        // Create handshake first
        const res = await apiPost<{ handshake: { id: number; slug: string } }>(`/api/outbox/handshakes`, {
          slug,
          title: formData.title,
          description: formData.description,
          expires_at: formData.expires_at || null,
        });
        newId = res.handshake.id;
        // lock the slug we used
        setFormData((prev) => ({ ...prev, slug }));
      }

      // Persist fields
      if (!newId) throw new Error('Handshake id missing after save');

      // Process deletes first
      for (const rid of deletedIds) {
        try {
          await deleteRequest(newId, rid);
        } catch {
          /* ignore one-off delete failures; surface generic error below if needed */
        }
      }
      setDeletedIds([]);

      // Create & update
      for (const f of fields) {
        const payload: RequestInput = {
          label: f.label.trim(),
          type: f.type,
          required: !!f.required,
          options: f.type === 'select' ? (f.options ?? []) : [],
        };

        if (!payload.label) continue; // skip empties

        if (f.id) {
          await updateRequest(newId, f.id, payload);
        } else {
          const created = await createRequest(newId, payload);
          // update local id so subsequent saves update instead of recreate
          f.id = created.id;
        }
      }

      // After first create, move to edit URL; otherwise stay on page
      if (!isEditMode) {
        navigate(`/outbox/handshakes/${newId}/edit`, { replace: true });
      }
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (/slug_taken/i.test(msg)) {
        setError('Link ID is already taken. Open Settings to change it.');
        setShowSettings(true);
      } else if (/slug_immutable/i.test(msg)) {
        setError('Link ID cannot be changed after creation.');
      } else if (/plan_limit_reached/i.test(msg)) {
        setError('Free plan allows 1 active handshake. Archive one or upgrade to add more.');
      } else {
        setError(msg || 'Failed to save handshake');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link to="/outbox" className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50">
          ← Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          {previewHref && isEditMode ? (
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
              title="Open public preview"
            >
              Preview
            </a>
          ) : (
            <span className="px-3 py-1.5 rounded border text-sm opacity-50" title="Save once to preview">
              Preview
            </span>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-semibold mb-4">
        {isEditMode ? 'Compose Handshake' : 'Compose Handshake (new)'}
      </h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSave} className="space-y-8">
        {/* FIELDS FIRST */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Fields</h2>
            <button
              type="button"
              onClick={addField}
              className="px-3 py-1.5 rounded bg-black text-white text-sm hover:opacity-90"
            >
              + Add field
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="border rounded p-4 bg-gray-50 text-sm text-gray-700">
              <p className="mb-1 font-medium">No fields yet.</p>
              <p>Click “+ Add field” to create your first field. You can keep adding more before saving.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {fields.map((f, idx) => (
                <li key={f.id ?? f._tempId ?? idx} className="flex flex-wrap items-center gap-2 border p-3 rounded">
                  <input
                    type="text"
                    value={f.label}
                    onChange={(e) => updateField(idx, { label: e.target.value })}
                    className="border rounded px-2 py-1 flex-grow min-w-[160px]"
                    placeholder="Label"
                  />
                  <select
                    value={f.type}
                    onChange={(e) =>
                      updateField(idx, {
                        type: e.target.value as DraftField['type'],
                        options: e.target.value === 'select' ? (f.options ?? []) : [],
                      })
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="select">Select</option>
                    <option value="file">File</option>
                  </select>
                  {f.type === 'select' && (
                    <input
                      type="text"
                      value={optionsToString(f.options)}
                      onChange={(e) => updateField(idx, { options: stringToOptions(e.target.value) })}
                      placeholder="Options (comma separated)"
                      className="border rounded px-2 py-1 flex-grow min-w-[160px]"
                    />
                  )}
                  <label className="flex items-center gap-1 select-none">
                    <input
                      type="checkbox"
                      checked={!!f.required}
                      onChange={(e) => updateField(idx, { required: e.target.checked })}
                    />
                    Required
                  </label>

                  {/* Simple reorder: Up/Down */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="border rounded px-2 py-1 text-xs"
                      disabled={idx === 0}
                      onClick={() =>
                        setFields((prev) => {
                          const next = [...prev];
                          [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                          return next;
                        })
                      }
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="border rounded px-2 py-1 text-xs"
                      disabled={idx === fields.length - 1}
                      onClick={() =>
                        setFields((prev) => {
                          const next = [...prev];
                          [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                          return next;
                        })
                      }
                    >
                      ↓
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeField(idx)}
                    className="ml-auto bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    aria-label={`Delete field ${f.label || idx + 1}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* SETTINGS (DETAILS) — collapsed by default */}
        <section className="border rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2"
            onClick={() => setShowSettings((s) => !s)}
            aria-expanded={showSettings}
          >
            <span className="font-semibold">Settings</span>
            <span className="text-sm">{showSettings ? 'Hide' : 'Show'}</span>
          </button>

          {showSettings && (
            <div className="p-3 space-y-4 border-t">
              {!isEditMode && (
                <div>
                  <label htmlFor="slug" className="block font-medium mb-1">
                    Link ID
                  </label>
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    value={formData.slug}
                    onChange={handleDetailChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="(optional — auto from Title on first save)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If left blank, we’ll auto-generate it from the Title on first save.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="title" className="block font-medium mb-1">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleDetailChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g., Job Application"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleDetailChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Optional context for participants"
                />
              </div>

              <div>
                <label htmlFor="expires_at" className="block font-medium mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expires_at"
                  id="expires_at"
                  value={formData.expires_at ?? ''}
                  onChange={handleDetailChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
          )}
        </section>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
          >
            {isEditMode ? 'Save handshake' : 'Create handshake'}
          </button>
        </div>
      </form>
    </div>
  );
}
