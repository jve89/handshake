// src/client/App.tsx
import './setupAuth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HandshakePage from './pages/HandshakePage';
import ThankYouPage from './pages/ThankYouPage';

// Inbox pages
import InboxHome from './pages/inbox/InboxHome';
import InboxSubmissions from './pages/inbox/InboxSubmissions';
import InboxSubmissionDetail from './pages/inbox/InboxSubmissionDetail';

// Single, canonical dashboard
import Dashboard from './pages/dashboard/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home → Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public handshake form */}
        <Route path="/handshake/:slug" element={<HandshakePage />} />

        {/* Canonical dashboard shell */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Inbox routes */}
        <Route path="/inbox" element={<InboxHome />} />
        <Route path="/inbox/handshakes/:handshakeId" element={<InboxSubmissions />} />
        <Route path="/inbox/submissions/:submissionId" element={<InboxSubmissionDetail />} />

        {/* Other routes */}
        <Route path="/thank-you" element={<ThankYouPage />} />

        {/* Catch-all → dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
