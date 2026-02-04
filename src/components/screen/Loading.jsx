import React from "react";
import "../component.css";

const Loading = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="overlay__screen-component loading">
      <div className="spinner-circle__screen-component"></div>
    </div>
  );
};

export default Loading;
