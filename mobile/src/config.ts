const env = (process.env ?? {}) as Record<string, string | undefined>

export const API_URL = env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.7:4000/api'
export const SOCKET_URL = env.EXPO_PUBLIC_SOCKET_URL ?? 'http://192.168.0.7:4000'