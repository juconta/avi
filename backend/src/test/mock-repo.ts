export class MockRepo<T extends { id: string }> {
  items: T[] = []

  constructor(seed?: T[]) {
    if (seed) this.items = [...seed]
  }

  async findById(id: string): Promise<T | undefined> {
    return this.items.find((i) => i.id === id)
  }

  async findAll(): Promise<T[]> {
    return [...this.items]
  }

  async create(entity: T): Promise<T> {
    this.items.push(entity)
    return entity
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    const idx = this.items.findIndex((i) => i.id === id)
    if (idx === -1) return undefined
    this.items[idx] = { ...this.items[idx], ...patch }
    return this.items[idx]
  }

  async delete(id: string): Promise<boolean> {
    const before = this.items.length
    this.items = this.items.filter((i) => i.id !== id)
    return this.items.length < before
  }
}
