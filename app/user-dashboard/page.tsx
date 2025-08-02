"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Calendar, Users, IndianRupee, Clock, AlertTriangle, Star, X, Edit, Trash2, User, Car, Phone } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Driver {
  name: string
  photograph_url: string
  primary_phone: string
  car_model: string
  car_make: string
  vehicle_number: string
}

interface Ride {
  id: string
  from_location: string
  to_location: string
  departure_time: string
  price: number
  available_seats: number
  driver: Driver
}

interface Booking {
  id: string
  seats_booked: number
  total_price: number
  status: "confirmed" | "cancelled"
  created_at: string
  ride: Ride
  reviews?: Array<{
    id: string
    rating: number
    review_text: string
  }>
}

// Helper function to safely get the image URL from a Base64 string
const getImageUrl = (base64String: string | null): string | undefined => {
  if (!base64String) {
    return undefined;
  }
  if (base64String.startsWith("data:")) {
    return base64String;
  }
  return `data:image/jpeg;base64,${base64String}`;
};

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDriverProfileModal, setShowDriverProfileModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [editSeats, setEditSeats] = useState(1)
  const [processingAction, setProcessingAction] = useState(false)
  const [photoError, setPhotoError] = useState<Record<string, boolean>>({});
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
            id,
            from_location,
            to_location,
            departure_time,
            price,
            available_seats,
            driver:drivers (
              name,
              photograph_url,
              primary_phone,
              car_model,
              car_make,
              vehicle_number
            )
          ),
          reviews (
            id,
            rating,
            review_text
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

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setEditSeats(booking.seats_booked)
    setShowEditModal(true)
  }

  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowCancelModal(true)
  }

  const handleDriverProfile = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDriverProfileModal(true);
  }

  const submitReview = async () => {
    if (!selectedBooking || rating === 0) return

    setProcessingAction(true)
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
      closeReviewModal()
      fetchBookings(user.id)
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Failed to submit review. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  const submitEditBooking = async () => {
    if (!selectedBooking || editSeats < 1) return

    setProcessingAction(true)
    try {
      const seatDifference = editSeats - selectedBooking.seats_booked
      if (seatDifference > 0 && seatDifference > selectedBooking.ride.available_seats) {
        alert("Not enough seats available for this booking.")
        setProcessingAction(false)
        return
      }

      const newTotalPrice = editSeats * selectedBooking.ride.price

      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          seats_booked: editSeats,
          total_price: newTotalPrice
        })
        .eq("id", selectedBooking.id)

      if (bookingError) throw bookingError

      const newAvailableSeats = selectedBooking.ride.available_seats - seatDifference
      const { error: rideError } = await supabase
        .from("rides")
        .update({ available_seats: newAvailableSeats })
        .eq("id", selectedBooking.ride.id)

      if (rideError) throw rideError

      alert("Booking updated successfully!")
      closeEditModal()
      fetchBookings(user.id)
    } catch (error) {
      console.error("Error updating booking:", error)
      alert("Failed to update booking. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  const confirmCancelBooking = async () => {
    if (!selectedBooking) return

    setProcessingAction(true)
    try {
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", selectedBooking.id)

      if (bookingError) throw bookingError

      const newAvailableSeats = selectedBooking.ride.available_seats + selectedBooking.seats_booked
      const { error: rideError } = await supabase
        .from("rides")
        .update({ available_seats: newAvailableSeats })
        .eq("id", selectedBooking.ride.id)

      if (rideError) throw rideError

      alert("Booking cancelled successfully!")
      closeCancelModal()
      fetchBookings(user.id)
    } catch (error) {
      console.error("Error cancelling booking:", error)
      alert("Failed to cancel booking. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  const closeReviewModal = () => {
    setShowReviewModal(false)
    setRating(0)
    setReviewText("")
    setSelectedBooking(null)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditSeats(1)
    setSelectedBooking(null)
  }

  const closeCancelModal = () => {
    setShowCancelModal(false)
    setSelectedBooking(null)
  }
  
  const closeDriverProfileModal = () => {
    setShowDriverProfileModal(false);
    setSelectedDriver(null);
  }

  const canModifyBooking = (booking: Booking) => {
    const departureTime = new Date(booking.ride.departure_time)
    const now = new Date()
    const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return booking.status === "confirmed" && hoursUntilDeparture > 2
  }

  const hasReviewed = (booking: Booking) => {
    return booking.reviews && booking.reviews.length > 0
  }

  const totalSpent = bookings
    .filter(booking => booking.status === "confirmed")
    .reduce((sum, booking) => sum + booking.total_price, 0)

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={user}
        onLogout={handleLogout}
        showGetStarted={false}
        links={[
          { href: "/", label: "Home" },
          { href: "/rides", label: "Find Rides" },
        ]}
      />
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
                  ₹{totalSpent}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
              <CardDescription>View and manage all your current and past ride bookings</CardDescription>
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
                              <span>{booking.total_price}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={booking.status === "confirmed" ? "default" : "destructive"}>
                          {booking.status}
                        </Badge>
                      </div>

                      {booking.ride.driver && (
                        <div className="bg-muted/50 rounded p-3 text-sm mb-3">
                          <div className="flex items-center space-x-4 mb-2">
                            <div className="h-10 w-10 overflow-hidden rounded-full border">
                              {booking.ride.driver.photograph_url && !photoError[booking.ride.id] ? (
                                <img
                                  src={getImageUrl(booking.ride.driver.photograph_url)}
                                  alt="Driver's Photograph"
                                  className="h-full w-full object-cover"
                                  onError={() => setPhotoError(prev => ({...prev, [booking.ride.id]: true}))}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full bg-gray-200 text-xs text-gray-500">
                                  No Photo
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{booking.ride.driver.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {booking.ride.driver.primary_phone}
                              </p>
                            </div>
                          </div>
                          <p>
                            <strong>Vehicle:</strong> {booking.ride.driver.car_make} {booking.ride.driver.car_model} (
                            {booking.ride.driver.vehicle_number})
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
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
                          onClick={() => handleDriverProfile(booking.ride.driver)}
                          className="flex items-center space-x-1"
                        >
                          <User className="h-4 w-4" />
                          <span>Driver Profile</span>
                        </Button>

                        {!hasReviewed(booking) && booking.status === "confirmed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReviewDriver(booking)}
                            className="flex items-center space-x-1"
                          >
                            <Star className="h-4 w-4" />
                            <span>Review Driver</span>
                          </Button>
                        )}

                        {hasReviewed(booking) && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>Reviewed ({booking.reviews?.[0]?.rating}/5)</span>
                          </div>
                        )}

                        {canModifyBooking(booking) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBooking(booking)}
                              className="flex items-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelBooking(booking)}
                              className="flex items-center space-x-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Cancel</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
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
                  Driver: {selectedBooking.ride.driver.name}
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
                disabled={rating === 0 || processingAction}
                className="flex-1"
              >
                {processingAction ? "Submitting..." : "Submit Review"}
              </Button>
              <Button variant="outline" onClick={closeReviewModal}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Edit Booking</h3>
              <Button variant="ghost" size="sm" onClick={closeEditModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                {selectedBooking.ride.from_location} → {selectedBooking.ride.to_location}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Departure: {new Date(selectedBooking.ride.departure_time).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Price per seat: ₹{selectedBooking.ride.price}
              </p>
            </div>

            <div className="mb-4">
              <Label htmlFor="seats" className="text-sm font-medium text-foreground">
                Number of Seats
              </Label>
              <Input
                id="seats"
                type="number"
                min="1"
                max={selectedBooking.ride.available_seats + selectedBooking.seats_booked}
                value={editSeats}
                onChange={(e) => setEditSeats(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {selectedBooking.ride.available_seats + selectedBooking.seats_booked} seats
              </p>
            </div>

            <div className="mb-4 p-3 bg-muted/50 rounded">
              <p className="text-sm font-medium">
                Total Price: ₹{editSeats * selectedBooking.ride.price}
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={submitEditBooking}
                disabled={editSeats < 1 || processingAction}
                className="flex-1"
              >
                {processingAction ? "Updating..." : "Update Booking"}
              </Button>
              <Button variant="outline" onClick={closeEditModal}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Cancel Booking</h3>
              <Button variant="ghost" size="sm" onClick={closeCancelModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                Are you sure you want to cancel this booking?
              </p>
              <div className="bg-muted/50 rounded p-3 text-sm">
                <p><strong>Route:</strong> {selectedBooking.ride.from_location} → {selectedBooking.ride.to_location}</p>
                <p><strong>Departure:</strong> {new Date(selectedBooking.ride.departure_time).toLocaleString()}</p>
                <p><strong>Seats:</strong> {selectedBooking.seats_booked}</p>
                <p><strong>Total Price:</strong> ₹{selectedBooking.total_price}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={confirmCancelBooking}
                disabled={processingAction}
                className="flex-1"
              >
                {processingAction ? "Cancelling..." : "Yes, Cancel Booking"}
              </Button>
              <Button variant="outline" onClick={closeCancelModal}>
                No, Keep Booking
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Driver Profile Modal */}
      <Dialog open={showDriverProfileModal} onOpenChange={setShowDriverProfileModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Driver Profile</DialogTitle>
            <DialogDescription>
              Information about the driver for your booked ride.
            </DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-24 w-24 overflow-hidden rounded-full border">
                  {selectedDriver.photograph_url && !photoError['driver-profile'] ? (
                    <img
                      src={getImageUrl(selectedDriver.photograph_url)}
                      alt="Driver's Photograph"
                      className="h-full w-full object-cover"
                      onError={() => setPhotoError(prev => ({...prev, 'driver-profile': true}))}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-gray-200 text-sm text-gray-500 text-center p-2">
                      No Photo
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xl font-bold">{selectedDriver.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDriver.car_make} {selectedDriver.car_model}</p>
                  <Badge className="mt-1">Verified</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedDriver.primary_phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedDriver.vehicle_number}</span>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={closeDriverProfileModal}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}