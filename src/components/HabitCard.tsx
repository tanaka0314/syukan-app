import { useMemo, useState } from "react"
import { Check, Flame, Snowflake, MoreVertical, Info, ChevronUp, ChevronDown } from "lucide-react"
import type { Habit } from "../types"
import { useHabitStore, doneSetFor } from "../store/useHabitStore"
import { calcStreak, todayKey } from "../lib/date"
import { colorOf } from "../lib/colors"

interface Props {
  habit: Habit
  onDone: (habitId: string, x: number, y: number) => void
  onEdit: (habit: Habit) => void
  onFreeze: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst: boolean
  isLast: boolean
}

export default function HabitCard({
  habit, onDone, onEdit, onFreeze, onMoveUp, onMoveDown, isFirst, isLast,
}: Props) {
  const logs        = useHabitStore((s) => s.logs)
  const toggleToday = useHabitStore((s) => s.toggleToday)
  const useFreeze   = useHabitStore((s) => s.useFreeze)
  const saveNote    = useHabitStore((s) => s.saveNote)

  const today    = todayKey()
  const todayLog = logs.find((l) => l.habitId === habit.id && l.date === today)
  const isDone   = !!todayLog
  const isFreeze = todayLog?.kind === "freeze"

  const [showFreezeInfo, setShowFreezeInfo] = useState(false)
  const [editingNote, setEditingNote]       = useState(false)
  const [noteText, setNoteText]             = useState("")

  const streak = useMemo(
    () => calcStreak(doneSetFor(logs, habit.id), habit.days),
    [logs, habit.id, habit.days],
  )
  const col = colorOf(habit.color)

  function handleToggle(e: React.MouseEvent) {
    const nowDone = toggleToday(habit.id)
    if (nowDone) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      onDone(
        habit.id,
        (rect.left + rect.width / 2) / window.innerWidth,
        (rect.top + rect.height / 2) / window.innerHeight,
      )
      setEditingNote(false)
    }
  }

  function handleFreeze() {
    const ok = useFreeze(habit.id)
    if (ok) onFreeze()
  }

  function handleSaveNote() {
    saveNote(habit.id, today, noteText)
    setEditingNote(false)
  }

  function startEditNote() {
    setNoteText(todayLog?.note ?? "")
    setEditingNote(true)
  }

  return (
    <div
      className="relative bg-bmw-canvas animate-pop-in"
      style={{ borderBottom: "1px solid #e6e6e6" }}
    >
      {/* BMW: habit accent — 3px left border strip (decorative only) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: col.accent }}
      />

      {/* ── photo plate (model-card-photo style) ── */}
      <div
        className="relative flex h-[140px] w-full items-center justify-center"
        style={{ background: "#fafafa" }} // BMW surface-card
      >
        <span className="text-[60px] select-none">{habit.emoji}</span>

        {/* streak badge — top-left */}
        {streak > 0 && (
          <div
            className="absolute left-3 top-3 flex items-center gap-1 px-2 py-0.5"
            style={{ background: "#1a2129", color: "#bbbbbb" }}
          >
            <Flame size={11} />
            <span className="text-[11px] font-bold" style={{ letterSpacing: "0.5px" }}>
              {streak}日
            </span>
          </div>
        )}

        {/* done indicator — top-right */}
        {isDone && (
          <div
            className="absolute right-3 top-3 flex items-center gap-1 px-2 py-0.5"
            style={{
              background: isFreeze ? "#e6e6e6" : "#1c69d4",
              color: isFreeze ? "#6b6b6b" : "#ffffff",
            }}
          >
            <Check size={11} />
            <span className="text-[11px] font-bold" style={{ letterSpacing: "0.5px" }}>
              {isFreeze ? "SKIP" : "DONE"}
            </span>
          </div>
        )}

        {/* BMW: no shadow. Depth from color contrast only. */}
        {/* Progress bar at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{ background: isDone ? (isFreeze ? "#cccccc" : "#1c69d4") : "#e6e6e6" }}
        />
      </div>

      {/* ── card body (model-card style) ── */}
      <div className="pl-5 pr-4 pt-3 pb-2">

        {/* title: BMW Type Next / 700 → Inter 700 */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-[18px] leading-snug"
            style={{
              fontWeight: 700,
              color: isDone ? "#9a9a9a" : "#262626",
              textDecoration: isDone ? "line-through" : "none",
            }}
          >
            {habit.title}
          </h3>
          <button
            onClick={() => onEdit(habit)}
            aria-label="編集"
            className="mt-0.5 shrink-0 p-1 transition active:opacity-60"
            style={{ color: "#9a9a9a" }}
          >
            <MoreVertical size={16} />
          </button>
        </div>

        {/* sub-copy: Light 300 */}
        {habit.cue && (
          <p className="mt-0.5 text-[14px]" style={{ fontWeight: 300, color: "#6b6b6b" }}>
            🪝 {habit.cue}
          </p>
        )}
        {habit.tinyStep && (
          <p className="mt-0.5 text-[14px]" style={{ fontWeight: 300, color: "#6b6b6b" }}>
            👣 {habit.tinyStep}
          </p>
        )}

        {/* meta: UPPERCASE label */}
        <p
          className="mt-1.5 text-[11px]"
          style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9a9a9a" }}
        >
          {streak > 0 ? `${streak}日連続` : "連続なし"}
          {" · "}
          {isDone ? (isFreeze ? "スキップ使用" : "本日達成") : "未達成"}
        </p>
      </div>

      {/* ── action row ── */}
      <div className="flex items-stretch gap-0 pl-5 pr-4 pb-3">

        {/* 達成 — BMW primary button (rectangular, BMW Blue) */}
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 px-5 py-2.5 transition active:opacity-80"
          style={{
            background: isDone && !isFreeze ? "#1c69d4" : "#ffffff",
            color:       isDone && !isFreeze ? "#ffffff" : "#262626",
            border:      isDone && !isFreeze ? "none" : "1px solid #cccccc",
            fontWeight: 700,
            fontSize: "13px",
            letterSpacing: "0.5px",
          }}
          aria-label={isDone ? "達成を取り消す" : "達成にする"}
        >
          <Check size={13} strokeWidth={2.5} className={isDone && !isFreeze ? "animate-check-pop" : ""} />
          {isDone && !isFreeze ? "DONE" : "達成する"}
        </button>

        <div className="w-2" />

        {/* まあいっか — BMW secondary button */}
        {!isDone && (
          <>
            <button
              onClick={handleFreeze}
              disabled={habit.freezeTokens <= 0}
              className="flex items-center gap-1.5 px-4 py-2.5 transition active:opacity-70 disabled:opacity-30"
              style={{
                background: "transparent",
                color: "#6b6b6b",
                border: "1px solid #e6e6e6",
                fontWeight: 700,
                fontSize: "13px",
                letterSpacing: "0.5px",
              }}
            >
              <Snowflake size={12} />
              SKIP
            </button>
            <button
              onClick={() => setShowFreezeInfo((v) => !v)}
              className="ml-1 px-1.5 py-2.5 transition active:opacity-60"
              style={{ color: "#9a9a9a" }}
              aria-label="まあいっかとは？"
            >
              <Info size={13} />
            </button>
          </>
        )}

        <div className="flex-1" />

        {/* 残トークン */}
        {!isDone && (
          <span
            className="self-center mr-1 text-[11px]"
            style={{ fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#9a9a9a" }}
          >
            {habit.freezeTokens}/3
          </span>
        )}

        {/* ↑↓ */}
        <button
          onClick={onMoveUp}
          disabled={isFirst || !onMoveUp}
          className="self-center p-0.5 transition active:scale-90 disabled:opacity-20"
          style={{ color: "#9a9a9a" }}
          aria-label="上に移動"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast || !onMoveDown}
          className="self-center p-0.5 transition active:scale-90 disabled:opacity-20"
          style={{ color: "#9a9a9a" }}
          aria-label="下に移動"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* まあいっか説明 */}
      {showFreezeInfo && (
        <div
          className="mx-5 mb-3 p-3"
          style={{ background: "#f7f7f7", borderLeft: "3px solid #1c69d4" }}
        >
          <p className="text-[13px]" style={{ fontWeight: 700, letterSpacing: "0.5px", color: "#262626" }}>
            SKIP とは？
          </p>
          <p className="mt-1 text-[13px]" style={{ fontWeight: 300, color: "#3c3c3c", lineHeight: 1.55 }}>
            どうしても無理な日に使える機能です。連続記録を途切れさせません。
            完璧を目指さない — それが継続のコツです。
            残 <strong style={{ fontWeight: 700 }}>{habit.freezeTokens}回</strong>（毎月3回補充）。
          </p>
        </div>
      )}

      {/* ひとこと記録（達成時のみ） */}
      {isDone && !isFreeze && (
        <div className="px-5 pb-3">
          {editingNote ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={noteText}
                onChange={(e) => setNoteText(e.target.value.slice(0, 100))}
                placeholder="今日のひとこと（100字まで）"
                className="flex-1 px-3 py-2 text-[13px] outline-none"
                style={{
                  border: "1px solid #e6e6e6",
                  borderBottom: "2px solid #1c69d4",
                  fontWeight: 300,
                  color: "#262626",
                  background: "#ffffff",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveNote()}
              />
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 text-[12px] text-white transition active:opacity-80"
                style={{ background: "#1c69d4", fontWeight: 700, letterSpacing: "0.5px" }}
              >
                保存
              </button>
            </div>
          ) : todayLog?.note ? (
            <button
              onClick={startEditNote}
              className="w-full text-left text-[13px] transition active:opacity-70"
              style={{ fontWeight: 300, color: "#6b6b6b" }}
            >
              {todayLog.note}
            </button>
          ) : (
            <button
              onClick={startEditNote}
              className="text-[12px] transition active:opacity-60"
              style={{ fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#9a9a9a" }}
            >
              + ひとこと残す
            </button>
          )}
        </div>
      )}
    </div>
  )
}
