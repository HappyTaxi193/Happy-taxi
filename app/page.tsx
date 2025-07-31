"use client"
import { useEffect, useState } from "react" 
import { useRouter } from "next/navigation" 
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  const [user, setUser] = useState<any>(null) 
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error)
        localStorage.removeItem("user")
      }
    }
  }, []) 

  const handleLogout = () => {
    localStorage.removeItem("user") // Clear user data from localStorage
    setUser(null) // Clear user state
    alert("Logged out successfully!") // Provide feedback to the user
    router.push("/") // Redirect to home or login page after logout
  }

  return (
    <main className="min-h-screen">
      <Navbar
        user={user} 
        onLogout={handleLogout} 
        showGetStarted={!user} 
        links={[
          { href: "/", label: "Home" },
          { href: "/rides", label: "Find Rides" },
        ]}
      />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  )
}