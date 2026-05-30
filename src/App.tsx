import { useState } from "react"
import type { Habit } from "./types"
import { useHabitStore } from "./store/useHabitStore"
import BottomNav, { type Tab } from "./components/BottomNav"
import TodayView from "./components/TodayView"
import StatsView from "./components/StatsView"
import SettingsView from "./components/SettingsView"
import AddHabitModal from "./components/AddHabitModal"
import Onboarding from "./components/Onboarding"

export default function App() {
  const onboarded    = useHabitStore((s) => s.onboarded)
  const setOnboarded = useHabitStore((s) => s.setOnboarded)

  const [tab, setTab]         = useState<Tab>("today")
  const [modalOpen, setModal] = useState(false)
  const [editing, setEditing] = useState<Habit | null>(null)

  function openAdd()           { setEditing(null);  setModal(true) }
  function openEdit(h: Habit)  { setEditing(h);     setModal(true) }

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
