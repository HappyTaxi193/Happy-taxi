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
import { Car, Plus, MapPin, Calendar, Users, IndianRupee, Clock, CheckCircle, XCircle, AlertTriangle, Star, Phone, Edit, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"

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

interface Ride {
  id: string
  driver_id: string
  from_location: string
  to_location: string
  price: number
  total_seats: number
  available_seats: number
  departure_time: string
  status: "active" | "completed" | "cancelled"
  created_at: string
  is_ride_completed: boolean | null;
}

interface Booking {
  id: string
  ride_id: string
  user_id: string
  seats_booked: number
  status: string
  created_at: string
  users: {
    phone: string
  }
  rides?: {
    id: string;
    driver_id: string;
    price: number;
    status: string;
    is_ride_completed: boolean | null;
  };
}

export default function DriverDashboard() {
  const [user, setUser] = useState<any>(null)
  const [driver, setDriver] = useState<Driver | null>(null)
  const [rides, setRides] = useState<Ride[]>([])
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
  const [showEditRideDialog, setShowEditRideDialog] = useState(false)
  const [editingRide, setEditingRide] = useState<Ride | null>(null)
  const [editedRideDetails, setEditedRideDetails] = useState({
    price: "",
  })
  const [showBookingSummaryDialog, setShowBookingSummaryDialog] = useState(false)
  const [selectedRideBookings, setSelectedRideBookings] = useState<Booking[]>([])

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
        console.error("Driver fetch error:", driverError)
        throw driverError
      }
      setDriver(driverData)

      const { data: ridesData, error: ridesError } = await supabase
        .from("rides")
        .select("*, is_ride_completed")
        .eq("driver_id", driverData.id)
        .order("created_at", { ascending: false })

      if (ridesError) {
        console.error("Rides fetch error:", ridesError)
        throw ridesError
      }
      setRides(ridesData || [])

      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          *,
          users (phone),
          rides!inner(
            id,
            driver_id,
            price,
            status,
            is_ride_completed
          )
        `)
        .eq("rides.driver_id", driverData.id)
        .eq("rides.is_ride_completed", true);

      if (bookingsError) {
        console.error("Bookings fetch error detailed:", bookingsError);
      } else {
        const earnings = (bookingsData || []).reduce((total, booking) => {
          if (booking.rides && booking.rides.is_ride_completed === true) {
            return total + (booking.seats_booked * booking.rides.price)
          }
          return total
        }, 0)
        setTotalEarnings(earnings)
        const rideEarningsMap: Record<string, number> = {}
        ;(ridesData || []).forEach(ride => {
          rideEarningsMap[ride.id] = 0
        })
        ;(bookingsData || []).forEach(booking => {
          const rideId = booking.ride_id
          if (booking.rides && booking.rides.is_ride_completed === true) {
            rideEarningsMap[rideId] = (rideEarningsMap[rideId] || 0) + (booking.seats_booked * booking.rides.price)
          }
        })
        setRideEarnings(rideEarningsMap)
      }
    } catch (error) {
      console.error("Error fetching driver data:", error)
      alert("Failed to load dashboard data. Please refresh the page.")
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
          is_ride_completed: null,
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

  const handleCompleteRide = async (rideId: string) => {
    if (!confirm("Are you sure you want to mark this ride as completed?")) {
      return
    }

    try {
      const { error: rideUpdateError } = await supabase
        .from("rides")
        .update({ status: "completed", is_ride_completed: true })
        .eq("id", rideId)

      if (rideUpdateError) throw rideUpdateError

      if (driver) {
        const { data: currentDriverData, error: driverFetchError } = await supabase
          .from("drivers")
          .select("completed_rides")
          .eq("id", driver.id)
          .single()

        if (driverFetchError) throw driverFetchError

        const newCompletedRides = (currentDriverData?.completed_rides || 0) + 1

        const { error: driverUpdateError } = await supabase
          .from("drivers")
          .update({ completed_rides: newCompletedRides })
          .eq("id", driver.id)

        if (driverUpdateError) throw driverUpdateError
      }

      fetchDriverData(user.id)
      alert("Ride marked as completed and driver stats updated!")
    } catch (error) {
      console.error("Error completing ride:", error)
      alert("Failed to complete ride. Please try again.")
    }
  }

  const handleCancelRide = async (rideId: string) => {
    if (!confirm("Are you sure you want to cancel this ride? This action cannot be undone.")) {
      return
    }

    try {
      const { error: rideError } = await supabase
        .from("rides")
        .update({ status: "cancelled", is_ride_completed: false })
        .eq("id", rideId)

      if (rideError) throw rideError

      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("ride_id", rideId)

      if (bookingError) {
        console.error("Error cancelling bookings:", bookingError)
      }

      fetchDriverData(user.id)
      alert("Ride cancelled successfully! All associated bookings have been cancelled.")
    } catch (error) {
      console.error("Error cancelling ride:", error)
      alert("Failed to cancel ride. Please try again.")
    }
  }

  const handleEditRideClick = (ride: Ride) => {
    setEditingRide(ride)
    setEditedRideDetails({
      price: ride.price.toString(),
    })
    setShowEditRideDialog(true)
  }

  const handleEditRideSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRide) return

    try {
      const updatedPrice = Number.parseFloat(editedRideDetails.price)

      if (isNaN(updatedPrice)) {
        alert("Please enter a valid number for price.")
        return
      }

      const { error } = await supabase
        .from("rides")
        .update({
          price: updatedPrice,
        })
        .eq("id", editingRide.id)

      if (error) throw error

      setShowEditRideDialog(false)
      setEditingRide(null)
      fetchDriverData(user.id)
      alert("Ride updated successfully!")
    } catch (error) {
      console.error("Error updating ride:", error)
      alert("Failed to update ride. Please try again.")
    }
  }

  const handleShowBookingSummary = async (rideId: string) => {
    try {
      const { data: bookingsSummary, error } = await supabase
        .from("bookings")
        .select(`
          id,
          seats_booked,
          status,
          users (phone)
        `)
        .eq("ride_id", rideId)
        .in("status", ["confirmed", "completed"])

      if (error) {
        console.error("Booking summary fetch error detailed:", error);
        throw error;
      }

      setSelectedRideBookings(bookingsSummary || [])
      setShowBookingSummaryDialog(true)
    } catch (error) {
      console.error("Error fetching booking summary:", error)
      alert("Failed to fetch booking summary. Please check console for details.")
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
      const { data: existingReview, error: checkError } = await supabase
        .from("driver_reviews")
        .select("id")
        .eq("booking_id", selectedCustomer.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingReview) {
        alert("You have already reviewed this customer for this booking.")
        setSelectedCustomer(null)
        return
      }

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
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Driver Dashboard</h1>
              <div className="text-muted-foreground">
                Welcome back! Phone: {user.phone}
                {!driver.is_verified && (
                  <Badge variant="destructive" className="ml-2 mt-1 md:mt-0">
                    Pending Verification
                  </Badge>
                )}
                {driver.is_verified && <Badge className="ml-2 mt-1 md:mt-0 bg-green-600">Verified</Badge>}
              </div>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
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
                <div className="text-2xl font-bold">₹{totalEarnings.toLocaleString()}</div>
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
            <TabsList className="w-full sm:w-auto grid grid-cols-2">
              <TabsTrigger value="rides">My Rides</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="rides" className="space-y-6">
              {driver.is_verified && (
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <CardTitle>Ride Management</CardTitle>
                        <CardDescription>Post new rides and manage existing ones</CardDescription>
                      </div>
                      <Button onClick={() => setShowAddRide(!showAddRide)} className="mt-4 sm:mt-0">
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
                          <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                  {ride.from_location} → {ride.to_location}
                                </span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(ride.departure_time).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-1 mt-2 sm:mt-0">
                                  <Users className="h-4 w-4" />
                                  <span>
                                    {ride.available_seats}/{ride.total_seats} available
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 mt-2 sm:mt-0">
                                  <IndianRupee className="h-4 w-4" />
                                  <span>{ride.price} per seat</span>
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
                              className="mt-2 sm:mt-0"
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
                              ₹{ride.is_ride_completed ? (rideEarnings[ride.id] || 0).toLocaleString() : 0}
                            </p>
                            {ride.status === "cancelled" && (
                              <p className="text-red-600 text-xs mt-1">
                                This ride was cancelled - no earnings from this trip
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {ride.status === "active" && (
                                <>
                                  <Button size="sm" onClick={() => handleCompleteRide(ride.id)}>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Mark Completed
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleCancelRide(ride.id)}>
                                    Cancel Ride
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleEditRideClick(ride)}>
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="outline" onClick={() => handleShowBookingSummary(ride.id)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View Bookings
                              </Button>
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

      {/* Edit Ride Dialog */}
      <Dialog open={showEditRideDialog} onOpenChange={setShowEditRideDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Ride Details</DialogTitle>
            <DialogDescription>
              Make changes to the ride price. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditRideSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price (₹)
              </Label>
              <Input
                id="edit-price"
                type="number"
                value={editedRideDetails.price}
                onChange={(e) => setEditedRideDetails({ ...editedRideDetails, price: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditRideDialog(false)}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Booking Summary Dialog */}
      <Dialog open={showBookingSummaryDialog} onOpenChange={setShowBookingSummaryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Summary</DialogTitle>
            <DialogDescription>Details of confirmed bookings for this ride.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedRideBookings.length === 0 ? (
              <p className="text-muted-foreground">No confirmed bookings for this ride yet.</p>
            ) : (
              <div className="space-y-3">
                {selectedRideBookings.map((booking) => (
                  <div key={booking.id} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="font-medium">{booking.users.phone}</span>
                    </div>
                    <Badge variant="secondary">{booking.seats_booked} Seats</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowBookingSummaryDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}