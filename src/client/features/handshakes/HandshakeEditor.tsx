// src/client/features/handshakes/HandshakeEditor.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiGet, apiPost, apiPut } from '../../utils/api';

interface HandshakeFormData {
  slug: string;
  title: string;
  description?: string;
  expires_at?: string;
}

export default function HandshakeEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<HandshakeFormData>({
    slug: '',
    title: '',
    description: '',
    expires_at: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditMode) return;

    (async () => {
      try {
        setLoading(true);
        const data = await apiGet<{ handshake: any }>(`/api/outbox/handshakes/${id}`);
        const { slug, title, description, expires_at } = data.handshake;
        setFormData({
          slug,
          title,
          description: description || '',
          expires_at: expires_at ? String(expires_at).slice(0, 10) : '',
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEditMode]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!formData.slug || !formData.title) {
      setError('Link ID and Title are required');
      return;
    }
    setLoading(true);
    try {
      const url = isEditMode ? `/api/outbox/handshakes/${id}` : `/api/outbox/handshakes`;
      const payload = isEditMode
        ? {
            // Link ID (slug) is immutable; do not send it on update
            title: formData.title,
            description: formData.description,
            expires_at: formData.expires_at || null,
          }
        : {
            slug: formData.slug,
            title: formData.title,
            description: formData.description,
            expires_at: formData.expires_at || null,
          };
      if (isEditMode) {
        await apiPut(url, payload);
        navigate('/outbox'); // existing behavior
      } else {
        const data = await apiPost<{ handshake: { id: number } }>(url, payload);
        // newly created → go manage its fields/lines
        navigate(`/outbox/handshakes/${data.handshake.id}/requests`);
      }
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (/slug_taken/i.test(msg)) {
        setError('Link ID is already taken. Choose another.');
      } else if (/slug_immutable/i.test(msg)) {
        setError('Link ID cannot be changed after creation.');
      } else if (/plan_limit_reached/i.test(msg)) {
        setError('Free plan allows 1 active handshake. Archive one or upgrade to add more.');
      } else {
        setError(msg || 'Failed to save handshake');
      }
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto p-4">
      {/* Top toolbar with Back to Dashboard */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-4">
        {isEditMode ? 'Edit' : 'Create'} Handshake
      </h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="slug" className="block font-medium mb-1">
            Link ID <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="slug"
            id="slug"
            value={formData.slug}
            onChange={handleChange}
            disabled={isEditMode}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
          {isEditMode && (
            <p className="text-xs text-gray-500 mt-1">
              Link ID cannot be changed after creation.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
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
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2"
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
            value={formData.expires_at}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {isEditMode ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
}
