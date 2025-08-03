// app/admin-dashboard/page.tsx
"use client"
import { supabase } from "@/lib/supabase"
import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Car, CheckCircle, Clock, Ban, XCircle, DollarSign } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"

interface Driver {
  id: string
  is_verified: boolean
  is_banned?: boolean
}

interface User {
  id: string
  role: string
  is_banned?: boolean
}

interface Ride {
  id: string
  is_ride_completed: boolean | null;
  price: number;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [rides, setRides] = useState<Ride[]>([])
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.push('/')
      return
    }

    setUser(parsedUser)
    fetchStatsData()
  }, [router])

  const fetchStatsData = async () => {
    try {
      setLoading(true)
      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select(`id, is_verified, is_banned`)
      if (driversError) throw driversError

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(`id, role, is_banned`)
        .eq("role", "user")
      if (usersError) throw usersError

      const { data: ridesData, error: ridesError } = await supabase
        .from("rides")
        .select(`id, is_ride_completed, price, created_at`)
      if (ridesError) throw ridesError

      setDrivers(driversData || [])
      setUsers(usersData || [])
      setRides(ridesData || [])

      // Calculate Revenue
      const totalRev = ridesData?.reduce((acc, ride) => acc + (ride.price || 0), 0) || 0;
      setTotalRevenue(totalRev);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyRev = ridesData
        ?.filter(ride => {
          const rideDate = new Date(ride.created_at);
          return rideDate.getMonth() === currentMonth && rideDate.getFullYear() === currentYear;
        })
        .reduce((acc, ride) => acc + (ride.price || 0), 0) || 0;
      setMonthlyRevenue(monthlyRev);

    } catch (error) {
      console.error("Error fetching stats data:", error)
      alert("Failed to load dashboard stats.")
    } finally {
      setLoading(false)
    }
  }

  const overallStats = useMemo(() => {
    const totalUsers = users.length
    const activeUsers = users.filter(u => !u.is_banned).length
    const bannedUsers = users.filter(u => u.is_banned).length
    const totalDrivers = drivers.length
    const verifiedDrivers = drivers.filter(d => d.is_verified).length
    const pendingDrivers = drivers.filter(d => !d.is_verified).length
    const bannedDrivers = drivers.filter(d => d.is_banned).length
    const totalRides = rides.length
    const completedRides = rides.filter(r => r.is_ride_completed === true).length
    const cancelledRides = rides.filter(r => r.is_ride_completed === false).length
    return {
      totalUsers,
      activeUsers,
      bannedUsers,
      totalDrivers,
      verifiedDrivers,
      pendingDrivers,
      bannedDrivers,
      totalRides,
      completedRides,
      cancelledRides,
    }
  }, [drivers, users, rides])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push('/login')
    alert("Logged out successfully!")
  }

  const StatCard = ({ title, value, icon: Icon, color = "text-foreground" }: {
    title: string
    value: string | number
    icon: any
    color?: string
  }) => {
    return (
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
  }

  const NavButton = ({ href, label }: { href: string; label: string }) => {
    return (
      <Button variant="outline" onClick={() => router.push(href)} className="w-full sm:w-auto">
        {label}
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        title="Admin Dashboard"
        logoSrc="/admin-logo.png"
        onLogout={handleLogout}
        showGetStarted={false}
        links={[
          { href: "/admin-dashboard", label: "Dashboard" },
          { href: "/drivers-info", label: "Drivers" },
          { href: "/users-info", label: "Customers" },
          { href: "/rides-info", label: "Rides" },
        ]}
      />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 mt-16">
        <h2 className="text-2xl font-semibold mb-4">Website Analysis</h2>
        <p className="text-muted-foreground mb-8">Comprehensive overview of platform data.</p>

        {loading ? (
          <div className="text-center py-16">Loading dashboard data...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Revenue Stats */}
              <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-600" />
              <StatCard title="Monthly Revenue" value={`₹${monthlyRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-600" />
              
              {/* Other Stats */}
              <StatCard title="Total Users" value={overallStats.totalUsers} icon={Users} />
              <StatCard title="Active Users" value={overallStats.activeUsers} icon={Users} color="text-green-600" />
              <StatCard title="Banned Users" value={overallStats.bannedUsers} icon={Users} color="text-red-600" />
              <StatCard title="Total Drivers" value={overallStats.totalDrivers} icon={Car} />
              <StatCard title="Verified Drivers" value={overallStats.verifiedDrivers} icon={CheckCircle} color="text-green-600" />
              <StatCard title="Pending Drivers" value={overallStats.pendingDrivers} icon={Clock} color="text-orange-600" />
              <StatCard title="Banned Drivers" value={overallStats.bannedDrivers} icon={Ban} color="text-red-600" />
              <StatCard title="Total Rides" value={overallStats.totalRides} icon={Car} />
              <StatCard title="Completed Rides" value={overallStats.completedRides} icon={CheckCircle} color="text-green-600" />
              <StatCard title="Cancelled Rides" value={overallStats.cancelledRides} icon={XCircle} color="text-red-600" />
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              <NavButton href="/drivers-info" label="Manage Drivers" />
              <NavButton href="/users-info" label="Manage Customers" />
              <NavButton href="/rides-info" label="Manage Rides" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}