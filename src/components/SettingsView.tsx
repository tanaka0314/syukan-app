import { useEffect, useRef, useState } from "react"
import { Download, Upload, Trash2, Bell, BellOff, BellRing, ChevronRight, Info, ExternalLink } from "lucide-react"
import { useHabitStore } from "../store/useHabitStore"
import {
  requestPushPermission,
  getPushPermission,
  isOneSignalConfigured,
} from "../lib/notifications"

export default function SettingsView() {
  const habits       = useHabitStore((s) => s.habits)
  const logs         = useHabitStore((s) => s.logs)
  const xp           = useHabitStore((s) => s.xp)
  const importState  = useHabitStore((s) => s.importState)
  const resetAll     = useHabitStore((s) => s.resetAll)
  const archiveHabit = useHabitStore((s) => s.archiveHabit)

  const fileRef    = useRef<HTMLInputElement>(null)
  const [notifMsg, setNotifMsg] = useState<string | null>(null)
  const [pushStatus, setPushStatus] = useState<string>("")
  const archived   = habits.filter((h) => h.archived)

  useEffect(() => {
    const p = getPushPermission()
    if (p === "granted")        setPushStatus("enabled")
    else if (p === "denied")    setPushStatus("denied")
    else if (p === "not_configured") setPushStatus("not_configured")
    else                        setPushStatus("default")
  }, [])

  async function handleEnableNotifications() {
    const result = await requestPushPermission()
    if (result === "granted") {
      setPushStatus("enabled")
      setNotifMsg("✅ 通知をオンにしました！アプリを閉じていても通知が届きます。")
    } else if (result === "denied") {
      setPushStatus("denied")
      setNotifMsg("⚠️ 通知がブロックされています。端末の設定からブラウザの通知を許可してください。")
    } else {
      setNotifMsg("⚙️ OneSignal App ID が設定されていません。下の手順を確認してください。")
    }
  }

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

      {/* about banner */}
      <div className="mx-4 mt-4 rounded-yt-card p-4" style={{ background: "#F2F2F2" }}>
        <p className="flex items-center gap-1.5 text-[14px] font-medium" style={{ color: "#0F0F0F" }}>
          <Info size={15} style={{ color: "#FF0000" }} /> つづくん について
        </p>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "#606060" }}>
          「がんばり」ではなく「仕組み」で習慣を続けるために作られたアプリです。
          <strong style={{ color: "#0F0F0F" }}>極小ステップ</strong>（2分ルール）・
          <strong style={{ color: "#0F0F0F" }}>きっかけ設定</strong>（if-then）・
          <strong style={{ color: "#0F0F0F" }}>連続記録</strong>・
          <strong style={{ color: "#0F0F0F" }}>即時ごほうび</strong>・
          <strong style={{ color: "#0F0F0F" }}>まあいっか機能</strong>（フリーズ）を
          搭載しています。すべて行動科学の知見に基づいています。
        </p>
        <p className="mt-2 text-[12px]" style={{ color: "#606060" }}>
          📱 データはこの端末のブラウザ内にのみ保存されます。外部には送信しません。
        </p>
      </div>

      {/* 通知セクション */}
      <div className="mt-5">
        <p className="px-4 pb-1.5 text-[12px] font-medium uppercase" style={{ color: "#606060" }}>通知</p>
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)", background: "#FFFFFF" }}>

          {/* 現在のステータス表示 */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            <span className="shrink-0">
              {pushStatus === "enabled"
                ? <BellRing size={18} style={{ color: "#FF0000" }} />
                : pushStatus === "denied"
                ? <BellOff size={18} style={{ color: "#606060" }} />
                : <Bell size={18} style={{ color: "#FF0000" }} />}
            </span>
            <span className="flex-1">
              <span className="block text-[15px]" style={{ color: "#0F0F0F" }}>
                プッシュ通知
              </span>
              <span className="block text-[12px]" style={{ color: "#606060" }}>
                {pushStatus === "enabled"   ? "✅ 有効 — アプリを閉じていても通知が届きます"
                : pushStatus === "denied"   ? "🚫 ブロック済み — 端末の設定から許可してください"
                : pushStatus === "not_configured" ? "⚙️ 未設定 — 下の手順で App ID を設定してください"
                : "タップして通知を有効にする"}
              </span>
            </span>
            {pushStatus !== "enabled" && pushStatus !== "denied" && (
              <button
                onClick={handleEnableNotifications}
                className="shrink-0 rounded-yt-pill px-3 py-1 text-[13px] font-medium text-white transition active:scale-95"
                style={{ background: "#FF0000" }}
              >
                有効にする
              </button>
            )}
          </div>

          {notifMsg && (
            <p className="px-4 py-2 text-[12px]" style={{ color: "#606060" }}>{notifMsg}</p>
          )}

          {/* OneSignal 未設定の場合の案内 */}
          {!isOneSignalConfigured() && (
            <div className="px-4 py-4" style={{ background: "#FFF9F9" }}>
              <p className="text-[13px] font-medium" style={{ color: "#0F0F0F" }}>
                🔔 バックグラウンド通知の設定手順
              </p>
              <ol className="mt-2 space-y-1.5 text-[12px] leading-relaxed" style={{ color: "#606060" }}>
                <li>① <a href="https://app.onesignal.com/signup" target="_blank" rel="noopener noreferrer"
                    className="underline" style={{ color: "#FF0000" }}>onesignal.com</a> で無料アカウントを作成</li>
                <li>② 「New App」→ Web Push → サイトURL を入力</li>
                <li>③ Settings → Keys & IDs から <strong>App ID</strong> をコピー</li>
                <li>④ プロジェクトに <code className="rounded px-1" style={{ background: "#F2F2F2" }}>.env.local</code> ファイルを作成：</li>
              </ol>
              <pre className="mt-2 overflow-x-auto rounded-yt p-2 text-[11px]" style={{ background: "#F2F2F2", color: "#0F0F0F" }}>
{`VITE_ONESIGNAL_APP_ID=ここにApp IDを貼る`}
              </pre>
              <p className="mt-1.5 text-[11px]" style={{ color: "#606060" }}>
                ⑤ <code className="rounded px-1" style={{ background: "#F2F2F2" }}>npm run build</code> を再実行してデプロイ
              </p>
              <a
                href="https://app.onesignal.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-1 text-[12px] font-medium"
                style={{ color: "#FF0000" }}
              >
                OneSignal を開く <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
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
