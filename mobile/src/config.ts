const env = (process.env ?? {}) as Record<string, string | undefined>

export const API_URL = env.EXPO_PUBLIC_API_URL ?? 'https://avi-zaus.onrender.com/api'
export const SOCKET_URL = env.EXPO_PUBLIC_SOCKET_URL ?? 'https://avi-zaus.onrender.com'