import { useEffect, useState } from "react";
import { getPlayers, getRoles, compare } from "./api";
import PlayerSelect from "./components/PlayerSelect.jsx";
import RoleRadar, { STAT_LABELS } from "./components/RoleRadar.jsx";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [p1Id, setP1Id] = useState("");
  const [p2Id, setP2Id] = useState("");
  const [roleOverride, setRoleOverride] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPlayers().then(setPlayers).catch(() => setError("Could not reach the backend API."));
    getRoles().then(setRoles).catch(() => {});
  }, []);

  const p1 = players.find((p) => p._id === p1Id);
  const effectiveRole = roleOverride || p1?.role || "";

  async function runComparison() {
    if (!p1Id || !p2Id) return;
    setLoading(true);
    setError("");
    try {
      const data = await compare(p1Id, p2Id, roleOverride || undefined);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Comparison failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="masthead">
        <div className="brand">
  PARK ZE BUS
</div>
        <div className="tag">Role-weighted player comparator</div>
      </header>

      <div className="picker-row">
        <PlayerSelect label="Player A" players={players} value={p1Id} onChange={setP1Id} />
        <div className="vs-badge">VS</div>
        <PlayerSelect label="Player B" players={players} value={p2Id} onChange={setP2Id} />
      </div>

      <div className="role-select">
        <span>SCOUT FOR ROLE:</span>
        <select value={effectiveRole} onChange={(e) => setRoleOverride(e.target.value)}>
          {roles.map((r) => (
            <option key={r._id} value={r.role}>
              {r.role}
            </option>
          ))}
        </select>
        <button className="primary" onClick={runComparison} disabled={!p1Id || !p2Id || loading}>
          {loading ? "Analyzing..." : "Compare"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!result && !error && (
        <div className="empty-state panel">
          Pick two players and a role, then hit Compare. Stats are normalized to
          percentiles against same-position peers and weighted by what actually
          matters for the chosen role not just raw totals.
        </div>
      )}

      {result && (
        <div className="panel">
          <div className="report-header">
            <div>
              <div className="role-title">{result.role}</div>
              <div className="role-desc">Radar axes show percentile rank vs. peers at this position.</div>
            </div>
          </div>

          <div className="score-cards">
            <div className="score-card p1">
              <div className="name">{result.player1.name}</div>
              <div className="meta">{result.player1.club} · {result.player1.season}</div>
              <div className="score-label">Role Score</div>
              <div className="score">{result.player1.roleScore}</div>
            </div>
            <div className="score-card p2">
              <div className="name">{result.player2.name}</div>
              <div className="meta">{result.player2.club} · {result.player2.season}</div>
              <div className="score-label">Role Score</div>
              <div className="score">{result.player2.roleScore}</div>
            </div>
          </div>

          <RoleRadar radar={result.radar} p1Name={result.player1.name} p2Name={result.player2.name} />

          <table className="stat-table">
            <thead>
              <tr>
                <th>Stat</th>
                <th className="num">Weight</th>
                <th className="num">{result.player1.name}</th>
                <th className="num">{result.player2.name}</th>
              </tr>
            </thead>
            <tbody>
              {result.radar.map((r) => (
                <tr key={r.stat}>
                  <td>{STAT_LABELS[r.stat] || r.stat}</td>
                  <td className="num">{r.weight.toFixed(2)}</td>
                  <td className="num p1-col">{r[`${result.player1.name}_raw`]}</td>
                  <td className="num p2-col">{r[`${result.player2.name}_raw`]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="foot">player-scout · React + Express + MongoDB</footer>
    </div>
  );
}