// page.tsx (for the root route '/')
"use client" // This directive is necessary for client-side functionality like useState, useEffect, and localStorage

import { useEffect, useState } from "react" // Import useState and useEffect
import { useRouter } from "next/navigation" // Import useRouter for redirection
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  const [user, setUser] = useState<any>(null) // State to store user data
  const router = useRouter()

  useEffect(() => {
    // Attempt to load user data from localStorage when the component mounts
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error)
        // Handle corrupted localStorage data, e.g., clear it
        localStorage.removeItem("user")
      }
    }
  }, []) // Empty dependency array means this runs once on mount

  const handleLogout = () => {
    localStorage.removeItem("user") // Clear user data from localStorage
    setUser(null) // Clear user state
    alert("Logged out successfully!") // Provide feedback to the user
    router.push("/") // Redirect to home or login page after logout
  }

  return (
    <main className="min-h-screen">
      <Navbar
        user={user} // Pass the user object to Navbar
        onLogout={handleLogout} // Pass the logout function
        showGetStarted={!user} // Show "Get Started" only if not logged in
        links={[
          { href: "/", label: "Home" },
          { href: "/rides", label: "Find Rides" },
          // The "Dashboard" link logic is handled internally by Navbar based on `user.role`
        ]}
      />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  )
}