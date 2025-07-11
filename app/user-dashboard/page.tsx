"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users, IndianRupee, Clock, AlertTriangle, Star, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Booking {
  id: string
  seats_booked: number
  total_price: number
  status: "confirmed" | "cancelled"
  created_at: string
  ride: {
    from_location: string
    to_location: string
    departure_time: string
    price: number
    driver: {
      primary_phone: string
      car_model: string
      car_make: string
      vehicle_number: string
    }
  }
}

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/auth")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "user") {
      router.push("/auth")
      return
    }

    setUser(parsedUser)
    fetchBookings(parsedUser.id)
  }, [router])

  const fetchBookings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          ride:rides (
            from_location,
            to_location,
            departure_time,
            price,
            driver:drivers (
              primary_phone,
              car_model,
              car_make,
              vehicle_number
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleSOS = (bookingId: string) => {
    alert("SOS Alert triggered! Emergency services will be contacted.")
  }

  const handleReviewDriver = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowReviewModal(true)
  }

  const submitReview = async () => {
    if (!selectedBooking || rating === 0) return
    
    try {
      const { error } = await supabase
        .from("reviews")
        .insert([
          {
            booking_id: selectedBooking.id,
            user_id: user.id,
            rating: rating,
            review_text: reviewText || null,
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }
      
      alert("Review submitted successfully!")
      setShowReviewModal(false)
      setRating(0)
      setReviewText("")
      setSelectedBooking(null)
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Failed to submit review. Please try again.")
    }
  }

  const closeReviewModal = () => {
    setShowReviewModal(false)
    setRating(0)
    setReviewText("")
    setSelectedBooking(null)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
              <p className="text-muted-foreground">Phone: {user.phone}</p>
            </div>
            <div className="flex space-x-4">
              <Button asChild>
                <a href="/rides">Find Rides</a>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Rides</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.filter((b) => b.status === "confirmed").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{bookings.reduce((sum, booking) => sum + booking.total_price, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
              <CardDescription>View all your current and past ride bookings</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading your bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No bookings yet</p>
                  <Button asChild>
                    <a href="/rides">Book Your First Ride</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {booking.ride.from_location} → {booking.ride.to_location}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(booking.ride.departure_time).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{booking.seats_booked} seats</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <IndianRupee className="h-4 w-4" />
                              <span>₹{booking.total_price}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={booking.status === "confirmed" ? "default" : "destructive"}>
                          {booking.status}
                        </Badge>
                      </div>

                      {booking.ride.driver && (
                        <div className="bg-muted/50 rounded p-3 text-sm mb-3">
                          <p>
                            <strong>Driver:</strong> {booking.ride.driver.primary_phone}
                          </p>
                          <p>
                            <strong>Vehicle:</strong> {booking.ride.driver.car_make} {booking.ride.driver.car_model} (
                            {booking.ride.driver.vehicle_number})
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleSOS(booking.id)}
                          className="flex items-center space-x-1"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <span>SOS</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewDriver(booking)}
                          className="flex items-center space-x-1"
                        >
                          <Star className="h-4 w-4" />
                          <span>Review Driver</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Review Driver</h3>
              <Button variant="ghost" size="sm" onClick={closeReviewModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                {selectedBooking.ride.from_location} → {selectedBooking.ride.to_location}
              </p>
              {selectedBooking.ride.driver && (
                <p className="text-sm text-muted-foreground">
                  Driver: {selectedBooking.ride.driver.primary_phone}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${
                      star <= rating ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Review (Optional)</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded-md resize-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={submitReview}
                disabled={rating === 0}
                className="flex-1"
              >
                Submit Review
              </Button>
              <Button variant="outline" onClick={closeReviewModal}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}