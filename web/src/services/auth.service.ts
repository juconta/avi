import api from './api'
import type { AuthResult, User } from '../../../shared/src/types/user'

const TOKEN_KEY = 'avi_token'
const USER_KEY = 'avi_user'

export const authService = {
  async register(data: { email: string; name: string; password: string }): Promise<AuthResult> {
    const { data: res } = await api.post<AuthResult>('/auth/register', data)
    this.persist(res)
    return res
  },

  async login(data: { email: string; password: string }): Promise<AuthResult> {
    const { data: res } = await api.post<AuthResult>('/auth/login', data)
    this.persist(res)
    return res
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    return data
  },

  persist(result: AuthResult) {
    localStorage.setItem(TOKEN_KEY, result.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(result.user))
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}
