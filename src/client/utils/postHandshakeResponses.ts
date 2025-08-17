// src/client/utils/postHandshakeResponses.ts
interface HandshakeResponse {
  request_id: number;
  value: string;
}

export async function submitResponses(
  slug: string,
  responses: HandshakeResponse[],
) {
  const res = await fetch(`/api/handshake/${encodeURIComponent(slug)}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ responses }),
    credentials: "include",
  });

  if (!res.ok) {
    try {
      const data = await res.json();
      throw new Error(data?.error || `Submission failed (${res.status})`);
    } catch {
      const text = await res.text().catch(() => "");
      throw new Error(text || "Submission failed. Please try again.");
    }
  }
  return res.json(); // { submission_id }
}
