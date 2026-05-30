import { useMemo, useState } from "react"
import type { Habit } from "../types"
import { useHabitStore } from "../store/useHabitStore"
import { todayKey, isScheduledOn, weekdayLabel, weekdayOf } from "../lib/date"
import { getLevelInfo, praiseMessage, allDoneMessage, streakMessage, comfortMessage } from "../lib/level"
import { celebrateOne, celebrateAll } from "../lib/celebrate"
import { calcStreak } from "../lib/date"
import { doneSetFor } from "../store/useHabitStore"
import ProgressRing from "./ProgressRing"
import HabitCard from "./HabitCard"

interface Props {
  onAdd: () => void
  onEdit: (h: Habit) => void
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 5)  return "お疲れ様です"
  if (h < 11) return "おはようございます"
  if (h < 17) return "こんにちは"
  return "こんばんは"
}

export default function TodayView({ onAdd, onEdit }: Props) {
  const habits       = useHabitStore((s) => s.habits)
  const logs         = useHabitStore((s) => s.logs)
  const xp           = useHabitStore((s) => s.xp)
  const reorderHabit = useHabitStore((s) => s.reorderHabit)
  const [toast, setToast] = useState<string | null>(null)

  const today  = todayKey()
  const todays = useMemo(
    () =>
      habits
        .filter((h) => !h.archived && isScheduledOn(h.days, today))
        .sort((a, b) => a.order - b.order),
    [habits, today],
  )

  const doneCount = todays.filter((h) =>
    logs.some((l) => l.habitId === h.id && l.date === today)
  ).length
  const progress = todays.length ? doneCount / todays.length : 0
  const level    = getLevelInfo(xp)
  const allClear = todays.length > 0 && doneCount === todays.length
  const wd       = weekdayOf(today)
  const now      = new Date()

  function showToast(msg: string) {
    setToast(msg)
    window.clearTimeout((showToast as { _t?: number })._t)
    ;(showToast as { _t?: number })._t = window.setTimeout(() => setToast(null), 2800)
  }

  function handleDone(habitId: string, x: number, y: number) {
    const habit = habits.find((h) => h.id === habitId)
    const newDone =
      todays.filter((h) => logs.some((l) => l.habitId === h.id && l.date === today)).length + 1
    const all = newDone >= todays.length && todays.length > 0
    if (all) {
      celebrateAll()
      showToast(allDoneMessage())
    } else {
      celebrateOne(x, y)
      const streak = habit
        ? calcStreak(new Set([...doneSetFor(logs, habitId), today]), habit.days)
        : 0
      const sm = streakMessage(streak)
      showToast(sm ?? praiseMessage())
    }
  }

  return (
    <div className="mx-auto max-w-md pb-24 bg-bmw-canvas">

      {/* ── BMW: white sticky top nav (64px) ── */}
      <header
        className="sticky top-0 z-20 flex h-16 items-center justify-between px-5"
        style={{ background: "#ffffff", borderBottom: "1px solid #e6e6e6" }}
      >
        <div className="flex items-baseline gap-2">
          {/* BMW-style wordmark — no pill, no decoration */}
          <span className="text-[22px]" style={{ fontWeight: 700, color: "#1c69d4" }}>つ</span>
          <span className="text-[22px]" style={{ fontWeight: 700, color: "#262626" }}>づくん</span>
        </div>
        <span
          className="text-[11px]"
          style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9a9a9a" }}
        >
          {now.getMonth() + 1}月{now.getDate()}日 {weekdayLabel(wd)}
        </span>
      </header>

      {/* ── BMW: dark navy hero band (surface-dark #1a2129) ── */}
      <div className="px-5 py-7" style={{ background: "#1a2129" }}>
        <div className="flex items-center gap-6">
          {/* Progress ring — BMW Blue on dark */}
          <ProgressRing progress={progress} size={88} stroke={5} color="#1c69d4">
            <span className="text-[20px] leading-none" style={{ fontWeight: 700, color: "#ffffff" }}>
              {doneCount}
            </span>
            <span className="text-[11px]" style={{ color: "#bbbbbb" }}>/{todays.length}</span>
          </ProgressRing>

          <div className="flex-1">
            <p className="text-[13px]" style={{ fontWeight: 300, color: "#bbbbbb" }}>
              {greeting()}
            </p>
            <p className="mt-0.5 text-[16px]" style={{ fontWeight: 700, color: "#ffffff" }}>
              {allClear
                ? "本日の習慣、完了。"
                : todays.length === 0
                ? "本日の習慣はありません。"
                : `あと ${todays.length - doneCount} 項目`}
            </p>

            {/* XP bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[11px] mb-1">
                <span style={{ fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#bbbbbb" }}>
                  LV.{level.level} {level.title}
                </span>
                <span style={{ fontWeight: 300, color: "#6b6b6b" }}>{xp} XP</span>
              </div>
              <div className="h-[2px]" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${Math.round(level.progress * 100)}%`, background: "#1c69d4" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── section label ── */}
      {todays.length > 0 && (
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid #e6e6e6", background: "#f7f7f7" }}
        >
          <span
            className="text-[11px]"
            style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6b6b6b" }}
          >
            今日の習慣
          </span>
          <span className="text-[11px]" style={{ fontWeight: 300, color: "#9a9a9a" }}>
            {doneCount} / {todays.length} 完了
          </span>
        </div>
      )}

      {/* ── habit list ── */}
      {todays.length === 0 ? (
        <EmptyToday hasAny={habits.some((h) => !h.archived)} onAdd={onAdd} />
      ) : (
        <div>
          {todays.map((h, idx) => (
            <HabitCard
              key={h.id}
              habit={h}
              onDone={handleDone}
              onEdit={onEdit}
              onFreeze={() => showToast(comfortMessage())}
              onMoveUp={() => reorderHabit(h.id, "up")}
              onMoveDown={() => reorderHabit(h.id, "down")}
              isFirst={idx === 0}
              isLast={idx === todays.length - 1}
            />
          ))}
        </div>
      )}

      {/* ── toast ── */}
      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-slide-up">
          <div
            className="max-w-[88vw] px-5 py-3 text-center text-[13px] text-white"
            style={{ background: "#1a2129", fontWeight: 300 }}
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyToday({ hasAny, onAdd }: { hasAny: boolean; onAdd: () => void }) {
  return (
    <div>
      {/* dark band */}
      <div className="px-5 py-12 text-center" style={{ background: "#1a2129" }}>
        <div className="mb-4 text-[56px]">{hasAny ? "🛋️" : "🌱"}</div>
        <p className="text-[20px]" style={{ fontWeight: 700, color: "#ffffff" }}>
          {hasAny ? "本日はお休み" : "最初の習慣を登録する"}
        </p>
        <p className="mt-2 text-[14px]" style={{ fontWeight: 300, color: "#bbbbbb" }}>
          {hasAny ? "ゆっくり休んでください。" : "小さく始めることが、続く習慣の第一歩です。"}
        </p>
        {!hasAny && (
          <button
            onClick={onAdd}
            className="mt-6 px-8 py-3 text-[14px] text-white transition active:opacity-80"
            style={{ background: "#1c69d4", fontWeight: 700, letterSpacing: "0.5px" }}
          >
            習慣を追加する
          </button>
        )}
      </div>
    </div>
  )
}
