'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Shield, 
  Users, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Globe,
  Mail,
  MapPin,
  Stethoscope,
  Building2,
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  MoreHorizontal
} from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'

interface Service {
  _id: string
  name: string
  description: string
  category: string
  requirements: string[]
  fee: number
  isActive: boolean
}

export default function LandingPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [language, setLanguage] = useState<'en' | 'so'>('en')
  const [activeSection, setActiveSection] = useState<'home' | 'services'>('home')

  // Background images for the hero section
  const backgroundImages = [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Government/Administrative
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Digital Services
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Technology Services
    'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', // Administrative Services
  ]

  useEffect(() => {
    fetchServices()
    
    // Auto-change background images
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length)
    }, 5000)

    // Detect scroll position to highlight active section
    const handleScroll = () => {
      const servicesSection = document.getElementById('services')
      if (servicesSection) {
        const rect = servicesSection.getBoundingClientRect()
        // If services section is in viewport (top is less than half screen height)
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= 0) {
          setActiveSection('services')
        } else {
          setActiveSection('home')
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position

    return () => {
      clearInterval(interval)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/landing')
      const data = await response.json()
      if (data.success) {
        setServices(data.services)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
    setLoading(false)
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      medical: <Stethoscope className="h-6 w-6" />,
      administrative: <Building2 className="h-6 w-6" />,
      emergency: <AlertTriangle className="h-6 w-6" />,
      consultation: <MessageSquare className="h-6 w-6" />,
      referral: <RefreshCw className="h-6 w-6" />,
      other: <MoreHorizontal className="h-6 w-6" />
    }
    return icons[category as keyof typeof icons] || <FileText className="h-6 w-6" />
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      medical: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      administrative: 'bg-gradient-to-r from-gray-500 to-slate-600',
      emergency: 'bg-gradient-to-r from-red-500 to-rose-600',
      consultation: 'bg-gradient-to-r from-green-500 to-emerald-600',
      referral: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      other: 'bg-gradient-to-r from-yellow-500 to-orange-600'
    }
    return colors[category as keyof typeof colors] || 'bg-gradient-to-r from-gray-500 to-gray-600'
  }

  const translations = {
    en: {
      nav: {
        home: 'Home',
        eservices: 'eServices',
        login: 'Login',
        signup: 'Sign Up'
      },
      hero: {
        title: 'Ministry of Health, Federal Republic of Somalia',
        subtitle: 'Electronic Services ',
        description: 'The Ministry of Health Electronic Health Services Portal has been developed to provide electronic public services to citizens and residents. Users can register, apply for health-related administrative services online, upload supporting documents, and track the status of their requests through a secure and transparent system.',
        getStarted: 'Get Started',
        learnMore: 'Learn More'
      },
      services: {
        title: 'Available Electronic Services',
        subtitle: 'Access comprehensive health-related administrative services online with just a few clicks - no office visits required',
        applyNow: 'Apply Now',
        requirements: 'Requirements'
      },
      features: {
        title: 'Why Choose Our Electronic Services?',
        secure: {
          title: 'Secure & Reliable',
          description: 'Your data is protected with advanced security measures'
        },
        fast: {
          title: 'Fast Processing',
          description: 'Quick application processing and status tracking'
        },
        convenient: {
          title: '24/7 Availability',
          description: 'Access services anytime, anywhere'
        },
        transparent: {
          title: 'Transparent Process',
          description: 'Track your application status in real-time'
        }
      }
    },
    so: {
      nav: {
        home: 'Guriga',
        eservices: 'Adeegyada-e',
        login: 'Gal',
        signup: 'Isdiiwaangeli'
      },
      hero: {
        title: 'Wasaaradda Caafimaadka, Jamhuuriyadda Federaalka Soomaaliya',
        subtitle: 'Bogga Adeegyada Caafimaadka Elektarooniga ah',
        description: 'Waxaan u sahalnay muwaadiniinta helitaanka adeegyada maamulka caafimaadka iyagoo adeegsanaya barnamijkayaga elektarooniga ah oo dhamaystiran. Ku diiwaangeli onlayn, soo gudbi codsashada, soo rar dukumiintiyada, waxaana la socon kartaa codsashadaada waqti dhabta ah iyagoo adeegsanaya nidaamkayaga ammaan ah, hufan, oo fudud.',
        getStarted: 'Bilow',
        learnMore: 'Wax badan oo baro'
      },
      services: {
        title: 'Adeegyada Elektarooniga ah ee la heli karo',
        subtitle: 'Hel adeegyada maamulka caafimaadka oo dhamaystiran onlayn ah dhawr gujin keliya - ma loo baahna booqashada xafiisyada',
        applyNow: 'Hadda Codso',
        requirements: 'Shuruudaha'
      },
      features: {
        title: 'Maxay tahay sababta aad u doorato adeegyadayada elektarooniga ah?',
        secure: {
          title: 'Ammaan & Kalsoonaan',
          description: 'Xogahaagu waxay ku badbaadsan yihiin tallaabooyinka amniga horumarsan'
        },
        fast: {
          title: 'Habraac Degdeg ah',
          description: 'Habraaca codsashada degdegga ah iyo la socoshada xaaladda'
        },
        convenient: {
          title: 'Diyaar 24/7',
          description: 'Hel adeegyada waqti kasta, meel kasta'
        },
        transparent: {
          title: 'Habka Cadaalad ah',
          description: 'La soco xaaladda codsashadaada waqti dhabta ah'
        }
      }
    }
  }

  const t = translations[language]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Left side - Logo and Menu */}
            <div className="flex items-center space-x-4 sm:space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Image
                  src="/images/logo1.png"
                  alt="Ministry of Health Logo"
                  width={50}
                  height={50}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-15 md:h-15"
                />
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800">Ministry of Health</h1>
                  <p className="text-xs sm:text-sm text-gray-600">Electronic Health Services Portal</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="hidden lg:flex items-center space-x-6">
                <Link 
                  href="/landingpage" 
                  className={`font-semibold transition-colors ${
                    activeSection === 'home' 
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  {t.nav.home}
                </Link>
                <Link 
                  href="#services" 
                  className={`font-semibold transition-colors ${
                    activeSection === 'services' 
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  onClick={() => setActiveSection('services')}
                >
                  {t.nav.eservices}
                </Link>
                
                {/* Language Selector */}
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'so')}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">EN</option>
                    <option value="so">SO</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right side - Login and Sign Up */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Language Selector */}
              <div className="flex lg:hidden items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'so')}
                  className="border border-gray-300 rounded-md px-1 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">EN</option>
                  <option value="so">SO</option>
                </select>
              </div>
              
              <Link href="/auth/users/user-login">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
                  {t.nav.login}
                </Button>
              </Link>
              <Link href="/auth/users/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
                  {t.nav.signup}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            {t.hero.title}
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 sm:mb-8 text-blue-200">
            {t.hero.subtitle}
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 leading-relaxed text-gray-200 max-w-4xl mx-auto text-justify">
            {t.hero.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="#services">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                {t.hero.getStarted}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-800 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
              {t.hero.learnMore}
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">{t.features.title}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">{t.features.secure.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 text-justify">{t.features.secure.description}</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">{t.features.fast.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 text-justify">{t.features.fast.description}</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">{t.features.convenient.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 text-justify">{t.features.convenient.description}</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">{t.features.transparent.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 text-justify">{t.features.transparent.description}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">{t.services.title}</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto text-justify">{t.services.subtitle}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {services.map((service) => (
                <Card key={service._id} className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 overflow-hidden">
                  <CardHeader className={`${getCategoryColor(service.category)} text-white p-4 sm:p-6`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                          {getCategoryIcon(service.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg sm:text-xl font-bold text-white">{service.name}</CardTitle>
                          <Badge className="bg-white/20 text-white border-0 mt-1 text-xs">
                            {service.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-gray-600 mb-6 leading-relaxed text-justify text-sm sm:text-base">{service.description}</p>
                    
                    <div className="space-y-4 mb-6">
                      {service.requirements.length > 0 && (
                        <div>
                          <span className="font-semibold text-gray-800 block mb-2 text-sm sm:text-base">{t.services.requirements}:</span>
                          <ul className="space-y-1">
                            {service.requirements.map((req, index) => (
                              <li key={index} className="text-xs sm:text-sm text-gray-600 flex items-start">
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-justify">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <Link href="/auth/users/signup">
                      <Button className={`w-full ${getCategoryColor(service.category)} text-white hover:opacity-90 transition-opacity text-sm sm:text-base py-2 sm:py-3`}>
                        {t.services.applyNow}
                        <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && services.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Services Available</h3>
              <p className="text-gray-600 text-sm sm:text-base">Services will be displayed here once they are added by administrators.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <Image
                  src="/images/logo1.png"
                  alt="Ministry of Health Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">Ministry of Health</h3>
                  <p className="text-gray-300 text-sm sm:text-base">Federal Republic of Somalia</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base text-justify">
                Providing accessible, secure, and efficient electronic health-related administrative services to all citizens and residents of Somalia through innovative digital solutions.
              </p>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Info</h4>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300 text-sm sm:text-base">info@moh.gov.so</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm sm:text-base">Mogadishu, Somalia</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="#services" className="block text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  eServices
                </Link>
                <Link href="/auth/users/signup" className="block text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  Register
                </Link>
                <Link href="/auth/users/user-login" className="block text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                  Login
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              © 2025 Ministry of Health, Federal Republic of Somalia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}