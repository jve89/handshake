// src/client/App.tsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

// Public
import Home from "./pages/Home";
import HandshakePage from "./pages/HandshakePage";
import ThankYouPage from "./pages/ThankYouPage";
import AuthPage from "./pages/AuthPage";

// Inbox (tokened links; not JWT-protected)
import InboxHome from "./pages/inbox/InboxHome";
import InboxSubmissions from "./pages/inbox/InboxSubmissions";
import InboxSubmissionDetail from "./pages/inbox/InboxSubmissionDetail";

// Outbox (JWT-protected)
import OutboxHome from "./pages/outbox/Dashboard";
import HandshakeRequests from "./pages/outbox/HandshakeRequests";

// Editors / Features
import HandshakeEditor from "./features/handshakes/HandshakeEditor";

function RequireAuth({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token) {
    // bounce to /auth and remember where the user wanted to go
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/handshake/:slug" element={<HandshakePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />

        {/* Outbox (sender side, protected) */}
        <Route
          path="/outbox"
          element={
            <RequireAuth>
              <OutboxHome />
            </RequireAuth>
          }
        />
        <Route
          path="/outbox/handshakes/new"
          element={
            <RequireAuth>
              <HandshakeEditor />
            </RequireAuth>
          }
        />
        <Route
          path="/outbox/handshakes/:id/edit"
          element={
            <RequireAuth>
              <HandshakeEditor />
            </RequireAuth>
          }
        />
        <Route
          path="/outbox/handshakes/:handshakeId/requests"
          element={
            <RequireAuth>
              <HandshakeRequests />
            </RequireAuth>
          }
        />

        {/* Inbox (receiver side; tokened via query, not JWT) */}
        <Route path="/inbox" element={<InboxHome />} />
        <Route
          path="/inbox/handshakes/:handshakeId"
          element={<InboxSubmissions />}
        />
        <Route
          path="/inbox/submissions/:submissionId"
          element={<InboxSubmissionDetail />}
        />

        {/* Catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
