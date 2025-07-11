"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Car, Plus, MapPin, Calendar, Users, IndianRupee, Clock, CheckCircle, XCircle, AlertTriangle, Star, Phone } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Driver {
  id: string
  primary_phone: string
  secondary_phone: string | null
  address: string
  aadhaar_number: string
  vehicle_number: string
  car_model: string
  car_make: string
  is_verified: boolean
}

interface Ride {
  id: string
  from_location: string
  to_location: string
  price: number
  total_seats: number
  available_seats: number
  departure_time: string
  status: "active" | "completed" | "cancelled"
  created_at: string
}

interface Booking {
  id: string
  ride_id: string
  user_id: string
  seats_booked: number
  status: string
  created_at: string
  user: {
    phone: string
    name: string
  }
}

export default function DriverDashboard() {
  const [user, setUser] = useState<any>(null)
  const [driver, setDriver] = useState<Driver | null>(null)
  const [rides, setRides] = useState<Ride[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddRide, setShowAddRide] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Booking | null>(null)
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(5)
  const [sosActive, setSosActive] = useState(false)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [rideEarnings, setRideEarnings] = useState<Record<string, number>>({})
  const [newRide, setNewRide] = useState({
    from_location: "",
    to_location: "",
    price: "",
    total_seats: "",
    departure_time: "",
  })
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

    setUser(parsedUser)
    fetchDriverData(parsedUser.id)
  }, [router])

  const fetchDriverData = async (userId: string) => {
    try {
      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (driverError) {
        console.error("Driver error:", driverError)
        throw driverError
      }
      setDriver(driverData)

      const { data: ridesData, error: ridesError } = await supabase
        .from("rides")
        .select("*")
        .eq("driver_id", driverData.id)
        .order("created_at", { ascending: false })

      if (ridesError) {
        console.error("Rides error:", ridesError)
        throw ridesError
      }
      setRides(ridesData || [])

      // Fetch bookings for earnings calculation - FIXED VERSION
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          *,
          rides!inner(
            id,
            driver_id,
            price,
            status
          )
        `)
        .eq("rides.driver_id", driverData.id)
        .in("status", ["confirmed", "completed"]) // Only confirmed and completed bookings

      if (bookingsError) {
        console.error("Bookings error:", bookingsError)
      } else {
        // Calculate total earnings from confirmed/completed bookings on NON-CANCELLED rides only
        const earnings = (bookingsData || []).reduce((total, booking) => {
          // Only add earnings if the ride is not cancelled
          if (booking.rides.status !== "cancelled") {
            return total + (booking.seats_booked * booking.rides.price)
          }
          return total
        }, 0)
        setTotalEarnings(earnings)

        // Calculate earnings per ride - FIXED VERSION
        const rideEarningsMap: Record<string, number> = {}
        
        // Initialize all rides with 0 earnings first
        ;(ridesData || []).forEach(ride => {
          rideEarningsMap[ride.id] = 0
        })
        
        // Add earnings only for NON-CANCELLED rides
        ;(bookingsData || []).forEach(booking => {
          const rideId = booking.rides.id
          // Only add earnings if the ride is not cancelled
          if (booking.rides.status !== "cancelled") {
            rideEarningsMap[rideId] += booking.seats_booked * booking.rides.price
          }
        })
        
        setRideEarnings(rideEarningsMap)
      }

      setBookings([])
    } catch (error) {
      console.error("Error fetching driver data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRide = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!driver) return

    try {
      const { error } = await supabase.from("rides").insert([
        {
          driver_id: driver.id,
          from_location: newRide.from_location,
          to_location: newRide.to_location,
          price: Number.parseFloat(newRide.price),
          total_seats: Number.parseInt(newRide.total_seats),
          available_seats: Number.parseInt(newRide.total_seats),
          departure_time: newRide.departure_time,
        },
      ])

      if (error) throw error

      setNewRide({
        from_location: "",
        to_location: "",
        price: "",
        total_seats: "",
        departure_time: "",
      })
      setShowAddRide(false)
      fetchDriverData(user.id)
      alert("Ride added successfully!")
    } catch (error) {
      console.error("Error adding ride:", error)
      alert("Failed to add ride. Please try again.")
    }
  }

  const handleCancelRide = async (rideId: string) => {
    if (!confirm("Are you sure you want to cancel this ride? This action cannot be undone.")) {
      return
    }

    try {
      // Cancel the ride
      const { error: rideError } = await supabase.from("rides").update({ status: "cancelled" }).eq("id", rideId)

      if (rideError) throw rideError

      // Also cancel all bookings for this ride
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("ride_id", rideId)

      if (bookingError) {
        console.error("Error cancelling bookings:", bookingError)
        // Continue anyway as the ride is already cancelled
      }

      // Refresh data to update earnings and ride status
      fetchDriverData(user.id)
      alert("Ride cancelled successfully! All associated bookings have been cancelled.")
    } catch (error) {
      console.error("Error cancelling ride:", error)
      alert("Failed to cancel ride. Please try again.")
    }
  }

  const handleSOS = async () => {
    setSosActive(true)
    try {
      const { error } = await supabase.from("sos_alerts").insert([
        {
          driver_id: driver?.id,
          location: "Current Location",
          status: "active",
        },
      ])

      if (error) throw error

      alert("SOS Alert sent! Emergency services have been notified.")
    } catch (error) {
      console.error("Error sending SOS:", error)
      alert("Failed to send SOS alert. Please try calling emergency services directly.")
    } finally {
      setSosActive(false)
    }
  }

  const handleSubmitReview = async () => {
  if (!selectedCustomer) return

  try {
    // First check if review already exists
    const { data: existingReview, error: checkError } = await supabase
      .from("driver_reviews")
      .select("id")
      .eq("booking_id", selectedCustomer.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is what we want
      throw checkError
    }

    if (existingReview) {
      alert("You have already reviewed this customer for this booking.")
      setSelectedCustomer(null)
      return
    }

    // Insert new review
    const { error } = await supabase.from("driver_reviews").insert([
      {
        driver_id: driver?.id,
        customer_id: selectedCustomer.user_id,
        booking_id: selectedCustomer.id,
        rating: rating,
        review: reviewText,
      },
    ])

    if (error) throw error

    setSelectedCustomer(null)
    setReviewText("")
    setRating(5)
    alert("Review submitted successfully!")
    
    // Refresh bookings to update UI
    fetchDriverData(user.id)
  } catch (error) {
    console.error("Error submitting review:", error)
    alert("Failed to submit review. Please try again.")
  }
}

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
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

  if (!user || !driver) {
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
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
              <div className="text-muted-foreground">
                Welcome back! Phone: {user.phone}
                {!driver.is_verified && (
                  <Badge variant="destructive" className="ml-2">
                    Pending Verification
                  </Badge>
                )}
                {driver.is_verified && <Badge className="ml-2 bg-green-600">Verified</Badge>}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={handleSOS}
                disabled={sosActive}
                className="bg-red-600 hover:bg-red-700"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {sosActive ? "Sending SOS..." : "SOS"}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>

          {!driver.is_verified && (
            <Card className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <p className="text-orange-800 dark:text-orange-200">
                    Your account is pending admin verification. You can view your profile but cannot post rides until
                    verified.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rides.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Rides</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rides.filter((r) => r.status === "active").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalEarnings}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vehicle</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">{driver.vehicle_number}</div>
                <div className="text-xs text-muted-foreground">
                  {driver.car_make} {driver.car_model}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="rides">
            <TabsList>
              <TabsTrigger value="rides">My Rides</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="rides" className="space-y-6">
              {driver.is_verified && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Ride Management</CardTitle>
                        <CardDescription>Post new rides and manage existing ones</CardDescription>
                      </div>
                      <Button onClick={() => setShowAddRide(!showAddRide)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Ride
                      </Button>
                    </div>
                  </CardHeader>
                  {showAddRide && (
                    <CardContent>
                      <form onSubmit={handleAddRide} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="from">From Location</Label>
                            <Input
                              id="from"
                              placeholder="Mumbai"
                              value={newRide.from_location}
                              onChange={(e) => setNewRide({ ...newRide, from_location: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="to">To Location</Label>
                            <Input
                              id="to"
                              placeholder="Pune"
                              value={newRide.to_location}
                              onChange={(e) => setNewRide({ ...newRide, to_location: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="price">Price per Seat (₹)</Label>
                            <Input
                              id="price"
                              type="number"
                              placeholder="500"
                              value={newRide.price}
                              onChange={(e) => setNewRide({ ...newRide, price: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="seats">Total Seats</Label>
                            <Input
                              id="seats"
                              type="number"
                              placeholder="4"
                              min="1"
                              max="8"
                              value={newRide.total_seats}
                              onChange={(e) => setNewRide({ ...newRide, total_seats: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="departure">Departure Time</Label>
                            <Input
                              id="departure"
                              type="datetime-local"
                              value={newRide.departure_time}
                              onChange={(e) => setNewRide({ ...newRide, departure_time: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <Button type="submit">Add Ride</Button>
                          <Button type="button" variant="outline" onClick={() => setShowAddRide(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  )}
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Your Rides</CardTitle>
                  <CardDescription>Manage your posted rides</CardDescription>
                </CardHeader>
                <CardContent>
                  {rides.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No rides posted yet</p>
                      {driver.is_verified && (
                        <Button onClick={() => setShowAddRide(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Post Your First Ride
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rides.map((ride) => (
                        <div key={ride.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                  {ride.from_location} → {ride.to_location}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(ride.departure_time).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4" />
                                  <span>
                                    {ride.available_seats}/{ride.total_seats} available
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <IndianRupee className="h-4 w-4" />
                                  <span>₹{ride.price} per seat</span>
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={
                                ride.status === "active"
                                  ? "default"
                                  : ride.status === "completed"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {ride.status}
                            </Badge>
                          </div>
                          <div className="bg-muted/50 rounded p-3 text-sm">
                            <p>
                              <strong>Booked Seats:</strong> {ride.total_seats - ride.available_seats}
                            </p>
                            <p>
                              <strong>Earnings:</strong>{" "}
                              ₹{ride.status === "cancelled" ? 0 : (rideEarnings[ride.id] || 0)}
                            </p>
                            {ride.status === "cancelled" && (
                              <p className="text-red-600 text-xs mt-1">
                                This ride was cancelled - no earnings from this trip
                              </p>
                            )}
                            <div className="flex space-x-2 mt-3">
                              {ride.status === "active" && (
                                <Button size="sm" variant="destructive" onClick={() => handleCancelRide(ride.id)}>
                                  Cancel Ride
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Driver Profile</CardTitle>
                  <CardDescription>Your driver information and vehicle details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Personal Information</h3>
                      <div>
                        <Label>Primary Phone</Label>
                        <p className="text-sm text-muted-foreground">{driver.primary_phone}</p>
                      </div>
                      {driver.secondary_phone && (
                        <div>
                          <Label>Secondary Phone</Label>
                          <p className="text-sm text-muted-foreground">{driver.secondary_phone}</p>
                        </div>
                      )}
                      <div>
                        <Label>Address</Label>
                        <p className="text-sm text-muted-foreground">{driver.address}</p>
                      </div>
                      <div>
                        <Label>Aadhaar Number</Label>
                        <p className="text-sm text-muted-foreground">
                          {driver.aadhaar_number.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3")}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Vehicle Information</h3>
                      <div>
                        <Label>Vehicle Number</Label>
                        <p className="text-sm text-muted-foreground">{driver.vehicle_number}</p>
                      </div>
                      <div>
                        <Label>Car Make</Label>
                        <p className="text-sm text-muted-foreground">{driver.car_make}</p>
                      </div>
                      <div>
                        <Label>Car Model</Label>
                        <p className="text-sm text-muted-foreground">{driver.car_model}</p>
                      </div>
                      <div>
                        <Label>Verification Status</Label>
                        <div className="flex items-center space-x-2">
                          {driver.is_verified ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Verified</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-orange-600" />
                              <span className="text-sm text-orange-600">Pending Verification</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}