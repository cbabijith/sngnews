'use client'

interface StatCardProps {
  title: string
  value: number
  icon: string
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`text-4xl ${color}`}>{icon}</div>
      </div>
    </div>
  )
}

interface DashboardStatsProps {
  totalNews: number
  totalStaff: number
  totalUsers: number
  totalCategories: number
}

export function DashboardStats({ 
  totalNews, 
  totalStaff, 
  totalUsers, 
  totalCategories 
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total News Published"
        value={totalNews}
        icon="📰"
        color="text-blue-500"
      />
      <StatCard
        title="Total Staff"
        value={totalStaff}
        icon="👥"
        color="text-green-500"
      />
      <StatCard
        title="Total Users"
        value={totalUsers}
        icon="👤"
        color="text-purple-500"
      />
      <StatCard
        title="Total Categories"
        value={totalCategories}
        icon="📁"
        color="text-orange-500"
      />
    </div>
  )
}
