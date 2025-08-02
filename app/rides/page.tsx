"use client"
import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,} from "@/components/ui/dialog"
import { MapPin, Calendar, Users, IndianRupee, Phone, Car, Search, X, Star, Clock, SlidersHorizontal } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type React from "react"

interface Ride {
  id: string
  from_location: string
  to_location: string
  price: number
  total_seats: number
  available_seats: number
  departure_time: string
  status: "active" | "completed" | "cancelled"
  driver_id: string
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

// New component for the search input with dropdown suggestions
interface LocationSearchInputProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onSelect: (value: string) => void
  suggestions: string[]
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  suggestions,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase())
  )

  const handleSelect = (suggestion: string) => {
    onSelect(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="relative space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="h-10 sm:h-11"
      />
      {showSuggestions && value && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 border border-gray-200 bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onMouseDown={() => handleSelect(suggestion)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
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
  const [showFilters, setShowFilters] = useState(false)
  const [allLocations, setAllLocations] = useState<string[]>([])

  const searchParams = useSearchParams()
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

  const calculateDriverRating = async (driverId: string) => {
    try {
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
        rating: Math.round(avgRating * 10) / 10,
        total_reviews: reviews.length
      }
    } catch (error) {
      console.error("Error calculating driver rating:", error)
      return { rating: 0, total_reviews: 0 }
    }
  }

  const fetchRides = useCallback(async () => {
    try {
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
      
      // Extract all unique locations for suggestions
      const uniqueLocations = new Set<string>();
      ridesWithRatings.forEach(ride => {
        uniqueLocations.add(ride.from_location);
        uniqueLocations.add(ride.to_location);
      });
      setAllLocations(Array.from(uniqueLocations));
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

    if (ratingFilter) {
      const minRating = parseFloat(ratingFilter)
      filtered = filtered.filter((ride) => ride.drivers.rating >= minRating)
    }

    if (timeFilter) {
      const now = new Date()
      
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
        className={`h-3 w-3 sm:h-4 sm:w-4 ${
          index < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : index < rating 
            ? "fill-yellow-200 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ))
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    alert("Logged out successfully!")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        user={user}
        onLogout={handleLogout}
        showGetStarted={!user}
        links={[
          { href: "/", label: "Home" },
          { href: "/rides", label: "Find Rides" },
        ]}
      />
      <br /><br />
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              Find Your Perfect Ride
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              Browse available rides and book your journey with trusted drivers
            </p>
          </div>

          <Card className="mb-6 sm:mb-8">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Search Rides</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="sm:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <LocationSearchInput
                  label="From Location"
                  placeholder="Enter pickup location"
                  value={fromLocation}
                  onChange={setFromLocation}
                  onSelect={setFromLocation}
                  suggestions={allLocations}
                />
                <LocationSearchInput
                  label="To Location"
                  placeholder="Enter destination"
                  value={toLocation}
                  onChange={setToLocation}
                  onSelect={setToLocation}
                  suggestions={allLocations}
                />
              </div>

              <div className={`${showFilters ? 'block' : 'hidden sm:block'} space-y-4`}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">Price Range</Label>
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger className="h-10 sm:h-11">
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
                  <div className="space-y-2">
                    <Label htmlFor="rating" className="text-sm font-medium">Minimum Rating</Label>
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger className="h-10 sm:h-11">
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
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-medium">Departure Time</Label>
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="h-10 sm:h-11">
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

                <div className="flex justify-center sm:justify-start">
                  <Button onClick={clearFilters} variant="outline" size="sm" className="bg-transparent">
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-4 px-1">
            <p className="text-sm sm:text-base text-muted-foreground">
              {loading ? "Loading rides..." : `Found ${filteredRides.length} available rides`}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-base sm:text-lg">Loading available rides...</div>
            </div>
          ) : filteredRides.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <MapPin className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No rides found</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 px-4">
                  {fromLocation || toLocation || priceFilter || ratingFilter || timeFilter
                    ? "Try adjusting your search criteria or filters to find more rides."
                    : "No rides are currently available. Check back later!"}
                </p>
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {filteredRides.map((ride) => (
                <Card key={ride.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                            <span className="text-base sm:text-lg font-semibold leading-tight">
                              {ride.from_location} → {ride.to_location}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                          <div className="text-xl sm:text-2xl font-bold text-primary">₹{ride.price}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">per seat</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-start space-x-2">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-foreground truncate">
                              {new Date(ride.departure_time).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </div>
                            <div className="text-xs">
                              {new Date(ride.departure_time).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{ride.available_seats} seats</span>
                        </div>
                        <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
                          <Car className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate">
                            {ride.drivers.car_make} {ride.drivers.car_model}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            {ride.drivers.vehicle_number}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="flex items-center space-x-1">
                            {ride.drivers.total_reviews > 0 ? (
                              <>
                                <div className="flex items-center space-x-1">
                                  {renderStars(ride.drivers.rating)}
                                </div>
                                <span className="text-xs sm:text-sm font-medium">
                                  {ride.drivers.rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-muted-foreground hidden sm:inline">
                                  ({ride.drivers.total_reviews} reviews)
                                </span>
                              </>
                            ) : (
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                No reviews yet
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>
                            {user && isRideBooked(ride.id) 
                              ? `Driver: ${ride.drivers.primary_phone}`
                              : "Phone visible after booking"
                            }
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        {user && isRideBooked(ride.id) ? (
                          <Badge variant="secondary" className="w-full justify-center py-2 sm:w-auto">
                            Booked
                          </Badge>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                onClick={() => setSelectedRide(ride)}
                                className="w-full sm:w-auto"
                                size="sm"
                              >
                                Book Ride
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md mx-4 sm:mx-0">
                              <DialogHeader>
                                <DialogTitle>Book Your Ride</DialogTitle>
                                <DialogDescription>Confirm your booking details below</DialogDescription>
                              </DialogHeader>
                              {selectedRide && (
                                <div className="space-y-4">
                                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                    <div className="flex items-start space-x-2">
                                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                      <span className="font-medium text-sm leading-tight">
                                        {selectedRide.from_location} → {selectedRide.to_location}
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-2">
                                      <div>
                                        <strong>Departure:</strong>{" "}
                                        {new Date(selectedRide.departure_time).toLocaleString('en-IN')}
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

                                  <div className="space-y-2">
                                    <Label htmlFor="seats" className="text-sm font-medium">Number of Seats</Label>
                                    <Input
                                      id="seats"
                                      type="number"
                                      min="1"
                                      max={selectedRide.available_seats}
                                      value={seatsToBook}
                                      onChange={(e) => setSeatsToBook(Number.parseInt(e.target.value))}
                                      className="h-10"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Available: {selectedRide.available_seats} seats
                                    </p>
                                  </div>

                                  <div className="bg-primary/10 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-sm">Total Amount:</span>
                                      <span className="text-lg sm:text-xl font-bold text-primary">
                                        ₹{seatsToBook * selectedRide.price}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {seatsToBook} seats × ₹{selectedRide.price} per seat
                                    </p>
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                      onClick={handleBookRide}
                                      disabled={bookingLoading || !user}
                                      className="flex-1 h-10"
                                    >
                                      {bookingLoading ? "Booking..." : !user ? "Login Required" : "Confirm Booking"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => setSelectedRide(null)}
                                      disabled={bookingLoading}
                                      className="sm:w-auto h-10"
                                    >
                                      Cancel
                                    </Button>
                                  </div>

                                  {!user && (
                                    <p className="text-xs text-muted-foreground text-center">
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