export interface HabitTemplate {
  emoji: string
  title: string
  tinyStep: string
  cue: string
}

export const TEMPLATES: HabitTemplate[] = [
  { emoji: "🏃", title: "運動する",     tinyStep: "運動着に着替えるだけ",         cue: "朝起きて顔を洗ったら" },
  { emoji: "📚", title: "本を読む",     tinyStep: "1ページだけ読む",             cue: "夜ベッドに入ったら" },
  { emoji: "🧘", title: "ストレッチ",   tinyStep: "深呼吸を3回するだけ",          cue: "歯みがきが終わったら" },
  { emoji: "💧", title: "水を飲む",     tinyStep: "コップ1杯飲む",               cue: "朝キッチンに立ったら" },
  { emoji: "✍️", title: "日記をつける", tinyStep: "今日の良かったこと1つ書く",    cue: "寝る前にスマホを置いたら" },
  { emoji: "🧹", title: "片付け",       tinyStep: "1つだけ元の場所に戻す",        cue: "夕食を食べ終えたら" },
  { emoji: "📖", title: "勉強する",     tinyStep: "テキストを開くだけ",           cue: "コーヒーを淹れたら" },
]

export function suggestTinyStep(title: string): string {
  const t = title.trim()
  return t ? `${t}を「ほんの少しだけ」やる` : ""
}

export const CUE_SUGGESTIONS = [
  "朝起きてトイレに行ったら",
  "顔を洗ったら",
  "朝食を食べ終えたら",
  "歯みがきが終わったら",
  "家に帰って手を洗ったら",
  "夕食を食べ終えたら",
  "お風呂から出たら",
  "ベッドに入ったら",
]

export const EMOJI_CHOICES = [
  "🏃","💪","🧘","🚶","📚","✍️","📖","💧","🥗","🍎",
  "🧹","🧺","💊","🦷","😴","🧠","🎯","🎸","🎨","💻",
  "🌱","☀️","🌙","⏰","💰","📱","🙏","❤️","🔥","⭐",
]

export const COLOR_CHOICES: {
  key: import("../types").HabitColor
  label: string
  swatch: string
}[] = [
  { key: "brand",  label: "オレンジ", swatch: "#FF6B35" },
  { key: "mint",   label: "ミント",   swatch: "#22A877" },
  { key: "blue",   label: "ブルー",   swatch: "#3B82F6" },
  { key: "purple", label: "パープル", swatch: "#8B5CF6" },
  { key: "rose",   label: "ローズ",   swatch: "#F43F5E" },
  { key: "amber",  label: "イエロー", swatch: "#F59E0B" },
]
