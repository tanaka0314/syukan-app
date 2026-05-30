// XP・レベル・称号と、状況に応じた励ましメッセージ。
// 「怠惰な人を責めない」トーンを徹底する。

/** 1達成で入るXP */
export const XP_PER_DONE = 10
/** フリーズ（まあいっか）でも少しだけ入る */
export const XP_PER_FREEZE = 2
/** ストリーク継続のボーナス（streak日数に応じて加算） */
export function streakBonus(streak: number): number {
  if (streak <= 0) return 0
  return Math.min(streak, 30) // 1日ごとに最大+30まで
}

export interface LevelInfo {
  level: number
  title: string
  /** 現レベルの開始XP */
  floor: number
  /** 次レベルの必要XP（最大レベルなら現XP） */
  ceil: number
  /** 0..1 の進捗 */
  progress: number
}

// レベルごとの称号。ゆるく前向きに。
const TITLES = [
  "はじめの一歩", // Lv1
  "ぼちぼち屋", // Lv2
  "三日坊主こえた人", // Lv3
  "コツコツ見習い", // Lv4
  "習慣の芽", // Lv5
  "つづける人", // Lv6
  "リズムの達人", // Lv7
  "習慣マイスター", // Lv8
  "ゆるぎない人", // Lv9
  "習慣の賢者", // Lv10+
]

/** レベルnに到達するために必要な累計XP（ゆるやかな二次曲線） */
function totalXpForLevel(level: number): number {
  // Lv1=0, Lv2=60, Lv3=150, Lv4=270 ... 緩めに設定して達成感を早めに
  return Math.round(30 * (level - 1) * level)
}

export function getLevelInfo(xp: number): LevelInfo {
  let level = 1
  while (totalXpForLevel(level + 1) <= xp && level < 999) level++
  const floor = totalXpForLevel(level)
  const ceil = totalXpForLevel(level + 1)
  const title = TITLES[Math.min(level - 1, TITLES.length - 1)]
  const progress = ceil > floor ? (xp - floor) / (ceil - floor) : 1
  return { level, title, floor, ceil, progress }
}

// --- 励ましメッセージ ---------------------------------------------

const PRAISE = [
  "ナイス！その一歩がぜんぶ。",
  "えらい。ちゃんと自分との約束守った。",
  "今日のあなた、最高。",
  "小さいけど、確実に前進。",
  "よくやった！明日のあなたが楽になる。",
  "その調子。むりせず、でも止まらず。",
  "できたね。これでいい、これがいい。",
]

const ALL_DONE = [
  "今日のぶん、ぜんぶクリア！自分をほめていい日。",
  "コンプリート！もう何もしなくてOK、ゆっくり休も。",
  "全部達成。あなたは思ってるよりすごい。",
]

const STREAK_MSG: { min: number; msg: string }[] = [
  { min: 30, msg: "30日連続…！もう立派な習慣だね。" },
  { min: 14, msg: "2週間つづいてる。完全に流れができてる。" },
  { min: 7, msg: "1週間連続！ここまで来たらしめたもの。" },
  { min: 3, msg: "3日つづいた。三日坊主、もう卒業。" },
  { min: 2, msg: "連続2日。いい流れ。" },
]

export function praiseMessage(): string {
  return PRAISE[Math.floor(Math.random() * PRAISE.length)]
}

export function allDoneMessage(): string {
  return ALL_DONE[Math.floor(Math.random() * ALL_DONE.length)]
}

export function streakMessage(streak: number): string | null {
  for (const s of STREAK_MSG) if (streak >= s.min) return s.msg
  return null
}

/** サボった/フリーズしたときの、責めないメッセージ */
export function comfortMessage(): string {
  const list = [
    "休む日があってもいい。連続は守ったよ。",
    "まあいっか、で大丈夫。続けてるだけで上出来。",
    "完璧じゃなくていい。また明日からでOK。",
  ]
  return list[Math.floor(Math.random() * list.length)]
}
