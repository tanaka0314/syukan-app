// 日付ユーティリティ。外部ライブラリに依存せず、ローカルタイムで扱う。
import type { Weekday } from "../types"

/** Date を "YYYY-MM-DD"（ローカル）に変換 */
export function toKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** 今日のキー */
export function todayKey(): string {
  return toKey(new Date())
}

/** "YYYY-MM-DD" を Date(ローカル0時) に戻す */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/** key の曜日 (0=日) */
export function weekdayOf(key: string): Weekday {
  return fromKey(key).getDay() as Weekday
}

/** base から offset 日ずらしたキー（offsetは負数で過去） */
export function addDaysKey(key: string, offset: number): string {
  const d = fromKey(key)
  d.setDate(d.getDate() + offset)
  return toKey(d)
}

/** 直近 n 日のキー配列（古い順）。最後が今日。 */
export function lastNDays(n: number, endKey = todayKey()): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) out.push(addDaysKey(endKey, -i))
  return out
}

/** その習慣を today に実施すべきか（曜日判定） */
export function isScheduledOn(days: Weekday[], key: string): boolean {
  return days.includes(weekdayOf(key))
}

const WD = ["日", "月", "火", "水", "木", "金", "土"]
export function weekdayLabel(w: Weekday): string {
  return WD[w]
}

/** 曜日集合を人間向けに（毎日 / 平日 / 土日 / 月・水・金 など） */
export function daysLabel(days: Weekday[]): string {
  const s = [...days].sort()
  if (s.length === 7) return "毎日"
  if (s.length === 5 && [1, 2, 3, 4, 5].every((d) => s.includes(d as Weekday)))
    return "平日"
  if (s.length === 2 && s.includes(0) && s.includes(6)) return "土日"
  return s.map((d) => WD[d]).join("・")
}

/**
 * ストリーク（連続達成日数）を計算する。
 * - 実施予定曜日のみを対象に、今日（または直近の予定日）から遡る。
 * - done と freeze はどちらも「途切れさせない」扱い。
 * - 今日がまだ予定日で未達成の場合でも、昨日までの連続は維持して数える。
 */
export function calcStreak(
  doneSet: Set<string>,
  days: Weekday[],
  endKey = todayKey()
): number {
  if (days.length === 0) return 0
  let streak = 0
  let cursor = endKey
  let guard = 0
  // 今日が予定日かつ未達成なら、今日はスキップして昨日から数える
  if (isScheduledOn(days, cursor) && !doneSet.has(cursor)) {
    cursor = addDaysKey(cursor, -1)
  }
  while (guard < 366 * 3) {
    guard++
    if (isScheduledOn(days, cursor)) {
      if (doneSet.has(cursor)) {
        streak++
      } else {
        break
      }
    }
    cursor = addDaysKey(cursor, -1)
  }
  return streak
}
