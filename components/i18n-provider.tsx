'use client'

import { useEffect, useState } from 'react'
import i18n from '@/lib/i18n'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check if i18n is already initialized
    if (i18n.isInitialized) {
      setIsReady(true)
    } else {
      // Wait for initialization
      const checkReady = () => {
        if (i18n.isInitialized) {
          setIsReady(true)
        } else {
          setTimeout(checkReady, 10)
        }
      }
      checkReady()
    }
  }, [])

  // Show loading only briefly, then render children regardless
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  if (!isReady) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return <>{children}</>
}