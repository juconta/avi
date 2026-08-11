import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { UserRole } from '../common/decorators/roles.decorator'
import { User } from '../storage/entities/user.entity'
import { USER_REPO } from '../storage/repositories/tokens'
import { AuthService } from './auth.service'
import { MockRepo } from '../test/mock-repo'
import * as bcrypt from 'bcryptjs'

describe('AuthService', () => {
  let service: AuthService
  let userRepo: MockRepo<User>

  const jwtService = {
    sign: jest.fn((payload) => `token_${payload.sub}`),
  }

  beforeEach(async () => {
    userRepo = new MockRepo<User>([])

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPO, useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile()

    service = module.get(AuthService)
  })

  describe('register', () => {
    it('debería crear un usuario y devolver token', async () => {
      const result = await service.register({
        email: 'JUAN@test.com',
        name: 'Juan',
        password: 'secreto123',
      })

      expect(result.accessToken).toBeDefined()
      expect(result.user.email).toBe('juan@test.com')
      expect(result.user.role).toBe(UserRole.USER)
      expect((result.user as any).password).toBeUndefined()
      expect(await bcrypt.compare('secreto123', userRepo.items[0].password)).toBe(true)
    })

    it('debería rechazar email duplicado', async () => {
      await service.register({ email: 'a@b.com', name: 'A', password: '123456' })

      await expect(
        service.register({ email: 'A@b.com', name: 'B', password: '123456' }),
      ).rejects.toThrow('El correo ya está registrado')
    })
  })

  describe('login', () => {
    it('debería autenticar credenciales válidas', async () => {
      const hashed = await bcrypt.hash('123456', 10)
      userRepo.items.push({
        id: 'u1',
        email: 'user@test.com',
        password: hashed,
        name: 'User',
        role: UserRole.USER,
        createdAt: new Date(),
      })

      const result = await service.login({ email: 'user@test.com', password: '123456' })
      expect(result.user.id).toBe('u1')
      expect(result.accessToken).toBe('token_u1')
    })

    it('debería rechazar credenciales inválidas', async () => {
      const hashed = await bcrypt.hash('123456', 10)
      userRepo.items.push({
        id: 'u1',
        email: 'user@test.com',
        password: hashed,
        name: 'User',
        role: UserRole.USER,
        createdAt: new Date(),
      })

      await expect(service.login({ email: 'user@test.com', password: 'incorrecta' })).rejects.toThrow(
        'Credenciales inválidas',
      )
    })

    it('debería rechazar email inexistente', async () => {
      await expect(service.login({ email: 'nadie@test.com', password: '123456' })).rejects.toThrow(
        'Credenciales inválidas',
      )
    })
  })

  describe('validateUser', () => {
    it('debería devolver el usuario autenticado', async () => {
      userRepo.items.push({
        id: 'u1',
        email: 'user@test.com',
        password: 'x',
        name: 'User',
        role: UserRole.ADMIN,
        createdAt: new Date(),
      })

      const result = await service.validateUser({ sub: 'u1' })
      expect(result.role).toBe(UserRole.ADMIN)
    })

    it('debería fallar si el usuario no existe', async () => {
      await expect(service.validateUser({ sub: 'nope' })).rejects.toThrow('Usuario no encontrado')
    })
  })
})
