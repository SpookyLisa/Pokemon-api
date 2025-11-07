import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function Liked() {
  const [likedPokemon, setLikedPokemon] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedPokemon")) || [];
    setLikedPokemon(stored);
  }, []);

  const toggleFavorite = (pokemon) => {
    // Use a unique key: prefer id, fallback to name
    const uniqueKey = pokemon.id ?? pokemon.name;

    const exists = likedPokemon.find(
      (p) => (p.id ?? p.name) === uniqueKey
    );

    let updated;
    if (exists) {
      updated = likedPokemon.filter((p) => (p.id ?? p.name) !== uniqueKey);
    } else {
      updated = [...likedPokemon, { ...pokemon, id: uniqueKey }];
    }

    setLikedPokemon(updated);
    localStorage.setItem("likedPokemon", JSON.stringify(updated));
  };

  return (
    <div className="app-container">
      <Header />
      <Navigation />

      <style>{`
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr); /* 3 per row */
          gap: 1.5rem;
        }

        .pokemon-card {
          position: relative;
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 3px 8px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 320px;
        }

        .pokemon-name {
          font-weight: bold;
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          text-transform: capitalize;
          text-align: center;
        }

        .pokemon-img-wrapper {
          width: 140px;
          height: 140px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .pokemon-img-filled {
          width: 120px;
          height: 120px;
          object-fit: contain;
        }

        .moves {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.3rem;
          width: 100%;
          margin-top: 0.5rem;
        }

        .move-btn {
          padding: 0.45rem;
          font-size: 0.95rem;
          border-radius: 6px;
          border: 1px solid #ddd;
          background: #fafafa;
          cursor: default;
        }

        .ability-row {
          width: 100%;
          margin-top: 0.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .ability-value {
          font-size: 0.9rem;
          color: #555;
          text-transform: capitalize;
        }

        .like-star {
          position: absolute;
          top: 8px;
          right: 8px;
          cursor: pointer;
          font-size: 24px;
          color: gold;
          z-index: 10;
        }
      `}</style>

      <main className="main-content">
        {likedPokemon.length === 0 ? (
          <p style={{ textAlign: "center" }}>No liked Pokémon yet.</p>
        ) : (
          <div className="team-grid">
            {likedPokemon.map((pokemon, index) => (
              <div key={pokemon.id ?? index} className="pokemon-card">
                <div
                  className="like-star"
                  onClick={() => toggleFavorite(pokemon)}
                  title="Toggle Favorite"
                >
                  ★
                </div>

                <div className="pokemon-name">{pokemon.name}</div>

                <div className="pokemon-img-wrapper">
                  <img
                    className="pokemon-img-filled"
                    src={pokemon.sprites?.front_default ?? ""}
                    alt={pokemon.name}
                  />
                </div>

                <div className="moves">
                  {pokemon.moves
                    ? pokemon.moves.slice(0, 4).map((m, idx) => (
                        <button key={idx} className="move-btn">
                          {m.move.name}
                        </button>
                      ))
                    : Array(4)
                        .fill(0)
                        .map((_, idx) => (
                          <button key={idx} className="move-btn empty">
                            Move
                          </button>
                        ))}
                </div>

                <div className="ability-row">
                  <div className="ability-value">
                    {pokemon.abilities?.[0]?.ability.name ?? "---"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
