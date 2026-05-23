import { subcategoryRepository } from '@/repositories'
import { Subcategory, ApiResponse } from '@/types'

export class SubcategoryService {
  async getAllSubcategories(): Promise<ApiResponse<Subcategory[]>> {
    return subcategoryRepository.getAll()
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<ApiResponse<Subcategory[]>> {
    return subcategoryRepository.getByCategory(categoryId)
  }

  async getSubcategoryById(id: string): Promise<ApiResponse<Subcategory>> {
    return subcategoryRepository.getById(id)
  }

  async createSubcategory(
    categoryId: string,
    name: string,
    description?: string
  ): Promise<ApiResponse<Subcategory>> {
    const slug = this.generateSlug(name)
    return subcategoryRepository.create({
      category_id: categoryId,
      name,
      slug,
      description: description || null,
    })
  }

  async updateSubcategory(
    id: string,
    name: string,
    description?: string
  ): Promise<ApiResponse<Subcategory>> {
    const slug = this.generateSlug(name)
    return subcategoryRepository.update(id, {
      name,
      slug,
      description: description || null,
    })
  }

  async deleteSubcategory(id: string): Promise<ApiResponse<void>> {
    const hasRelatedNews = await subcategoryRepository.hasRelatedNews(id)
    if (hasRelatedNews) {
      return {
        data: null,
        error: 'Cannot delete subcategory with related news items',
      }
    }
    return subcategoryRepository.delete(id)
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
}

export const subcategoryService = new SubcategoryService()
