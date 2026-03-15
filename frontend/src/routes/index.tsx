import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({ component: IndexPage })

function IndexPage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate({ to: '/dashboard', replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-2">Parking Admin</h1>
        <p className="text-gray-600">Real-time Billing System</p>
        <p className="text-gray-500 text-sm mt-4">Loading...</p>
      </div>
    </div>
  )
}
