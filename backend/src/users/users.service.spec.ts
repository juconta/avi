import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { UserRole } from '../common/decorators/roles.decorator'
import { User } from '../storage/entities/user.entity'
import { USER_REPO } from '../storage/repositories/tokens'
import { UsersService } from './users.service'
import { MockRepo } from '../test/mock-repo'

describe('UsersService', () => {
  let service: UsersService
  let repo: MockRepo<User>

  beforeEach(async () => {
    repo = new MockRepo<User>([
      {
        id: 'u1',
        email: 'a@b.com',
        password: 'hash',
        name: 'Ana',
        role: UserRole.USER,
        createdAt: new Date(),
      },
    ])

    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: USER_REPO, useValue: repo }],
    }).compile()

    service = module.get(UsersService)
  })

  describe('findAll', () => {
    it('debería devolver usuarios sin contraseña', async () => {
      const users = await service.findAll()
      expect(users).toHaveLength(1)
      expect((users[0] as any).password).toBeUndefined()
    })
  })

  describe('findById', () => {
    it('debería encontrar un usuario existente', async () => {
      const user = await service.findById('u1')
      expect(user.name).toBe('Ana')
      expect((user as any).password).toBeUndefined()
    })

    it('debería fallar si no existe', async () => {
      await expect(service.findById('nope')).rejects.toThrow('no encontrado')
    })
  })

  describe('updateProfile', () => {
    it('debería actualizar el nombre', async () => {
      const updated = await service.updateProfile('u1', { name: 'Ana María' })
      expect(updated.name).toBe('Ana María')
    })

    it('debería fallar si no existe', async () => {
      await expect(service.updateProfile('nope', { name: 'X' })).rejects.toThrow('no encontrado')
    })
  })
})
