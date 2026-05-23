import { newsRepository } from '@/repositories/news.repository'
import { News, ApiResponse } from '@/types'

export class NewsService {
  async getAllNews(includeCategory = true): Promise<ApiResponse<News[]>> {
    return newsRepository.getAll(includeCategory)
  }

  async getNewsById(id: string, includeCategory = true): Promise<ApiResponse<News>> {
    return newsRepository.getById(id, includeCategory)
  }

  async getNewsByCategory(categoryId: string): Promise<ApiResponse<News[]>> {
    return newsRepository.getByCategory(categoryId)
  }

  async getPublishedNews(): Promise<ApiResponse<News[]>> {
    return newsRepository.getPublished()
  }

  async createNews(
    title: string,
    description: string | null,
    content: string | null,
    imageUrl: string | null,
    youtubeLink: string | null,
    categoryId: string | null,
    createdById: string | null,
    isPublished = false,
    subcategoryId: string | null = null
  ): Promise<ApiResponse<News>> {
    return newsRepository.create({
      title,
      description,
      content,
      image_url: imageUrl,
      youtube_link: youtubeLink,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      created_by: createdById,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
  }

  async updateNews(
    id: string,
    title?: string,
    description?: string | null,
    content?: string | null,
    imageUrl?: string | null,
    youtubeLink?: string | null,
    categoryId?: string | null,
    subcategoryId?: string | null,
    isPublished?: boolean
  ): Promise<ApiResponse<News>> {
    const updates: Partial<News> = {}

    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (content !== undefined) updates.content = content
    if (imageUrl !== undefined) updates.image_url = imageUrl
    if (youtubeLink !== undefined) updates.youtube_link = youtubeLink
    if (categoryId !== undefined) updates.category_id = categoryId
    if (subcategoryId !== undefined) updates.subcategory_id = subcategoryId
    if (isPublished !== undefined) {
      updates.is_published = isPublished
      updates.published_at = isPublished ? new Date().toISOString() : null
    }

    return newsRepository.update(id, updates)
  }

  async deleteNews(id: string): Promise<ApiResponse<void>> {
    return newsRepository.delete(id)
  }

  async togglePublishStatus(id: string): Promise<ApiResponse<News>> {
    // First get the current status
    const current = await newsRepository.getById(id, false)
    if (current.error || !current.data) {
      return { data: null, error: current.error || 'News not found' }
    }

    return newsRepository.togglePublish(id, !current.data.is_published)
  }
}

export const newsService = new NewsService()
