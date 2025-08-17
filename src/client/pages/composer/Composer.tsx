import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Composer = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [step, setStep] = useState(1); // 1 = Details, 2 = Fields, 3 = Preview
  const navigate = useNavigate();

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleSaveHandshake = () => {
    // Call an API method to save the handshake
    // After save, navigate to Outbox or Handshake details
    navigate("/outbox");
  };

  return (
    <div className="composer-container">
      <h1>Create New Handshake</h1>

      {step === 1 && (
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button onClick={handleNextStep}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          {/* HandshakeFieldEditor component has been removed */}
          <button onClick={handlePreviousStep}>Back</button>
          <button onClick={handleNextStep}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Preview</h3>
          {/* Here, show the preview of the handshake, including title, description, and fields */}
          <button onClick={handlePreviousStep}>Back</button>
          <button onClick={handleSaveHandshake}>Save Handshake</button>
        </div>
      )}
    </div>
  );
};
