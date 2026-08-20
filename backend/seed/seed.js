import mongoose from "mongoose";
import dotenv from "dotenv";
import Player from "../models/Player.js";
import Stat from "../models/Stat.js";
import RoleWeighting from "../models/RoleWeighting.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/player-scout";


const roleWeightings = [
  {
    role: "Inverted Winger",
    position: "FWD",
    description: "Wide forward who cuts inside onto their stronger foot to shoot/create.",
    weights: {
      goals_p90: 0.22,
      xG_p90: 0.15,
      key_passes_p90: 0.15,
      xA_p90: 0.13,
      dribbles_p90: 0.15,
      progressive_carries_p90: 0.1,
      shot_accuracy: 0.1,
    },
  },
  {
    role: "Poacher",
    position: "FWD",
    description: "Pure finisher who lives off chances inside the box.",
    weights: {
      goals_p90: 0.3,
      xG_p90: 0.2,
      shots_p90: 0.15,
      conversion_rate: 0.2,
      touches_in_box_p90: 0.15,
    },
  },
  {
    role: "Target Man",
    position: "FWD",
    description: "Physical focal point who holds up play and wins aerial duels.",
    weights: {
      goals_p90: 0.2,
      aerial_won_p90: 0.28,
      hold_up_pass_p90: 0.22,
      xG_p90: 0.15,
      assists_p90: 0.15,
    },
  },
  {
    role: "Box-to-Box Midfielder",
    position: "MID",
    description: "Covers both boxes: contributes defensively and arrives late in attack.",
    weights: {
      tackles_p90: 0.18,
      interceptions_p90: 0.15,
      progressive_carries_p90: 0.17,
      key_passes_p90: 0.13,
      goals_p90: 0.13,
      pass_accuracy: 0.1,
      distance_covered_p90: 0.14,
    },
  },
  {
    role: "Advanced Playmaker",
    position: "MID",
    description: "Creative hub in the final third, unlocking defenses with the final ball.",
    weights: {
      key_passes_p90: 0.26,
      xA_p90: 0.2,
      through_balls_p90: 0.18,
      dribbles_p90: 0.14,
      goals_p90: 0.12,
      pass_accuracy: 0.1,
    },
  },
  {
    role: "Deep-Lying Playmaker",
    position: "MID",
    description: "Sits in front of the defense and dictates tempo with passing range.",
    weights: {
      pass_accuracy: 0.25,
      progressive_passes_p90: 0.28,
      interceptions_p90: 0.2,
      long_pass_accuracy: 0.17,
      tackles_p90: 0.1,
    },
  },
  {
    role: "Ball-Playing Defender",
    position: "DEF",
    description: "Center-back valued for progressing the ball, not just defending it.",
    weights: {
      pass_accuracy: 0.2,
      progressive_passes_p90: 0.22,
      interceptions_p90: 0.18,
      tackles_p90: 0.15,
      aerial_won_p90: 0.15,
      dribbles_p90: 0.1,
    },
  },
  {
    role: "Wing-Back",
    position: "DEF",
    description: "Full-back who bombs forward as an auxiliary winger.",
    weights: {
      crosses_p90: 0.22,
      progressive_carries_p90: 0.2,
      key_passes_p90: 0.16,
      tackles_p90: 0.16,
      interceptions_p90: 0.13,
      distance_covered_p90: 0.13,
    },
  },
  {
    role: "Stopper Centre-Back",
    position: "DEF",
    description: "No-nonsense defender focused on winning duels and clearing danger.",
    weights: {
      tackles_p90: 0.22,
      interceptions_p90: 0.2,
      aerial_won_p90: 0.24,
      clearances_p90: 0.2,
      blocks_p90: 0.14,
    },
  },
  {
    role: "Sweeper Keeper",
    position: "GK",
    description: "Goalkeeper who acts as an extra defender/passer outside the box.",
    weights: {
      save_percentage: 0.3,
      pass_accuracy: 0.2,
      sweeper_actions_p90: 0.25,
      long_pass_accuracy: 0.15,
      clean_sheets_pct: 0.1,
    },
  },
  {
    role: "Shot-Stopper",
    position: "GK",
    description: "Goalkeeper valued primarily for pure shot-stopping ability.",
    weights: {
      save_percentage: 0.32,
      saves_p90: 0.24,
      clean_sheets_pct: 0.2,
      penalties_saved_pct: 0.12,
      claims_p90: 0.12,
    },
  },
];

const season = "2025/26";

// Small helper so every player line doesn't need every stat key repeated —
// only the keys relevant to the role's weighting matter for compare/radar.
function p(name, club, nationality, age, position, role, minutesPlayed, values) {
  return { name, club, nationality, age, position, role, stat: { season, minutesPlayed, values } };
}

const players = [
  // ---------------- PREMIER LEAGUE (30) ----------------
  p("Mohamed Salah", "Liverpool", "Egypt", 33, "FWD", "Inverted Winger", 2600, {
    goals_p90: 0.62, xG_p90: 0.5, key_passes_p90: 2.3, xA_p90: 0.35, dribbles_p90: 3.1, progressive_carries_p90: 4.9, shot_accuracy: 51,
  }),
  p("Florian Wirtz", "Liverpool", "Germany", 23, "MID", "Advanced Playmaker", 2300, {
    key_passes_p90: 3.1, xA_p90: 0.36, through_balls_p90: 1.4, dribbles_p90: 3.4, goals_p90: 0.28, pass_accuracy: 86,
  }),
  p("Virgil van Dijk", "Liverpool", "Netherlands", 34, "DEF", "Ball-Playing Defender", 2700, {
    pass_accuracy: 90, progressive_passes_p90: 6.1, interceptions_p90: 1.7, tackles_p90: 1.2, aerial_won_p90: 3.4, dribbles_p90: 0.5,
  }),
  p("Ryan Gravenberch", "Liverpool", "Netherlands", 24, "MID", "Box-to-Box Midfielder", 2500, {
    tackles_p90: 1.8, interceptions_p90: 1.1, progressive_carries_p90: 3.6, key_passes_p90: 1.4, goals_p90: 0.12, pass_accuracy: 90, distance_covered_p90: 10.9,
  }),
  p("Ibrahima Konate", "Liverpool", "France", 27, "DEF", "Stopper Centre-Back", 2400, {
    tackles_p90: 1.5, interceptions_p90: 1.9, aerial_won_p90: 3.6, clearances_p90: 4.8, blocks_p90: 1.1,
  }),
  p("Bukayo Saka", "Arsenal", "England", 24, "FWD", "Inverted Winger", 2500, {
    goals_p90: 0.5, xG_p90: 0.44, key_passes_p90: 2.6, xA_p90: 0.38, dribbles_p90: 4.1, progressive_carries_p90: 5.0, shot_accuracy: 48,
  }),
  p("Viktor Gyokeres", "Arsenal", "Sweden", 27, "FWD", "Poacher", 2600, {
    goals_p90: 0.71, xG_p90: 0.6, shots_p90: 3.8, conversion_rate: 21, touches_in_box_p90: 6.2,
  }),
  p("Declan Rice", "Arsenal", "England", 27, "MID", "Box-to-Box Midfielder", 2700, {
    tackles_p90: 2.0, interceptions_p90: 1.4, progressive_carries_p90: 3.9, key_passes_p90: 1.9, goals_p90: 0.2, pass_accuracy: 89, distance_covered_p90: 11.4,
  }),
  p("Martin Odegaard", "Arsenal", "Norway", 27, "MID", "Advanced Playmaker", 2400, {
    key_passes_p90: 3.4, xA_p90: 0.34, through_balls_p90: 1.6, dribbles_p90: 2.6, goals_p90: 0.24, pass_accuracy: 88,
  }),
  p("William Saliba", "Arsenal", "France", 25, "DEF", "Ball-Playing Defender", 2800, {
    pass_accuracy: 91, progressive_passes_p90: 4.9, interceptions_p90: 2.1, tackles_p90: 1.4, aerial_won_p90: 3.6, dribbles_p90: 0.4,
  }),
  p("Erling Haaland", "Manchester City", "Norway", 26, "FWD", "Poacher", 2500, {
    goals_p90: 0.98, xG_p90: 0.85, shots_p90: 4.6, conversion_rate: 24, touches_in_box_p90: 7.1,
  }),
  p("Phil Foden", "Manchester City", "England", 26, "MID", "Advanced Playmaker", 2300, {
    key_passes_p90: 2.9, xA_p90: 0.31, through_balls_p90: 1.2, dribbles_p90: 3.7, goals_p90: 0.34, pass_accuracy: 87,
  }),
  p("Rodri", "Manchester City", "Spain", 30, "MID", "Deep-Lying Playmaker", 2600, {
    pass_accuracy: 92, progressive_passes_p90: 7.4, interceptions_p90: 1.6, long_pass_accuracy: 78, tackles_p90: 1.3,
  }),
  p("Josko Gvardiol", "Manchester City", "Croatia", 24, "DEF", "Ball-Playing Defender", 2600, {
    pass_accuracy: 90, progressive_passes_p90: 5.8, interceptions_p90: 1.5, tackles_p90: 1.6, aerial_won_p90: 2.9, dribbles_p90: 0.9,
  }),
  p("Bruno Fernandes", "Manchester United", "Portugal", 31, "MID", "Advanced Playmaker", 2700, {
    key_passes_p90: 3.2, xA_p90: 0.33, through_balls_p90: 1.7, dribbles_p90: 1.9, goals_p90: 0.29, pass_accuracy: 84,
  }),
  p("Bryan Mbeumo", "Manchester United", "Cameroon", 26, "FWD", "Inverted Winger", 2500, {
    goals_p90: 0.47, xG_p90: 0.4, key_passes_p90: 2.0, xA_p90: 0.28, dribbles_p90: 2.9, progressive_carries_p90: 4.2, shot_accuracy: 46,
  }),
  p("Matheus Cunha", "Manchester United", "Brazil", 26, "FWD", "Target Man", 2300, {
    goals_p90: 0.4, aerial_won_p90: 2.4, hold_up_pass_p90: 3.1, xG_p90: 0.36, assists_p90: 0.22,
  }),
  p("Cole Palmer", "Chelsea", "England", 23, "MID", "Advanced Playmaker", 2400, {
    key_passes_p90: 3.0, xA_p90: 0.35, through_balls_p90: 1.3, dribbles_p90: 3.2, goals_p90: 0.38, pass_accuracy: 85,
  }),
  p("Levi Colwill", "Chelsea", "England", 22, "DEF", "Ball-Playing Defender", 2200, {
    pass_accuracy: 89, progressive_passes_p90: 5.2, interceptions_p90: 1.6, tackles_p90: 1.5, aerial_won_p90: 2.6, dribbles_p90: 0.7,
  }),
  p("Reece James", "Chelsea", "England", 26, "DEF", "Wing-Back", 2000, {
    crosses_p90: 3.6, progressive_carries_p90: 3.8, key_passes_p90: 1.9, tackles_p90: 1.7, interceptions_p90: 1.2, distance_covered_p90: 10.6,
  }),
  p("Enzo Fernandez", "Chelsea", "Argentina", 25, "MID", "Deep-Lying Playmaker", 2500, {
    pass_accuracy: 90, progressive_passes_p90: 6.8, interceptions_p90: 1.5, long_pass_accuracy: 74, tackles_p90: 1.6,
  }),
  p("James Maddison", "Tottenham Hotspur", "England", 29, "MID", "Advanced Playmaker", 2200, {
    key_passes_p90: 3.3, xA_p90: 0.37, through_balls_p90: 1.8, dribbles_p90: 2.4, goals_p90: 0.21, pass_accuracy: 83,
  }),
  p("Dominic Solanke", "Tottenham Hotspur", "England", 28, "FWD", "Target Man", 2100, {
    goals_p90: 0.38, aerial_won_p90: 2.7, hold_up_pass_p90: 3.4, xG_p90: 0.34, assists_p90: 0.18,
  }),
  p("Sandro Tonali", "Tottenham Hotspur", "Italy", 26, "MID", "Box-to-Box Midfielder", 2400, {
    tackles_p90: 1.9, interceptions_p90: 1.3, progressive_carries_p90: 3.3, key_passes_p90: 1.6, goals_p90: 0.16, pass_accuracy: 88, distance_covered_p90: 11.1,
  }),
  p("Nick Woltemade", "Newcastle United", "Germany", 24, "FWD", "Target Man", 2000, {
    goals_p90: 0.42, aerial_won_p90: 3.1, hold_up_pass_p90: 3.6, xG_p90: 0.37, assists_p90: 0.15,
  }),
  p("Fabian Schar", "Newcastle United", "Switzerland", 34, "DEF", "Stopper Centre-Back", 2400, {
    tackles_p90: 1.4, interceptions_p90: 1.7, aerial_won_p90: 3.3, clearances_p90: 5.1, blocks_p90: 1.0,
  }),
  p("Nick Pope", "Newcastle United", "England", 34, "GK", "Shot-Stopper", 2700, {
    save_percentage: 72, saves_p90: 3.1, clean_sheets_pct: 42, penalties_saved_pct: 28, claims_p90: 1.4,
  }),
  p("Morgan Rogers", "Aston Villa", "England", 24, "FWD", "Inverted Winger", 2200, {
    goals_p90: 0.34, xG_p90: 0.3, key_passes_p90: 2.2, xA_p90: 0.29, dribbles_p90: 3.4, progressive_carries_p90: 4.6, shot_accuracy: 44,
  }),
  p("Ollie Watkins", "Aston Villa", "England", 30, "FWD", "Poacher", 2500, {
    goals_p90: 0.51, xG_p90: 0.46, shots_p90: 3.2, conversion_rate: 18, touches_in_box_p90: 5.4,
  }),
  p("Kaoru Mitoma", "Brighton", "Japan", 29, "FWD", "Inverted Winger", 2100, {
    goals_p90: 0.31, xG_p90: 0.28, key_passes_p90: 2.1, xA_p90: 0.26, dribbles_p90: 4.4, progressive_carries_p90: 4.4, shot_accuracy: 45,
  }),

  // ---------------- LA LIGA (20) ----------------
  p("Kylian Mbappe", "Real Madrid", "France", 27, "FWD", "Inverted Winger", 2600, {
    goals_p90: 0.79, xG_p90: 0.66, key_passes_p90: 2.0, xA_p90: 0.27, dribbles_p90: 3.8, progressive_carries_p90: 5.3, shot_accuracy: 53,
  }),
  p("Jude Bellingham", "Real Madrid", "England", 22, "MID", "Box-to-Box Midfielder", 2500, {
    tackles_p90: 2.1, interceptions_p90: 1.3, progressive_carries_p90: 4.8, key_passes_p90: 2.4, goals_p90: 0.55, pass_accuracy: 87, distance_covered_p90: 11.2,
  }),
  p("Vinicius Junior", "Real Madrid", "Brazil", 25, "FWD", "Inverted Winger", 2600, {
    goals_p90: 0.68, xG_p90: 0.55, key_passes_p90: 2.1, xA_p90: 0.32, dribbles_p90: 5.4, progressive_carries_p90: 6.1, shot_accuracy: 52,
  }),
  p("Trent Alexander-Arnold", "Real Madrid", "England", 27, "DEF", "Wing-Back", 2300, {
    crosses_p90: 4.1, progressive_carries_p90: 3.4, key_passes_p90: 2.6, tackles_p90: 1.1, interceptions_p90: 1.3, distance_covered_p90: 10.3,
  }),
  p("Eduardo Camavinga", "Real Madrid", "France", 23, "MID", "Box-to-Box Midfielder", 2400, {
    tackles_p90: 2.2, interceptions_p90: 1.5, progressive_carries_p90: 3.7, key_passes_p90: 1.3, goals_p90: 0.09, pass_accuracy: 90, distance_covered_p90: 11.6,
  }),
  p("Antonio Rudiger", "Real Madrid", "Germany", 33, "DEF", "Ball-Playing Defender", 2400, {
    pass_accuracy: 92, progressive_passes_p90: 5.5, interceptions_p90: 1.8, tackles_p90: 1.6, aerial_won_p90: 3.1, dribbles_p90: 0.6,
  }),
  p("Thibaut Courtois", "Real Madrid", "Belgium", 33, "GK", "Sweeper Keeper", 2700, {
    save_percentage: 74, pass_accuracy: 85, sweeper_actions_p90: 0.9, long_pass_accuracy: 68, clean_sheets_pct: 45,
  }),
  p("Lamine Yamal", "Barcelona", "Spain", 19, "FWD", "Inverted Winger", 2500, {
    goals_p90: 0.44, xG_p90: 0.38, key_passes_p90: 2.9, xA_p90: 0.39, dribbles_p90: 5.1, progressive_carries_p90: 5.6, shot_accuracy: 47,
  }),
  p("Pedri", "Barcelona", "Spain", 23, "MID", "Advanced Playmaker", 2400, {
    key_passes_p90: 2.8, xA_p90: 0.29, through_balls_p90: 1.5, dribbles_p90: 3.9, goals_p90: 0.19, pass_accuracy: 91,
  }),
  p("Raphinha", "Barcelona", "Brazil", 29, "FWD", "Inverted Winger", 2400, {
    goals_p90: 0.46, xG_p90: 0.39, key_passes_p90: 2.3, xA_p90: 0.34, dribbles_p90: 3.6, progressive_carries_p90: 4.7, shot_accuracy: 46,
  }),
  p("Fermin Lopez", "Barcelona", "Spain", 23, "MID", "Advanced Playmaker", 2100, {
    key_passes_p90: 2.4, xA_p90: 0.25, through_balls_p90: 1.1, dribbles_p90: 3.0, goals_p90: 0.31, pass_accuracy: 88,
  }),
  p("Pau Cubarsi", "Barcelona", "Spain", 19, "DEF", "Ball-Playing Defender", 2500, {
    pass_accuracy: 92, progressive_passes_p90: 5.9, interceptions_p90: 1.9, tackles_p90: 1.3, aerial_won_p90: 2.4, dribbles_p90: 1.0,
  }),
  p("Anthony Gordon", "Barcelona", "England", 25, "FWD", "Inverted Winger", 2000, {
    goals_p90: 0.36, xG_p90: 0.32, key_passes_p90: 2.0, xA_p90: 0.27, dribbles_p90: 3.3, progressive_carries_p90: 4.3, shot_accuracy: 44,
  }),
  p("Antoine Griezmann", "Atletico Madrid", "France", 35, "MID", "Advanced Playmaker", 2300, {
    key_passes_p90: 2.6, xA_p90: 0.27, through_balls_p90: 1.3, dribbles_p90: 2.2, goals_p90: 0.33, pass_accuracy: 86,
  }),
  p("Julian Alvarez", "Atletico Madrid", "Argentina", 26, "FWD", "Poacher", 2400, {
    goals_p90: 0.58, xG_p90: 0.49, shots_p90: 3.5, conversion_rate: 20, touches_in_box_p90: 5.9,
  }),
  p("Marcos Llorente", "Atletico Madrid", "Spain", 31, "MID", "Box-to-Box Midfielder", 2200, {
    tackles_p90: 1.7, interceptions_p90: 1.2, progressive_carries_p90: 3.5, key_passes_p90: 1.4, goals_p90: 0.18, pass_accuracy: 85, distance_covered_p90: 11.3,
  }),
  p("Jan Oblak", "Atletico Madrid", "Slovenia", 33, "GK", "Shot-Stopper", 2600, {
    save_percentage: 73, saves_p90: 3.3, clean_sheets_pct: 40, penalties_saved_pct: 30, claims_p90: 1.2,
  }),
  p("Nico Williams", "Athletic Bilbao", "Spain", 23, "FWD", "Inverted Winger", 2300, {
    goals_p90: 0.35, xG_p90: 0.31, key_passes_p90: 2.4, xA_p90: 0.31, dribbles_p90: 4.6, progressive_carries_p90: 4.9, shot_accuracy: 45,
  }),
  p("Inaki Williams", "Athletic Bilbao", "Ghana", 31, "FWD", "Poacher", 2300, {
    goals_p90: 0.4, xG_p90: 0.35, shots_p90: 2.9, conversion_rate: 17, touches_in_box_p90: 4.8,
  }),
  p("Alex Baena", "Villarreal", "Spain", 24, "MID", "Advanced Playmaker", 2200, {
    key_passes_p90: 2.7, xA_p90: 0.3, through_balls_p90: 1.4, dribbles_p90: 2.9, goals_p90: 0.22, pass_accuracy: 85,
  }),

  // ---------------- BUNDESLIGA (20) ----------------
  p("Harry Kane", "Bayern Munich", "England", 32, "FWD", "Poacher", 2600, {
    goals_p90: 0.9, xG_p90: 0.78, shots_p90: 4.1, conversion_rate: 23, touches_in_box_p90: 6.5,
  }),
  p("Jamal Musiala", "Bayern Munich", "Germany", 23, "MID", "Advanced Playmaker", 2200, {
    key_passes_p90: 2.9, xA_p90: 0.3, through_balls_p90: 1.5, dribbles_p90: 4.2, goals_p90: 0.36, pass_accuracy: 87,
  }),
  p("Michael Olise", "Bayern Munich", "France", 24, "FWD", "Inverted Winger", 2400, {
    goals_p90: 0.42, xG_p90: 0.36, key_passes_p90: 2.6, xA_p90: 0.35, dribbles_p90: 3.9, progressive_carries_p90: 4.8, shot_accuracy: 47,
  }),
  p("Luis Diaz", "Bayern Munich", "Colombia", 29, "FWD", "Inverted Winger", 2400, {
    goals_p90: 0.48, xG_p90: 0.41, key_passes_p90: 1.9, xA_p90: 0.24, dribbles_p90: 3.7, progressive_carries_p90: 4.5, shot_accuracy: 46,
  }),
  p("Joshua Kimmich", "Bayern Munich", "Germany", 31, "MID", "Deep-Lying Playmaker", 2600, {
    pass_accuracy: 91, progressive_passes_p90: 7.1, interceptions_p90: 1.4, long_pass_accuracy: 76, tackles_p90: 1.2,
  }),
  p("Dayot Upamecano", "Bayern Munich", "France", 27, "DEF", "Stopper Centre-Back", 2500, {
    tackles_p90: 1.6, interceptions_p90: 1.8, aerial_won_p90: 3.5, clearances_p90: 4.6, blocks_p90: 1.2,
  }),
  p("Manuel Neuer", "Bayern Munich", "Germany", 40, "GK", "Sweeper Keeper", 2400, {
    save_percentage: 71, pass_accuracy: 88, sweeper_actions_p90: 1.1, long_pass_accuracy: 71, clean_sheets_pct: 41,
  }),
  p("Karim Adeyemi", "Borussia Dortmund", "Germany", 24, "FWD", "Inverted Winger", 2100, {
    goals_p90: 0.39, xG_p90: 0.33, key_passes_p90: 1.8, xA_p90: 0.25, dribbles_p90: 3.8, progressive_carries_p90: 4.1, shot_accuracy: 43,
  }),
  p("Jobe Bellingham", "Borussia Dortmund", "England", 20, "MID", "Box-to-Box Midfielder", 2200, {
    tackles_p90: 1.9, interceptions_p90: 1.2, progressive_carries_p90: 3.4, key_passes_p90: 1.5, goals_p90: 0.21, pass_accuracy: 86, distance_covered_p90: 11.0,
  }),
  p("Serhou Guirassy", "Borussia Dortmund", "Guinea", 29, "FWD", "Poacher", 2300, {
    goals_p90: 0.65, xG_p90: 0.55, shots_p90: 3.6, conversion_rate: 22, touches_in_box_p90: 5.7,
  }),
  p("Nico Schlotterbeck", "Borussia Dortmund", "Germany", 26, "DEF", "Ball-Playing Defender", 2400, {
    pass_accuracy: 89, progressive_passes_p90: 5.6, interceptions_p90: 1.6, tackles_p90: 1.5, aerial_won_p90: 2.8, dribbles_p90: 0.6,
  }),
  p("Gregor Kobel", "Borussia Dortmund", "Switzerland", 28, "GK", "Shot-Stopper", 2700, {
    save_percentage: 72, saves_p90: 3.4, clean_sheets_pct: 39, penalties_saved_pct: 26, claims_p90: 1.3,
  }),
  p("Xavi Simons", "RB Leipzig", "Netherlands", 23, "MID", "Advanced Playmaker", 2300, {
    key_passes_p90: 2.7, xA_p90: 0.28, through_balls_p90: 1.4, dribbles_p90: 3.1, goals_p90: 0.25, pass_accuracy: 85,
  }),
  p("Assan Ouedraogo", "RB Leipzig", "Germany", 20, "MID", "Box-to-Box Midfielder", 2000, {
    tackles_p90: 1.8, interceptions_p90: 1.1, progressive_carries_p90: 3.2, key_passes_p90: 1.3, goals_p90: 0.14, pass_accuracy: 87, distance_covered_p90: 10.8,
  }),
  p("Ademola Lookman", "RB Leipzig", "Nigeria", 28, "FWD", "Inverted Winger", 2200, {
    goals_p90: 0.5, xG_p90: 0.43, key_passes_p90: 2.2, xA_p90: 0.29, dribbles_p90: 3.9, progressive_carries_p90: 4.6, shot_accuracy: 48,
  }),
  p("Granit Xhaka", "Bayer Leverkusen", "Switzerland", 33, "MID", "Deep-Lying Playmaker", 2500, {
    pass_accuracy: 89, progressive_passes_p90: 6.6, interceptions_p90: 1.5, long_pass_accuracy: 73, tackles_p90: 1.4,
  }),
  p("Patrik Schick", "Bayer Leverkusen", "Czechia", 30, "FWD", "Target Man", 2000, {
    goals_p90: 0.55, aerial_won_p90: 3.3, hold_up_pass_p90: 2.9, xG_p90: 0.48, assists_p90: 0.14,
  }),
  p("Jonathan Tah", "Bayer Leverkusen", "Germany", 30, "DEF", "Stopper Centre-Back", 2500, {
    tackles_p90: 1.5, interceptions_p90: 1.7, aerial_won_p90: 3.4, clearances_p90: 4.9, blocks_p90: 1.1,
  }),
  p("Waldemar Anton", "VfB Stuttgart", "Germany", 29, "DEF", "Ball-Playing Defender", 2400, {
    pass_accuracy: 88, progressive_passes_p90: 5.0, interceptions_p90: 1.7, tackles_p90: 1.6, aerial_won_p90: 2.7, dribbles_p90: 0.5,
  }),
  p("Deniz Undav", "VfB Stuttgart", "Germany", 29, "FWD", "Poacher", 2200, {
    goals_p90: 0.53, xG_p90: 0.45, shots_p90: 3.0, conversion_rate: 19, touches_in_box_p90: 5.1,
  }),
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected. Clearing old data...");
  await Promise.all([Player.deleteMany({}), Stat.deleteMany({}), RoleWeighting.deleteMany({})]);

  await RoleWeighting.insertMany(roleWeightings);
  console.log(`Inserted ${roleWeightings.length} role weightings`);

  for (const pl of players) {
    const { stat, ...playerData } = pl;
    const created = await Player.create(playerData);
    await Stat.create({ player: created._id, ...stat });
  }
  console.log(`Inserted ${players.length} players with stat lines`);

  await mongoose.disconnect();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
