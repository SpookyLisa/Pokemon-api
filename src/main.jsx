import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Teams from "./Pages/Teams.jsx";
import Liked from "./Pages/Liked.jsx";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/liked" element={<Liked />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
