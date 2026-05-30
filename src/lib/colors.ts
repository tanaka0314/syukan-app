// Habit accent colors — decorative only (left stripe, heatmap).
// All interactive elements use BMW Blue (#1c69d4).
import type { HabitColor } from "../types"

export interface ColorSet {
  accent: string   // left border stripe / heatmap fill
  freeze: string   // freeze cell tint
}

const MAP: Record<HabitColor, ColorSet> = {
  brand:  { accent: "#FF6B35", freeze: "rgba(255,107,53,0.20)"  },
  mint:   { accent: "#22A877", freeze: "rgba(34,168,119,0.20)"  },
  blue:   { accent: "#1c69d4", freeze: "rgba(28,105,212,0.20)"  },
  purple: { accent: "#7c3aed", freeze: "rgba(124,58,237,0.20)"  },
  rose:   { accent: "#e11d48", freeze: "rgba(225,29,72,0.20)"   },
  amber:  { accent: "#d97706", freeze: "rgba(217,119,6,0.20)"   },
}

export function colorOf(c: HabitColor): ColorSet {
  return MAP[c] ?? MAP.blue
}
