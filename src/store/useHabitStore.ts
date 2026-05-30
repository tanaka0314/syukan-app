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
}

interface HabitState {
  habits: Habit[]
  logs: CompletionLog[]
  xp: number
  onboarded: boolean
  /** フリーズトークン最終補充月 "YYYY-MM" */
  lastReplenishMonth: string

  addHabit: (input: NewHabitInput) => void
  updateHabit: (id: string, patch: Partial<NewHabitInput>) => void
  archiveHabit: (id: string) => void
  deleteHabit: (id: string) => void
  /** 今日の達成をトグル。戻り値は達成済みになったか */
  toggleToday: (habitId: string) => boolean
  /** まあいっかを使う。成功したら true */
  useFreeze: (habitId: string) => boolean
  /** 達成ログにひとこと保存 */
  saveNote: (habitId: string, date: string, note: string) => void
  /** 表示順を上下に移動（archived=false の習慣のみ対象） */
  reorderHabit: (id: string, direction: "up" | "down") => void
  /** 毎月フリーズトークンを 3 に補充 */
  replenishFreeze: () => void
  setOnboarded: (v: boolean) => void
  importState: (data: { habits: Habit[]; logs: CompletionLog[]; xp: number }) => void
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
      lastReplenishMonth: "",

      addHabit: (input) => {
        const { habits } = get()
        const habit: Habit = {
          id: uid(),
          title: input.title.trim(),
          tinyStep: input.tinyStep.trim(),
          cue: input.cue.trim(),
          emoji: input.emoji || "⭐",
          color: input.color,
          days: input.days.length ? input.days : [0, 1, 2, 3, 4, 5, 6],
          order: habits.filter((h) => !h.archived).length,
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
              : h,
          ),
        }))
      },

      archiveHabit: (id) => {
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, archived: !h.archived } : h,
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
        const exists = logs.find((l) => l.habitId === habitId && l.date === key)
        if (exists) {
          const refund = exists.kind === "done" ? XP_PER_DONE : XP_PER_FREEZE
          set((s) => ({
            logs: s.logs.filter((l) => !(l.habitId === habitId && l.date === key)),
            xp: Math.max(0, s.xp - refund),
          }))
          return false
        }
        const habit = habits.find((h) => h.id === habitId)
        const doneSet = new Set(
          logs.filter((l) => l.habitId === habitId).map((l) => l.date),
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
        if (logs.find((l) => l.habitId === habitId && l.date === key)) return false
        set((s) => ({
          logs: [...s.logs, { habitId, date: key, kind: "freeze" }],
          xp: s.xp + XP_PER_FREEZE,
          habits: s.habits.map((h) =>
            h.id === habitId ? { ...h, freezeTokens: h.freezeTokens - 1 } : h,
          ),
        }))
        return true
      },

      saveNote: (habitId, date, note) => {
        set((s) => ({
          logs: s.logs.map((l) =>
            l.habitId === habitId && l.date === date
              ? { ...l, note: note.trim().slice(0, 100) }
              : l,
          ),
        }))
      },

      reorderHabit: (id, direction) => {
        const { habits } = get()
        // アーカイブを除いた習慣を order 昇順で並べる
        const active = [...habits.filter((h) => !h.archived)].sort(
          (a, b) => a.order - b.order,
        )
        const idx = active.findIndex((h) => h.id === id)
        if (idx === -1) return
        const swapIdx = direction === "up" ? idx - 1 : idx + 1
        if (swapIdx < 0 || swapIdx >= active.length) return

        // order 値を交換
        const idA = active[idx].id
        const idB = active[swapIdx].id
        const orderA = active[idx].order
        const orderB = active[swapIdx].order
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id === idA) return { ...h, order: orderB }
            if (h.id === idB) return { ...h, order: orderA }
            return h
          }),
        }))
      },

      replenishFreeze: () => {
        const month = new Date().toISOString().slice(0, 7) // "YYYY-MM"
        const { lastReplenishMonth } = get()
        if (lastReplenishMonth === month) return
        set((s) => ({
          habits: s.habits.map((h) => ({ ...h, freezeTokens: DEFAULT_FREEZE })),
          lastReplenishMonth: month,
        }))
      },

      setOnboarded: (v) => set({ onboarded: v }),

      importState: (data) =>
        set({
          habits: data.habits ?? [],
          logs: data.logs ?? [],
          xp: data.xp ?? 0,
        }),

      resetAll: () =>
        set({ habits: [], logs: [], xp: 0, onboarded: true, lastReplenishMonth: "" }),
    }),
    { name: "syukan-app-v1", version: 1 },
  ),
)

export function doneSetFor(logs: CompletionLog[], habitId: string): Set<string> {
  return new Set(logs.filter((l) => l.habitId === habitId).map((l) => l.date))
}

export function isCompletedOn(
  logs: CompletionLog[],
  habitId: string,
  dateKey: string,
): CompletionLog["kind"] | null {
  const l = logs.find((x) => x.habitId === habitId && x.date === dateKey)
  return l ? l.kind : null
}
