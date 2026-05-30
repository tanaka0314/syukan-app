/** 習慣をどの曜日に行うか。0=日曜 ... 6=土曜 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** 習慣1件 */
export interface Habit {
  id: string
  title: string
  tinyStep: string
  cue: string
  emoji: string
  color: HabitColor
  days: Weekday[]
  /** 表示順（小さいほど上） */
  order: number
  createdAt: string
  freezeTokens: number
  archived: boolean
}

export type HabitColor = "brand" | "mint" | "blue" | "purple" | "rose" | "amber"

/** 達成ログ */
export interface CompletionLog {
  habitId: string
  /** "YYYY-MM-DD" */
  date: string
  kind: "done" | "freeze"
  /** 達成後のひとこと（任意） */
  note?: string
}

export interface PersistedState {
  habits: Habit[]
  logs: CompletionLog[]
  xp: number
  onboarded: boolean
}
