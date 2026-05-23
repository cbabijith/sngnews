'use client'

import { useEffect, useState } from 'react'
import { newsService, categoryService } from '@/services'
import { profileRepository } from '@/repositories'
import { DashboardStats } from './DashboardStats'

export function Dashboard() {
  const [stats, setStats] = useState({
    totalNews: 0,
    totalStaff: 0,
    totalUsers: 0,
    totalCategories: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [newsResult, categoriesResult, staffResult, usersResult] = await Promise.all([
          newsService.getPublishedNews(),
          categoryService.getAllCategories(),
          profileRepository.getByRole('staff'),
          profileRepository.getByRole('user'),
        ])

        setStats({
          totalNews: newsResult.data?.length || 0,
          totalStaff: staffResult.data?.length || 0,
          totalUsers: usersResult.data?.length || 0,
          totalCategories: categoriesResult.data?.length || 0,
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your news platform</p>
      </div>

      <DashboardStats
        totalNews={stats.totalNews}
        totalStaff={stats.totalStaff}
        totalUsers={stats.totalUsers}
        totalCategories={stats.totalCategories}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">No recent activity to display</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/content/news"
              className="block px-4 py-2 bg-button text-white rounded-lg hover:opacity-90 text-center"
            >
              Add New News
            </a>
            <a
              href="/content/categories"
              className="block px-4 py-2 bg-button text-white rounded-lg hover:opacity-90 text-center"
            >
              Add New Category
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
