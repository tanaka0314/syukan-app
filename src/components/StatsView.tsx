import { useMemo } from "react"
import { Flame, Trophy, TrendingUp, Info } from "lucide-react"
import { useHabitStore, doneSetFor, isCompletedOn } from "../store/useHabitStore"
import { calcStreak, lastNDays, isScheduledOn, todayKey, fromKey } from "../lib/date"
import { getLevelInfo } from "../lib/level"
import { colorOf } from "../lib/colors"

export default function StatsView() {
  const habits = useHabitStore((s) => s.habits)
  const logs   = useHabitStore((s) => s.logs)
  const xp     = useHabitStore((s) => s.xp)
  const active = habits.filter((h) => !h.archived)
  const level  = getLevelInfo(xp)

  const summary = useMemo(() => {
    let bestStreak = 0, totalDone = 0
    for (const h of active) {
      const ds = doneSetFor(logs, h.id)
      totalDone += ds.size
      const s = calcStreak(ds, h.days)
      if (s > bestStreak) bestStreak = s
    }
    const days = lastNDays(30)
    let scheduled = 0, done = 0
    for (const h of active) {
      for (const d of days) {
        if (fromKey(d) < fromKey(h.createdAt.slice(0, 10))) continue
        if (isScheduledOn(h.days, d)) {
          scheduled++
          if (logs.some((l) => l.habitId === h.id && l.date === d)) done++
        }
      }
    }
    return { bestStreak, totalDone, rate: scheduled ? Math.round((done / scheduled) * 100) : 0 }
  }, [active, logs])

  return (
    <div className="mx-auto max-w-md pb-28" style={{ background: "#FFFFFF" }}>

      {/* header */}
      <header
        className="sticky top-0 z-20 px-4 py-3"
        style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.10)" }}
      >
        <h1 className="text-[18px] font-medium" style={{ color: "#0F0F0F" }}>あなたの記録</h1>
      </header>

      {/* level card (dark = YouTube dark mode flavor) */}
      <div className="mx-4 mt-4 rounded-yt-card p-4" style={{ background: "#0F0F0F", color: "#FFFFFF" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>現在のレベル</p>
            <p className="mt-0.5 text-[20px] font-medium">{level.title}</p>
            <p className="text-[24px] font-bold leading-tight">Lv.{level.level}</p>
          </div>
          <div className="text-right">
            <p className="text-[28px] font-bold" style={{ color: "#FF0000" }}>{xp}</p>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              XP（経験値）
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              習慣を達成するたびに増えます
            </p>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round(level.progress * 100)}%`, background: "#FF0000" }} />
        </div>
        <p className="mt-1 text-[11px]" style={{ color: "rgba(255,255,255,0.40)" }}>
          次のレベル「{getLevelInfo(level.ceil).title}」まで {Math.max(0, level.ceil - xp)} XP
        </p>
      </div>

      {/* stats row */}
      <div className="mx-4 mt-4 grid grid-cols-3 gap-3">
        <StatBox
          icon={<Flame size={20} style={{ color: "#FF0000" }} />}
          value={summary.bestStreak} unit="日"
          label="最高連続" desc="途切れずに達成した最長記録"
        />
        <StatBox
          icon={<TrendingUp size={20} style={{ color: "#FF0000" }} />}
          value={summary.rate} unit="%"
          label="30日達成率" desc="直近30日の予定日中の達成割合"
        />
        <StatBox
          icon={<Trophy size={20} style={{ color: "#FF0000" }} />}
          value={summary.totalDone} unit="回"
          label="のべ達成" desc="アプリ開始からの合計達成回数"
        />
      </div>

      {/* section */}
      <div className="mt-6 px-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <p className="text-[14px] font-medium" style={{ color: "#0F0F0F" }}>
          習慣ごとのカレンダー
          <span className="ml-1 text-[12px] font-normal" style={{ color: "#606060" }}>
            · 直近13週
          </span>
        </p>
        <p className="mt-0.5 text-[12px]" style={{ color: "#606060" }}>
          色が濃いほど達成した日。灰色はフリーズ（まあいっか）使用日。
        </p>
      </div>

      {active.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-[15px] font-medium" style={{ color: "#0F0F0F" }}>まだ習慣がありません</p>
          <p className="mt-1 text-[13px]" style={{ color: "#606060" }}>「ホーム」タブから追加してみよう。</p>
        </div>
      ) : (
        <div className="px-4 pt-3 space-y-4">
          {active.map((h) => <HabitHeatmap key={h.id} habitId={h.id} />)}
        </div>
      )}
    </div>
  )
}

function StatBox({ icon, value, unit, label, desc }: {
  icon: React.ReactNode; value: number; unit: string; label: string; desc: string
}) {
  return (
    <div className="rounded-yt-card p-3 text-center" style={{ background: "#F2F2F2" }}>
      <div className="mb-1 flex justify-center">{icon}</div>
      <p className="text-[20px] font-bold leading-tight" style={{ color: "#0F0F0F" }}>
        {value}<span className="text-[12px] font-normal" style={{ color: "#606060" }}>{unit}</span>
      </p>
      <p className="mt-0.5 text-[11px] font-medium" style={{ color: "#0F0F0F" }}>{label}</p>
      <p className="mt-0.5 text-[10px] leading-tight" style={{ color: "#606060" }}>{desc}</p>
    </div>
  )
}

function HabitHeatmap({ habitId }: { habitId: string }) {
  const habit  = useHabitStore((s) => s.habits.find((h) => h.id === habitId))!
  const logs   = useHabitStore((s) => s.logs)
  const col    = colorOf(habit.color)
  const days   = lastNDays(91)
  const today  = todayKey()
  const streak = useMemo(
    () => calcStreak(doneSetFor(logs, habitId), habit.days),
    [logs, habitId, habit.days],
  )

  return (
    <div className="rounded-yt-card p-3" style={{ border: "1px solid rgba(0,0,0,0.10)" }}>
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full text-[16px]" style={{ background: col.thumb }}>
          {habit.emoji}
        </span>
        <span className="flex-1 truncate text-[14px] font-medium" style={{ color: "#0F0F0F" }}>
          {habit.title}
        </span>
        {streak > 0 && (
          <span className="flex items-center gap-0.5 rounded-yt-pill px-2 py-0.5 text-[11px] font-medium text-white" style={{ background: "#FF0000" }}>
            <Flame size={10} /> {streak}日
          </span>
        )}
      </div>

      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {chunkWeeks(days).map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((d, di) => {
              if (!d) return <div key={`p${di}`} className="h-[11px] w-[11px]" />
              const scheduled = isScheduledOn(habit.days, d)
              const kind      = isCompletedOn(logs, habitId, d)
              let bg = "transparent", opacity = 1
              if (!scheduled)          bg = "rgba(0,0,0,0.04)"
              else if (kind === "done")    bg = col.accent
              else if (kind === "freeze")  bg = col.freeze
              else { bg = "rgba(0,0,0,0.08)"; if (d > today) opacity = 0 }
              return (
                <div key={d} title={d}
                  className="h-[11px] w-[11px] rounded-[2px]"
                  style={{ background: bg, opacity }}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-3 text-[11px]" style={{ color: "#606060" }}>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: col.accent }} /> 達成
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: col.freeze }} /> まあいっか
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-black/10" /> 未達成
        </span>
        <Info size={11} className="ml-auto" />
      </div>
    </div>
  )
}

function chunkWeeks(days: string[]): string[][] {
  if (!days.length) return []
  const firstW = fromKey(days[0]).getDay()
  const padded: (string | null)[] = [...Array(firstW).fill(null), ...days]
  const weeks: string[][] = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7).map((x) => x ?? ""))
  }
  return weeks
}
