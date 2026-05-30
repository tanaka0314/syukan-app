import { useState } from "react"

interface Props { onDone: () => void }

const SLIDES = [
  {
    emoji: "🛋️",
    title: "意志の力に頼らない",
    body: "続かないのは、あなたのせいではありません。仕組みが無いだけです。このアプリが「続く仕組み」をすべて用意します。",
    tag: "DESIGN PRINCIPLE",
  },
  {
    emoji: "👣",
    title: "小さく始める",
    body: "「腕立て1回」で充分です。始めることが最も重要なステップ。やる気は、始めた後に生まれます。",
    tag: "2-MINUTE RULE",
  },
  {
    emoji: "🪝",
    title: "きっかけを設計する",
    body: "「歯みがきしたら、スクワット1回」のように、既存の習慣にくっつける。If-thenで行動が自動化されます。",
    tag: "IF-THEN PLANNING",
  },
  {
    emoji: "❄️",
    title: "完璧を目指さない",
    body: "どうしても無理な日は「SKIP」で連続記録をキープ。完璧よりも継続が、習慣形成の本質です。",
    tag: "SELF-COMPASSION",
  },
]

export default function Onboarding({ onDone }: Props) {
  const [i, setI] = useState(0)
  const last = i === SLIDES.length - 1
  const s    = SLIDES[i]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col safe-top safe-bottom"
      style={{ background: "#1a2129" }}  // BMW surface-dark — full dark hero
    >
      {/* BMW white top nav */}
      <div
        className="flex h-16 items-center justify-between px-6"
        style={{ background: "#ffffff" }}
      >
        <div className="flex items-baseline gap-1">
          <span className="text-[20px]" style={{ fontWeight: 700, color: "#1c69d4" }}>つ</span>
          <span className="text-[20px]" style={{ fontWeight: 700, color: "#262626" }}>づくん</span>
        </div>
        <button
          onClick={onDone}
          className="text-[12px] transition active:opacity-60"
          style={{ fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#6b6b6b" }}
        >
          SKIP
        </button>
      </div>

      {/* BMW: horizontal progress bar below nav (like BMW configurator step) */}
      <div className="h-[2px] flex" style={{ background: "rgba(255,255,255,0.1)" }}>
        {SLIDES.map((_, idx) => (
          <div
            key={idx}
            className="h-full transition-all duration-300"
            style={{
              flex: 1,
              background: idx <= i ? "#1c69d4" : "transparent",
              marginRight: idx < SLIDES.length - 1 ? "1px" : 0,
            }}
          />
        ))}
      </div>

      {/* content: dark hero band */}
      <div className="flex flex-1 flex-col justify-center px-8">
        {/* tag: UPPERCASE label */}
        <p
          className="mb-4 text-[11px]"
          style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#1c69d4" }}
        >
          {s.tag}
        </p>

        <div
          key={i}
          className="mb-6 text-[56px] animate-pop-in"
        >
          {s.emoji}
        </div>

        {/* BMW: heavy 700 display headline */}
        <h2
          className="mb-4 text-[32px] leading-tight"
          style={{ fontWeight: 700, color: "#ffffff" }}
        >
          {s.title}
        </h2>

        {/* BMW: Light 300 body copy */}
        <p
          className="text-[16px] leading-relaxed max-w-xs"
          style={{ fontWeight: 300, color: "#bbbbbb" }}
        >
          {s.body}
        </p>
      </div>

      {/* step indicators */}
      <div className="flex justify-center gap-2 pb-6">
        {SLIDES.map((_, idx) => (
          <div
            key={idx}
            className="h-[2px] transition-all duration-300"
            style={{
              width: idx === i ? "32px" : "12px",
              background: idx === i ? "#1c69d4" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

      {/* BMW primary CTA — rectangular, BMW Blue */}
      <div className="px-6 pb-8">
        <button
          onClick={() => last ? onDone() : setI(i + 1)}
          className="h-12 w-full text-[14px] text-white transition active:opacity-80"
          style={{ background: "#1c69d4", fontWeight: 700, letterSpacing: "0.5px" }}
        >
          {last ? "始める" : "次へ"}
        </button>
        {i === 0 && (
          <p
            className="mt-3 text-center text-[12px]"
            style={{ fontWeight: 300, color: "#6b6b6b" }}
          >
            無料 · アカウント不要 · データはこの端末のみに保存
          </p>
        )}
      </div>
    </div>
  )
}
