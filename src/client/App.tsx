// src/client/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public
import Home from './pages/Home';
import HandshakePage from './pages/HandshakePage';
import ThankYouPage from './pages/ThankYouPage';
import AuthPage from './pages/AuthPage';

// Inbox
import InboxHome from './pages/inbox/InboxHome';
import InboxSubmissions from './pages/inbox/InboxSubmissions';
import InboxSubmissionDetail from './pages/inbox/InboxSubmissionDetail';

// Outbox
import OutboxHome from './pages/outbox/Dashboard';
import HandshakeRequests from './pages/outbox/HandshakeRequests';

// Editors / Features
import HandshakeEditor from './features/handshakes/HandshakeEditor';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/handshake/:slug" element={<HandshakePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />

        {/* Outbox (sender side) */}
        <Route path="/outbox" element={<OutboxHome />} />
        <Route path="/outbox/handshakes/new" element={<HandshakeEditor />} />
        <Route path="/outbox/handshakes/:id/edit" element={<HandshakeEditor />} />
        <Route path="/outbox/handshakes/:handshakeId/requests" element={<HandshakeRequests />} />

        {/* Inbox (receiver side) */}
        <Route path="/inbox" element={<InboxHome />} />
        <Route path="/inbox/handshakes/:handshakeId" element={<InboxSubmissions />} />
        <Route path="/inbox/submissions/:submissionId" element={<InboxSubmissionDetail />} />

        {/* Catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
