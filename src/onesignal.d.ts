// Type declarations for OneSignal Web SDK (CDN version)
interface OneSignalType {
  init(options: {
    appId: string
    serviceWorkerPath?: string
    serviceWorkerParam?: { scope: string }
    notifyButton?: { enable: boolean }
    welcomeNotification?: { disable: boolean }
  }): Promise<void>
  Notifications: {
    permission: boolean
    requestPermission(): Promise<void>
    addEventListener(event: string, handler: () => void): void
  }
  User: {
    PushSubscription: {
      id: string | null
      optedIn: boolean
      optIn(): Promise<void>
      optOut(): Promise<void>
    }
  }
}

interface Window {
  OneSignalDeferred: ((onesignal: OneSignalType) => void)[]
  OneSignal?: OneSignalType
}
