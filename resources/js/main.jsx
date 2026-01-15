import React from "react";
import { createRoot } from "react-dom/client";
import "../css/globals.css";
import App from "./app.jsx";

const container = document.getElementById("app");
createRoot(container).render(<App />);
