'use client'

import { useEffect, useState } from 'react'
import { CategoryForm } from '@/components/category-form'
import { CategoryList } from '@/components/category-list'
import { useDB } from '@/hooks/useDB'
import { Category } from '@/lib/types'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CategoriesPage() {
  const db = useDB()
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch categories
  useEffect(() => {
    if (!db.dbReady) return

    const fetchCategories = async () => {
      try {
        setLoading(true)
        const cats = await db.getAllCategories()
        setCategories(cats)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [db.dbReady])

  const handleAddCategory = async (formData: any) => {
    setIsSubmitting(true)
    try {
      if (editingCategory) {
        await db.updateCategory(editingCategory.id, formData)
      } else {
        await db.addCategory(formData)
      }

      // Refresh data
      const cats = await db.getAllCategories()
      setCategories(cats)

      setShowForm(false)
      setEditingCategory(null)
    } catch (error) {
      console.error('Error adding category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await db.deleteCategory(id)
      const cats = await db.getAllCategories()
      setCategories(cats)
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  if (!db.dbReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-600">Initializing database...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-600 mt-2">Organize your transactions</p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <CategoryForm
          onSubmit={handleAddCategory}
          onClose={handleCloseForm}
          initialData={editingCategory || undefined}
          isLoading={isSubmitting}
        />
      )}

      {/* List */}
      <CategoryList
        categories={categories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        isLoading={loading}
      />
    </div>
  )
}
