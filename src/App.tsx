import { useEffect, useRef, useState } from "react"
import type { Habit } from "./types"
import { useHabitStore } from "./store/useHabitStore"
import { todayKey, isScheduledOn } from "./lib/date"
import { initOneSignal } from "./lib/notifications"
import BottomNav, { type Tab } from "./components/BottomNav"
import TodayView from "./components/TodayView"
import StatsView from "./components/StatsView"
import SettingsView from "./components/SettingsView"
import AddHabitModal from "./components/AddHabitModal"
import Onboarding from "./components/Onboarding"

export default function App() {
  const onboarded    = useHabitStore((s) => s.onboarded)
  const setOnboarded = useHabitStore((s) => s.setOnboarded)
  const habits       = useHabitStore((s) => s.habits)
  const logs         = useHabitStore((s) => s.logs)

  const [tab, setTab]         = useState<Tab>("today")
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState<Habit | null>(null)

  // OneSignal の初期化（App ID が設定されている場合のみ）
  useEffect(() => { initOneSignal() }, [])

  function openAdd()      { setEditing(null);  setModal(true) }
  function openEdit(h: Habit) { setEditing(h); setModal(true) }

  // アプリが開いている間だけ動くフォールバックリマインダー
  useInAppReminders(habits, logs)

  return (
    <div className="min-h-full safe-top" style={{ background: "#FFFFFF" }}>
      {!onboarded && <Onboarding onDone={() => setOnboarded(true)} />}

      {tab === "today"    && <TodayView onAdd={openAdd} onEdit={openEdit} />}
      {tab === "stats"    && <StatsView />}
      {tab === "settings" && <SettingsView />}

      <BottomNav tab={tab} onChange={setTab} onAdd={openAdd} />

      <AddHabitModal open={modalOpen} editing={editing} onClose={() => setModal(false)} />
    </div>
  )
}

/** アプリが開いている間だけ有効なリマインダー（OneSignal 未設定時のフォールバック） */
function useInAppReminders(habits: Habit[], logs: { habitId: string; date: string }[]) {
  const fired = useRef<Set<string>>(new Set())

  useEffect(() => {
    function check() {
      if (!("Notification" in window) || Notification.permission !== "granted") return
      const now   = new Date()
      const hhmm  = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`
      const today = todayKey()
      for (const h of habits) {
        if (h.archived || !h.reminder || h.reminder !== hhmm) continue
        if (!isScheduledOn(h.days, today)) continue
        if (logs.some((l) => l.habitId === h.id && l.date === today)) continue
        const key = `${h.id}-${today}-${hhmm}`
        if (fired.current.has(key)) continue
        fired.current.add(key)
        new Notification("つづくん", {
          body: `${h.emoji} ${h.cue ? h.cue + "、" : ""}「${h.tinyStep || h.title}」やってみよ`,
          icon: "./icon.svg",
        })
      }
    }
    const id = window.setInterval(check, 30_000)
    check()
    return () => window.clearInterval(id)
  }, [habits, logs])
}
