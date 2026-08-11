import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles || requiredRoles.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const user: AuthUser | undefined = request.user
    if (!user) throw new ForbiddenException('No autenticado')

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`Se requiere rol: ${requiredRoles.join(', ')}`)
    }
    return true
  }
}
