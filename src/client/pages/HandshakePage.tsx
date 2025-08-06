import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HandshakeForm, { HandshakeData } from '../components/HandshakeForm';

export default function HandshakePage() {
  const { slug } = useParams<{ slug: string }>();
  const [handshake, setHandshake] = useState<HandshakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchHandshake() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/handshake/${slug}`);
        if (!res.ok) throw new Error(`Failed to load handshake: ${res.statusText}`);

        const data = await res.json();
        setHandshake(data.handshake);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchHandshake();
  }, [slug]);

  if (loading) return <p>Loading handshake…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!handshake) return <p>No handshake found.</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{handshake.title}</h1>
      <p className="mb-6 text-gray-700">{handshake.description}</p>
      <HandshakeForm handshake={handshake} />
    </div>
  );
}
