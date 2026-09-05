import { API_URL } from './api'

export function sendDebugLog(msg: string) {
  try {
    fetch(`${API_URL}/debug/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg: String(msg).slice(0, 1000) }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* no-op */
  }
}