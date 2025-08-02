"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

interface Driver {
  id: string
  user_id: string
  photograph_url: string
  primary_phone: string
  secondary_phone: string | null
  address: string
  aadhaar_number: string
  driving_license_url: string
  vehicle_number: string
  car_model: string
  car_make: string
  is_verified: boolean
  total_earnings: number
  completed_rides: number
}

export default function EditProfilePage() {
  const [driver, setDriver] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    primary_phone: "",
    secondary_phone: "",
    address: "",
    vehicle_number: "",
    car_model: "",
    car_make: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/auth")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "driver") {
      router.push("/auth")
      return
    }

    fetchDriverData(parsedUser.id)
  }, [router])

  const fetchDriverData = async (userId: string) => {
    try {
      const { data: driverData, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error) {
        throw error
      }

      setDriver(driverData)
      setFormData({
        primary_phone: driverData.primary_phone || "",
        secondary_phone: driverData.secondary_phone || "",
        address: driverData.address || "",
        vehicle_number: driverData.vehicle_number || "",
        car_model: driverData.car_model || "",
        car_make: driverData.car_make || "",
      })
    } catch (error) {
      console.error("Error fetching driver data:", error)
      alert("Failed to load profile data.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!driver) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("drivers")
        .update({
          primary_phone: formData.primary_phone,
          secondary_phone: formData.secondary_phone,
          address: formData.address,
          vehicle_number: formData.vehicle_number,
          car_model: formData.car_model,
          car_make: formData.car_make,
        })
        .eq("id", driver.id)

      if (error) {
        throw error
      }

      alert("Profile updated successfully!")
      router.push("/driver-dashboard")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Driver profile not found</p>
            <Button onClick={() => router.push("/auth")}>Go to Login</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Edit Profile</h1>
          <p className="text-muted-foreground">Update your personal and vehicle information.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Update Your Information</CardTitle>
            <CardDescription>
              Your Aadhaar number cannot be changed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                  <div>
                    <Label htmlFor="primary_phone">Primary Phone</Label>
                    <Input
                      id="primary_phone"
                      value={formData.primary_phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondary_phone">Secondary Phone (Optional)</Label>
                    <Input
                      id="secondary_phone"
                      value={formData.secondary_phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label>Aadhaar Number</Label>
                    <p className="text-sm text-muted-foreground font-medium flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                      {driver.aadhaar_number.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Vehicle Information</h3>
                  <div>
                    <Label htmlFor="vehicle_number">Vehicle Number</Label>
                    <Input
                      id="vehicle_number"
                      value={formData.vehicle_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="car_make">Car Make</Label>
                    <Input
                      id="car_make"
                      value={formData.car_make}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="car_model">Car Model</Label>
                    <Input
                      id="car_model"
                      value={formData.car_model}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}