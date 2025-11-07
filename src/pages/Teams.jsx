import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function Teams() {
  const [savedTeams, setSavedTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("savedTeams")) || [];
    setSavedTeams(stored);
  }, []);

  const handleLoadTeam = (team, index) => {
    const minimalTeam = team.map((p) => ({ id: p.id ?? p.name, name: p.name }));
    localStorage.setItem("currentTeam", JSON.stringify({ team: minimalTeam, index }));
    navigate("/"); // go back to App
  };

  const handleDelete = (index) => {
    const updated = savedTeams.filter((_, i) => i !== index);
    localStorage.setItem("savedTeams", JSON.stringify(updated));
    setSavedTeams(updated);
  };

  return (
    <div className="app-container">
      <Header />
      <Navigation />

      <main className="main-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Saved Teams</h2>
        {savedTeams.length === 0 && <p>No saved teams yet.</p>}

        <div className="team-list" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "900px" }}>
          {savedTeams.map((team, i) => (
            <div key={i} className="saved-team card" style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", background: "#fff", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0 }}>Team {i + 1}</h4>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleLoadTeam(team, i)} style={{ background: "#4dabf7", color: "#fff", border: "none", borderRadius: "6px", padding: "0.3rem 0.6rem", cursor: "pointer" }}>Load</button>
                  <button onClick={() => handleDelete(i)} style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: "6px", padding: "0.3rem 0.6rem", cursor: "pointer" }}>Delete</button>
                </div>
              </div>

              <div className="saved-team-pokemon" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "0.5rem", justifyItems: "center", marginTop: "0.5rem" }}>
                {team.map((p, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt={p.name} title={p.name} style={{ width: "60px", height: "60px", borderRadius: "8px", border: "1px solid #ccc" }} />
                    <div style={{ fontSize: "0.8rem", textAlign: "center" }}>{p.name.charAt(0).toUpperCase() + p.name.slice(1)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
