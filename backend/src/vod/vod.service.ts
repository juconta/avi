import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { VodAsset } from '../storage/entities/vod.entity'
import { VOD_REPO } from '../storage/repositories/tokens'
import { CrudRepository } from '../storage/repositories/tokens'
import { CreateVodDto, UpdateVodDto } from './dto/vod.dto'

@Injectable()
export class VodService {
  constructor(@Inject(VOD_REPO) private readonly vodRepo: CrudRepository<VodAsset>) {}

  async findAll(): Promise<VodAsset[]> {
    const assets = await this.vodRepo.findAll()
    return assets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async findById(id: string): Promise<VodAsset> {
    const asset = await this.vodRepo.findById(id)
    if (!asset) throw new NotFoundException(`Contenido VOD ${id} no encontrado`)
    return asset
  }

  async create(dto: CreateVodDto): Promise<VodAsset> {
    const asset: VodAsset = {
      id: crypto.randomUUID(),
      title: dto.title,
      description: dto.description,
      durationSeconds: dto.durationSeconds,
      videoUrl: dto.videoUrl,
      thumbUrl: dto.thumbUrl ?? `https://picsum.photos/seed/${crypto.randomUUID()}/1280/720`,
      price: dto.price,
      createdAt: new Date(),
    }
    return this.vodRepo.create(asset)
  }

  async update(id: string, dto: UpdateVodDto): Promise<VodAsset> {
    const asset = await this.vodRepo.update(id, dto)
    if (!asset) throw new NotFoundException(`Contenido VOD ${id} no encontrado`)
    return asset
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.vodRepo.delete(id)
    if (!deleted) throw new NotFoundException(`Contenido VOD ${id} no encontrado`)
  }
}
