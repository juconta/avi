export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  STREAMER = 'streamer',
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export interface AuthResult {
  accessToken: string
  user: User
}
