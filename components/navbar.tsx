// navbar.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface NavbarProps {
  title?: string;
  logoSrc?: string;
  onLogout: () => void;
  showGetStarted: boolean;
  links: { href: string; label: string; onClick?: () => void }[];
  user: any; // Add user prop to receive user data
}

export function Navbar({ onLogout, user, showGetStarted }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [showLoginAlert, setShowLoginAlert] = useState(false) // State for login alert

  const handleDashboardClick = () => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin-dashboard")
      } else if (user.role === "driver") {
        router.push("/driver-dashboard")
      } else if (user.role === "user") {
        router.push("/user-dashboard")
      }
    } else {
      setShowLoginAlert(true) // Show alert if not logged in
    }
    setIsOpen(false) // Close mobile menu after click
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/WhatsApp Image 2025-07-10 at 3.42.37 PM.jpeg" alt="HappyTaxi" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-bold text-primary">HappyTaxi</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link
                href="/rides"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
              >
                Find Rides
              </Link>
              {/* Dashboard Button */}
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                onClick={handleDashboardClick}
              >
                Dashboard
              </Button>

              {/* Conditionally render Login/Logout */}
              {!user ? (
                <Link
                  href="/auth"
                  className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  onClick={onLogout}
                >
                  Logout
                </Button>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            {showGetStarted && (
              <Button asChild>
                <Link href="/auth">Get Started</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-b">
            <Link
              href="/"
              className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/rides"
              className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Find Rides
            </Link>
            {/* Dashboard Button (styled like a link) for Mobile */}
            <Button
              variant="ghost"
              className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              onClick={handleDashboardClick}
            >
              Dashboard
            </Button>
            {/* Conditionally render Login/Logout for Mobile */}
            {!user ? (
              <Link
                href="/auth"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            ) : (
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                onClick={() => { onLogout(); setIsOpen(false); }}
              >
                Logout
              </Button>
            )}
            {showGetStarted && (
              <div className="px-3 py-2">
                <Button asChild className="w-full">
                  <Link href="/auth" onClick={() => setIsOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Alert Dialog */}
      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to access the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setShowLoginAlert(false); router.push("/auth"); }}>
              Go to Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  )
}