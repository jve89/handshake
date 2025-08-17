import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HandshakeCard } from "../../components/HandshakeCard";

// Define the Handshake type globally to use across your components
interface Handshake {
  id: string;
  slug: string;
  title: string;
  status: string;
  lastActivity: string;
  // Add other fields here as per your API response
}

export const OutboxHome = () => {
  const [handshakes, setHandshakes] = useState<Handshake[]>([]); // Ensure handshakes state is typed
  const [isLoading, setIsLoading] = useState(true);
  const [folderFilter, setFolderFilter] = useState("All");
  const [folders, setFolders] = useState(["Folder 1", "Folder 2"]); // Example folders
  const navigate = useNavigate();

  const handleCardClick = (id: string) => {
    navigate(`/handshakes/${id}`);
  };

  const handleFolderChange = (folder: string) => {
    setFolderFilter(folder);
  };

  useEffect(() => {
    const fetchHandshakes = async () => {
      setIsLoading(true);
      const data = await fetch(
        `/api/outbox/handshakes?folder=${folderFilter}`,
      ).then((res) => res.json());
      setHandshakes(data.handshakes); // Assuming API returns an array of handshakes
      setIsLoading(false);
    };

    fetchHandshakes();
  }, [folderFilter]);

  return (
    <div className="outbox-container">
      <h1>Outbox</h1>

      <div>
        <label>Filter by Folder: </label>
        <select
          value={folderFilter}
          onChange={(e) => handleFolderChange(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Folder 1">Folder 1</option>
          <option value="Folder 2">Folder 2</option>
        </select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="handshake-list">
          {handshakes.map(
            (
              handshake, // No need for explicit typing here, TypeScript infers the type from state
            ) => (
              <HandshakeCard
                key={handshake.id}
                handshake={handshake}
                onClick={() => handleCardClick(handshake.id)}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
};
