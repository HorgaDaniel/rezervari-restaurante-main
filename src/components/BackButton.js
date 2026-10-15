import React from 'react';
import { useNavigate } from 'react-router-dom';

function BackButton() {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          backgroundColor: "#764ba2",
          color: "#fff",
          padding: "8px 16px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        ← Înapoi
      </button>
    </div>
  );
}

export default BackButton;
