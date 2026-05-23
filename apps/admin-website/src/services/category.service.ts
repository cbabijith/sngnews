import { categoryRepository } from '@/repositories/category.repository'
import { Category, ApiResponse } from '@/types'

export class CategoryService {
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    return categoryRepository.getAll()
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return categoryRepository.getById(id)
  }

  async createCategory(name: string, description?: string): Promise<ApiResponse<Category>> {
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    return categoryRepository.create({
      name,
      slug,
      description: description || null,
    })
  }

  async updateCategory(id: string, name?: string, description?: string): Promise<ApiResponse<Category>> {
    const updates: Partial<Category> = {}

    if (name) {
      updates.name = name
      updates.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    if (description !== undefined) {
      updates.description = description
    }

    return categoryRepository.update(id, updates)
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    const hasRelatedNews = await categoryRepository.hasRelatedNews(id)
    if (hasRelatedNews) {
      return {
        data: null,
        error: 'Cannot delete category with related news items',
      }
    }

    const hasSubcategories = await categoryRepository.hasSubcategories(id)
    if (hasSubcategories) {
      return {
        data: null,
        error: 'Cannot delete category with subcategories',
      }
    }

    return categoryRepository.delete(id)
  }
}

export const categoryService = new CategoryService()
