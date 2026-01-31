import React from "react";
import "./screen.css";

const Loading = ({ isActive }) => {
  if (!isActive) {
    return null;
  }

  return (
    <div className="loading-overlay">
      <div className="spinner-circle"></div>
    </div>
  );
};

export default Loading;
