// app/rides-info/page.tsx
"use client"
import { supabase } from "@/lib/supabase"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Route, Calendar, DollarSign, Users, Info, CheckCircle, Tag, Clock, Eye } from "lucide-react"
import { Navbar } from "@/components/navbar"

const PAGE_LIMIT = 20;

interface Driver {
  id: string
  car_model: string
  car_make: string
  users: { phone: string; role: string }
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
  is_ride_completed: boolean | null;
  fee_status: string;
}

export default function RidesInfoPage() {
  const router = useRouter()
  const [rides, setRides] = useState<Ride[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRides = useCallback(async (page: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);
    try {
        const start = page * PAGE_LIMIT;
        const { data, error } = await supabase
            .from("rides")
            .select("*")
            .order("created_at", { ascending: false })
            .range(start, start + PAGE_LIMIT - 1);
        
        if (error) throw error;
        if (!data || data.length < PAGE_LIMIT) setHasMore(false);

        const newRides = (data as Ride[]) || [];
        setRides(prev => page === 0 ? newRides : [...prev, ...newRides]);
        setPage(page + 1);
    } catch (error) {
        console.error("Error fetching rides:", error);
        setError("Failed to load rides. Check your database connection.");
    } finally {
        setLoading(false);
    }
  }, [loading, hasMore]);

  const fetchDrivers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select(`id, car_make, car_model, users (phone)`);
      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error("Error fetching drivers for rides:", error);
    }
  }, []);

  useEffect(() => {
    fetchRides(0);
    fetchDrivers();
  }, [fetchRides, fetchDrivers]);

  const RideCard = ({ ride }: { ride: Ride }) => {
    const driver = drivers.find(d => d.id === ride.driver_id);
    const driverPhone = driver ? driver.users.phone : 'N/A';
    const driverName = driver ? `${driver.car_make} ${driver.car_model}` : 'N/A';
    return (
      <div className="border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
              <div><h3 className="font-semibold text-lg">Ride ID: {ride.id.substring(0, 8)}...</h3><p className="text-sm text-muted-foreground">Driver: {driverName} ({driverPhone})</p></div>
              <div className="flex flex-wrap gap-2">
                {ride.is_ride_completed === true && <Badge className="bg-green-600">Completed</Badge>}
                {ride.is_ride_completed === false && <Badge variant="destructive">Cancelled</Badge>}
                {ride.is_ride_completed === null && <Badge variant="secondary">Ongoing/Scheduled</Badge>}
                <Badge variant="outline">Status: {ride.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
              <div><p><strong>From:</strong> {ride.from_location}</p><p><strong>To:</strong> {ride.to_location}</p><p><strong>Departure:</strong> {new Date(ride.departure_time).toLocaleString()}</p></div>
              <div><p><strong>Price:</strong> ₹{ride.price.toLocaleString()}</p><p><strong>Seats:</strong> {ride.available_seats}/{ride.total_seats} available</p><p><strong>Fee Status:</strong> {ride.fee_status}</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild><Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> View Details</Button></DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Ride Details</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><h3 className="font-semibold text-lg">Ride ID: {ride.id}</h3><p className="text-muted-foreground">Driver: {driverName} ({driverPhone})</p></div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2"><Route className="h-4 w-4" /><strong>Route:</strong> {ride.from_location} to {ride.to_location}</p>
                      <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /><strong>Departure:</strong> {new Date(ride.departure_time).toLocaleString()}</p>
                      <p className="flex items-center gap-2"><DollarSign className="h-4 w-4" /><strong>Price per seat:</strong> ₹{ride.price.toLocaleString()}</p>
                      <p className="flex items-center gap-2"><Users className="h-4 w-4" /><strong>Seats:</strong> {ride.available_seats} of {ride.total_seats} available</p>
                      <p className="flex items-center gap-2"><Info className="h-4 w-4" /><strong>Status:</strong> {ride.status}</p>
                      <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /><strong>Ride Completed:</strong> {ride.is_ride_completed === true ? 'Yes' : ride.is_ride_completed === false ? 'No' : 'N/A'}</p>
                      <p className="flex items-center gap-2"><Tag className="h-4 w-4" /><strong>Fee Status:</strong> {ride.fee_status}</p>
                      <p className="flex items-center gap-2"><Clock className="h-4 w-4" /><strong>Created At:</strong> {new Date(ride.created_at).toLocaleString()}</p>
                      <p className="flex items-center gap-2"><Clock className="h-4 w-4" /><strong>Last Updated:</strong> {new Date(ride.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        title="Admin Dashboard"
        logoSrc="/admin-logo.png"
        onLogout={() => router.push('/login')}
        showGetStarted={false}
        links={[
          { href: "/admin-dashboard", label: "Dashboard" },
          { href: "/drivers-info", label: "Drivers" },
          { href: "/users-info", label: "Customers" },
          { href: "/rides-info", label: "Rides" },
        ]}
      />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 mt-16">
        <Card>
          <CardHeader>
            <CardTitle>Ride Management</CardTitle>
            <CardDescription>View and manage all ride information</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              loading && page === 0 ? (
                <div className="text-center py-8">Loading rides...</div>
              ) : rides.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No rides available.</div>
              ) : (
                <>
                  <div className="space-y-4 mt-6">
                    {rides.map(ride => (<RideCard key={ride.id} ride={ride} />))}
                  </div>
                  {hasMore && (<div className="flex justify-center mt-4"><Button onClick={() => fetchRides(page)} disabled={loading}>{loading ? 'Loading...' : 'Load More'}</Button></div>)}
                </>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}