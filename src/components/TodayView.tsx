import { useMemo, useState } from "react"
import { Bell } from "lucide-react"
import type { Habit } from "../types"
import { useHabitStore } from "../store/useHabitStore"
import { todayKey, isScheduledOn, weekdayLabel, weekdayOf } from "../lib/date"
import { getLevelInfo, praiseMessage, allDoneMessage, streakMessage } from "../lib/level"
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
  if (h < 5)  return "おつかれさま"
  if (h < 11) return "おはようございます"
  if (h < 17) return "こんにちは"
  return "こんばんは"
}

export default function TodayView({ onAdd, onEdit }: Props) {
  const habits = useHabitStore((s) => s.habits)
  const logs   = useHabitStore((s) => s.logs)
  const xp     = useHabitStore((s) => s.xp)
  const [toast, setToast] = useState<string | null>(null)

  const today  = todayKey()
  const todays = useMemo(
    () => habits.filter((h) => !h.archived && isScheduledOn(h.days, today)),
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
      showToast("🎉 " + allDoneMessage())
    } else {
      celebrateOne(x, y)
      const streak = habit
        ? calcStreak(new Set([...doneSetFor(logs, habitId), today]), habit.days)
        : 0
      const sm = streakMessage(streak)
      showToast(sm ? "🔥 " + sm : praiseMessage())
    }
  }

  return (
    <div className="mx-auto max-w-md pb-24" style={{ background: "#FFFFFF" }}>

      {/* ── YouTube-style header ── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.10)" }}
      >
        <div className="flex items-baseline gap-2">
          {/* YouTube-style wordmark */}
          <span className="text-[20px] font-bold leading-none" style={{ color: "#FF0000" }}>つ</span>
          <span className="text-[20px] font-bold leading-none" style={{ color: "#0F0F0F" }}>づくん</span>
        </div>
        <div className="flex items-center gap-1 text-[12px]" style={{ color: "#606060" }}>
          <Bell size={18} />
        </div>
      </header>

      {/* ── progress summary card ── */}
      <div className="px-4 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <div className="flex items-center gap-4">
          <ProgressRing progress={progress} size={88} stroke={8} color="#FF0000">
            <span className="text-[18px] font-bold leading-none" style={{ color: "#0F0F0F" }}>
              {doneCount}
            </span>
            <span className="text-[11px]" style={{ color: "#606060" }}>
              /{todays.length}
            </span>
          </ProgressRing>

          <div className="flex-1">
            <p className="text-[14px] font-medium" style={{ color: "#0F0F0F" }}>
              {greeting()}、{now.getMonth() + 1}月{now.getDate()}日({weekdayLabel(wd)})
            </p>
            <p className="mt-0.5 text-[13px]" style={{ color: "#606060" }}>
              {allClear
                ? "今日の習慣、ぜんぶ完了！🎉 お疲れさまでした"
                : todays.length === 0
                ? "今日やる習慣はありません。のんびりどうぞ 🛋️"
                : `あと ${todays.length - doneCount} 個。ひとつずつで大丈夫。`}
            </p>

            {/* level bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-[11px]" style={{ color: "#606060" }}>
                <span>
                  Lv.{level.level} {level.title}
                  <span className="ml-1 text-[10px]">
                    （経験値 {xp} XP · 達成するたびに増えます）
                  </span>
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-yt-surface">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(level.progress * 100)}%`, background: "#FF0000" }}
                />
              </div>
              <p className="mt-0.5 text-[10px]" style={{ color: "#606060" }}>
                次のレベルまで {Math.max(0, level.ceil - xp)} XP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── section label ── */}
      {todays.length > 0 && (
        <div className="px-4 py-2">
          <p className="text-[13px] font-medium" style={{ color: "#0F0F0F" }}>
            今日の習慣
            <span className="ml-1 font-normal" style={{ color: "#606060" }}>
              · {todays.length}件
            </span>
          </p>
        </div>
      )}

      {/* ── habit feed ── */}
      {todays.length === 0 ? (
        <EmptyToday hasAny={habits.some((h) => !h.archived)} onAdd={onAdd} />
      ) : (
        <div>
          {todays.map((h) => (
            <HabitCard key={h.id} habit={h} onDone={handleDone} onEdit={onEdit} />
          ))}
        </div>
      )}

      {/* ── toast ── */}
      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-16 z-50 -translate-x-1/2 animate-slide-up">
          <div
            className="max-w-[88vw] rounded-yt px-4 py-2.5 text-center text-[13px] font-medium text-white shadow-md"
            style={{ background: "rgba(15,15,15,0.90)" }}
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
    <div className="px-4 py-16 text-center">
      <div className="mb-4 text-[56px]">{hasAny ? "🛋️" : "🌱"}</div>
      <p className="text-[16px] font-medium" style={{ color: "#0F0F0F" }}>
        {hasAny ? "今日はお休みの日" : "最初の習慣を追加しよう"}
      </p>
      <p className="mt-2 text-[13px]" style={{ color: "#606060" }}>
        {hasAny
          ? "ゆっくり休んでね。また明日。"
          : "「バカみたいに小さく」始めるのが、続けるコツです。"}
      </p>
      {!hasAny && (
        <button
          onClick={onAdd}
          className="mt-5 rounded-yt-pill px-5 py-2.5 text-[14px] font-medium text-white transition active:scale-95"
          style={{ background: "#FF0000" }}
        >
          ＋ 習慣を追加する
        </button>
      )}
    </div>
  )
}
