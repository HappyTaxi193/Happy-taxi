"use client"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Car, CheckCircle, XCircle, Clock, Ban, Eye, TrendingUp, DollarSign, Star, AlertTriangle, BarChart3, PieChart } from "lucide-react"
import { Navbar } from "@/components/navbar"

interface Driver {
  id: string
  user_id: string
  photograph_url: string
  primary_phone: string
  secondary_phone: string | null
  address: string
  aadhaar_number: string
  driving_license_url: string
  vehicle_number: string
  car_model: string
  car_make: string
  is_verified: boolean
  created_at: string
  updated_at: string
  rating: number
  total_reviews: number
  is_banned?: boolean
  total_earnings?: number
  completed_rides?: number
  users: { phone: string; role: string }
}

interface User {
  id: string
  phone: string
  role: string
  created_at: string
  updated_at: string
  is_banned?: boolean
  total_bookings?: number
  total_spent?: number
  last_booking?: string
}

interface Booking {
  id: string
  user_id: string
  ride_id: string
  seats_booked: number
  total_price: number
  status: string
  created_at: string
  updated_at: string
}

interface Ride {
  id: string
  driver_id: string
  from_location: string
  to_location: string
  price: number
  total_seats: number
  available_seats: number
  departure_time: string
  status: string
  created_at: string
  updated_at: string
}

export default function EnhancedAdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rides, setRides] = useState<Ride[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    pendingDrivers: 0,
    verifiedDrivers: 0,
    bannedDrivers: 0,
    bannedUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    completedRides: 0,
    averageRating: 0
  })
  const [monthlyRevenue, setMonthlyRevenue] = useState<Record<string, number>>({}) // New state for monthly revenue
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // State to manage the active tab for the main content
  const [activeTab, setActiveTab] = useState("drivers");


  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      // router.push("/auth")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      // router.push("/auth")
      return
    }

    setUser(parsedUser)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch drivers with user info
      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select(`
          *,
          users (phone, role)
        `)
        .order("created_at", { ascending: false })

      if (driversError) throw driversError

      // Fetch users (customers)
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .eq("role", "user")
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      // Fetch bookings for analytics
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")

      if (bookingsError) throw bookingsError

      // Fetch rides for analytics
      const { data: ridesData, error: ridesError } = await supabase
        .from("rides")
        .select("*")

      if (ridesError) throw ridesError

      setDrivers(driversData || [])
      setUsers(usersData || [])
      setBookings(bookingsData || [])
      setRides(ridesData || [])

    } catch (error) {
      console.error("Error fetching data:", error)
      alert("Failed to load data. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    calculateStats()
  }, [drivers, users, bookings, rides])

  const calculateStats = () => {
    const totalUsers = users.filter(u => u.role === "user").length
    const totalDrivers = drivers.length
    const pendingDrivers = drivers.filter(d => !d.is_verified).length
    const verifiedDrivers = drivers.filter(d => d.is_verified).length
    const bannedDrivers = drivers.filter(d => d.is_banned).length
    const bannedUsers = users.filter(u => u.is_banned).length
    const totalBookings = bookings.length
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_price, 0)
    const completedRides = rides.filter(r => r.status === "completed").length
    const averageRating = drivers.length > 0 ? drivers.reduce((sum, d) => sum + (d.rating || 0), 0) / drivers.length : 0

    // Calculate monthly revenue
    const monthlyRev: Record<string, number> = {}
    bookings.forEach(booking => {
      const date = new Date(booking.created_at)
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      monthlyRev[yearMonth] = (monthlyRev[yearMonth] || 0) + booking.total_price
    })

    setStats({
      totalUsers,
      totalDrivers,
      pendingDrivers,
      verifiedDrivers,
      bannedDrivers,
      bannedUsers,
      totalBookings,
      totalRevenue,
      completedRides,
      averageRating
    })
    setMonthlyRevenue(monthlyRev) // Set the monthly revenue state
  }

  const handleDriverAction = async (driverId: string, action: string) => {
    if (processingIds.has(driverId)) return // Prevent double-clicking

    try {
      setProcessingIds(prev => new Set(prev).add(driverId))

      switch (action) {
        case 'verify':
          const { error: verifyError } = await supabase
            .from("drivers")
            .update({ is_verified: true })
            .eq("id", driverId)
          if (verifyError) throw verifyError
          break
        case 'ban':
          const { error: banError } = await supabase
            .from("drivers")
            .update({ is_banned: true })
            .eq("id", driverId)
          if (banError) throw banError
          break
        case 'unban':
          const { error: unbanError } = await supabase
            .from("drivers")
            .update({ is_banned: false })
            .eq("id", driverId)
          if (unbanError) throw unbanError
          break
        case 'reject':
          const { error: rejectError } = await supabase
            .from("drivers")
            .delete()
            .eq("id", driverId)
          if (rejectError) throw rejectError
          break
      }

      await fetchData() // Re-fetch data to update the UI
      alert(`Driver ${action}ed successfully!`)
    } catch (error) {
      console.error("Error:", error)
      alert(`Failed to ${action} driver`)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(driverId)
        return newSet
      })
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    if (processingIds.has(userId)) return // Prevent double-clicking

    try {
      setProcessingIds(prev => new Set(prev).add(userId))

      switch (action) {
        case 'ban':
          const { error: banError } = await supabase
            .from("users")
            .update({ is_banned: true })
            .eq("id", userId)
          if (banError) throw banError
          break
        case 'unban':
          const { error: unbanError } = await supabase
            .from("users")
            .update({ is_banned: false })
            .eq("id", userId)
          if (unbanError) throw unbanError
          break
      }

      await fetchData() // Re-fetch data to update the UI
      alert(`User ${action}ned successfully!`)
    } catch (error) {
      console.error("Error:", error)
      alert(`Failed to ${action} user`)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    // router.push("/") // You'll likely want to redirect to the login page
    alert("Logged out successfully!");
  }

  const StatCard = ({ title, value, icon: Icon, color = "text-foreground" }: {
    title: string
    value: string | number
    icon: any
    color?: string
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  )

  const DriverCard = ({ driver }: { driver: Driver }) => (
    <div className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0">
          <img
            src={driver.photograph_url}
            alt="Driver"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
            <div>
              <h3 className="font-semibold text-lg">{driver.car_make} {driver.car_model}</h3>
              <p className="text-sm text-muted-foreground">{driver.vehicle_number}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {driver.is_verified && <Badge className="bg-green-600">Verified</Badge>}
              {!driver.is_verified && <Badge variant="secondary">Pending</Badge>}
              {driver.is_banned && <Badge variant="destructive">Banned</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p><strong>Phone:</strong> {driver.primary_phone}</p>
              <p><strong>Rating:</strong> {driver.rating}/5 ({driver.total_reviews} reviews)</p>
            </div>
            <div>
              <p><strong>Earnings:</strong> ₹{driver.total_earnings?.toLocaleString() || 0}</p>
              <p><strong>Rides:</strong> {driver.completed_rides || 0}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!driver.is_verified && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleDriverAction(driver.id, 'verify')}
                  disabled={processingIds.has(driver.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDriverAction(driver.id, 'reject')}
                  disabled={processingIds.has(driver.id)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}

            {driver.is_verified && (
              <Button
                size="sm"
                variant={driver.is_banned ? "outline" : "destructive"}
                onClick={() => handleDriverAction(driver.id, driver.is_banned ? 'unban' : 'ban')}
                disabled={processingIds.has(driver.id)}
              >
                <Ban className="h-4 w-4 mr-1" />
                {driver.is_banned ? 'Unban' : 'Ban'}
              </Button>
            )}

            <Dialog>
              {/* CORRECTED: Move onClick to DialogTrigger */}
              <DialogTrigger asChild onClick={() => setSelectedDriver(driver)}>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  View Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Driver Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={driver.photograph_url}
                      alt="Driver"
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{driver.car_make} {driver.car_model}</h3>
                      <p className="text-muted-foreground">{driver.vehicle_number}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Contact Information</h4>
                      <p><strong>Primary Phone:</strong> {driver.primary_phone}</p>
                      {driver.secondary_phone && <p><strong>Secondary Phone:</strong> {driver.secondary_phone}</p>}
                      <p><strong>Address:</strong> {driver.address}</p>
                      <p><strong>Aadhaar:</strong> {driver.aadhaar_number}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Performance Stats</h4>
                      <p><strong>Rating:</strong> {driver.rating}/5</p>
                      <p><strong>Total Reviews:</strong> {driver.total_reviews}</p>
                      <p><strong>Total Earnings:</strong> ₹{driver.total_earnings?.toLocaleString() || 0}</p>
                      <p><strong>Completed Rides:</strong> {driver.completed_rides || 0}</p>
                      <p><strong>Joined:</strong> {new Date(driver.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* New Section for Documents */}
                  <div className="space-y-2">
                    <h4 className="font-semibold mb-2">Documents</h4>
                    {driver.driving_license_url ? (
                      <div className="flex flex-col items-start space-y-2">
                        <p><strong>Driving License:</strong></p>
                        <a href={driver.driving_license_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          <img
                            src={driver.driving_license_url}
                            alt="Driving License"
                            className="max-w-full h-auto rounded-md border shadow-sm cursor-pointer"
                            style={{ maxWidth: '300px' }} // Adjust size as needed
                          />
                          Click to view full size
                        </a>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Driving License not available.</p>
                    )}
                    {/* You can add Aadhaar card, photograph etc. here similarly */}
                    {driver.photograph_url && (
                        <div className="flex flex-col items-start space-y-2 mt-4">
                            <p><strong>Photograph:</strong></p>
                            <a href={driver.photograph_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                <img
                                    src={driver.photograph_url}
                                    alt="Driver Photograph"
                                    className="max-w-full h-auto rounded-md border shadow-sm cursor-pointer"
                                    style={{ maxWidth: '200px' }} // Adjust size as needed
                                />
                                Click to view full size
                            </a>
                        </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )

  const UserCard = ({ user }: { user: User }) => (
    <div className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
            <div>
              <h3 className="font-semibold text-lg">{user.phone}</h3>
              <p className="text-sm text-muted-foreground">Customer</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.is_banned && <Badge variant="destructive">Banned</Badge>}
              {!user.is_banned && <Badge variant="secondary">Active</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p><strong>Total Bookings:</strong> {user.total_bookings || 0}</p>
              <p><strong>Total Spent:</strong> ₹{user.total_spent?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              {user.last_booking && <p><strong>Last Booking:</strong> {new Date(user.last_booking).toLocaleDateString()}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={user.is_banned ? "outline" : "destructive"}
              onClick={() => handleUserAction(user.id, user.is_banned ? 'unban' : 'ban')}
              disabled={processingIds.has(user.id)}
            >
              <Ban className="h-4 w-4 mr-1" />
              {user.is_banned ? 'Unban' : 'Ban'}
            </Button>

            <Dialog>
              {/* CORRECTED: Move onClick to DialogTrigger */}
              <DialogTrigger asChild onClick={() => setSelectedUser(user)}>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  View Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>User Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{user.phone}</h3>
                    <p className="text-muted-foreground">Customer Account</p>
                  </div>

                  <div className="space-y-2">
                    <p><strong>Account Status:</strong> {user.is_banned ? 'Banned' : 'Active'}</p>
                    <p><strong>Total Bookings:</strong> {user.total_bookings || 0}</p>
                    <p><strong>Total Spent:</strong> ₹{user.total_spent?.toLocaleString() || 0}</p>
                    <p><strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                    {user.last_booking && <p><strong>Last Booking:</strong> {new Date(user.last_booking).toLocaleDateString()}</p>}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Use the flexible Navbar component */}
      <Navbar
        title="Admin Dashboard"
        logoSrc="/admin-logo.png" // You might want a different logo for admin, or remove it
        onLogout={handleLogout}
        showGetStarted={false} // Hide "Get Started" button for admin
        links={[
          // These links will correspond to the tabs below
          { href: "#", label: "Drivers", onClick: () => setActiveTab("drivers") },
          { href: "#", label: "Customers", onClick: () => setActiveTab("users") },
          { href: "#", label: "Analytics", onClick: () => setActiveTab("analytics") },
        ]}
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 mt-16"> {/* Add top margin to account for fixed navbar height */}
        {/* Dashboard Description */}
        <p className="text-muted-foreground mb-8">Analysis of the platform</p>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
          <StatCard title="Total Drivers" value={stats.totalDrivers} icon={Car} />
          <StatCard title="Pending Approval" value={stats.pendingDrivers} icon={Clock} color="text-orange-600" />
          <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-600" />
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Completed Rides" value={stats.completedRides} icon={CheckCircle} color="text-green-600" />
          <StatCard title="Average Rating" value={stats.averageRating.toFixed(1)} icon={Star} color="text-yellow-600" />
          <StatCard title="Banned Drivers" value={stats.bannedDrivers} icon={Ban} color="text-red-600" />
          <StatCard title="Banned Users" value={stats.bannedUsers} icon={AlertTriangle} color="text-red-600" />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="drivers" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="drivers">Drivers ({stats.totalDrivers})</TabsTrigger>
            <TabsTrigger value="users">Customers ({stats.totalUsers})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Drivers Tab */}
          <TabsContent value="drivers">
            <Card>
              <CardHeader>
                <CardTitle>Driver Management</CardTitle>
                <CardDescription>Manage driver registrations and profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">Pending ({stats.pendingDrivers})</TabsTrigger>
                    <TabsTrigger value="verified">Verified ({stats.verifiedDrivers})</TabsTrigger>
                    <TabsTrigger value="banned">Banned ({stats.bannedDrivers})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending" className="space-y-4 mt-6">
                    {loading ? (
                      <div className="text-center py-8">Loading drivers...</div>
                    ) : drivers.filter(d => !d.is_verified).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No pending approvals</div>
                    ) : (
                      drivers.filter(d => !d.is_verified).map(driver => (
                        <DriverCard key={driver.id} driver={driver} />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="verified" className="space-y-4 mt-6">
                    {loading ? (
                      <div className="text-center py-8">Loading drivers...</div>
                    ) : drivers.filter(d => d.is_verified && !d.is_banned).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No verified drivers</div>
                    ) : (
                      drivers.filter(d => d.is_verified && !d.is_banned).map(driver => (
                        <DriverCard key={driver.id} driver={driver} />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="banned" className="space-y-4 mt-6">
                    {loading ? (
                      <div className="text-center py-8">Loading drivers...</div>
                    ) : drivers.filter(d => d.is_banned).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No banned drivers</div>
                    ) : (
                      drivers.filter(d => d.is_banned).map(driver => (
                        <DriverCard key={driver.id} driver={driver} />
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>Manage customer accounts and profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="active">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active Users ({stats.totalUsers - stats.bannedUsers})</TabsTrigger>
                    <TabsTrigger value="banned">Banned Users ({stats.bannedUsers})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="active" className="space-y-4 mt-6">
                    {loading ? (
                      <div className="text-center py-8">Loading users...</div>
                    ) : users.filter(u => !u.is_banned).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No active users</div>
                    ) : (
                      users.filter(u => !u.is_banned).map(user => (
                        <UserCard key={user.id} user={user} />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="banned" className="space-y-4 mt-6">
                    {loading ? (
                      <div className="text-center py-8">Loading users...</div>
                    ) : users.filter(u => u.is_banned).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No banned users</div>
                    ) : (
                      users.filter(u => u.is_banned).map(user => (
                        <UserCard key={user.id} user={user} />
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Platform Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalBookings}</div>
                      <div className="text-sm text-blue-600">Total Bookings</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</div>
                      <div className="text-sm text-green-600">Total Revenue</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.completedRides}</div>
                      <div className="text-sm text-purple-600">Completed Rides</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
                      <div className="text-sm text-yellow-600">Avg Rating</div>
                    </div>
                  </div>

                  {/* Monthly Revenue Section */}
                  <div className="space-y-2 mt-6">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Monthly Revenue
                    </h4>
                    {Object.keys(monthlyRevenue).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(monthlyRevenue)
                          .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
                          .map(([month, revenue]) => (
                            <div key={month} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                              <span className="text-sm text-muted-foreground">{month}</span>
                              <span className="font-medium">₹{revenue.toLocaleString()}</span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No monthly revenue data available.</p>
                    )}
                  </div>

                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Users</span>
                      <span className="font-semibold">{stats.totalUsers - stats.bannedUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Banned Users</span>
                      <span className="font-semibold text-red-600">{stats.bannedUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Verified Drivers</span>
                      <span className="font-semibold text-green-600">{stats.verifiedDrivers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Drivers</span>
                      <span className="font-semibold text-orange-600">{stats.pendingDrivers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Banned Drivers</span>
                      <span className="font-semibold text-red-600">{stats.bannedDrivers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}