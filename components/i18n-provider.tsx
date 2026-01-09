'use client'

import { useEffect } from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { resources } from '@/lib/i18n'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          resources,
          fallbackLng: 'so', // Default to Somali
          lng: 'so', // Start with Somali
          debug: false,
          interpolation: {
            escapeValue: false
          }
        })
    }
  }, [])

  return <>{children}</>
}