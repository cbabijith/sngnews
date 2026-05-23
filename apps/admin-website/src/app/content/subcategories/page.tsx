'use client'

import { useState, useEffect } from 'react'
import { subcategoryService, categoryService } from '@/services'
import { Subcategory, Category } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { createClient } from '@supabase/supabase-js'

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    slug: '',
    description: ''
  })

  useEffect(() => {
    fetchSubcategories()
    fetchCategories()
    checkAdminRole()
  }, [])

  const checkAdminRole = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    setIsAdmin(profile?.role === 'admin')
  }

  const fetchSubcategories = async () => {
    const result = await subcategoryService.getAllSubcategories()
    if (result.data) {
      setSubcategories(result.data)
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    const result = await categoryService.getAllCategories()
    if (result.data) {
      setCategories(result.data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let result
    if (editingSubcategory) {
      result = await subcategoryService.updateSubcategory(
        editingSubcategory.id,
        formData.name,
        formData.description
      )
    } else {
      result = await subcategoryService.createSubcategory(
        formData.category_id,
        formData.name,
        formData.description
      )
    }
    
    if (result.error) {
      alert(result.error)
      return
    }
    
    setShowForm(false)
    setEditingSubcategory(null)
    setFormData({ category_id: '', name: '', slug: '', description: '' })
    fetchSubcategories()
  }

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory)
    setFormData({
      category_id: subcategory.category_id,
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return
    
    const result = await subcategoryService.deleteSubcategory(id)
    if (result.error) {
      alert(result.error)
      return
    }
    fetchSubcategories()
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">Loading subcategories...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Subcategories</h1>
        {isAdmin && (
          <button
            onClick={() => {
              setShowForm(true)
              setEditingSubcategory(null)
              setFormData({ category_id: '', name: '', slug: '', description: '' })
            }}
            className="px-6 py-3 bg-button text-white rounded-lg hover:opacity-90"
          >
            Add Subcategory
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full p-3 border rounded-lg"
                required
                disabled={!!editingSubcategory}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="w-full p-3 border rounded-lg"
                placeholder="Subcategory name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                className="w-full p-3 border rounded-lg"
                placeholder="subcategory-slug"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border rounded-lg"
                rows={3}
                placeholder="Subcategory description"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-button text-white rounded-lg hover:opacity-90"
              >
                {editingSubcategory ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingSubcategory(null)
                  setFormData({ category_id: '', name: '', slug: '', description: '' })
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
        {subcategories.length === 0 ? (
          <p className="text-gray-500">No subcategories found</p>
        ) : (
          subcategories.map((subcategory) => {
            const category = categories.find(c => c.id === subcategory.category_id)
            return (
              <div key={subcategory.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {category?.name}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold">{subcategory.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">/{subcategory.slug}</p>
                    {subcategory.description && (
                      <p className="text-gray-600">{subcategory.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEdit(subcategory)}
                          className="px-4 py-2 bg-button text-white rounded hover:opacity-90"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subcategory.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </DashboardLayout>
  )
}
