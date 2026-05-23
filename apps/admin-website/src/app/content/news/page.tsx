'use client'

import { useState, useEffect } from 'react'
import { newsService, categoryService, subcategoryService } from '@/services'
import { supabaseApi } from '@/api/supabase.api'
import { News, Category, Subcategory } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useThemeStore } from '@/store/themeStore'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

export default function NewsPage() {
  const { colors } = useThemeStore()
  const [newsItems, setNewsItems] = useState<News[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [formData, setFormData] = useState({
    category_id: '',
    subcategory_id: '',
    title: '',
    content: '',
    image_url: '',
    youtube_link: '',
    is_published: false
  })

  // Auto-save draft to localStorage
  useEffect(() => {
    if (showForm && !editingNews) {
      localStorage.setItem('news-draft', JSON.stringify(formData))
    }
  }, [formData, showForm, editingNews])

  // Load draft when opening form
  useEffect(() => {
    if (showForm && !editingNews) {
      const savedDraft = localStorage.getItem('news-draft')
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft)
          setFormData({
            category_id: draft.category_id || '',
            subcategory_id: draft.subcategory_id || '',
            title: draft.title || '',
            content: draft.content || '',
            image_url: draft.image_url || '',
            youtube_link: draft.youtube_link || '',
            is_published: draft.is_published || false
          })
        } catch (e) {
          console.error('Error loading draft:', e)
        }
      }
    }
  }, [showForm, editingNews])

  useEffect(() => {
    fetchNews()
    fetchCategories()
    fetchSubcategories()
  }, [])

  const fetchNews = async () => {
    const result = await newsService.getAllNews(true)
    if (result.data) {
      setNewsItems(result.data)
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    const result = await categoryService.getAllCategories()
    if (result.data) {
      setCategories(result.data)
    }
  }

  const fetchSubcategories = async () => {
    const result = await subcategoryService.getAllSubcategories()
    if (result.data) {
      setSubcategories(result.data)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Delete old image if exists
      if (formData.image_url) {
        try {
          const url = new URL(formData.image_url)
          const pathParts = url.pathname.split('/')
          const fileName = pathParts[pathParts.length - 1]
          await supabaseApi.storage.deleteImage(fileName)
        } catch (error) {
          console.error('Error deleting old image:', error)
        }
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const result = await supabaseApi.storage.uploadImage(file, filePath)
      if (result.error) throw new Error(result.error)

      setFormData({ ...formData, image_url: result.data })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (formData.image_url) {
      try {
        const url = new URL(formData.image_url)
        const pathParts = url.pathname.split('/')
        const fileName = pathParts[pathParts.length - 1]
        await supabaseApi.storage.deleteImage(fileName)
      } catch (error) {
        console.error('Error deleting image from storage:', error)
      }
    }
    setFormData({ ...formData, image_url: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let result
    if (editingNews) {
      result = await newsService.updateNews(
        editingNews.id,
        formData.title,
        null,
        formData.content,
        formData.image_url,
        formData.youtube_link,
        formData.category_id || null,
        formData.subcategory_id || null,
        formData.is_published
      )
    } else {
      result = await newsService.createNews(
        formData.title,
        null,
        formData.content,
        formData.image_url,
        formData.youtube_link,
        formData.category_id || null,
        null,
        formData.is_published,
        formData.subcategory_id || null
      )
    }
    
    if (result.error) {
      alert(result.error)
      return
    }
    
    setShowForm(false)
    setEditingNews(null)
    setFormData({
      category_id: '',
      subcategory_id: '',
      title: '',
      content: '',
      image_url: '',
      youtube_link: '',
      is_published: false
    })
    localStorage.removeItem('news-draft')
    fetchNews()
  }

  const handleCancel = () => {
    setShowCancelConfirm(true)
  }

  const confirmCancel = () => {
    setShowCancelConfirm(false)
    setShowForm(false)
    setEditingNews(null)
    setFormData({
      category_id: '',
      subcategory_id: '',
      title: '',
      content: '',
      image_url: '',
      youtube_link: '',
      is_published: false
    })
    localStorage.removeItem('news-draft')
  }

  const handleEdit = (news: News) => {
    setEditingNews(news)
    setFormData({
      category_id: news.category_id || '',
      subcategory_id: news.subcategory_id || '',
      title: news.title,
      content: news.content || '',
      image_url: news.image_url || '',
      youtube_link: news.youtube_link || '',
      is_published: news.is_published
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return
    
    // Get the news item to check for image
    const newsItem = newsItems.find(item => item.id === id)
    
    // Delete image from storage if exists
    if (newsItem?.image_url) {
      try {
        // Extract file path from URL
        const url = new URL(newsItem.image_url)
        const pathParts = url.pathname.split('/')
        const fileName = pathParts[pathParts.length - 1]
        await supabaseApi.storage.deleteImage(fileName)
      } catch (error) {
        console.error('Error deleting image from storage:', error)
      }
    }
    
    const result = await newsService.deleteNews(id)
    if (result.error) {
      alert(result.error)
      return
    }
    fetchNews()
  }

  const togglePublish = async (news: News) => {
    const result = await newsService.togglePublishStatus(news.id)
    if (result.error) {
      alert(result.error)
      return
    }
    fetchNews()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">Loading news...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-4xl font-bold ${colors.text}`}>News Management</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingNews(null)
            setFormData({
              category_id: '',
              subcategory_id: '',
              title: '',
              content: '',
              image_url: '',
              youtube_link: '',
              is_published: false
            })
          }}
          className="px-6 py-3 bg-button text-white rounded-lg hover:opacity-90"
        >
          Add News
        </button>
      </div>

      {showForm && (
        <div className={`${colors.card} p-6 rounded-lg shadow mb-8`}>
          <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>
            {editingNews ? 'Edit News' : 'Add New News'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value, subcategory_id: '' })}
                className={`w-full p-3 ${colors.border} rounded-lg ${colors.text}`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {formData.category_id && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Subcategory (Optional)</label>
                <select
                  value={formData.subcategory_id}
                  onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                  className={`w-full p-3 ${colors.border} rounded-lg ${colors.text}`}
                >
                  <option value="">No subcategory</option>
                  {subcategories
                    .filter(sub => sub.category_id === formData.category_id)
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                </select>
              </div>
            )}
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className={`w-full p-3 ${colors.border} rounded-lg ${colors.text}`}
                placeholder="News title"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Content</label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={`w-full p-3 ${colors.border} rounded-lg ${colors.text}`}
                disabled={uploading}
              />
              {uploading && <p className={`text-sm ${colors.textSecondary} mt-1`}>Uploading...</p>}
              {formData.image_url && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="max-w-xs rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-opacity"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text}`}>YouTube Link</label>
              <input
                type="url"
                value={formData.youtube_link}
                onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
                className={`w-full p-3 ${colors.border} rounded-lg ${colors.text}`}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-button text-white rounded-lg hover:opacity-90"
                disabled={uploading}
              >
                {editingNews ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${colors.card} p-6 rounded-lg shadow-lg max-w-md w-full mx-4`}>
            <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>Cancel News Creation?</h3>
            <p className={`${colors.text} mb-6`}>
              Are you sure you want to cancel? This will clear all your changes and delete the draft.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmCancel}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Cancel & Discard
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {newsItems.length === 0 ? (
          <p className={colors.textSecondary}>No news items found</p>
        ) : (
          newsItems.map((item) => (
            <div key={item.id} className={`${colors.card} p-6 rounded-lg shadow`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                    {item.published_at && (
                      <span className={`text-sm ${colors.textSecondary}`}>
                        {new Date(item.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${colors.text}`}>{item.title}</h3>
                  {item.description && (
                    <p className={`${colors.textSecondary} mb-2`}>{item.description}</p>
                  )}
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="mt-2 max-w-xs rounded-lg"
                    />
                  )}
                  {item.youtube_link && (
                    <a
                      href={item.youtube_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline mt-2 block"
                    >
                      YouTube Video
                    </a>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => togglePublish(item)}
                    className={`w-10 h-10 flex items-center justify-center text-white rounded-lg hover:opacity-90 transition-opacity ${
                      item.is_published ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    title={item.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {item.is_published ? '↓' : '↑'}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="w-10 h-10 flex items-center justify-center bg-button text-white rounded-lg hover:opacity-90 transition-opacity"
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-opacity"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
