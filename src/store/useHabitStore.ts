// アプリの状態管理。zustand + persist で localStorage に自動保存する。
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Habit, CompletionLog, Weekday, HabitColor } from "../types"
import { todayKey } from "../lib/date"
import { XP_PER_DONE, XP_PER_FREEZE, streakBonus } from "../lib/level"
import { calcStreak } from "../lib/date"

const DEFAULT_FREEZE = 3

export interface NewHabitInput {
  title: string
  tinyStep: string
  cue: string
  emoji: string
  color: HabitColor
  days: Weekday[]
  reminder: string | null
}

interface HabitState {
  habits: Habit[]
  logs: CompletionLog[]
  xp: number
  onboarded: boolean

  // actions
  addHabit: (input: NewHabitInput) => void
  updateHabit: (id: string, patch: Partial<NewHabitInput>) => void
  archiveHabit: (id: string) => void
  deleteHabit: (id: string) => void
  /** 今日の達成をトグル。戻り値はトグル後に「達成済みか」 */
  toggleToday: (habitId: string) => boolean
  /** 「まあいっか（フリーズ）」を使って今日を埋める。成功したら true */
  useFreeze: (habitId: string) => boolean
  setOnboarded: (v: boolean) => void
  importState: (data: {
    habits: Habit[]
    logs: CompletionLog[]
    xp: number
  }) => void
  resetAll: () => void
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],
      xp: 0,
      onboarded: false,

      addHabit: (input) => {
        const habit: Habit = {
          id: uid(),
          title: input.title.trim(),
          tinyStep: input.tinyStep.trim(),
          cue: input.cue.trim(),
          emoji: input.emoji || "⭐",
          color: input.color,
          days: input.days.length ? input.days : [0, 1, 2, 3, 4, 5, 6],
          reminder: input.reminder,
          createdAt: new Date().toISOString(),
          freezeTokens: DEFAULT_FREEZE,
          archived: false,
        }
        set((s) => ({ habits: [...s.habits, habit] }))
      },

      updateHabit: (id, patch) => {
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  ...patch,
                  title: patch.title?.trim() ?? h.title,
                  tinyStep: patch.tinyStep?.trim() ?? h.tinyStep,
                  cue: patch.cue?.trim() ?? h.cue,
                }
              : h
          ),
        }))
      },

      archiveHabit: (id) => {
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, archived: !h.archived } : h
          ),
        }))
      },

      deleteHabit: (id) => {
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          logs: s.logs.filter((l) => l.habitId !== id),
        }))
      },

      toggleToday: (habitId) => {
        const key = todayKey()
        const { logs, habits } = get()
        const exists = logs.find(
          (l) => l.habitId === habitId && l.date === key
        )
        if (exists) {
          // 取り消し。done由来のXPを差し引く（フリーズの取り消しは少額）
          const refund =
            exists.kind === "done" ? XP_PER_DONE : XP_PER_FREEZE
          set((s) => ({
            logs: s.logs.filter(
              (l) => !(l.habitId === habitId && l.date === key)
            ),
            xp: Math.max(0, s.xp - refund),
          }))
          return false
        }
        // 達成を記録。ストリークボーナス込みでXP加算。
        const habit = habits.find((h) => h.id === habitId)
        const doneSet = new Set(
          logs.filter((l) => l.habitId === habitId).map((l) => l.date)
        )
        doneSet.add(key)
        const streak = habit ? calcStreak(doneSet, habit.days) : 1
        const gain = XP_PER_DONE + streakBonus(streak)
        set((s) => ({
          logs: [...s.logs, { habitId, date: key, kind: "done" }],
          xp: s.xp + gain,
        }))
        return true
      },

      useFreeze: (habitId) => {
        const key = todayKey()
        const { logs, habits } = get()
        const habit = habits.find((h) => h.id === habitId)
        if (!habit || habit.freezeTokens <= 0) return false
        const exists = logs.find(
          (l) => l.habitId === habitId && l.date === key
        )
        if (exists) return false
        set((s) => ({
          logs: [...s.logs, { habitId, date: key, kind: "freeze" }],
          xp: s.xp + XP_PER_FREEZE,
          habits: s.habits.map((h) =>
            h.id === habitId
              ? { ...h, freezeTokens: h.freezeTokens - 1 }
              : h
          ),
        }))
        return true
      },

      setOnboarded: (v) => set({ onboarded: v }),

      importState: (data) =>
        set({
          habits: data.habits ?? [],
          logs: data.logs ?? [],
          xp: data.xp ?? 0,
        }),

      resetAll: () =>
        set({ habits: [], logs: [], xp: 0, onboarded: true }),
    }),
    {
      name: "syukan-app-v1",
      version: 1,
    }
  )
)

// --- セレクタ的ヘルパー（コンポーネントから使う） ---------------

/** 指定習慣の達成済み日付Set */
export function doneSetFor(logs: CompletionLog[], habitId: string): Set<string> {
  return new Set(
    logs.filter((l) => l.habitId === habitId).map((l) => l.date)
  )
}

/** 指定日に達成済みか（done/freeze問わず） */
export function isCompletedOn(
  logs: CompletionLog[],
  habitId: string,
  dateKey: string
): CompletionLog["kind"] | null {
  const l = logs.find(
    (x) => x.habitId === habitId && x.date === dateKey
  )
  return l ? l.kind : null
}
