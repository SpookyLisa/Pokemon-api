import React, { useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import axios from "axios";

const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#FB6C6C",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

export default function App() {
  const [team, setTeam] = useState(Array(6).fill(null));
  const [pokemonList, setPokemonList] = useState([]);
  const [typesMeta, setTypesMeta] = useState({});
  const [allTypes, setAllTypes] = useState([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(null);
  const [likedPokemon, setLikedPokemon] = useState(
    JSON.parse(localStorage.getItem("likedPokemon")) || []
  );

  // Fetch
  useEffect(() => {
    async function bootstrap() {
      try {
        const pRes = await axios.get(
          "https://pokeapi.co/api/v2/pokemon?limit=500&offset=0"
        );
        setPokemonList(pRes.data.results);

        const tRes = await axios.get("https://pokeapi.co/api/v2/type");
        const typeResults = tRes.data.results
          .map((t) => t.name)
          .filter((n) => n !== "shadow" && n !== "unknown");
        setAllTypes(typeResults);

        const typeDetails = await Promise.all(
          typeResults.map((typeName) =>
            axios.get(`https://pokeapi.co/api/v2/type/${typeName}`)
          )
        );

        const mapping = {};
        typeDetails.forEach((resp) => {
          const name = resp.data.name;
          const dr = resp.data.damage_relations;
          mapping[name] = {
            double_to: new Set(dr.double_damage_to.map((x) => x.name)),
            half_to: new Set(dr.half_damage_to.map((x) => x.name)),
            no_to: new Set(dr.no_damage_to.map((x) => x.name)),
          };
        });

        setTypesMeta(mapping);
      } catch (err) {
        console.error("Bootstrap error", err);
      }
    }

    bootstrap();

    // Load current team from localStorage (Teams page)
    const loadCurrentTeam = async () => {
      const saved = JSON.parse(localStorage.getItem("currentTeam"));
      if (saved?.team) {
        const fullTeam = await Promise.all(
          saved.team.map(async (p) => {
            if (!p.name) return null;
            if (p.sprites && p.moves && p.types) return p;
            try {
              const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${p.name}`);
              return res.data;
            } catch {
              return null;
            }
          })
        );
        setTeam(fullTeam.map((p) => p || null));
        setCurrentTeamIndex(saved.index);
      }
    };
    loadCurrentTeam();
  }, []);

  // Team handlers
  const handleNameSelect = async (slotIndex, nameOrUrl) => {
    if (!nameOrUrl) return;
    try {
      const found = pokemonList.find((p) => p.name === nameOrUrl);
      const url = found ? found.url : nameOrUrl;
      const res = await axios.get(url);
      const newTeam = [...team];
      newTeam[slotIndex] = res.data;
      setTeam(newTeam);
    } catch (err) {
      console.error("Could not load pokemon:", err);
      alert("Could not load selected Pokémon. Try again.");
    }
  };

  const handleClearSlot = (index) => {
    const newTeam = [...team];
    newTeam[index] = null;
    setTeam(newTeam);
  };

  const handleNewTeam = () => {
    localStorage.removeItem("currentTeam");
    setTeam(Array(6).fill(null));
    setCurrentTeamIndex(null);
  };

  // Favourites
  const isLiked = (pokemon) => likedPokemon.some((p) => p.id === pokemon.id);
  const toggleLike = (pokemon) => {
    let updatedLikes;
    if (likedPokemon.some((p) => p.id === pokemon.id)) {
      updatedLikes = likedPokemon.filter((p) => p.id !== pokemon.id);
    } else {
      updatedLikes = [...likedPokemon, pokemon];
    }
    setLikedPokemon(updatedLikes);
    localStorage.setItem("likedPokemon", JSON.stringify(updatedLikes));
  };

  // Team stats
  const computeTeamDefenceScores = () => {
    const scores = {};
    if (!allTypes.length || !Object.keys(typesMeta).length) {
      allTypes.forEach((t) => (scores[t] = 0));
      return scores;
    }
    allTypes.forEach((attackType) => {
      let total = 0;
      team.forEach((p) => {
        if (!p) return;
        const pTypes = p.types.map((t) => t.type.name);
        let mul = 1;
        pTypes.forEach((defType) => {
          const meta = typesMeta[attackType];
          if (!meta) return;
          if (meta.no_to.has(defType)) mul *= 0;
          else if (meta.double_to.has(defType)) mul *= 2;
          else if (meta.half_to.has(defType)) mul *= 0.5;
          else mul *= 1;
        });
        if (mul >= 2) total += 1;
        else if (mul <= 0.5 && mul > 0) total -= 1;
        else if (mul === 0) total -= 1;
      });
      scores[attackType] = total;
    });
    return scores;
  };

  const computeTeamCoverageCounts = () => {
    const counts = {};
    allTypes.forEach((t) => (counts[t] = 0));
    team.forEach((p) => {
      if (!p) return;
      p.types.forEach((tt) => {
        counts[tt.type.name] = (counts[tt.type.name] || 0) + 1;
      });
    });
    return counts;
  };

  const defenceScores = computeTeamDefenceScores();
  const coverageCounts = computeTeamCoverageCounts();

  const renderTypesPanel = (title, values, isDefence = true) => (
    <div className="types-panel card">
      <h3 className="panel-title">{title}</h3>
      <div className="types-grid">
        {allTypes.map((t) => {
          const color = TYPE_COLORS[t] || "#bbb";
          const val = values[t] ?? 0;
          const show = isDefence ? (val > 0 ? `+${val}` : val) : val;
          return (
            <div key={t} className="type-cell">
              <div className="type-pill" style={{ background: color }} title={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </div>
              <div className={`type-value ${isDefence ? "defence" : "coverage"}`}>
                {show}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <Header />
      <Navigation />

      <main className="main-content grid-with-panels">
        <div className="team-grid">
          {team.map((pokemon, i) => (
            <div key={i} className="card-wrapper">
              <div className="name-select-row">
                <select
                  value={pokemon ? pokemon.name : ""}
                  onChange={(e) => {
                    const chosenName = e.target.value;
                    if (!chosenName) return;
                    const found = pokemonList.find((p) => p.name === chosenName);
                    if (found) handleNameSelect(i, found.name);
                  }}
                  className="slot-select"
                >
                  <option value="">Name</option>
                  {pokemonList.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                    </option>
                  ))}
                </select>

                {pokemon && (
                  <button
                    className="clear-btn small"
                    onClick={() => handleClearSlot(i)}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="pokemon-card slot" style={{ position: "relative" }}>
                {pokemon && (
                  <button
                    className={`like-btn ${isLiked(pokemon) ? "liked" : ""}`}
                    onClick={() => {
                      const pokemonWithId = { ...pokemon, id: pokemon.id || pokemon.name };
                      toggleLike(pokemonWithId);
                    }}
                    title={isLiked(pokemon) ? "Unfavourite" : "Favourite"}
                  >
                    ★
                  </button>
                )}

                <div className="pokemon-img-wrapper">
                  {pokemon ? (
                    <img
                      className="pokemon-img-filled"
                      src={pokemon.sprites.front_default}
                      alt={pokemon.name}
                    />
                  ) : (
                    <div className="pokemon-img-empty">?</div>
                  )}
                </div>

                <div className="moves">
                  {pokemon
                    ? pokemon.moves.slice(0, 4).map((m, idx) => (
                        <button key={idx} className="move-btn">
                          {m.move.name}
                        </button>
                      ))
                    : [0, 1, 2, 3].map((n) => (
                        <button key={n} className="move-btn empty">
                          Move
                        </button>
                      ))}
                </div>

                <div className="ability-row">
                  <div className="ability-value">
                    {pokemon ? pokemon.abilities[0]?.ability.name : "---"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="panels-column">
          {renderTypesPanel("Team Defence", defenceScores, true)}
          {renderTypesPanel("Team Type Coverage", coverageCounts, false)}
        </div>
      </main>

      <div className="actions" style={{ marginTop: "1rem" }}>
        <button onClick={handleNewTeam}>New Team</button>
        <button
          onClick={() => {
            const savedTeams = JSON.parse(localStorage.getItem("savedTeams")) || [];
            const cleanedTeam = team.filter(Boolean).map((p) => ({ id: p.id || p.name, name: p.name }));
            if (currentTeamIndex !== null) {
              savedTeams[currentTeamIndex] = cleanedTeam;
            } else {
              savedTeams.push(cleanedTeam);
            }
            localStorage.setItem("savedTeams", JSON.stringify(savedTeams));
            alert("Team saved!");
          }}
        >
          Save
        </button>
        <button onClick={() => (window.location.href = "/teams")}>
          View Teams
        </button>
      </div>

      <Footer />
    </div>
  );
}
