"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gavel, Mail, Home } from "lucide-react" // Import icons
import { useRouter } from "next/navigation"

export default function BannedPage() {
  const router = useRouter()

  const handleContactSupport = () => {
    // Replace with your actual support email or contact page link
    window.location.href = "mailto:support@happytaxi.com?subject=Account Banned Inquiry"
  }

  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 flex items-center justify-center min-h-[calc(100vh-140px)]"> {/* Adjusted min-height */}
        <div className="max-w-md mx-auto px-4">
          <Card className="text-center">
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <Gavel className="h-16 w-16 text-red-500" /> {/* Larger, prominent icon */}
              </div>
              <CardTitle className="text-3xl font-bold text-red-600">Account Banned</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                We regret to inform you that your account has been banned.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300">
                This action is typically taken due to a violation of our terms of service or community guidelines.
                If you believe this is an error or would like to appeal, please contact our support team.
              </p>
              <div className="flex flex-col space-y-3">
                
                <Button onClick={handleGoHome} className="w-full" variant="outline">
                  <Home className="mr-2 h-4 w-4" /> Go to Homepage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}