import { Home, BarChart3, Settings, Plus } from "lucide-react"

export type Tab = "today" | "stats" | "settings"

interface Props {
  tab: Tab
  onChange: (t: Tab) => void
  onAdd: () => void
}

export default function BottomNav({ tab, onChange, onAdd }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 safe-bottom bg-bmw-canvas"
      style={{ borderTop: "1px solid #e6e6e6" }}
    >
      <div className="mx-auto flex max-w-md items-stretch">

        <NavItem label="HOME" active={tab === "today"} onClick={() => onChange("today")}>
          <Home size={20} strokeWidth={tab === "today" ? 2.5 : 1.5} />
        </NavItem>

        <NavItem label="記録" active={tab === "stats"} onClick={() => onChange("stats")}>
          <BarChart3 size={20} strokeWidth={tab === "stats" ? 2.5 : 1.5} />
        </NavItem>

        {/* BMW-style primary CTA button — rectangular, BMW Blue */}
        <button
          onClick={onAdd}
          aria-label="習慣を追加"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-3 transition-opacity active:opacity-70"
          style={{ background: "#1c69d4" }}
        >
          <Plus size={20} color="#ffffff" strokeWidth={2} />
          <span className="label-upper text-[9px] text-white" style={{ letterSpacing: "1px" }}>
            追加
          </span>
        </button>

        <NavItem label="設定" active={tab === "settings"} onClick={() => onChange("settings")}>
          <Settings size={20} strokeWidth={tab === "settings" ? 2.5 : 1.5} />
        </NavItem>

      </div>
    </nav>
  )
}

function NavItem({
  label, active, onClick, children,
}: {
  label: string; active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 py-3 transition-opacity active:opacity-60"
      aria-label={label}
    >
      <span style={{ color: active ? "#1c69d4" : "#6b6b6b" }}>{children}</span>
      <span
        className="text-[9px] font-bold"
        style={{
          color: active ? "#1c69d4" : "#6b6b6b",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </button>
  )
}
