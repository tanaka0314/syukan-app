import { useMemo } from "react"
import { Flame, Trophy, TrendingUp } from "lucide-react"
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
  const nextLevel = getLevelInfo(level.ceil)

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
    <div className="mx-auto max-w-md pb-28 bg-bmw-canvas">

      {/* white header */}
      <header
        className="sticky top-0 z-20 flex h-16 items-center px-5"
        style={{ background: "#ffffff", borderBottom: "1px solid #e6e6e6" }}
      >
        <h1 className="text-[18px]" style={{ fontWeight: 700, color: "#262626" }}>記録</h1>
      </header>

      {/* ── BMW dark hero band: level info ── */}
      <div className="px-6 py-8" style={{ background: "#1a2129" }}>
        <p
          className="mb-1 text-[11px]"
          style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6b6b6b" }}
        >
          現在のレベル
        </p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[40px] leading-none" style={{ fontWeight: 700, color: "#ffffff" }}>
              {level.title}
            </p>
            <p className="mt-1 text-[20px]" style={{ fontWeight: 700, color: "#1c69d4" }}>
              LV. {level.level}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[36px] leading-none" style={{ fontWeight: 700, color: "#ffffff" }}>
              {xp}
            </p>
            <p
              className="text-[11px]"
              style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6b6b6b" }}
            >
              TOTAL XP
            </p>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-5">
          <div className="h-[2px]" style={{ background: "rgba(255,255,255,0.12)" }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${Math.round(level.progress * 100)}%`, background: "#1c69d4" }}
            />
          </div>
          <p className="mt-1.5 text-[12px]" style={{ fontWeight: 300, color: "#6b6b6b" }}>
            次のレベル「{nextLevel.title}」まで {Math.max(0, level.ceil - xp)} XP
          </p>
        </div>
      </div>

      {/* ── spec cells (BMW spec-cell style) ── */}
      <div
        className="grid grid-cols-3"
        style={{ borderBottom: "1px solid #e6e6e6", background: "#ffffff" }}
      >
        <SpecCell icon={<Flame size={16} style={{ color: "#1c69d4" }} />} value={summary.bestStreak} unit="日" label="最高連続" desc="途切れずに達成した最長記録" />
        <SpecCell icon={<TrendingUp size={16} style={{ color: "#1c69d4" }} />} value={summary.rate} unit="%" label="30日達成率" desc="予定日に対する達成割合" border />
        <SpecCell icon={<Trophy size={16} style={{ color: "#1c69d4" }} />} value={summary.totalDone} unit="回" label="のべ達成" desc="開始からの累計達成数" />
      </div>

      {/* section label */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid #e6e6e6", background: "#f7f7f7" }}
      >
        <span
          className="text-[11px]"
          style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6b6b6b" }}
        >
          習慣カレンダー
        </span>
        <span className="text-[11px]" style={{ fontWeight: 300, color: "#9a9a9a" }}>直近13週</span>
      </div>

      {/* heatmaps */}
      {active.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <p className="text-[16px]" style={{ fontWeight: 700, color: "#262626" }}>まだ習慣がありません</p>
          <p className="mt-1 text-[14px]" style={{ fontWeight: 300, color: "#6b6b6b" }}>
            ホームタブから追加してください。
          </p>
        </div>
      ) : (
        <div>
          {active.map((h) => <HabitHeatmap key={h.id} habitId={h.id} />)}
        </div>
      )}
    </div>
  )
}

function SpecCell({ icon, value, unit, label, desc, border }: {
  icon: React.ReactNode; value: number; unit: string; label: string; desc: string; border?: boolean
}) {
  return (
    <div
      className="px-4 py-5"
      style={{
        borderRight: border ? "1px solid #e6e6e6" : undefined,
        borderLeft:  border ? "1px solid #e6e6e6" : undefined,
      }}
    >
      <div className="mb-2">{icon}</div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-[28px] leading-none" style={{ fontWeight: 700, color: "#262626" }}>{value}</span>
        <span className="text-[12px]" style={{ fontWeight: 300, color: "#6b6b6b" }}>{unit}</span>
      </div>
      <p
        className="mt-1 text-[10px]"
        style={{ fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#9a9a9a" }}
      >
        {label}
      </p>
      <p className="mt-0.5 text-[11px]" style={{ fontWeight: 300, color: "#9a9a9a" }}>{desc}</p>
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
    <div
      className="px-5 py-4"
      style={{ borderBottom: "1px solid #e6e6e6" }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[20px]">{habit.emoji}</span>
        <span className="flex-1 truncate text-[15px]" style={{ fontWeight: 700, color: "#262626" }}>
          {habit.title}
        </span>
        {streak > 0 && (
          <span
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] text-white"
            style={{ background: "#1a2129", fontWeight: 700, letterSpacing: "0.5px" }}
          >
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
                  className="h-[11px] w-[11px]"
                  style={{ background: bg, opacity }}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-4 text-[10px]" style={{ color: "#9a9a9a", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5" style={{ background: col.accent }} /> 達成
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5" style={{ background: col.freeze }} /> スキップ
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 bg-black/8" style={{ background: "rgba(0,0,0,0.08)" }} /> 未達成
        </span>
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
