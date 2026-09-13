import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config'

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('avi_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers['Cache-Control'] = 'no-store'
  if (config.method === 'get') {
    config.params = { ...config.params, t: Date.now() }
  }
  return config
})

export default api
