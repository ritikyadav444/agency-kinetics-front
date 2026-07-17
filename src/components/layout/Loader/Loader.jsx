import React from "react";
import "./Loader.css";

const Loader = ({ message }) => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default Loader;
