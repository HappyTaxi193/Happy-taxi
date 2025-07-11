"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MapPin, Calendar, Users, IndianRupee, Phone, Car, Search, X, Star, Clock, SlidersHorizontal } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Ride {
  id: string
  from_location: string
  to_location: string
  price: number
  total_seats: number
  available_seats: number
  departure_time: string
  status: "active" | "completed" | "cancelled"
  driver_id: string // Make sure this exists in your rides table
  drivers: {
    id: string
    primary_phone: string
    secondary_phone: string | null
    car_make: string
    car_model: string
    vehicle_number: string
    rating: number
    total_reviews: number
  }
}

interface Booking {
  id: string
  ride_id: string
  user_id: string
  seats_booked: number
  total_price: number
  status: string
}

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([])
  const [filteredRides, setFilteredRides] = useState<Ride[]>([])
  const [userBookings, setUserBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [priceFilter, setPriceFilter] = useState("")
  const [ratingFilter, setRatingFilter] = useState("")
  const [timeFilter, setTimeFilter] = useState("")
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [seatsToBook, setSeatsToBook] = useState(1)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Get search parameters from URL
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    if (from) setFromLocation(from)
    if (to) setToLocation(to)

    fetchRides()
    if (userData) {
      fetchUserBookings(JSON.parse(userData).id)
    }
  }, [])

  useEffect(() => {
    filterRides()
  }, [fromLocation, toLocation, priceFilter, ratingFilter, timeFilter, rides])

  // Function to calculate driver rating from reviews
  const calculateDriverRating = async (driverId: string) => {
    try {
      // Get all reviews for this driver through their rides
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select(`
          rating,
          bookings!inner(
            rides!inner(
              driver_id
            )
          )
        `)
        .eq("bookings.rides.driver_id", driverId)

      if (error) {
        console.error("Error fetching driver reviews:", error)
        return { rating: 0, total_reviews: 0 }
      }

      if (!reviews || reviews.length === 0) {
        return { rating: 0, total_reviews: 0 }
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const avgRating = totalRating / reviews.length

      return {
        rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
        total_reviews: reviews.length
      }
    } catch (error) {
      console.error("Error calculating driver rating:", error)
      return { rating: 0, total_reviews: 0 }
    }
  }

  const fetchRides = useCallback(async () => {
    try {
      // First fetch rides with driver info
      const { data: ridesData, error } = await supabase
        .from("rides")
        .select(`
          *,
          drivers (
            id,
            primary_phone,
            secondary_phone,
            car_make,
            car_model,
            vehicle_number
          )
        `)
        .eq("status", "active")
        .gt("available_seats", 0)
        .gte("departure_time", new Date().toISOString())
        .order("departure_time", { ascending: true })

      if (error) throw error

      // Calculate ratings for each driver
      const ridesWithRatings = await Promise.all(
        (ridesData || []).map(async (ride) => {
          const driverRating = await calculateDriverRating(ride.drivers.id)
          return {
            ...ride,
            drivers: {
              ...ride.drivers,
              rating: driverRating.rating,
              total_reviews: driverRating.total_reviews
            }
          }
        })
      )

      setRides(ridesWithRatings)
    } catch (error) {
      console.error("Error fetching rides:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserBookings = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "confirmed")

      if (error) throw error
      setUserBookings(data || [])
    } catch (error) {
      console.error("Error fetching user bookings:", error)
    }
  }, [])

  const filterRides = () => {
    let filtered = rides

    // Location filters
    if (fromLocation) {
      filtered = filtered.filter((ride) => 
        ride.from_location.toLowerCase().includes(fromLocation.toLowerCase())
      )
    }

    if (toLocation) {
      filtered = filtered.filter((ride) => 
        ride.to_location.toLowerCase().includes(toLocation.toLowerCase())
      )
    }

    // Price filter
    if (priceFilter) {
      switch (priceFilter) {
        case "under-500":
          filtered = filtered.filter((ride) => ride.price < 500)
          break
        case "500-1000":
          filtered = filtered.filter((ride) => ride.price >= 500 && ride.price <= 1000)
          break
        case "1000-2000":
          filtered = filtered.filter((ride) => ride.price > 1000 && ride.price <= 2000)
          break
        case "above-2000":
          filtered = filtered.filter((ride) => ride.price > 2000)
          break
      }
    }

    // Rating filter
    if (ratingFilter) {
      const minRating = parseFloat(ratingFilter)
      filtered = filtered.filter((ride) => ride.drivers.rating >= minRating)
    }

    // Time filter
    if (timeFilter) {
      const now = new Date()
      const currentHour = now.getHours()
      
      filtered = filtered.filter((ride) => {
        const rideTime = new Date(ride.departure_time)
        const rideHour = rideTime.getHours()
        
        switch (timeFilter) {
          case "morning":
            return rideHour >= 6 && rideHour < 12
          case "afternoon":
            return rideHour >= 12 && rideHour < 18
          case "evening":
            return rideHour >= 18 && rideHour < 24
          case "night":
            return rideHour >= 0 && rideHour < 6
          case "next-2-hours":
            return rideTime.getTime() <= now.getTime() + (2 * 60 * 60 * 1000)
          case "today":
            return rideTime.toDateString() === now.toDateString()
          case "tomorrow":
            const tomorrow = new Date(now)
            tomorrow.setDate(tomorrow.getDate() + 1)
            return rideTime.toDateString() === tomorrow.toDateString()
          default:
            return true
        }
      })
    }

    setFilteredRides(filtered)
  }

  const isRideBooked = (rideId: string) => {
    return userBookings.some(booking => booking.ride_id === rideId)
  }

  const handleBookRide = async () => {
    if (!user) {
      alert("Please login to book a ride")
      return
    }

    if (user.role !== "user") {
      alert("Only passengers can book rides")
      return
    }

    if (!selectedRide) return

    setBookingLoading(true)

    try {
      // Check if seats are still available
      const { data: currentRide, error: checkError } = await supabase
        .from("rides")
        .select("available_seats")
        .eq("id", selectedRide.id)
        .single()

      if (checkError) throw checkError

      if (currentRide.available_seats < seatsToBook) {
        alert("Not enough seats available. Please select fewer seats.")
        setBookingLoading(false)
        return
      }

      // Create booking
      const { error: bookingError } = await supabase.from("bookings").insert([
        {
          user_id: user.id,
          ride_id: selectedRide.id,
          seats_booked: seatsToBook,
          total_price: seatsToBook * selectedRide.price,
          status: "confirmed"
        },
      ])

      if (bookingError) throw bookingError

      // Update available seats
      const { error: updateError } = await supabase
        .from("rides")
        .update({
          available_seats: currentRide.available_seats - seatsToBook,
        })
        .eq("id", selectedRide.id)

      if (updateError) throw updateError

      alert("Ride booked successfully!")
      setSelectedRide(null)
      setSeatsToBook(1)
      fetchRides()
      fetchUserBookings(user.id)
    } catch (error) {
      console.error("Error booking ride:", error)
      alert("Failed to book ride. Please try again.")
    } finally {
      setBookingLoading(false)
    }
  }

  const clearFilters = () => {
    setFromLocation("")
    setToLocation("")
    setPriceFilter("")
    setRatingFilter("")
    setTimeFilter("")
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : index < rating 
            ? "fill-yellow-200 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Find Your Perfect Ride</h1>
            <p className="text-xl text-muted-foreground">
              Browse available rides and book your journey with trusted drivers
            </p>
          </div>

          {/* Search Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search & Filter Rides</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="from">From Location</Label>
                  <Input
                    id="from"
                    placeholder="Enter pickup location"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="to">To Location</Label>
                  <Input
                    id="to"
                    placeholder="Enter destination"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price Range</Label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-500">Under ₹500</SelectItem>
                      <SelectItem value="500-1000">₹500 - ₹1000</SelectItem>
                      <SelectItem value="1000-2000">₹1000 - ₹2000</SelectItem>
                      <SelectItem value="above-2000">Above ₹2000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rating">Minimum Rating</Label>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select minimum rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      <SelectItem value="4.0">4.0+ Stars</SelectItem>
                      <SelectItem value="3.5">3.5+ Stars</SelectItem>
                      <SelectItem value="3.0">3.0+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time">Departure Time</Label>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="next-2-hours">Next 2 Hours</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="morning">Morning (6AM-12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM-6PM)</SelectItem>
                      <SelectItem value="evening">Evening (6PM-12AM)</SelectItem>
                      <SelectItem value="night">Night (12AM-6AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="mb-4">
            <p className="text-muted-foreground">
              {loading ? "Loading rides..." : `Found ${filteredRides.length} available rides`}
            </p>
          </div>

          {/* Rides List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading available rides...</div>
            </div>
          ) : filteredRides.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No rides found</h3>
                <p className="text-muted-foreground mb-4">
                  {fromLocation || toLocation || priceFilter || ratingFilter || timeFilter
                    ? "Try adjusting your search criteria or filters to find more rides."
                    : "No rides are currently available. Check back later!"}
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredRides.map((ride) => (
                <Card key={ride.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span className="text-lg font-semibold">
                            {ride.from_location} → {ride.to_location}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <div>
                              <div>{new Date(ride.departure_time).toLocaleDateString()}</div>
                              <div>{new Date(ride.departure_time).toLocaleTimeString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{ride.available_seats} seats available</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <IndianRupee className="h-4 w-4" />
                            <span>{ride.price} per seat</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>
                              {ride.drivers.car_make} {ride.drivers.car_model}
                            </span>
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Driver Rating */}
                              <div className="flex items-center space-x-1">
                                {ride.drivers.total_reviews > 0 ? (
                                  <>
                                    {renderStars(ride.drivers.rating)}
                                    <span className="text-sm font-medium ml-1">
                                      {ride.drivers.rating.toFixed(1)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      ({ride.drivers.total_reviews} reviews)
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    No reviews yet
                                  </span>
                                )}
                              </div>
                              
                              {/* Phone number - only visible if booked */}
                              {user && isRideBooked(ride.id) ? (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4" />
                                  <span className="text-sm">Driver: {ride.drivers.primary_phone}</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4" />
                                  <span className="text-sm">Phone visible after booking</span>
                                </div>
                              )}
                            </div>
                            <Badge variant="outline">{ride.drivers.vehicle_number}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 text-right">
                        <div className="text-2xl font-bold text-primary mb-2">₹{ride.price}</div>
                        <div className="text-sm text-muted-foreground mb-4">per seat</div>
                        {user && isRideBooked(ride.id) ? (
                          <Badge variant="secondary">Booked</Badge>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => setSelectedRide(ride)}>Book Ride</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Book Your Ride</DialogTitle>
                                <DialogDescription>Confirm your booking details below</DialogDescription>
                              </DialogHeader>
                              {selectedRide && (
                                <div className="space-y-4">
                                  <div className="bg-muted/50 rounded-lg p-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <MapPin className="h-4 w-4 text-primary" />
                                      <span className="font-medium">
                                        {selectedRide.from_location} → {selectedRide.to_location}
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                      <div>
                                        <strong>Departure:</strong>{" "}
                                        {new Date(selectedRide.departure_time).toLocaleString()}
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <strong>Driver Rating:</strong>
                                        {selectedRide.drivers.total_reviews > 0 ? (
                                          <div className="flex items-center space-x-1">
                                            {renderStars(selectedRide.drivers.rating)}
                                            <span className="text-sm">
                                              {selectedRide.drivers.rating.toFixed(1)}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-sm text-muted-foreground">
                                            No reviews yet
                                          </span>
                                        )}
                                      </div>
                                      <div>
                                        <strong>Vehicle:</strong> {selectedRide.drivers.car_make}{" "}
                                        {selectedRide.drivers.car_model} ({selectedRide.drivers.vehicle_number})
                                      </div>
                                      <div>
                                        <strong>Driver Contact:</strong> Will be revealed after booking
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="seats">Number of Seats</Label>
                                    <Input
                                      id="seats"
                                      type="number"
                                      min="1"
                                      max={selectedRide.available_seats}
                                      value={seatsToBook}
                                      onChange={(e) => setSeatsToBook(Number.parseInt(e.target.value))}
                                      className="mt-1"
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Available: {selectedRide.available_seats} seats
                                    </p>
                                  </div>

                                  <div className="bg-primary/10 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium">Total Amount:</span>
                                      <span className="text-xl font-bold text-primary">
                                        ₹{seatsToBook * selectedRide.price}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {seatsToBook} seats × ₹{selectedRide.price} per seat
                                    </p>
                                  </div>

                                  <div className="flex space-x-3">
                                    <Button
                                      onClick={handleBookRide}
                                      disabled={bookingLoading || !user}
                                      className="flex-1"
                                    >
                                      {bookingLoading ? "Booking..." : !user ? "Login Required" : "Confirm Booking"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setSelectedRide(null)}
                                      disabled={bookingLoading}
                                    >
                                      Cancel
                                    </Button>
                                  </div>

                                  {!user && (
                                    <p className="text-sm text-muted-foreground text-center">
                                      Please{" "}
                                      <a href="/auth" className="text-primary hover:underline">
                                        login
                                      </a>{" "}
                                      to book this ride
                                    </p>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}