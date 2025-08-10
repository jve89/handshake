import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HandshakePage from './pages/HandshakePage';
import HandshakeList from './pages/dashboard/HandshakeList';
import HandshakeForm from './pages/dashboard/HandshakeForm';
import ThankYouPage from './pages/ThankYouPage';

// Existing wrappers
import OutboxHome from './pages/outbox/OutboxHome';
import OutboxRequests from './pages/outbox/OutboxRequests';
import InboxHome from './pages/inbox/InboxHome';

// NEW inbox pages
import InboxSubmissions from './pages/inbox/InboxSubmissions';
import InboxSubmissionDetail from './pages/inbox/InboxSubmissionDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/handshake/demo123" replace />} />

        {/* Public handshake form */}
        <Route path="/handshake/:slug" element={<HandshakePage />} />

        {/* Existing sender dashboard routes */}
        <Route path="/dashboard/handshakes" element={<HandshakeList />} />
        <Route path="/dashboard/handshakes/new" element={<HandshakeForm />} />
        <Route path="/dashboard/handshakes/:id/edit" element={<HandshakeForm />} />

        {/* Outbox aliases (wrappers) */}
        <Route path="/outbox" element={<OutboxHome />} />
        <Route path="/outbox/:handshakeId/requests" element={<OutboxRequests />} />

        {/* Inbox routes */}
        <Route path="/inbox" element={<InboxHome />} />
        <Route path="/inbox/handshakes/:handshakeId" element={<InboxSubmissions />} />
        <Route path="/inbox/submissions/:submissionId" element={<InboxSubmissionDetail />} />

        {/* Other routes */}
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
    </BrowserRouter>
  );
}
