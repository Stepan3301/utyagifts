'use client'

import { useEffect, useState } from 'react'
import { init } from '@twa-dev/sdk'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Initialize Telegram WebApp SDK
    init()
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🚀 Rocket Gifts</h1>
          <p className="text-gray-500">Crash-rocket-style game with Telegram gifts</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This is your Rocket Gifts Mini App. The game interface will be implemented here.
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                📦 <strong>Inventory:</strong> View and manage your gifts
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                🎮 <strong>Game:</strong> Start a rocket session and cash out at the right time
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                🎁 <strong>Pool:</strong> Win gifts from the pool when you cash out
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Game interface coming soon...</p>
        </div>
      </div>
    </main>
  )
}

