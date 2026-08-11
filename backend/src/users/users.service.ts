import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { User } from '../storage/entities/user.entity'
import { USER_REPO } from '../storage/repositories/tokens'
import { CrudRepository } from '../storage/repositories/tokens'

@Injectable()
export class UsersService {
  constructor(@Inject(USER_REPO) private readonly userRepo: CrudRepository<User>) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepo.findAll()
    return users.map(({ password: _pw, ...rest }) => rest)
  }

  async findById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.findById(id)
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`)
    const { password: _pw, ...rest } = user
    return rest
  }

  async updateProfile(id: string, data: Partial<Pick<User, 'name'>>): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.update(id, data)
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`)
    const { password: _pw, ...rest } = user
    return rest
  }
}
