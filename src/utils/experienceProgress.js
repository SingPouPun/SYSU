const EXPERIENCE_PREFIX = 'sysu-'

export function readExperienceProgress(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key)
    return stored === null ? fallback : JSON.parse(stored)
  } catch {
    return fallback
  }
}

export function writeExperienceProgress(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 无痕或受限环境中仍保留本次挂载期间的状态。
  }
}

export function clearExperienceProgress() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index))
      keys
        .filter((key) => key?.startsWith(EXPERIENCE_PREFIX))
        .forEach((key) => storage.removeItem(key))
    } catch {
      // 登出接口已经成功时，不让受限存储阻断页面复位。
    }
  }
}
