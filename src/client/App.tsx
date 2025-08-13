// src/client/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HandshakePage from './pages/HandshakePage';
import ThankYouPage from './pages/ThankYouPage';

// Inbox pages
import InboxHome from './pages/inbox/InboxHome';
import InboxSubmissions from './pages/inbox/InboxSubmissions';
import InboxSubmissionDetail from './pages/inbox/InboxSubmissionDetail';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// NEW
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public home */}
        <Route path="/" element={<Home />} />

        {/* Public handshake form */}
        <Route path="/handshake/:slug" element={<HandshakePage />} />

        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Inbox */}
        <Route path="/inbox" element={<InboxHome />} />
        <Route path="/inbox/handshakes/:handshakeId" element={<InboxSubmissions />} />
        <Route path="/inbox/submissions/:submissionId" element={<InboxSubmissionDetail />} />

        {/* Other */}
        <Route path="/thank-you" element={<ThankYouPage />} />

        {/* Catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
