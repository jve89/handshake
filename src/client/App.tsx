// src/client/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HandshakePage from './pages/HandshakePage';
import HandshakeList from './pages/dashboard/HandshakeList';
import HandshakeForm from './pages/dashboard/HandshakeForm';
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

        {/* Sender dashboard (legacy routes kept for now) */}
        <Route path="/dashboard/handshakes" element={<HandshakeList />} />
        <Route path="/dashboard/handshakes/new" element={<HandshakeForm />} />
        <Route path="/dashboard/handshakes/:id/edit" element={<HandshakeForm />} />

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
