import { useEffect, useState } from "react"
import { X, Trash2 } from "lucide-react"
import type { Habit, Weekday, HabitColor } from "../types"
import { useHabitStore, type NewHabitInput } from "../store/useHabitStore"
import {
  TEMPLATES, CUE_SUGGESTIONS, EMOJI_CHOICES, COLOR_CHOICES, suggestTinyStep,
} from "../lib/tinyHabit"
import { weekdayLabel } from "../lib/date"

interface Props { open: boolean; editing: Habit | null; onClose: () => void }

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]
const WEEKDAYS: Weekday[]  = [1, 2, 3, 4, 5]
const EMPTY: NewHabitInput = { title: "", tinyStep: "", cue: "", emoji: "⭐", color: "blue", days: [...ALL_DAYS] }

export default function AddHabitModal({ open, editing, onClose }: Props) {
  const addHabit    = useHabitStore((s) => s.addHabit)
  const updateHabit = useHabitStore((s) => s.updateHabit)
  const deleteHabit = useHabitStore((s) => s.deleteHabit)
  const [form, setForm]           = useState<NewHabitInput>(EMPTY)
  const [showEmoji, setShowEmoji] = useState(false)

  useEffect(() => {
    if (!open) return
    setShowEmoji(false)
    setForm(editing
      ? { title: editing.title, tinyStep: editing.tinyStep, cue: editing.cue, emoji: editing.emoji, color: editing.color, days: [...editing.days] }
      : { ...EMPTY, days: [...ALL_DAYS] })
  }, [open, editing])

  if (!open) return null

  function set<K extends keyof NewHabitInput>(k: K, v: NewHabitInput[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }
  function toggleDay(d: Weekday) {
    setForm((f) => {
      const days = f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d]
      return { ...f, days }
    })
  }
  function save() {
    if (!form.title.trim()) return
    const payload = { ...form, tinyStep: form.tinyStep.trim() || suggestTinyStep(form.title) }
    if (editing) updateHabit(editing.id, payload)
    else addHabit(payload)
    onClose()
  }

  // BMW input style
  const inputStyle = {
    border: "none",
    borderBottom: "1px solid #e6e6e6",
    background: "transparent",
    color: "#262626",
    fontWeight: 300,
    fontSize: "16px",
    outline: "none",
    width: "100%",
    padding: "10px 0",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative z-10 flex max-h-[94vh] w-full flex-col animate-slide-up"
        style={{ background: "#ffffff", maxWidth: 480, margin: "0 auto" }}
      >
        {/* BMW-style header with bottom border */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #e6e6e6" }}
        >
          <h2 className="text-[18px]" style={{ fontWeight: 700, color: "#262626" }}>
            {editing ? "習慣を編集" : "新しい習慣"}
          </h2>
          <button onClick={onClose} className="p-1 transition active:opacity-60" aria-label="閉じる">
            <X size={20} style={{ color: "#6b6b6b" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* テンプレ */}
          {!editing && (
            <div>
              <SectionLabel>テンプレから選ぶ</SectionLabel>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.title}
                    onClick={() => setForm((f) => ({ ...f, title: t.title, tinyStep: t.tinyStep, cue: t.cue, emoji: t.emoji }))}
                    className="shrink-0 px-3 py-2 text-[13px] transition active:bg-bmw-soft"
                    style={{
                      border: "1px solid #e6e6e6",
                      fontWeight: 700,
                      letterSpacing: "0.3px",
                      color: "#262626",
                      background: "#ffffff",
                    }}
                  >
                    {t.emoji} {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* タイトル */}
          <div>
            <SectionLabel>習慣の名前</SectionLabel>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEmoji((v) => !v)}
                className="text-[24px] transition active:scale-90"
                aria-label="絵文字"
              >
                {form.emoji}
              </button>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="例: 運動する"
                style={inputStyle}
              />
            </div>
            {showEmoji && (
              <div className="mt-2 grid grid-cols-8 gap-1 p-3" style={{ background: "#f7f7f7" }}>
                {EMOJI_CHOICES.map((e) => (
                  <button key={e} onClick={() => { set("emoji", e); setShowEmoji(false) }}
                    className="p-1.5 text-[20px] hover:bg-bmw-strong transition active:scale-90">
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 極小ステップ */}
          <div>
            <SectionLabel>極小ステップ（これだけやればOK）</SectionLabel>
            <input
              value={form.tinyStep}
              onChange={(e) => set("tinyStep", e.target.value)}
              placeholder="例: 運動着に着替えるだけ"
              style={inputStyle}
            />
            <p className="mt-1.5 text-[12px]" style={{ fontWeight: 300, color: "#9a9a9a" }}>
              ハードルは低いほど続きます。
            </p>
          </div>

          {/* if-then */}
          <div>
            <SectionLabel>きっかけ（if-then）</SectionLabel>
            <input
              value={form.cue}
              onChange={(e) => set("cue", e.target.value)}
              placeholder="例: 朝起きて顔を洗ったら"
              style={inputStyle}
            />
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {CUE_SUGGESTIONS.map((c) => (
                <button key={c} onClick={() => set("cue", c)}
                  className="shrink-0 px-2.5 py-1 text-[12px] transition active:scale-95"
                  style={{ border: "1px solid #e6e6e6", fontWeight: 300, color: "#6b6b6b" }}>
                  {c}
                </button>
              ))}
            </div>
            {form.cue && form.title && (
              <div
                className="mt-3 px-4 py-3"
                style={{ borderLeft: "3px solid #1c69d4", background: "#f7f7f7" }}
              >
                <p className="text-[13px]" style={{ fontWeight: 300, color: "#3c3c3c" }}>
                  「{form.cue}、{form.tinyStep || form.title}」
                </p>
              </div>
            )}
          </div>

          {/* 曜日 */}
          <div>
            <SectionLabel>実施する曜日</SectionLabel>
            <div className="flex gap-2 mb-3">
              {[
                { label: "毎日", days: ALL_DAYS, check: (d: Weekday[]) => d.length === 7 },
                { label: "平日", days: WEEKDAYS,  check: (d: Weekday[]) => d.length === 5 && WEEKDAYS.every((x) => d.includes(x)) },
                { label: "土日", days: [0, 6] as Weekday[], check: (d: Weekday[]) => d.length === 2 && d.includes(0) && d.includes(6) },
              ].map(({ label, days, check }) => {
                const active = check(form.days)
                return (
                  <button key={label} onClick={() => set("days", [...days])}
                    className="px-3 py-1.5 text-[12px] transition active:opacity-70"
                    style={{
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      background: active ? "#262626" : "#ffffff",
                      color: active ? "#ffffff" : "#262626",
                      border: "1px solid " + (active ? "#262626" : "#e6e6e6"),
                    }}>
                    {label}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-1.5">
              {ALL_DAYS.map((d) => {
                const on = form.days.includes(d)
                return (
                  <button key={d} onClick={() => toggleDay(d)}
                    className="h-9 flex-1 text-[12px] transition active:scale-95"
                    style={{
                      fontWeight: 700,
                      background: on ? "#1c69d4" : "#ffffff",
                      color: on ? "#ffffff" : "#6b6b6b",
                      border: "1px solid " + (on ? "#1c69d4" : "#e6e6e6"),
                    }}>
                    {weekdayLabel(d)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* カラー */}
          <div>
            <SectionLabel>カラー</SectionLabel>
            <div className="flex gap-3">
              {COLOR_CHOICES.map((c) => {
                const sel = form.color === c.key
                return (
                  <button key={c.key} onClick={() => set("color", c.key as HabitColor)} aria-label={c.label}
                    className="h-8 w-8 transition active:scale-90"
                    style={{
                      background: c.swatch,
                      outline: sel ? `2px solid #262626` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                )
              })}
            </div>
          </div>

          {editing && (
            <button
              onClick={() => { if (editing && confirm("削除しますか？")) { deleteHabit(editing.id); onClose() } }}
              className="flex items-center gap-1.5 text-[12px] transition active:opacity-70"
              style={{ fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#dc2626" }}
            >
              <Trash2 size={13} /> 削除
            </button>
          )}
        </div>

        {/* BMW: rectangular primary save button */}
        <div className="px-6 py-4" style={{ borderTop: "1px solid #e6e6e6" }}>
          <button
            onClick={save}
            disabled={!form.title.trim()}
            className="h-12 w-full text-[14px] text-white transition active:opacity-80 disabled:opacity-30"
            style={{ background: "#1c69d4", fontWeight: 700, letterSpacing: "0.5px" }}
          >
            {editing ? "変更を保存する" : "この習慣をはじめる"}
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-2 text-[11px]"
      style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6b6b6b" }}
    >
      {children}
    </p>
  )
}
