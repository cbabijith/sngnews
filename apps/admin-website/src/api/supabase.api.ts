import { createClient } from '@/lib/client'
import { categoryRepository, newsRepository } from '@/repositories'

// This layer provides a unified API interface for external calls
// Currently it wraps the repository layer, but can be extended for external APIs

const supabase = createClient()

export const supabaseApi = {
  // Auth
  auth: {
    signIn: async (email: string, password: string) => {
      return supabase.auth.signInWithPassword({ email, password })
    },
    signOut: async () => {
      return supabase.auth.signOut()
    },
    signUp: async (email: string, password: string) => {
      return supabase.auth.signUp({ email, password })
    },
    getUser: async () => {
      return supabase.auth.getUser()
    },
  },

  // Storage
  storage: {
    uploadImage: async (file: File, path: string) => {
      const { data, error } = await supabase.storage
        .from('news-images')
        .upload(path, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(path)

      return { data: publicUrl, error: null }
    },

    deleteImage: async (path: string) => {
      return supabase.storage
        .from('news-images')
        .remove([path])
    },
  },

  // Database (delegates to repositories)
  categories: categoryRepository,
  news: newsRepository,
}
