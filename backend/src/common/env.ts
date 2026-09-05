export function jwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET
  if (fromEnv && fromEnv !== 'avi_dev_secret_change_in_production') {
    return fromEnv
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET no está configurado en producción')
  }
  return 'avi_dev_secret_change_in_production'
}