import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { VodAsset } from '../storage/entities/vod.entity'
import { VOD_REPO } from '../storage/repositories/tokens'
import { VodService } from './vod.service'
import { MockRepo } from '../test/mock-repo'

describe('VodService', () => {
  let service: VodService
  let repo: MockRepo<VodAsset>

  beforeEach(async () => {
    repo = new MockRepo<VodAsset>([
      {
        id: 'vod-1',
        title: 'Doc 1',
        description: 'Desc',
        durationSeconds: 3600,
        thumbUrl: 'thumb',
        videoUrl: 'video',
        price: 2.99,
        createdAt: new Date('2024-01-01'),
      },
    ])

    const module = await Test.createTestingModule({
      providers: [VodService, { provide: VOD_REPO, useValue: repo }],
    }).compile()

    service = module.get(VodService)
  })

  describe('findAll', () => {
    it('debería devolver todos los contenidos', async () => {
      const assets = await service.findAll()
      expect(assets).toHaveLength(1)
    })
  })

  describe('findById', () => {
    it('debería encontrar un contenido existente', async () => {
      const asset = await service.findById('vod-1')
      expect(asset.title).toBe('Doc 1')
    })

    it('debería fallar si no existe', async () => {
      await expect(service.findById('nope')).rejects.toThrow('no encontrado')
    })
  })

  describe('create', () => {
    it('debería crear un nuevo contenido', async () => {
      const created = await service.create({
        title: 'Nuevo',
        description: 'Desc',
        durationSeconds: 120,
        videoUrl: 'url',
        price: 0,
      })

      expect(created.price).toBe(0)
      expect(repo.items).toHaveLength(2)
    })
  })

  describe('update', () => {
    it('debería actualizar un contenido', async () => {
      const updated = await service.update('vod-1', { price: 5.5 })
      expect(updated.price).toBe(5.5)
    })

    it('debería fallar si no existe', async () => {
      await expect(service.update('nope', { price: 1 })).rejects.toThrow('no encontrado')
    })
  })

  describe('remove', () => {
    it('debería eliminar un contenido', async () => {
      await service.remove('vod-1')
      expect(repo.items).toHaveLength(0)
    })

    it('debería fallar si no existe', async () => {
      await expect(service.remove('nope')).rejects.toThrow('no encontrado')
    })
  })
})
