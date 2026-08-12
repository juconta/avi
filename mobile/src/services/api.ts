import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const API_URL = 'http://192.168.0.7:4000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('avi_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
