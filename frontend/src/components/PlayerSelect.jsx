export default function PlayerSelect({ label, players, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>
          Select a player...
        </option>
        {players.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} — {p.club} ({p.role})
          </option>
        ))}
      </select>
    </div>
  );
}
