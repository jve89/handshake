import React, { useEffect, useState } from "react";

export default function InboxHome() {
  const [status, setStatus] = useState<"checking" | "up" | "down">("checking");

  useEffect(() => {
    fetch("/api/inbox/health")
      .then((r) => (r.ok ? setStatus("up") : setStatus("down")))
      .catch(() => setStatus("down"));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Inbox</h1>
      <p>Receiver dashboard placeholder.</p>
      <p>API health: {status === "checking" ? "checking…" : status}</p>
    </div>
  );
}
