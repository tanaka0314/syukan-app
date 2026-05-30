import { Home, BarChart3, Settings, PlusCircle } from "lucide-react"

export type Tab = "today" | "stats" | "settings"

interface Props {
  tab: Tab
  onChange: (t: Tab) => void
  onAdd: () => void
}

export default function BottomNav({ tab, onChange, onAdd }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 safe-bottom bg-yt-bg"
      style={{ borderTop: "1px solid rgba(0,0,0,0.10)" }}
    >
      <div className="mx-auto flex max-w-md items-center">

        <NavItem label="ホーム"  active={tab === "today"}    onClick={() => onChange("today")}>
          <Home size={22} />
        </NavItem>

        <NavItem label="記録" active={tab === "stats"}    onClick={() => onChange("stats")}>
          <BarChart3 size={22} />
        </NavItem>

        {/* YouTube-style center create button */}
        <button
          onClick={onAdd}
          aria-label="習慣を追加"
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-opacity active:opacity-60"
        >
          <PlusCircle size={26} className="text-yt-red" strokeWidth={1.8} />
          <span className="text-[10px] text-yt-sub">追加</span>
        </button>

        <NavItem label="設定"   active={tab === "settings"} onClick={() => onChange("settings")}>
          <Settings size={22} />
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
      className="flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-opacity active:opacity-60"
      aria-label={label}
    >
      <span style={{ color: active ? "#FF0000" : "#606060" }}>{children}</span>
      <span
        className="text-[10px]"
        style={{ color: active ? "#FF0000" : "#606060", fontWeight: active ? 500 : 400 }}
      >
        {label}
      </span>
    </button>
  )
}
