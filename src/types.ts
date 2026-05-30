// アプリ全体で使うデータ型の定義。

/** 習慣をどの曜日に行うか。0=日曜 ... 6=土曜 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** 習慣1件 */
export interface Habit {
  id: string
  /** 本来やりたいこと（例: 毎日30分ランニング） */
  title: string
  /** 2分ルール版の極小ステップ（例: 玄関で靴を履くだけ） */
  tinyStep: string
  /** if-then の「きっかけ」（例: 朝起きてトイレに行ったら） */
  cue: string
  /** 絵文字アイコン */
  emoji: string
  /** カードの色キー（brand / mint / blue / purple ...） */
  color: HabitColor
  /** 実施する曜日。毎日なら全曜日。 */
  days: Weekday[]
  /** リマインド時刻 "HH:MM"。未設定なら null。 */
  reminder: string | null
  /** 作成日時 (ISO) */
  createdAt: string
  /** 残っている「まあいっか（フリーズ）」回数 */
  freezeTokens: number
  /** アーカイブ済みか */
  archived: boolean
}

export type HabitColor = "brand" | "mint" | "blue" | "purple" | "rose" | "amber"

/** 達成ログ。日付(YYYY-MM-DD)ごとに記録。 */
export interface CompletionLog {
  habitId: string
  /** "YYYY-MM-DD" */
  date: string
  /** 通常達成 or フリーズ（サボったが連続を守った日） */
  kind: "done" | "freeze"
}

/** 永続化されるアプリ全体の状態 */
export interface PersistedState {
  habits: Habit[]
  logs: CompletionLog[]
  xp: number
  onboarded: boolean
}
