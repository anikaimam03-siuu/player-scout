import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const STAT_LABELS = {
  goals_p90: "Goals /90",
  xG_p90: "xG /90",
  key_passes_p90: "Key Passes /90",
  xA_p90: "xA /90",
  dribbles_p90: "Dribbles /90",
  progressive_carries_p90: "Prog. Carries /90",
  shot_accuracy: "Shot Accuracy %",
  tackles_p90: "Tackles /90",
  interceptions_p90: "Interceptions /90",
  pass_accuracy: "Pass Accuracy %",
  distance_covered_p90: "Distance /90",
  progressive_passes_p90: "Prog. Passes /90",
  aerial_won_p90: "Aerials Won /90",
  save_percentage: "Save %",
  sweeper_actions_p90: "Sweeper Actions /90",
  long_pass_accuracy: "Long Pass %",
  clean_sheets_pct: "Clean Sheets %",
};

export default function RoleRadar({ radar, p1Name, p2Name }) {
  const data = radar.map((r) => ({
    stat: STAT_LABELS[r.stat] || r.stat,
    [p1Name]: r[p1Name],
    [p2Name]: r[p2Name],
  }));

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#1f2c25" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fill: "#c8d6cf", fontSize: 11, fontFamily: "JetBrains Mono" }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#4a5a51", fontSize: 9 }} />
          <Radar
            name={p1Name}
            dataKey={p1Name}
            stroke="#3ddc84"
            fill="#3ddc84"
            fillOpacity={0.28}
            strokeWidth={2}
          />
          <Radar
            name={p2Name}
            dataKey={p2Name}
            stroke="#ff8a3d"
            fill="#ff8a3d"
            fillOpacity={0.22}
            strokeWidth={2}
          />
          <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: "#101512", border: "1px solid #1f2c25", fontFamily: "JetBrains Mono", fontSize: 12 }}
            labelStyle={{ color: "#e9f2ec" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { STAT_LABELS };
