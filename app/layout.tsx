import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://happy-taxi-full-stack.vercel.app'),
  title: "HTCab Haridwar - Best Taxi Service | Book Cabs Online in Haridwar",
  description: "HTCab Haridwar offers reliable taxi services, cab booking, and tour packages in Haridwar. 24/7 available, verified drivers, affordable rates. Book temple tours, airport transfers & outstation trips.",
  keywords: [
    "htcab haridwar",
    "happy taxi service",
    "taxi service haridwar",
    "cab booking haridwar",
    "haridwar taxi",
    "tour packages haridwar",
    "haridwar to rishikesh taxi",
    "haridwar sightseeing",
    "temple tours haridwar",
    "airport transfer haridwar",
    "char dham yatra taxi",
    "roshmabad haridwar taxi"
  ].join(", "),
  
  authors: [{ name: "HTCab Haridwar" }],
  creator: "HTCab Haridwar",
  publisher: "HTCab Haridwar",
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://happy-taxi-full-stack.vercel.app',
    siteName: 'HTCab Haridwar',
    title: 'HTCab Haridwar - Best Taxi Service | Book Cabs Online in Haridwar',
    description: 'HTCab Haridwar offers reliable taxi services, cab booking, and tour packages in Haridwar. 24/7 available, verified drivers, affordable rates.',
    images: [
      {
        url: '/htcab-haridwar-taxi-service-business-card-2025.jpg', 
        width: 1200,
        height: 630,
        alt: 'HTCab Haridwar - Premium Taxi Service Business Card',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'HTCab Haridwar - Best Taxi Service | Book Cabs Online',
    description: 'Reliable taxi services in Haridwar. Book temple tours, airport transfers & outstation trips. 24/7 available, verified drivers.',
    images: ['/htcab-haridwar-taxi-service-business-card-2025.jpg'], 
  },
  
  alternates: {
    canonical: 'https://happy-taxi-full-stack.vercel.app',
  },
  
  other: {
    'geo.region': 'IN-UT',
    'geo.placename': 'Haridwar',
    'geo.position': '29.9457;78.1642',
    'ICBM': '29.9457, 78.1642',
    'business:contact_data:locality': 'Haridwar',
    'business:contact_data:region': 'Uttarakhand',
    'business:contact_data:country_name': 'India',
  },
  
  category: 'Transportation',
  classification: 'Taxi Service, Tour Operator, Travel Service',
}

// Structured Data JSON-LD
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TaxiService",
      "@id": "https://happy-taxi-full-stack.vercel.app/#taxiservice",
      "name": "Happy Taxi Service",
      "alternateName": ["HTCab", "Happy Taxi Haridwar", "HTCab Haridwar"],
      "description": "Premium taxi service in Haridwar offering cab booking, temple tours, airport transfers, and outstation trips with verified drivers and 24/7 availability. No advance payment required - pay after trip completion.",
      "url": "https://happy-taxi-full-stack.vercel.app",
      "telephone": "+91-9760764682", 
      "email": "rashmijoshi193@gmail.com", 
      "image": {
        "@type": "ImageObject",
        "url": "https://happy-taxi-full-stack.vercel.app/htcab-haridwar-best-taxi-service-logo.jpg", 
        "width": 300,
        "height": 300
      },
      "logo": {
        "@type": "ImageObject",
        "url": "https://happy-taxi-full-stack.vercel.app/htcab-haridwar-best-taxi-service-logo.jpg", 
        "width": 300,
        "height": 300
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Flat 108 P4 Deep Ganga Apartment",
        "addressLocality": "Haridwar",
        "addressRegion": "Uttarakhand",
        "postalCode": "249401",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "29.9457",
        "longitude": "78.1642"
      },
      "areaServed": [
        {
          "@type": "City",
          "name": "Haridwar",
          "containedInPlace": {
            "@type": "State",
            "name": "Uttarakhand"
          }
        },
        {
          "@type": "City",
          "name": "Rishikesh"
        },
        {
          "@type": "City",
          "name": "Dehradun"
        },
        {
          "@type": "City",
          "name": "Roorkee"
        },
        {
          "@type": "City",
          "name": "Mana"
        }
      ],
      "serviceType": [
        "Local Taxi Service",
        "Outstation Cab Booking",
        "Airport Transfer",
        "Temple Tours",
        "City Tour & Sightseeing",
        "Hill Station Trips",
        "Market Drop Service",
        "Station Drop Service",
        "PTM Pick & Drop",
        "Hospital Transportation"
      ],
      "priceRange": "₹",
      "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "UPI", "Net Banking"],
      "openingHours": "Mo-Su 00:00-23:59",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Happy Taxi Service Offerings",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Local Taxi Service Haridwar",
              "description": "Local transportation within Haridwar city for all your needs"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Temple Tours Haridwar",
              "description": "Guided temple tours including Har Ki Pauri, Mansa Devi, Chandi Devi"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Airport Transfer Service",
              "description": "Dehradun Airport to Haridwar transfers and vice versa"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Outstation Trips All India",
              "description": "Haridwar to Rishikesh, Delhi, Mussoorie and all India destinations"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Hill Station Tours",
              "description": "Cab booking for hills and mountain destinations"
            }
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "150",
        "bestRating": "5",
        "worstRating": "1"
      },
      "sameAs": [
        "https://www.facebook.com/people/Deepak-Joshi/pfbid02u8D63BVc26apTbkdcC7n95wVkNx67FNDdvmra3Ed67utb49d5cfzAWHUbXx5kxs5l/?rdid=XRjjpoqQNQRsVxP9&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1ELNes8Ydj%2F", 
        "https://www.instagram.com/happytaxiservice1?igsh=MXhxNG1nMXcxZXQ1YQ=="
      ]
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://happy-taxi-full-stack.vercel.app/#localbusiness",
      "name": "Happy Taxi Service",
      "image": "https://happy-taxi-full-stack.vercel.app/htcab-haridwar-best-taxi-service-logo.jpg", 
      "telephone": "+91-9760764682",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Flat 108 P4 Deep Ganga Apartment",
        "addressLocality": "Haridwar",
        "addressRegion": "Uttarakhand",
        "postalCode": "249401",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "29.9457",
        "longitude": "78.1642"
      },
      "url": "https://happy-taxi-full-stack.vercel.app",
      "priceRange": "₹₹",
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday", 
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "00:00",
        "closes": "23:59"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://happy-taxi-full-stack.vercel.app/#website",
      "url": "https://happy-taxi-full-stack.vercel.app",
      "name": "HTCab Haridwar - Best Taxi Service in Haridwar",
      "description": "Book reliable taxi services in Haridwar. Temple tours, airport transfers, outstation trips with verified drivers.",
      "publisher": {
        "@id": "https://happy-taxi-full-stack.vercel.app/#localbusiness"
      },
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://happy-taxi-full-stack.vercel.app/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      ],
      "inLanguage": "en-IN"
    },
    {
      "@type": "Organization",
      "@id": "https://happy-taxi-full-stack.vercel.app/#organization",
      "name": "Happy Taxi Service",
      "alternateName": "HTCab Haridwar",
      "url": "https://happy-taxi-full-stack.vercel.app",
      "logo": {
        "@type": "ImageObject",
        "url": "https://happy-taxi-full-stack.vercel.app/htcab-haridwar-best-taxi-service-logo.jpg", 
        "width": 300,
        "height": 300
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+91-9760764682",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi"]
        },
        {
          "@type": "ContactPoint",
          "telephone": "+91-9760764682",
          "contactType": "reservations",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi"]
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Flat 108 P4 Deep Ganga Apartment",
        "addressLocality": "Haridwar",
        "addressRegion": "Uttarakhand",
        "postalCode": "249401",
        "addressCountry": "IN"
      },
      "sameAs": [
        "https://www.facebook.com/people/Deepak-Joshi/pfbid02u8D63BVc26apTbkdcC7n95wVkNx67FNDdvmra3Ed67utb49d5cfzAWHUbXx5kxs5l/?rdid=XRjjpoqQNQRsVxP9&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1ELNes8Ydj%2F",
        "https://www.instagram.com/happytaxiservice1?igsh=MXhxNG1nMXcxZXQ1YQ=="
      ]
    }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional SEO Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HTCab Haridwar" />
        
        {/* Favicon */}
        <link rel="icon" href="/htcab-haridwar-taxi-favicon-icon.ico" /> 
        <link rel="apple-touch-icon" href="/htcab-haridwar-taxi-favicon-icon.ico" /> 
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem 
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        
        {/* WhatsApp Business Chat Widget */}
        <Script id="whatsapp-widget" strategy="lazyOnload">
          {`
            (function() {
              var wa = document.createElement('div');
              wa.innerHTML = '<a href="https://wa.me/919760764682?text=Hi%20Happy%20Taxi%20Service,%20I%20need%20a%20taxi%20booking" target="_blank" style="position:fixed;bottom:20px;right:20px;background:#25d366;color:white;border-radius:50px;padding:15px;text-decoration:none;font-size:18px;z-index:1000;box-shadow:0 2px 10px rgba(0,0,0,0.3);">📱 WhatsApp</a>';
              document.body.appendChild(wa);
            })();
          `}
        </Script>
      </body>
    </html>
  )
}