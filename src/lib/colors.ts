// habit accent colors — thumbnail background tints only.
// All interactive elements use YouTube Red (#FF0000).
import type { HabitColor } from "../types"

export interface ColorSet {
  thumb: string    // thumbnail background (soft tint)
  accent: string   // progress bar / heatmap fill
  freeze: string   // freeze cell tint
}

const MAP: Record<HabitColor, ColorSet> = {
  brand:  { thumb: "#FFF0EC", accent: "#FF6B35", freeze: "rgba(255,107,53,0.25)" },
  mint:   { thumb: "#E8F8F2", accent: "#22A877", freeze: "rgba(34,168,119,0.25)" },
  blue:   { thumb: "#EBF3FF", accent: "#3B82F6", freeze: "rgba(59,130,246,0.25)"  },
  purple: { thumb: "#F3EEFF", accent: "#8B5CF6", freeze: "rgba(139,92,246,0.25)" },
  rose:   { thumb: "#FFECEF", accent: "#F43F5E", freeze: "rgba(244,63,94,0.25)"  },
  amber:  { thumb: "#FFF8E8", accent: "#F59E0B", freeze: "rgba(245,158,11,0.25)" },
}

export function colorOf(c: HabitColor): ColorSet {
  return MAP[c] ?? MAP.brand
}
