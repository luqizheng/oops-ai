import { Injectable, OnModuleInit } from '@nestjs/common'
import { ChromaClient } from 'chromadb'

@Injectable()
export class VectorService implements OnModuleInit {
  private client: ChromaClient | null = null
  private collection: any = null
  private readonly collectionName = 'requirements'

  async onModuleInit() {
    await this.initializeClient()
  }

  private async initializeClient() {
    try {
      this.client = new ChromaClient({
        path: 'http://localhost:8000',
      })

      const collections = await this.client.listCollections()
      const exists = collections.some(col => col.name === this.collectionName)

      if (exists) {
        this.collection = await this.client.getCollection({
          name: this.collectionName,
        })
      } else {
        this.collection = await this.client.createCollection({
          name: this.collectionName,
          metadata: { description: 'Requirements vector store' },
        })
      }
    } catch (error) {
      console.warn('ChromaDB not available, vector search disabled:', error.message)
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      return Array(768).fill(0)
    }

    const words = text.toLowerCase().split(/\s+/)
    const embedding = Array(768).fill(0)

    words.forEach((word, index) => {
      const hash = this.hashString(word)
      const position = hash % 768
      embedding[position] += 1
    })

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    if (magnitude > 0) {
      return embedding.map(val => val / magnitude)
    }

    return embedding
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  async addRequirement(id: string, embedding: number[]) {
    if (!this.collection) {
      return
    }

    try {
      await this.collection.add({
        ids: [id],
        embeddings: [embedding],
        metadatas: [{ id }],
      })
    } catch (error) {
      console.error('Failed to add requirement to vector store:', error.message)
    }
  }

  async updateRequirement(id: string, embedding: number[]) {
    if (!this.collection) {
      return
    }

    try {
      await this.collection.update({
        ids: [id],
        embeddings: [embedding],
        metadatas: [{ id }],
      })
    } catch (error) {
      console.error('Failed to update requirement in vector store:', error.message)
    }
  }

  async removeRequirement(id: string) {
    if (!this.collection) {
      return
    }

    try {
      await this.collection.delete({ ids: [id] })
    } catch (error) {
      console.error('Failed to remove requirement from vector store:', error.message)
    }
  }

  async searchSimilarRequirements(
    embedding: number[],
    limit: number = 5,
  ): Promise<Array<{ id: string; similarity: number }>> {
    if (!this.collection) {
      return []
    }

    try {
      const results = await this.collection.query({
        queryEmbeddings: [embedding],
        nResults: limit,
      })

      if (results.ids[0] && results.distances[0]) {
        return results.ids[0].map((id: string, index: number) => ({
          id,
          similarity: 1 - (results.distances[0][index] || 0),
        }))
      }

      return []
    } catch (error) {
      console.error('Failed to search similar requirements:', error.message)
      return []
    }
  }

  async findSimilarRequirements(
    text: string,
    limit: number = 5,
  ): Promise<Array<{ id: string; similarity: number }>> {
    const embedding = await this.generateEmbedding(text)
    return this.searchSimilarRequirements(embedding, limit)
  }
}