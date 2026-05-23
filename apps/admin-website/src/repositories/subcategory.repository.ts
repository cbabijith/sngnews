import { createClient } from '@/lib/client'
import { Subcategory, ApiResponse } from '@/types'

const supabase = createClient()

export class SubcategoryRepository {
  async getAll(): Promise<ApiResponse<Subcategory[]>> {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*, categories(name)')
        .order('name')

      if (error) throw error

      return { data: data as unknown as Subcategory[], error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch subcategories',
      }
    }
  }

  async getByCategory(categoryId: string): Promise<ApiResponse<Subcategory[]>> {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('name')

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch subcategories by category',
      }
    }
  }

  async getById(id: string): Promise<ApiResponse<Subcategory>> {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*, categories(name)')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data: data as unknown as Subcategory, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch subcategory',
      }
    }
  }

  async create(subcategory: Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Subcategory>> {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .insert(subcategory)
        .select('*, categories(name)')
        .single()

      if (error) throw error

      return { data: data as unknown as Subcategory, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create subcategory',
      }
    }
  }

  async update(id: string, updates: Partial<Omit<Subcategory, 'id' | 'created_at' | 'updated_at'>>): Promise<ApiResponse<Subcategory>> {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .update(updates)
        .eq('id', id)
        .select('*, categories(name)')
        .single()

      if (error) throw error

      return { data: data as unknown as Subcategory, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update subcategory',
      }
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: null, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete subcategory',
      }
    }
  }

  async hasRelatedNews(id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id')
        .eq('subcategory_id', id)
        .limit(1)

      if (error) throw error

      return (data?.length || 0) > 0
    } catch (error) {
      return false
    }
  }
}

export const subcategoryRepository = new SubcategoryRepository()
