import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HandshakePage from './pages/HandshakePage';
import HandshakeList from './pages/dashboard/HandshakeList';
import HandshakeForm from './pages/dashboard/HandshakeForm';
import ThankYouPage from './pages/ThankYouPage';

// New wrapper pages (additive only)
import OutboxHome from './pages/outbox/OutboxHome';
import OutboxRequests from './pages/outbox/OutboxRequests';
import InboxHome from './pages/inbox/InboxHome';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/handshake/demo123" replace />} />

        {/* Public handshake form */}
        <Route path="/handshake/:slug" element={<HandshakePage />} />

        {/* Existing sender dashboard routes (unchanged) */}
        <Route path="/dashboard/handshakes" element={<HandshakeList />} />
        <Route path="/dashboard/handshakes/new" element={<HandshakeForm />} />
        <Route path="/dashboard/handshakes/:id/edit" element={<HandshakeForm />} />

        {/* New additive aliases (wrappers only, no renames) */}
        <Route path="/outbox" element={<OutboxHome />} />
        <Route path="/outbox/:handshakeId/requests" element={<OutboxRequests />} />

        {/* Inbox placeholder page */}
        <Route path="/inbox" element={<InboxHome />} />

        {/* Other routes */}
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
    </BrowserRouter>
  );
}
