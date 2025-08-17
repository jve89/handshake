import React from "react";

interface Handshake {
  id: string;
  title: string;
  status: string;
  lastActivity: string;
  // Add other fields here if needed
}

interface HandshakeCardProps {
  handshake: Handshake;
  onClick: () => void;
}

export const HandshakeCard: React.FC<HandshakeCardProps> = ({
  handshake,
  onClick,
}) => {
  return (
    <div className="handshake-card" onClick={onClick}>
      <h3>{handshake.title}</h3>
      <p>Status: {handshake.status}</p>
      <p>Last Activity: {handshake.lastActivity}</p>
      {/* Add more fields as necessary */}
    </div>
  );
};
