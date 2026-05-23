'use client'

import { useState, useEffect } from 'react'
import { categoryService, subcategoryService } from '@/services'
import { Category, Subcategory } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { createClient } from '@supabase/supabase-js'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })

  useEffect(() => {
    fetchCategories()
    fetchSubcategories()
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

  const fetchCategories = async () => {
    const result = await categoryService.getAllCategories()
    if (result.data) {
      setCategories(result.data)
    }
    setLoading(false)
  }

  const fetchSubcategories = async () => {
    const result = await subcategoryService.getAllSubcategories()
    if (result.data) {
      setSubcategories(result.data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let result
    if (editingCategory) {
      result = await categoryService.updateCategory(editingCategory.id, formData.name, formData.description)
    } else {
      result = await categoryService.createCategory(formData.name, formData.description)
    }
    
    if (result.error) {
      alert(result.error)
      return
    }
    
    setShowForm(false)
    setEditingCategory(null)
    setFormData({ name: '', slug: '', description: '' })
    fetchCategories()
    fetchSubcategories()
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    const result = await categoryService.deleteCategory(id)
    if (result.error) {
      alert(result.error)
      return
    }
    fetchCategories()
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
        <div className="p-8">Loading categories...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Categories</h1>
        {isAdmin && (
          <button
            onClick={() => {
              setShowForm(true)
              setEditingCategory(null)
              setFormData({ name: '', slug: '', description: '' })
            }}
            className="px-6 py-3 bg-button text-white rounded-lg hover:opacity-90"
          >
            Add Category
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="w-full p-3 border rounded-lg"
                placeholder="Category name"
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
                placeholder="category-slug"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border rounded-lg"
                rows={3}
                placeholder="Category description"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-button text-white rounded-lg hover:opacity-90"
              >
                {editingCategory ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingCategory(null)
                  setFormData({ name: '', slug: '', description: '' })
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
        {categories.length === 0 ? (
          <p className="text-gray-500">No categories found</p>
        ) : (
          categories.map((category) => {
            const categorySubcategories = subcategories.filter(sub => sub.category_id === category.id)
            return (
              <div key={category.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">/{category.slug}</p>
                    {category.description && (
                      <p className="text-gray-600 mb-4">{category.description}</p>
                    )}
                    {categorySubcategories.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Subcategories ({categorySubcategories.length}):</p>
                        <div className="flex flex-wrap gap-2">
                          {categorySubcategories.map((sub) => (
                            <span
                              key={sub.id}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEdit(category)}
                          className="px-4 py-2 bg-button text-white rounded hover:opacity-90"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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
