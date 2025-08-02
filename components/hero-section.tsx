"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Calendar, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { LocationSearchInput } from "@/components/LocationSearchInput"

export function HeroSection() {
  const [fromLocation, setFromLocation] = useState("")
  const [toLocation, setToLocation] = useState("")
  const [allLocations, setAllLocations] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const { data: rides, error } = await supabase
        .from("rides")
        .select("from_location, to_location")
        .eq("status", "active")
        .gte("departure_time", new Date().toISOString())

      if (error) throw error

      const uniqueLocations = new Set<string>()
      rides?.forEach(ride => {
        uniqueLocations.add(ride.from_location)
        uniqueLocations.add(ride.to_location)
      })

      setAllLocations(Array.from(uniqueLocations))
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (fromLocation && toLocation) {
      router.push(`/rides?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-bg dark:gradient-bg-dark opacity-90"></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <br /><br /><br /><br /><br /><br />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Your Journey,
            <br />
            <span className="text-yellow-300">Our Priority</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
            Connect with trusted drivers and passengers. Safe, reliable, and affordable rides at your fingertips.
          </p>

          {/* Search Form */}
          <Card className="max-w-2xl mx-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LocationSearchInput
                    placeholder="From location"
                    value={fromLocation}
                    onChange={setFromLocation}
                    onSelect={setFromLocation}
                    suggestions={allLocations}
                  />
                  <LocationSearchInput
                    placeholder="To location"
                    value={toLocation}
                    onChange={setToLocation}
                    onSelect={setToLocation}
                    suggestions={allLocations}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Search className="mr-2 h-5 w-5" />
                  Find Rides
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg p-6">
                <Users className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-white/80">Happy Users</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg p-6">
                <Calendar className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-white/80">Cities Covered</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg p-6">
                <Calendar className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-white/80">Available</div>
              </div>
            </div>
      <br /><br /><br /><br />
          </div>
        </div>
      </div>
    </section>
  )
}