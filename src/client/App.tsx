import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HandshakePage from './pages/HandshakePage';
import HandshakeList from './pages/dashboard/HandshakeList';
import HandshakeForm from './pages/dashboard/HandshakeForm';
import ThankYouPage from './pages/ThankYouPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/handshake/demo123" replace />} />

        {/* Public handshake form */}
        <Route path="/handshake/:slug" element={<HandshakePage />} />

        {/* User dashboard routes */}
        <Route path="/dashboard/handshakes" element={<HandshakeList />} />
        <Route path="/dashboard/handshakes/new" element={<HandshakeForm />} />
        <Route path="/dashboard/handshakes/:id/edit" element={<HandshakeForm />} />

        {/* Add other routes here as needed */}
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
    </BrowserRouter>
  );
}
