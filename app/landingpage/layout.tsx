import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ministry of Health - Electronic Health Services Portal | Federal Republic of Somalia',
  description: 'Access electronic health-related administrative services online. Apply for medical certificates, upload documents, and track your applications through our secure portal.',
  keywords: 'Somalia, Ministry of Health, Electronic Health Services, administrative services, medical certificates, online applications, government services',
}

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}