import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface HandshakeFormData {
  slug: string;
  title: string;
  description?: string;
  expires_at?: string;
}

export default function HandshakeForm() {
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
    if (isEditMode) {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      fetch(`/api/handshakes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch handshake data');
          return res.json();
        })
        .then(data => {
          const { slug, title, description, expires_at } = data.handshake;
          setFormData({
            slug,
            title,
            description: description || '',
            expires_at: expires_at ? expires_at.slice(0, 10) : '',
          });
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, isEditMode]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.slug || !formData.title) {
      setError('Slug and Title are required');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('authToken');

    try {
      const res = await fetch(isEditMode ? `/api/handshakes/${id}` : '/api/handshakes', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save handshake');
      }

      navigate('/dashboard/handshakes');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">{isEditMode ? 'Edit' : 'Create'} Handshake</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="slug" className="block font-medium mb-1">
            Slug <span className="text-red-600">*</span>
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
          {isEditMode && <p className="text-xs text-gray-500 mt-1">Slug cannot be changed after creation.</p>}
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
