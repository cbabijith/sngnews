import { createClient } from '@/lib/client'
import { Category, ApiResponse } from '@/types'

const supabase = createClient()

export class CategoryRepository {
  async getAll(): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
      }
    }
  }

  async getById(id: string): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch category',
      }
    }
  }

  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create category',
      }
    }
  }

  async update(id: string, category: Partial<Category>): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update category',
      }
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: null, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete category',
      }
    }
  }

  async hasRelatedNews(id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id')
        .eq('category_id', id)
        .limit(1)

      if (error) throw error

      return (data?.length || 0) > 0
    } catch (error) {
      return false
    }
  }

  async hasSubcategories(id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('id')
        .eq('category_id', id)
        .limit(1)

      if (error) throw error

      return (data?.length || 0) > 0
    } catch (error) {
      return false
    }
  }
}

export const categoryRepository = new CategoryRepository()
