"use client"

import type React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gavel, FileText, UserCheck, Car, Briefcase, Award, PhoneCall, CheckCircle } from "lucide-react"

export default function DriverRequirementsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Become a HappyTaxi Driver</CardTitle>
              <CardDescription className="text-lg mt-2">
                Join our team of professional drivers and start earning on your own terms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Eligibility Criteria */}
              <section>
                <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 mr-2 text-primary" />
                  Eligibility Criteria
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Age Requirement</h3>
                      <p className="text-muted-foreground mt-1">
                        Applicants must be at least 21 years old.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <Gavel className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Clean Driving Record</h3>
                      <p className="text-muted-foreground mt-1">
                        A clear driving history with no major violations in the past three years.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Commercial Driving Experience</h3>
                      <p className="text-muted-foreground mt-1">
                        Previous experience in commercial driving or taxi services is preferred but not always mandatory.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <PhoneCall className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Valid Phone Number</h3>
                      <p className="text-muted-foreground mt-1">
                        A primary and optionally a secondary active mobile phone number for communication.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Required Documents */}
              <section className="mt-10 pt-8 border-t border-dashed border-gray-200">
                <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
                  <FileText className="h-6 w-6 mr-2 text-primary" />
                  Required Documents
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Valid Driving License</h3>
                      <p className="text-muted-foreground mt-1">
                        A valid commercial driving license appropriate for the vehicle type.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Aadhaar Card</h3>
                      <p className="text-muted-foreground mt-1">
                        Your Aadhaar card for identity and address verification.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Vehicle Registration & Insurance</h3>
                      <p className="text-muted-foreground mt-1">
                        Valid vehicle registration documents and comprehensive insurance policy.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Vehicle Fitness Certificate</h3>
                      <p className="text-muted-foreground mt-1">
                        Proof that your vehicle meets safety and environmental standards.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Proof of Address</h3>
                      <p className="text-muted-foreground mt-1">
                        Utility bill or other government-issued document showing your current address.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Photograph</h3>
                      <p className="text-muted-foreground mt-1">
                        A recent passport-sized photograph.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Vehicle Requirements */}
              <section className="mt-10 pt-8 border-t border-dashed border-gray-200">
                <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
                  <Car className="h-6 w-6 mr-2 text-primary" />
                  Vehicle Requirements
                </h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Vehicle must be in excellent working condition.</li>
                  <li>Should be clean and well-maintained, both interior and exterior.</li>
                  <li>Must meet local regulations for commercial passenger transport.</li>
                  <li>Proof of valid PUC (Pollution Under Control) certificate.</li>
                </ul>
              </section>

              {/* Application Process */}
              <section className="mt-10 pt-8 border-t border-dashed border-gray-200">
                <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 mr-2 text-primary" />
                  Application Process
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Sign up as a driver on the HappyTaxi app/website.</li>
                  <li>Fill in all required personal and vehicle details.</li>
                  <li>Upload clear scans or photos of all necessary documents.</li>
                  <li>Our team will review your application and documents.</li>
                  <li>Upon approval, you will be notified and can start accepting rides!</li>
                </ol>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}