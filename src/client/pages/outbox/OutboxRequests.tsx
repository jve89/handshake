import React from 'react';
// Reuse existing sender requests view (legacy dashboard)
import HandshakeRequests from '../dashboard/HandshakeRequests';

// Wrapper to keep URL shape stable while we migrate later
export default function OutboxRequests() {
  return <HandshakeRequests />;
}
