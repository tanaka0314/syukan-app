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
  onFreeze: () => void   // まあいっか成功時のコールバック（トースト表示用）
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
  const [editingNote, setEditingNote] = useState(false)
  const [noteText, setNoteText] = useState("")

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
    <div className="bg-yt-bg" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>

      {/* ── thumbnail ── */}
      <div className="relative flex h-[148px] w-full items-center justify-center" style={{ background: col.thumb }}>
        <span className="text-[64px] select-none">{habit.emoji}</span>

        {streak > 0 && (
          <div
            className="absolute left-2 top-2 flex items-center gap-1 rounded-yt px-2 py-0.5 text-[12px] font-medium text-white"
            style={{ background: "rgba(0,0,0,0.70)" }}
          >
            <Flame size={12} />{streak}日連続
          </div>
        )}

        {isDone && (
          <div
            className="absolute right-2 top-2 flex items-center gap-1 rounded-yt px-2 py-0.5 text-[12px] font-medium text-white"
            style={{ background: isFreeze ? "rgba(80,80,80,0.80)" : "rgba(255,0,0,0.85)" }}
          >
            <Check size={12} />{isFreeze ? "まあいっか" : "達成ずみ"}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          {isDone && (
            <div
              className="h-full transition-all duration-500"
              style={{ width: "100%", background: isFreeze ? "#888" : "#FF0000" }}
            />
          )}
        </div>
      </div>

      {/* ── metadata ── */}
      <div className="flex items-start gap-3 px-3 pt-3 pb-1">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[18px]"
          style={{ background: col.thumb }}
        >
          {habit.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="text-[15px] font-medium leading-snug"
            style={{ color: isDone ? "#606060" : "#0F0F0F", textDecoration: isDone ? "line-through" : "none" }}
          >
            {habit.title}
          </h3>
          {habit.cue && (
            <p className="mt-0.5 text-[13px]" style={{ color: "#606060" }}>🪝 {habit.cue}</p>
          )}
          {habit.tinyStep && (
            <p className="mt-0.5 text-[13px]" style={{ color: "#606060" }}>👣 {habit.tinyStep}</p>
          )}
          <p className="mt-1 text-[12px]" style={{ color: "#606060" }}>
            {streak > 0 ? `🔥 ${streak}日連続達成中` : "まだ連続なし"}
            {" · "}{isDone ? (isFreeze ? "まあいっかを使用" : "本日達成！") : "未達成"}
          </p>
        </div>
        <button
          onClick={() => onEdit(habit)}
          aria-label="編集"
          className="mt-0.5 rounded-full p-1.5 transition active:bg-yt-surface"
          style={{ color: "#606060" }}
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* ── action bar ── */}
      <div className="flex items-center gap-0 px-3 pb-2 pt-1">
        {/* 達成 */}
        <button
          onClick={handleToggle}
          className="flex items-center gap-1.5 rounded-yt-pill px-3.5 py-1.5 text-[13px] font-medium transition active:scale-95"
          style={{
            background: isDone && !isFreeze ? "#FF0000" : "#F2F2F2",
            color: isDone && !isFreeze ? "#fff" : "#0F0F0F",
          }}
          aria-label={isDone ? "達成を取り消す" : "達成にする"}
        >
          <Check size={14} strokeWidth={isDone ? 3 : 2} className={isDone && !isFreeze ? "animate-check-pop" : ""} />
          {isDone && !isFreeze ? "達成ずみ！" : "達成する"}
        </button>

        <div className="w-2" />

        {/* まあいっか */}
        {!isDone && (
          <div className="relative flex items-center">
            <button
              onClick={handleFreeze}
              disabled={habit.freezeTokens <= 0}
              className="flex items-center gap-1.5 rounded-yt-pill px-3.5 py-1.5 text-[13px] font-medium transition active:scale-95 disabled:opacity-40"
              style={{ background: "#F2F2F2", color: "#0F0F0F" }}
            >
              <Snowflake size={14} />まあいっか
            </button>
            <button
              onClick={() => setShowFreezeInfo((v) => !v)}
              className="ml-1 p-1"
              style={{ color: "#606060" }}
              aria-label="まあいっかとは？"
            >
              <Info size={14} />
            </button>
          </div>
        )}

        <div className="flex-1" />

        {/* 残トークン */}
        {!isDone && (
          <span className="mr-2 text-[12px]" style={{ color: "#606060" }}>残{habit.freezeTokens}回</span>
        )}

        {/* ↑↓ 並び替えボタン */}
        <button
          onClick={onMoveUp}
          disabled={isFirst || !onMoveUp}
          aria-label="上に移動"
          className="rounded p-0.5 transition active:scale-90 disabled:opacity-20"
          style={{ color: "#606060" }}
        >
          <ChevronUp size={18} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast || !onMoveDown}
          aria-label="下に移動"
          className="rounded p-0.5 transition active:scale-90 disabled:opacity-20"
          style={{ color: "#606060" }}
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {/* ── まあいっか説明 ── */}
      {showFreezeInfo && (
        <div className="mx-3 mb-3 rounded-yt p-3 text-[13px] leading-relaxed" style={{ background: "#F2F2F2", color: "#606060" }}>
          <p className="font-medium" style={{ color: "#0F0F0F" }}>❄️ まあいっかとは？</p>
          <p className="mt-1">「どうしても無理だった日」に使えるサボり免罪符です。押すと<strong>連続記録が途切れません</strong>。</p>
          <p className="mt-1">完璧じゃなくていい。続けることのほうが大切です。</p>
          <p className="mt-1">現在 <strong>{habit.freezeTokens}回分</strong>残っています（毎月3回に補充されます）。</p>
        </div>
      )}

      {/* ── ひとこと記録（達成時のみ、freezeは除く） ── */}
      {isDone && !isFreeze && (
        <div className="mx-3 mb-3">
          {editingNote ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={noteText}
                onChange={(e) => setNoteText(e.target.value.slice(0, 100))}
                placeholder="今日の一言（100字まで）"
                className="flex-1 rounded-yt px-3 py-1.5 text-[13px] outline-none"
                style={{ background: "#F2F2F2", border: "1px solid rgba(0,0,0,0.10)", color: "#0F0F0F" }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveNote()}
              />
              <button
                onClick={handleSaveNote}
                className="rounded-yt px-3 py-1.5 text-[13px] font-medium text-white"
                style={{ background: "#FF0000" }}
              >
                保存
              </button>
            </div>
          ) : todayLog?.note ? (
            <button
              onClick={startEditNote}
              className="w-full rounded-yt px-3 py-2 text-left text-[13px] transition active:bg-yt-surface"
              style={{ background: "#F2F2F2", color: "#606060" }}
            >
              💬 {todayLog.note}
            </button>
          ) : (
            <button
              onClick={startEditNote}
              className="text-[12px] transition active:opacity-60"
              style={{ color: "#606060" }}
            >
              💬 ひとこと残す（任意）
            </button>
          )}
        </div>
      )}
    </div>
  )
}
