import { useRef } from "react"
import { Download, Upload, Trash2, ChevronRight, Info } from "lucide-react"
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
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `syukan-backup-${new Date().toISOString().slice(0, 10)}.json`,
    })
    a.click()
    URL.revokeObjectURL(url)
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
          alert("読み込みました！")
        }
      } catch { alert("ファイルを読み込めませんでした。") }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <div className="mx-auto max-w-md pb-28" style={{ background: "#FFFFFF" }}>

      <header className="sticky top-0 z-20 px-4 py-3" style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.10)" }}>
        <h1 className="text-[18px] font-medium" style={{ color: "#0F0F0F" }}>設定</h1>
      </header>

      {/* about */}
      <div className="mx-4 mt-4 rounded-yt-card p-4" style={{ background: "#F2F2F2" }}>
        <p className="flex items-center gap-1.5 text-[14px] font-medium" style={{ color: "#0F0F0F" }}>
          <Info size={15} style={{ color: "#FF0000" }} /> つづくん について
        </p>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "#606060" }}>
          「がんばり」ではなく「仕組み」で習慣を続けるために作られたアプリです。
          <strong style={{ color: "#0F0F0F" }}>極小ステップ</strong>（2分ルール）・
          <strong style={{ color: "#0F0F0F" }}>きっかけ設定</strong>（if-then）・
          <strong style={{ color: "#0F0F0F" }}>連続記録</strong>・
          <strong style={{ color: "#0F0F0F" }}>まあいっか機能</strong>（フリーズ）を搭載。
          すべて行動科学の知見に基づいています。
        </p>
        <p className="mt-2 text-[12px]" style={{ color: "#606060" }}>
          📱 データはこの端末のブラウザ内にのみ保存されます。
        </p>
      </div>

      <Section title="データ管理">
        <Row icon={<Download size={18} style={{ color: "#606060" }} />}
          title="バックアップを書き出す"
          desc="JSONファイルとして保存。機種変更時などに使えます"
          onClick={handleExport} />
        <Row icon={<Upload size={18} style={{ color: "#606060" }} />}
          title="バックアップから読み込む"
          desc="以前のバックアップを復元します"
          onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
      </Section>

      {archived.length > 0 && (
        <Section title="お休み中の習慣">
          {archived.map((h) => (
            <div key={h.id} className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <span className="text-[20px]">{h.emoji}</span>
              <span className="flex-1 truncate text-[15px]" style={{ color: "#0F0F0F" }}>{h.title}</span>
              <button onClick={() => archiveHabit(h.id)}
                className="rounded-yt-pill px-3 py-1 text-[13px] font-medium text-white transition active:scale-95"
                style={{ background: "#FF0000" }}>
                再開する
              </button>
            </div>
          ))}
        </Section>
      )}

      <Section title="危険な操作">
        <Row icon={<Trash2 size={18} style={{ color: "#FF0000" }} />}
          title="すべてリセット"
          desc="習慣と記録をすべて削除します。この操作は取り消せません"
          danger onClick={() => { if (confirm("すべてのデータを削除します。本当によろしいですか？")) resetAll() }} />
      </Section>

    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="px-4 pb-1.5 text-[12px] font-medium uppercase" style={{ color: "#606060" }}>{title}</p>
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)", background: "#FFFFFF" }}>
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
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-yt-surface"
      style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">
        <span className="block text-[15px]" style={{ color: danger ? "#FF0000" : "#0F0F0F" }}>{title}</span>
        <span className="block text-[12px]" style={{ color: "#606060" }}>{desc}</span>
      </span>
      <ChevronRight size={16} style={{ color: "#C7C7CC" }} />
    </button>
  )
}
