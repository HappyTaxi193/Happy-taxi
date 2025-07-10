"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, User, Car, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { authenticateUser, createUser, ADMIN_CREDENTIALS, TEST_CREDENTIALS, TEST_DRIVER_CREDENTIALS } from "@/lib/auth"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState<"user" | "driver">("user")
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [driverData, setDriverData] = useState({
    primaryPhone: "",
    secondaryPhone: "",
    address: "",
    aadhaarNumber: "",
    vehicleNumber: "",
    carModel: "",
    carMake: "",
    photograph: null as File | null,
    drivingLicense: null as File | null,
  })

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const roleParam = searchParams.get("role")
    if (roleParam === "driver") {
      setRole("driver")
    }
  }, [searchParams])

  const clearMessages = () => {
    setError("")
    setSuccess("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()

    try {
      const result = await authenticateUser(phone, password)

      if (result.success && result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
        setSuccess("Login successful! Redirecting...")

        setTimeout(() => {
          if (result.user.role === "admin") {
            router.push("/admin-dashboard")
          } else if (result.user.role === "driver") {
            router.push("/driver-dashboard")
          } else {
            router.push("/user-dashboard")
          }
        }, 1000)
      } else {
        setError(result.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearMessages()

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      const userPhone = role === "driver" ? driverData.primaryPhone : phone
      const result = await createUser(userPhone, password, role)

      if (!result.success) {
        // Check if the error is about duplicate phone number
        if (result.error && result.error.includes("phone number already exists")) {
          setError("This phone number is already registered. Please use a different number or try logging in.")
          setLoading(false)
          return
        }
        throw new Error(result.error)
      }

      if (role === "driver" && result.user) {
        const { error: driverError } = await supabase.from("drivers").insert([
          {
            user_id: result.user.id,
            primary_phone: driverData.primaryPhone,
            secondary_phone: driverData.secondaryPhone || null,
            address: driverData.address,
            aadhaar_number: driverData.aadhaarNumber,
            vehicle_number: driverData.vehicleNumber,
            car_model: driverData.carModel,
            car_make: driverData.carMake,
            driving_license_url: "placeholder-license-url",
            photograph_url: "placeholder-photo-url",
          },
        ])

        if (driverError) throw driverError

        setSuccess("Driver registration successful! Please wait for admin approval.")
        setTimeout(() => router.push("/"), 2000)
      } else {
        localStorage.setItem("user", JSON.stringify(result.user))
        setSuccess("Account created successfully! Redirecting...")
        setTimeout(() => router.push("/user-dashboard"), 1000)
      }
    } catch (error) {
      console.error("Signup error:", error)
      
      // Handle specific error messages
      const errorMessage = error instanceof Error ? error.message : "Signup failed. Please try again."
      
      if (errorMessage.includes("phone number already exists") || 
          errorMessage.includes("already registered") || 
          errorMessage.includes("duplicate")) {
        setError("This phone number is already taken. Please use a different number or try logging in.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (credentials: { phone: string; password: string }, type: string) => {
    setLoading(true)
    clearMessages()

    try {
      const result = await authenticateUser(credentials.phone, credentials.password)
      if (result.success && result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
        setSuccess(`${type} login successful! Redirecting...`)

        setTimeout(() => {
          if (result.user.role === "admin") {
            router.push("/admin-dashboard")
          } else if (result.user.role === "driver") {
            router.push("/driver-dashboard")
          } else {
            router.push("/user-dashboard")
          }
        }, 1000)
      } else {
        setError(`${type} login failed: ${result.error}`)
      }
    } catch (error) {
      console.error(`${type} login error:`, error)
      setError(`${type} login failed`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-md mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to HappyTaxi</CardTitle>
              <CardDescription>{isLogin ? "Sign in to your account" : "Create your account"}</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => setIsLogin(value === "login")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>

                    {/* Quick Login Options */}
                    
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <div className="space-y-4">
                    <div>
                      <Label>I want to join as:</Label>
                      <RadioGroup
                        value={role}
                        onValueChange={(value: "user" | "driver") => setRole(value)}
                        className="flex space-x-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="user" id="user" />
                          <Label htmlFor="user" className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Passenger</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="driver" id="driver" />
                          <Label htmlFor="driver" className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>Driver</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {role === "user" ? (
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                          <Label htmlFor="userPhone">Phone Number</Label>
                          <Input
                            id="userPhone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="userPassword">Password</Label>
                          <Input
                            id="userPassword"
                            type="password"
                            placeholder="Create a password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                        </div>
                        <div>
                          <Label htmlFor="userConfirmPassword">Confirm Password</Label>
                          <Input
                            id="userConfirmPassword"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Creating Account..." : "Create Account"}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="primaryPhone">Primary Phone</Label>
                            <Input
                              id="primaryPhone"
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={driverData.primaryPhone}
                              onChange={(e) => setDriverData({ ...driverData, primaryPhone: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                            <Input
                              id="secondaryPhone"
                              type="tel"
                              placeholder="+91 98765 43211"
                              value={driverData.secondaryPhone}
                              onChange={(e) => setDriverData({ ...driverData, secondaryPhone: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            placeholder="Enter your full address"
                            value={driverData.address}
                            onChange={(e) => setDriverData({ ...driverData, address: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="aadhaar">Aadhaar Number</Label>
                          <Input
                            id="aadhaar"
                            type="text"
                            placeholder="1234 5678 9012"
                            value={driverData.aadhaarNumber}
                            onChange={(e) => setDriverData({ ...driverData, aadhaarNumber: e.target.value })}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                            <Input
                              id="vehicleNumber"
                              type="text"
                              placeholder="MH 01 AB 1234"
                              value={driverData.vehicleNumber}
                              onChange={(e) => setDriverData({ ...driverData, vehicleNumber: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="carModel">Car Model</Label>
                            <Input
                              id="carModel"
                              type="text"
                              placeholder="Swift Dzire"
                              value={driverData.carModel}
                              onChange={(e) => setDriverData({ ...driverData, carModel: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="carMake">Car Make</Label>
                          <Input
                            id="carMake"
                            type="text"
                            placeholder="Maruti Suzuki"
                            value={driverData.carMake}
                            onChange={(e) => setDriverData({ ...driverData, carMake: e.target.value })}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="driverPassword">Password</Label>
                            <Input
                              id="driverPassword"
                              type="password"
                              placeholder="Create password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              minLength={6}
                            />
                          </div>
                          <div>
                            <Label htmlFor="driverConfirmPassword">Confirm Password</Label>
                            <Input
                              id="driverConfirmPassword"
                              type="password"
                              placeholder="Confirm password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Upload Documents</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="photograph" className="cursor-pointer">
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Upload Photo</span>
                                </div>
                              </Label>
                              <Input
                                id="photograph"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  setDriverData({ ...driverData, photograph: e.target.files?.[0] || null })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="license" className="cursor-pointer">
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                                  <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Driving License</span>
                                </div>
                              </Label>
                              <Input
                                id="license"
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) =>
                                  setDriverData({ ...driverData, drivingLicense: e.target.files?.[0] || null })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Registering..." : "Register as Driver"}
                        </Button>
                      </form>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
