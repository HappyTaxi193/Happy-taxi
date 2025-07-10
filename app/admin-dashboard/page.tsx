"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Car, CheckCircle, XCircle, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Driver {
  id: string
  primary_phone: string
  secondary_phone: string | null
  address: string
  aadhaar_number: string
  vehicle_number: string
  car_model: string
  car_make: string
  is_verified: boolean
  created_at: string
  users: {
    phone: string
  }
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    pendingDrivers: 0,
    verifiedDrivers: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/auth")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.push("/auth")
      return
    }

    setUser(parsedUser)
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      // Fetch drivers with user info
      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select(`
          *,
          users (phone)
        `)
        .order("created_at", { ascending: false })

      if (driversError) throw driversError

      // Fetch stats
      const { data: usersData } = await supabase.from("users").select("role")

      const totalUsers = usersData?.filter((u) => u.role === "user").length || 0
      const totalDrivers = driversData?.length || 0
      const pendingDrivers = driversData?.filter((d) => !d.is_verified).length || 0
      const verifiedDrivers = driversData?.filter((d) => d.is_verified).length || 0

      setDrivers(driversData || [])
      setStats({
        totalUsers,
        totalDrivers,
        pendingDrivers,
        verifiedDrivers,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDriver = async (driverId: string, verify: boolean) => {
    try {
      const { error } = await supabase.from("drivers").update({ is_verified: verify }).eq("id", driverId)

      if (error) throw error

      // Refresh data
      fetchData()
      alert(`Driver ${verify ? "verified" : "rejected"} successfully!`)
    } catch (error) {
      console.error("Error updating driver:", error)
      alert("Failed to update driver status")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage drivers and platform operations</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDrivers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingDrivers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Drivers</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.verifiedDrivers}</div>
              </CardContent>
            </Card>
          </div>

          {/* Driver Management */}
          <Card>
            <CardHeader>
              <CardTitle>Driver Management</CardTitle>
              <CardDescription>Review and approve driver registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList>
                  <TabsTrigger value="pending">Pending Approval ({stats.pendingDrivers})</TabsTrigger>
                  <TabsTrigger value="verified">Verified Drivers ({stats.verifiedDrivers})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">Loading drivers...</div>
                  ) : drivers.filter((d) => !d.is_verified).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No pending driver approvals</div>
                  ) : (
                    drivers
                      .filter((d) => !d.is_verified)
                      .map((driver) => (
                        <div key={driver.id} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">Driver Application</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p>
                                    <strong>Primary Phone:</strong> {driver.primary_phone}
                                  </p>
                                  {driver.secondary_phone && (
                                    <p>
                                      <strong>Secondary Phone:</strong> {driver.secondary_phone}
                                    </p>
                                  )}
                                  <p>
                                    <strong>Aadhaar:</strong> {driver.aadhaar_number}
                                  </p>
                                </div>
                                <div>
                                  <p>
                                    <strong>Vehicle:</strong> {driver.car_make} {driver.car_model}
                                  </p>
                                  <p>
                                    <strong>Vehicle Number:</strong> {driver.vehicle_number}
                                  </p>
                                  <p>
                                    <strong>Applied:</strong> {new Date(driver.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <p>
                                  <strong>Address:</strong> {driver.address}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">Pending</Badge>
                          </div>

                          <div className="flex space-x-3">
                            <Button
                              onClick={() => handleVerifyDriver(driver.id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button variant="destructive" onClick={() => handleVerifyDriver(driver.id, false)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </TabsContent>

                <TabsContent value="verified" className="space-y-4">
                  {drivers.filter((d) => d.is_verified).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No verified drivers yet</div>
                  ) : (
                    drivers
                      .filter((d) => d.is_verified)
                      .map((driver) => (
                        <div key={driver.id} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p>
                                    <strong>Phone:</strong> {driver.primary_phone}
                                  </p>
                                  <p>
                                    <strong>Vehicle:</strong> {driver.car_make} {driver.car_model}
                                  </p>
                                </div>
                                <div>
                                  <p>
                                    <strong>Vehicle Number:</strong> {driver.vehicle_number}
                                  </p>
                                  <p>
                                    <strong>Verified:</strong> {new Date(driver.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-green-600">Verified</Badge>
                          </div>
                        </div>
                      ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
