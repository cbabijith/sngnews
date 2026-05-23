'use client'

import { useState, useEffect } from 'react'
import { newsService, categoryService } from '@/services'
import { supabaseApi } from '@/api/supabase.api'
import { News, Category } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<News[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    content: '',
    image_url: '',
    youtube_link: '',
    is_published: false
  })

  useEffect(() => {
    fetchNews()
    fetchCategories()
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let result
    if (editingNews) {
      result = await newsService.updateNews(
        editingNews.id,
        formData.title,
        formData.description,
        formData.content,
        formData.image_url,
        formData.youtube_link,
        formData.category_id || null,
        formData.is_published
      )
    } else {
      result = await newsService.createNews(
        formData.title,
        formData.description,
        formData.content,
        formData.image_url,
        formData.youtube_link,
        formData.category_id || null,
        null,
        formData.is_published
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
      title: '',
      description: '',
      content: '',
      image_url: '',
      youtube_link: '',
      is_published: false
    })
    fetchNews()
  }

  const handleEdit = (news: News) => {
    setEditingNews(news)
    setFormData({
      category_id: news.category_id || '',
      title: news.title,
      description: news.description || '',
      content: news.content || '',
      image_url: news.image_url || '',
      youtube_link: news.youtube_link || '',
      is_published: news.is_published
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return
    
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
        <h1 className="text-4xl font-bold">News Management</h1>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingNews(null)
            setFormData({
              category_id: '',
              title: '',
              description: '',
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
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editingNews ? 'Edit News' : 'Add New News'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full p-3 border rounded-lg"
                placeholder="News title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border rounded-lg"
                rows={3}
                placeholder="Short description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full p-3 border rounded-lg"
                rows={10}
                placeholder="Full article content"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-3 border rounded-lg"
                disabled={uploading}
              />
              {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="mt-2 max-w-xs rounded-lg"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">YouTube Link</label>
              <input
                type="url"
                value={formData.youtube_link}
                onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
                className="w-full p-3 border rounded-lg"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_published" className="text-sm font-medium">
                Publish immediately
              </label>
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
                onClick={() => {
                  setShowForm(false)
                  setEditingNews(null)
                  setFormData({
                    category_id: '',
                    title: '',
                    description: '',
                    content: '',
                    image_url: '',
                    youtube_link: '',
                    is_published: false
                  })
                }}
                className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {newsItems.length === 0 ? (
          <p className="text-gray-500">No news items found</p>
        ) : (
          newsItems.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                    {item.published_at && (
                      <span className="text-sm text-gray-500">
                        {new Date(item.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-600 mb-2">{item.description}</p>
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
className={`px-4 py-2 text-white rounded ${
                      item.is_published ? 'bg-yellow-500 hover:opacity-90' : 'bg-green-500 hover:opacity-90'
                    }`}
                  >
                    {item.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
className="px-4 py-2 bg-button text-white rounded hover:opacity-90"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
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
