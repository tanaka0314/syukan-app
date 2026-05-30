import { useRef } from "react"
import { Download, Upload, Trash2, ChevronRight } from "lucide-react"
import { useHabitStore } from "../store/useHabitStore"

export default function SettingsView() {
  const habits       = useHabitStore((s) => s.habits)
  const logs         = useHabitStore((s) => s.logs)
  const xp           = useHabitStore((s) => s.xp)
  const importState  = useHabitStore((s) => s.importState)
  const resetAll     = useHabitStore((s) => s.resetAll)
  const archiveHabit = useHabitStore((s) => s.archiveHabit)

  const fileRef  = useRef<HTMLInputElement>(null)
  const archived = habits.filter((h) => h.archived)

  function handleExport() {
    const blob = new Blob(
      [JSON.stringify({ habits, logs, xp, exportedAt: new Date() }, null, 2)],
      { type: "application/json" },
    )
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `syukan-backup-${new Date().toISOString().slice(0, 10)}.json`,
    })
    a.click()
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed.habits)) throw new Error()
        if (confirm("現在のデータを上書きして読み込みます。")) {
          importState({ habits: parsed.habits, logs: parsed.logs ?? [], xp: parsed.xp ?? 0 })
          alert("読み込みました。")
        }
      } catch { alert("ファイルを読み込めませんでした。") }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <div className="mx-auto max-w-md pb-28 bg-bmw-canvas">

      <header
        className="sticky top-0 z-20 flex h-16 items-center px-5"
        style={{ background: "#ffffff", borderBottom: "1px solid #e6e6e6" }}
      >
        <h1 className="text-[18px]" style={{ fontWeight: 700, color: "#262626" }}>設定</h1>
      </header>

      {/* BMW dark hero band: about */}
      <div className="px-6 py-8" style={{ background: "#1a2129" }}>
        <p
          className="mb-1 text-[11px]"
          style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6b6b6b" }}
        >
          About
        </p>
        <p className="text-[28px]" style={{ fontWeight: 700, color: "#ffffff" }}>つづくん</p>
        <p className="mt-3 text-[14px] leading-relaxed" style={{ fontWeight: 300, color: "#bbbbbb" }}>
          「がんばり」ではなく「仕組み」で習慣を続けるために設計されたアプリです。
          極小ステップ・if-then・連続記録・まあいっか機能——
          すべて行動科学の知見に基づいています。
        </p>
        <p className="mt-3 text-[12px]" style={{ fontWeight: 300, color: "#6b6b6b" }}>
          データはこの端末のみに保存されます。
        </p>
      </div>

      <Section title="データ管理">
        <Row icon={<Download size={16} style={{ color: "#1c69d4" }} />}
          title="バックアップを書き出す" desc="JSONファイルとして保存します"
          onClick={handleExport} />
        <Row icon={<Upload size={16} style={{ color: "#1c69d4" }} />}
          title="バックアップから読み込む" desc="以前のバックアップを復元します"
          onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
      </Section>

      {archived.length > 0 && (
        <Section title="お休み中の習慣">
          {archived.map((h) => (
            <div key={h.id} className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid #e6e6e6" }}>
              <span className="text-xl">{h.emoji}</span>
              <span className="flex-1 truncate text-[15px]" style={{ fontWeight: 700, color: "#262626" }}>{h.title}</span>
              <button onClick={() => archiveHabit(h.id)}
                className="px-4 py-1.5 text-[12px] text-white transition active:opacity-80"
                style={{ background: "#1c69d4", fontWeight: 700, letterSpacing: "0.5px" }}>
                再開する
              </button>
            </div>
          ))}
        </Section>
      )}

      <Section title="その他">
        <Row icon={<Trash2 size={16} style={{ color: "#dc2626" }} />}
          title="すべてリセット" desc="習慣と記録をすべて削除します（取り消し不可）"
          danger onClick={() => { if (confirm("すべてのデータを削除します。本当によろしいですか？")) resetAll() }} />
      </Section>

    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p
        className="px-5 pb-2 text-[11px]"
        style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6b6b6b" }}
      >
        {title}
      </p>
      <div style={{ borderTop: "1px solid #e6e6e6", borderBottom: "1px solid #e6e6e6" }}>
        {children}
      </div>
    </div>
  )
}

function Row({ icon, title, desc, onClick, danger }: {
  icon: React.ReactNode; title: string; desc: string; onClick: () => void; danger?: boolean
}) {
  return (
    <button onClick={onClick}
      className="flex w-full items-center gap-4 px-5 py-4 text-left transition active:bg-bmw-soft"
      style={{ borderBottom: "1px solid #e6e6e6" }}>
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">
        <span className="block text-[15px]" style={{ fontWeight: 700, color: danger ? "#dc2626" : "#262626" }}>{title}</span>
        <span className="block text-[13px]" style={{ fontWeight: 300, color: "#6b6b6b" }}>{desc}</span>
      </span>
      <ChevronRight size={16} style={{ color: "#cccccc" }} />
    </button>
  )
}
