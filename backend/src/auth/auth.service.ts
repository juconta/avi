import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserRole } from '../common/decorators/roles.decorator'
import { AuthUser } from '../common/guards/roles.guard'
import { User } from '../storage/entities/user.entity'
import { USER_REPO } from '../storage/repositories/tokens'
import { CrudRepository } from '../storage/repositories/tokens'
import * as bcrypt from 'bcryptjs'
import { LoginDto, RegisterDto } from './dto/auth.dto'

export interface AuthResult {
  accessToken: string
  user: Omit<User, 'password'>
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPO) private readonly userRepo: CrudRepository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.userRepo.findAll()
    if (existing.some((u) => u.email === dto.email.toLowerCase())) {
      throw new UnauthorizedException('El correo ya está registrado')
    }

    const hashed = await bcrypt.hash(dto.password, 10)
    const user: User = {
      id: crypto.randomUUID(),
      email: dto.email.toLowerCase(),
      name: dto.name,
      password: hashed,
      role: UserRole.USER,
      createdAt: new Date(),
    }
    await this.userRepo.create(user)
    return this.buildAuthResult(user)
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const users = await this.userRepo.findAll()
    const user = users.find((u) => u.email === dto.email.toLowerCase())
    if (!user) throw new UnauthorizedException('Credenciales inválidas')

    const valid = await bcrypt.compare(dto.password, user.password)
    if (!valid) throw new UnauthorizedException('Credenciales inválidas')

    return this.buildAuthResult(user)
  }

  async validateUser(payload: { sub: string }): Promise<AuthUser> {
    const user = await this.userRepo.findById(payload.sub)
    if (!user) throw new UnauthorizedException('Usuario no encontrado')
    return { id: user.id, email: user.email, role: user.role }
  }

  private buildAuthResult(user: User): AuthResult {
    const payload = { sub: user.id, email: user.email, role: user.role }
    const accessToken = this.jwtService.sign(payload)
    const { password: _pw, ...safe } = user
    return { accessToken, user: safe }
  }
}
