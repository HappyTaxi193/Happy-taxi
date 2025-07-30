"use client"

import type React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, PhoneCall, Map, Users, Car, HeartHandshake, AlertCircle } from "lucide-react"

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Your Safety, Our Priority</CardTitle>
              <CardDescription className="text-lg mt-2">
                At HappyTaxi, we are committed to ensuring a safe and secure experience for everyone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Passenger Safety */}
              <section>
                <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
                  <Users className="h-6 w-6 mr-2 text-primary" />
                  Passenger Safety Features
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Verified Drivers</h3>
                      <p className="text-muted-foreground mt-1">
                        All HappyTaxi drivers undergo a thorough background check and document verification process.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <Map className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Real-time Tracking</h3>
                      <p className="text-muted-foreground mt-1">
                        Share your trip details with loved ones and track your journey in real-time on the map.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <PhoneCall className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">In-App Emergency Button</h3>
                      <p className="text-muted-foreground mt-1">
                        Access an emergency button within the app to quickly connect with authorities or our support team.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Vehicle Standards</h3>
                      <p className="text-muted-foreground mt-1">
                        We ensure that all vehicles meet safety standards and are regularly inspected.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Driver Safety */}
              <section className="mt-10 pt-8 border-t border-dashed border-gray-200">
                <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
                  <Car className="h-6 w-6 mr-2 text-primary" />
                  Driver Safety Features
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Passenger Verification</h3>
                      <p className="text-muted-foreground mt-1">
                        Passengers are identified through their registered phone numbers, enhancing accountability.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <Map className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">GPS Tracking</h3>
                      <p className="text-muted-foreground mt-1">
                        All driver trips are GPS tracked, providing a record of every journey.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <PhoneCall className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">24/7 Support</h3>
                      <p className="text-muted-foreground mt-1">
                        Our dedicated support team is available around the clock to assist drivers with any issues.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <HeartHandshake className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Fair Conduct Policy</h3>
                      <p className="text-muted-foreground mt-1">
                        We maintain a strict code of conduct for both drivers and passengers to ensure respectful interactions.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* General Safety Tips */}
              <section className="mt-10 pt-8 border-t border-dashed border-gray-200">
                <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 mr-2 text-primary" /> {/* Using AlertCircle from page.tsx import */}
                  General Safety Tips
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Always verify the driver's name, vehicle model, and license plate before getting into the car.</li>
                  <li>Share your trip details with a trusted contact.</li>
                  <li>Do not share personal information with your driver/passenger.</li>
                  <li>Report any suspicious activity or uncomfortable situations to HappyTaxi support immediately.</li>
                  <li>For drivers, ensure your vehicle is well-maintained and all documents are up-to-date.</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}