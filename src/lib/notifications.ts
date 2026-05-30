// OneSignal push notification helpers.
// OneSignal を使う場合は VITE_ONESIGNAL_APP_ID を .env.local に設定する。

export const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined

export function isOneSignalConfigured(): boolean {
  return !!ONESIGNAL_APP_ID && ONESIGNAL_APP_ID !== "YOUR_APP_ID"
}

/** OneSignal SDK を初期化する（App.tsx から一度だけ呼ぶ） */
export function initOneSignal() {
  if (!isOneSignalConfigured()) return

  window.OneSignalDeferred = window.OneSignalDeferred || []
  window.OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID!,
      serviceWorkerPath: "OneSignalSDKWorker.js",
      serviceWorkerParam: { scope: "/" },
      notifyButton: { enable: false },
      welcomeNotification: { disable: true },
    })
  })
}

/** 通知の許可をリクエストし、結果を返す */
export async function requestPushPermission(): Promise<"granted" | "denied" | "not_configured"> {
  if (!isOneSignalConfigured()) return "not_configured"
  if (!window.OneSignal) return "not_configured"

  await window.OneSignal.Notifications.requestPermission()
  return window.OneSignal.Notifications.permission ? "granted" : "denied"
}

/** 現在の通知許可状態 */
export function getPushPermission(): "granted" | "denied" | "not_configured" | "default" {
  if (!isOneSignalConfigured()) return "not_configured"
  if (!("Notification" in window)) return "not_configured"
  return Notification.permission as "granted" | "denied" | "default"
}
