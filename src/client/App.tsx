import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HandshakePage from './pages/HandshakePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/handshake/demo123" replace />} />
        <Route path="/handshake/:slug" element={<HandshakePage />} />
        {/* Add other routes here as needed */}
      </Routes>
    </BrowserRouter>
  );
}
