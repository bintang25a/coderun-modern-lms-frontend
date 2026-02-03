import React from "react";
import "./screen.css";

const Loading = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="overlay__screen-component">
      <div className="spinner-circle__screen-component"></div>
    </div>
  );
};

export default Loading;
