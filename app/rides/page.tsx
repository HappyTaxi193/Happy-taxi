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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MapPin, Calendar, Users, IndianRupee, Phone, Car, Search, X } from "lucide-react"
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
  drivers: {
    primary_phone: string
    secondary_phone: string | null
    car_make: string
    car_model: string
    vehicle_number: string
  }
}

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([])
  const [filteredRides, setFilteredRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
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
  }, []) // Remove searchParams from dependencies

  useEffect(() => {
    // Filter rides based on search criteria
    let filtered = rides

    if (fromLocation) {
      filtered = filtered.filter((ride) => ride.from_location.toLowerCase().includes(fromLocation.toLowerCase()))
    }

    if (toLocation) {
      filtered = filtered.filter((ride) => ride.to_location.toLowerCase().includes(toLocation.toLowerCase()))
    }

    setFilteredRides(filtered)
  }, [fromLocation, toLocation]) // Remove rides from dependencies initially

  // Add a separate useEffect for when rides data changes
  useEffect(() => {
    // Re-filter when rides data is updated
    let filtered = rides

    if (fromLocation) {
      filtered = filtered.filter((ride) => ride.from_location.toLowerCase().includes(fromLocation.toLowerCase()))
    }

    if (toLocation) {
      filtered = filtered.filter((ride) => ride.to_location.toLowerCase().includes(toLocation.toLowerCase()))
    }

    setFilteredRides(filtered)
  }, [rides])

  const fetchRides = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("rides")
        .select(`
          *,
          drivers (
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
      setRides(data || [])
    } catch (error) {
      console.error("Error fetching rides:", error)
    } finally {
      setLoading(false)
    }
  }, [])

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
      fetchRides() // Refresh rides list
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
                <span>Search Rides</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    Clear Filters
                  </Button>
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
                  {fromLocation || toLocation
                    ? "Try adjusting your search criteria or check back later for new rides."
                    : "No rides are currently available. Check back later!"}
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Search
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
                            <span>₹{ride.price} per seat</span>
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
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span className="text-sm">Driver: {ride.drivers.primary_phone}</span>
                            </div>
                            <Badge variant="outline">{ride.drivers.vehicle_number}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 text-right">
                        <div className="text-2xl font-bold text-primary mb-2">₹{ride.price}</div>
                        <div className="text-sm text-muted-foreground mb-4">per seat</div>
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
                                    <div>
                                      <strong>Driver:</strong> {selectedRide.drivers.primary_phone}
                                    </div>
                                    <div>
                                      <strong>Vehicle:</strong> {selectedRide.drivers.car_make}{" "}
                                      {selectedRide.drivers.car_model} ({selectedRide.drivers.vehicle_number})
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
