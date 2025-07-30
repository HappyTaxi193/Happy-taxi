"use client"

import type React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, MapPin, Car, CheckCircle, Smartphone, Users } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">How HappyTaxi Works</CardTitle>
              <CardDescription className="text-lg mt-2">
                Getting around or earning as a driver has never been easier.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* How it Works for Passengers */}
              <section>
                <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
                  <Users className="h-6 w-6 mr-2 text-primary" />
                  For Passengers
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">1. Book Your Ride</h3>
                      <p className="text-muted-foreground mt-1">
                        Download the HappyTaxi app, enter your pickup and drop-off locations, and choose your preferred car type.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">2. Get Instant Fare Estimate</h3>
                      <p className="text-muted-foreground mt-1">
                        See your fare estimate upfront before you confirm your booking, ensuring transparency.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">3. Track Your Driver</h3>
                      <p className="text-muted-foreground mt-1">
                        Watch your driver's arrival in real-time on the map and receive updates.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">4. Enjoy Your Ride</h3>
                      <p className="text-muted-foreground mt-1">
                        Relax and enjoy a safe and comfortable journey to your destination. Pay conveniently through the app.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* How it Works for Drivers */}
              <section className="mt-10 pt-8 border-t border-dashed border-gray-200">
                <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
                  <Car className="h-6 w-6 mr-2 text-primary" />
                  For Drivers
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">1. Sign Up & Get Approved</h3>
                      <p className="text-muted-foreground mt-1">
                        Register through our app, submit your documents, and get approved to start driving.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">2. Accept Ride Requests</h3>
                      <p className="text-muted-foreground mt-1">
                        Go online and receive nearby ride requests. View trip details and destination before accepting.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">3. Drive & Earn</h3>
                      <p className="text-muted-foreground mt-1">
                        Navigate using the in-app map and complete trips. Your earnings are automatically calculated and paid out.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">4. Flexible Schedule</h3>
                      <p className="text-muted-foreground mt-1">
                        Drive when you want, where you want. HappyTaxi offers the flexibility to fit your lifestyle.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}