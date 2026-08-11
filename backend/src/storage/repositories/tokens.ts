export interface CrudRepository<T> {
  findById(id: string): Promise<T | undefined>
  findAll(): Promise<T[]>
  create(entity: T): Promise<T>
  update(id: string, entity: Partial<T>): Promise<T | undefined>
  delete(id: string): Promise<boolean>
}

export const USER_REPO = 'USER_REPO'
export const EVENT_REPO = 'EVENT_REPO'
export const PAYMENT_REPO = 'PAYMENT_REPO'
export const STREAM_SESSION_REPO = 'STREAM_SESSION_REPO'
export const VOD_REPO = 'VOD_REPO'
export const VIEW_STAT_REPO = 'VIEW_STAT_REPO'
export const CHAT_REPO = 'CHAT_REPO'
