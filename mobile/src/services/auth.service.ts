import AsyncStorage from '@react-native-async-storage/async-storage'
import type { AuthResult, User } from '../../../shared/src/types/user'
import api from './api'

const TOKEN_KEY = 'avi_token'
const USER_KEY = 'avi_user'

export const authService = {
  async register(data: { email: string; name: string; password: string }): Promise<AuthResult> {
    const { data: res } = await api.post<AuthResult>('/auth/register', data)
    await this.persist(res)
    return res
  },

  async login(data: { email: string; password: string }): Promise<AuthResult> {
    const { data: res } = await api.post<AuthResult>('/auth/login', data)
    await this.persist(res)
    return res
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    return data
  },

  async persist(result: AuthResult) {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, result.accessToken],
      [USER_KEY, JSON.stringify(result.user)],
    ])
  },

  async logout() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY])
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY)
  },

  async getUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },
}
