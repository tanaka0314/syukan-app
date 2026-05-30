import { useState } from "react"

interface Props { onDone: () => void }

const SLIDES = [
  {
    emoji: "🛋️",
    title: "意志の力に頼らない",
    body: "続かないのは怠け者だからじゃない。仕組みが無いだけ。このアプリが「続く仕組み」をぜんぶ用意します。",
    note: "行動科学ベースの習慣化アプリ",
  },
  {
    emoji: "👣",
    title: "バカみたいに小さく始める",
    body: "「腕立て1回」でOK。小さすぎて笑えるくらいがちょうどいい。やる気は始めたあとに出てきます（2分ルール）。",
    note: "Tiny Habits / BJ Fogg の理論より",
  },
  {
    emoji: "🪝",
    title: "きっかけを決めておく",
    body: "「歯みがきしたら、スクワット1回」のように今ある習慣にくっつける。if-then設定で勝手に体が動きます。",
    note: "実装意図（Gollwitzer）/ Habit Stacking",
  },
  {
    emoji: "❄️",
    title: "サボってもだいじょうぶ",
    body: "どうしても無理な日は「まあいっか」ボタンで連続記録をキープ。完璧をやめると逆に続きます。",
    note: "全か無か思考を避けることが鍵",
  },
]

export default function Onboarding({ onDone }: Props) {
  const [i, setI] = useState(0)
  const last = i === SLIDES.length - 1
  const s    = SLIDES[i]

  return (
    <div className="fixed inset-0 z-50 flex flex-col safe-top safe-bottom" style={{ background: "#FFFFFF" }}>

      {/* YouTube-style header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.10)" }}>
        <div className="flex items-baseline gap-1">
          <span className="text-[18px] font-bold" style={{ color: "#FF0000" }}>つ</span>
          <span className="text-[18px] font-bold" style={{ color: "#0F0F0F" }}>づくん</span>
        </div>
        <button onClick={onDone} className="text-[13px]" style={{ color: "#606060" }}>
          スキップ
        </button>
      </div>

      {/* progress bar (YouTube loading style) */}
      <div className="h-0.5 bg-yt-surface">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${((i + 1) / SLIDES.length) * 100}%`, background: "#FF0000" }}
        />
      </div>

      {/* content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div
          key={i}
          className="mb-8 flex h-32 w-32 animate-pop-in items-center justify-center rounded-yt-card text-[72px]"
          style={{ background: "#F2F2F2" }}
        >
          {s.emoji}
        </div>

        <p className="mb-1 text-[12px] font-medium rounded-yt-pill px-3 py-0.5" style={{ background: "#F2F2F2", color: "#606060" }}>
          {s.note}
        </p>

        <h2 className="mt-3 text-[24px] font-bold leading-tight" style={{ color: "#0F0F0F" }}>
          {s.title}
        </h2>
        <p className="mt-3 max-w-xs text-[15px] leading-relaxed" style={{ color: "#606060" }}>
          {s.body}
        </p>
      </div>

      {/* indicators */}
      <div className="mb-5 flex justify-center gap-1.5">
        {SLIDES.map((_sl, idx) => (
          <span
            key={idx}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: idx === i ? "24px" : "6px",
              background: idx === i ? "#FF0000" : "rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <button
          onClick={() => last ? onDone() : setI(i + 1)}
          className="h-12 w-full rounded-yt text-[15px] font-medium text-white transition active:scale-95"
          style={{ background: "#FF0000" }}
        >
          {last ? "はじめる" : "つぎへ"}
        </button>
        {i === 0 && (
          <p className="mt-3 text-center text-[12px]" style={{ color: "#606060" }}>
            無料・アカウント不要・データはこの端末だけに保存
          </p>
        )}
      </div>
    </div>
  )
}
