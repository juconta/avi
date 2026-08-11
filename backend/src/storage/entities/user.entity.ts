import { UserRole } from '../../common/decorators/roles.decorator'

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  createdAt: Date
}
