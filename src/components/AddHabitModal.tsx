import { useEffect, useState } from "react"
import { X, Trash2, Wand2 } from "lucide-react"
import type { Habit, Weekday, HabitColor } from "../types"
import { useHabitStore, type NewHabitInput } from "../store/useHabitStore"
import {
  TEMPLATES, CUE_SUGGESTIONS, EMOJI_CHOICES, COLOR_CHOICES, suggestTinyStep,
} from "../lib/tinyHabit"
import { weekdayLabel } from "../lib/date"

interface Props {
  open: boolean
  editing: Habit | null
  onClose: () => void
}

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]
const WEEKDAYS: Weekday[]  = [1, 2, 3, 4, 5]
const EMPTY: NewHabitInput = { title: "", tinyStep: "", cue: "", emoji: "⭐", color: "brand", days: [...ALL_DAYS] }

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

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 flex max-h-[94vh] w-full flex-col animate-slide-up"
        style={{ background: "#FFFFFF", borderRadius: "16px 16px 0 0", maxWidth: 480, margin: "0 auto" }}
      >
        {/* drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-yt-surface2" />
        </div>

        {/* header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <h2 className="text-[17px] font-medium" style={{ color: "#0F0F0F" }}>
            {editing ? "習慣を編集" : "新しい習慣を追加"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 transition active:bg-yt-surface"
            aria-label="閉じる"
          >
            <X size={20} style={{ color: "#606060" }} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">

          {/* テンプレ */}
          {!editing && (
            <div>
              <Label icon={<Wand2 size={13} />}>テンプレから選ぶ（かんたん）</Label>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.title}
                    onClick={() => setForm((f) => ({ ...f, title: t.title, tinyStep: t.tinyStep, cue: t.cue, emoji: t.emoji }))}
                    className="flex shrink-0 items-center gap-1.5 rounded-yt-pill px-3 py-1.5 text-[13px] font-medium transition active:scale-95"
                    style={{ background: "#F2F2F2", color: "#0F0F0F" }}
                  >
                    {t.emoji} {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* タイトル */}
          <div>
            <Label>習慣の名前</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEmoji((v) => !v)}
                className="h-11 w-11 shrink-0 rounded-yt text-[22px] transition active:scale-90"
                style={{ background: "#F2F2F2", border: "1px solid rgba(0,0,0,0.10)" }}
              >
                {form.emoji}
              </button>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="例: 運動する"
                className="h-11 flex-1 rounded-yt px-3 text-[15px] outline-none"
                style={{ background: "#F2F2F2", border: "1px solid rgba(0,0,0,0.10)", color: "#0F0F0F" }}
              />
            </div>
            {showEmoji && (
              <div className="mt-2 grid grid-cols-8 gap-1 rounded-yt p-2" style={{ background: "#F2F2F2" }}>
                {EMOJI_CHOICES.map((e) => (
                  <button key={e} onClick={() => { set("emoji", e); setShowEmoji(false) }}
                    className="rounded p-1.5 text-[20px] hover:bg-yt-surface2 active:scale-90 transition">
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 極小ステップ */}
          <div>
            <Label>👣 極小ステップ</Label>
            <input
              value={form.tinyStep}
              onChange={(e) => set("tinyStep", e.target.value)}
              placeholder="例: 運動着に着替えるだけ"
              className="h-11 w-full rounded-yt px-3 text-[15px] outline-none"
              style={{ background: "#F2F2F2", border: "1px solid rgba(0,0,0,0.10)", color: "#0F0F0F" }}
            />
            <p className="mt-1 text-[12px]" style={{ color: "#606060" }}>
              ハードルは低いほど続きます。「バカみたい」でちょうどいい。
            </p>
          </div>

          {/* if-then */}
          <div>
            <Label>🪝 きっかけ（いつやる？）</Label>
            <input
              value={form.cue}
              onChange={(e) => set("cue", e.target.value)}
              placeholder="例: 朝起きて顔を洗ったら"
              className="h-11 w-full rounded-yt px-3 text-[15px] outline-none"
              style={{ background: "#F2F2F2", border: "1px solid rgba(0,0,0,0.10)", color: "#0F0F0F" }}
            />
            <div className="mt-2 flex gap-1.5 overflow-x-auto">
              {CUE_SUGGESTIONS.map((c) => (
                <button key={c} onClick={() => set("cue", c)}
                  className="shrink-0 rounded-yt-pill px-2.5 py-1 text-[12px] transition active:scale-95"
                  style={{ background: "#F2F2F2", color: "#606060" }}>
                  {c}
                </button>
              ))}
            </div>
            {form.cue && form.title && (
              <p className="mt-2 rounded-yt px-3 py-2 text-[13px]" style={{ background: "#FFF3F3", color: "#CC0000" }}>
                「{form.cue}、{form.tinyStep || form.title}」
              </p>
            )}
          </div>

          {/* 曜日 */}
          <div>
            <Label>やる曜日</Label>
            <div className="mb-2 flex gap-2">
              {[
                { label: "毎日", days: ALL_DAYS, check: (d: Weekday[]) => d.length === 7 },
                { label: "平日", days: WEEKDAYS,  check: (d: Weekday[]) => d.length === 5 && WEEKDAYS.every((x) => d.includes(x)) },
                { label: "土日", days: [0, 6] as Weekday[], check: (d: Weekday[]) => d.length === 2 && d.includes(0) && d.includes(6) },
              ].map(({ label, days, check }) => {
                const active = check(form.days)
                return (
                  <button key={label} onClick={() => set("days", [...days])}
                    className="rounded-yt-pill px-3 py-1.5 text-[13px] font-medium transition active:scale-95"
                    style={{ background: active ? "#0F0F0F" : "#F2F2F2", color: active ? "#fff" : "#0F0F0F" }}>
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
                    className="h-9 flex-1 rounded-yt text-[13px] font-medium transition active:scale-95"
                    style={{ background: on ? "#FF0000" : "#F2F2F2", color: on ? "#fff" : "#606060" }}>
                    {weekdayLabel(d)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 色 */}
          <div>
            <Label>カラー</Label>
            <div className="flex gap-3">
              {COLOR_CHOICES.map((c) => {
                const selected = form.color === c.key
                return (
                  <button key={c.key} onClick={() => set("color", c.key as HabitColor)} aria-label={c.label}
                    className="h-8 w-8 rounded-full transition active:scale-90"
                    style={{ background: c.swatch, outline: selected ? `2px solid #FF0000` : "none", outlineOffset: "2px" }}
                  />
                )
              })}
            </div>
          </div>

          {editing && (
            <button onClick={() => {
              if (editing && confirm("削除しますか？記録も消えます。")) { deleteHabit(editing.id); onClose() }
            }}
              className="flex items-center gap-1.5 text-[13px]" style={{ color: "#FF0000" }}>
              <Trash2 size={14} /> この習慣を削除する
            </button>
          )}
        </div>

        {/* save */}
        <div className="px-4 py-3 safe-bottom" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <button onClick={save} disabled={!form.title.trim()}
            className="h-11 w-full rounded-yt text-[15px] font-medium text-white transition active:scale-95 disabled:opacity-40"
            style={{ background: "#FF0000" }}>
            {editing ? "保存する" : "この習慣をはじめる"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Label({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <p className="mb-1.5 flex items-center gap-1 text-[13px] font-medium" style={{ color: "#606060" }}>
      {icon}{children}
    </p>
  )
}
