'use client'

import { useEffect } from 'react'
import Image from 'next/image'

export default function HomePage() {
  useEffect(() => {
    // Redirect to landing page
    window.location.href = '/landingpage'
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-blue-500 to-green-600 rounded-full mx-auto"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-green-600 to-blue-500 rounded-full mx-auto absolute top-0 left-1/2 transform -translate-x-1/2" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl flex items-center space-x-4">
          <Image
            src="/images/logo1.png"
            alt="Ministry of Health Logo"
            width={40}
            height={40}
            className="rounded-lg shadow-md"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-800">Ministry of Health</h3>
            <p className="text-gray-600">Redirecting to Electronic Health Services Portal...</p>
          </div>
        </div>
      </div>
    </div>
  )
}