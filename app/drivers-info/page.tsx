// app/drivers-info/page.tsx
"use client"
import { supabase } from "@/lib/supabase"
import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircle, XCircle, Ban, Eye, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"

const PAGE_LIMIT = 5;

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
  rating?: number | null
  total_reviews?: number | null
  is_banned?: boolean
  total_earnings?: number
  completed_rides?: number
  name?: string
  users: { phone: string; role: string }
}

interface PaginationState {
  pending: { drivers: Driver[]; page: number; hasMore: boolean; loading: boolean };
  verified: { drivers: Driver[]; page: number; hasMore: boolean; loading: boolean };
  banned: { drivers: Driver[]; page: number; hasMore: boolean; loading: boolean };
}

export default function DriversInfoPage() {
  const router = useRouter();
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pending: { drivers: [], page: 0, hasMore: true, loading: false },
    verified: { drivers: [], page: 0, hasMore: true, loading: false },
    banned: { drivers: [], page: 0, hasMore: true, loading: false }
  });
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'banned'>('pending');

  const fetchDrivers = useCallback(async (tab: 'pending' | 'verified' | 'banned', page: number) => {
    const currentState = paginationState[tab];
    if (currentState.loading || !currentState.hasMore) return;

    setPaginationState(prev => ({
      ...prev,
      [tab]: { ...prev[tab], loading: true }
    }));
    setError(null);

    try {
      const start = page * PAGE_LIMIT;
      
      // Build query based on tab
      let query = supabase
        .from("drivers")
        .select(`*, users (phone, role)`)
        .order("created_at", { ascending: false })
        .range(start, start + PAGE_LIMIT - 1);

      // Add filters based on tab
      switch (tab) {
        case 'pending':
          query = query.eq('is_verified', false);
          break;
        case 'verified':
          query = query.eq('is_verified', true).eq('is_banned', false);
          break;
        case 'banned':
          query = query.eq('is_banned', true);
          break;
      }

      const { data: driversData, error: driversError } = await query;

      if (driversError) throw driversError;

      const newDrivers = (driversData as Driver[]) || [];
      const hasMore = newDrivers.length === PAGE_LIMIT;
      
      // Fetch ratings for each driver
      const driversWithRatings = await Promise.all(
        newDrivers.map(async (driver) => {
          try {
            // Get all reviews for this driver through the bookings and rides tables
            const { data: reviewsData, error: reviewsError } = await supabase
              .from("reviews")
              .select(`
                rating,
                bookings!inner(
                  ride_id,
                  rides!inner(
                    driver_id
                  )
                )
              `)
              .eq("bookings.rides.driver_id", driver.id);

            if (reviewsError) {
              console.error("Error fetching reviews for driver:", driver.id, reviewsError);
              return { ...driver, rating: null, total_reviews: 0 };
            }

            const ratings = reviewsData?.map(review => review.rating).filter(rating => rating !== null) || [];
            const totalReviews = ratings.length;
            const averageRating = totalReviews > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / totalReviews : null;

            return {
              ...driver,
              rating: averageRating,
              total_reviews: totalReviews
            };
          } catch (error) {
            console.error("Error calculating rating for driver:", driver.id, error);
            return { ...driver, rating: null, total_reviews: 0 };
          }
        })
      );
      
      setPaginationState(prev => ({
        ...prev,
        [tab]: {
          drivers: page === 0 ? driversWithRatings : [...prev[tab].drivers, ...driversWithRatings],
          page: page + 1,
          hasMore,
          loading: false
        }
      }));

    } catch (error) {
      console.error("Error fetching drivers:", error);
      setError("Failed to load drivers. Check your database connection.");
      setPaginationState(prev => ({
        ...prev,
        [tab]: { ...prev[tab], loading: false }
      }));
    }
  }, [paginationState]);

  // Initialize data for the active tab
  useEffect(() => {
    const currentState = paginationState[activeTab];
    if (currentState.drivers.length === 0 && !currentState.loading) {
      fetchDrivers(activeTab, 0);
    }
  }, [activeTab, fetchDrivers, paginationState]);

  const handleDriverAction = async (driverId: string, action: string) => {
    if (processingIds.has(driverId)) return;

    try {
      setProcessingIds(prev => new Set(prev).add(driverId));
      let success = false;

      switch (action) {
        case 'verify':
          const { error: verifyError } = await supabase.from("drivers").update({ is_verified: true }).eq("id", driverId);
          if (verifyError) throw verifyError;
          success = true;
          break;
        case 'ban':
          const { error: banError } = await supabase.from("drivers").update({ is_banned: true }).eq("id", driverId);
          if (banError) throw banError;
          success = true;
          break;
        case 'unban':
          const { error: unbanError } = await supabase.from("drivers").update({ is_banned: false }).eq("id", driverId);
          if (unbanError) throw unbanError;
          success = true;
          break;
        case 'reject':
          const { error: rejectError } = await supabase.from("drivers").delete().eq("id", driverId);
          if (rejectError) throw rejectError;
          success = true;
          break;
      }

      if (success) {
        // Reset all pagination states since driver status changed
        setPaginationState({
          pending: { drivers: [], page: 0, hasMore: true, loading: false },
          verified: { drivers: [], page: 0, hasMore: true, loading: false },
          banned: { drivers: [], page: 0, hasMore: true, loading: false }
        });
        
        // Refetch current tab data
        fetchDrivers(activeTab, 0);
        alert(`Driver ${action}ed successfully!`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to ${action} driver`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(driverId);
        return newSet;
      });
    }
  };

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
              <p><strong>Rating:</strong> {driver.rating ? driver.rating.toFixed(1) : 'N/A'}/5 ({driver.total_reviews || 0} reviews)</p>
            </div>
            <div>
              <p><strong>Earnings:</strong> ₹{driver.total_earnings?.toLocaleString() || 0}</p>
              <p><strong>Rides:</strong> {driver.completed_rides || 0}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!driver.is_verified && (
              <>
                <Button size="sm" onClick={() => handleDriverAction(driver.id, 'verify')} disabled={processingIds.has(driver.id)} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDriverAction(driver.id, 'reject')} disabled={processingIds.has(driver.id)}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </>
            )}
            {driver.is_verified && (
              <Button size="sm" variant={driver.is_banned ? "outline" : "destructive"} onClick={() => handleDriverAction(driver.id, driver.is_banned ? 'unban' : 'ban')} disabled={processingIds.has(driver.id)}>
                <Ban className="h-4 w-4 mr-1" /> {driver.is_banned ? 'Unban' : 'Ban'}
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> View Profile</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Driver Profile</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img src={driver.photograph_url} alt="Driver" className="w-20 h-20 rounded-full object-cover border" />
                    <div>
                      <h3 className="font-semibold text-lg">{driver.name ?? 'N/A'}</h3>
                      <p className="text-muted-foreground">{driver.car_make} {driver.car_model} ({driver.vehicle_number})</p>
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
                      <p><strong>Rating:</strong> {driver.rating ? driver.rating.toFixed(1) : 'N/A'}/5</p>
                      <p><strong>Total Reviews:</strong> {driver.total_reviews || 0}</p>
                      <p><strong>Total Earnings:</strong> ₹{driver.total_earnings?.toLocaleString() || 0}</p>
                      <p><strong>Completed Rides:</strong> {driver.completed_rides || 0}</p>
                      <p><strong>Joined:</strong> {new Date(driver.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold mb-2">Documents</h4>
                    {driver.driving_license_url ? (<div className="flex flex-col items-start space-y-2"><p><strong>Driving License:</strong></p><a href={driver.driving_license_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"><img src={driver.driving_license_url} alt="Driving License" className="max-w-full h-auto rounded-md border shadow-sm cursor-pointer" style={{ maxWidth: '300px' }}/>Click to view full size</a></div>) : (<p className="text-muted-foreground">Driving License not available.</p>)}
                    {driver.photograph_url && (<div className="flex flex-col items-start space-y-2 mt-4"><p><strong>Photograph:</strong></p><a href={driver.photograph_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"><img src={driver.photograph_url} alt="Driver Photograph" className="max-w-full h-auto rounded-md border shadow-sm cursor-pointer" style={{ maxWidth: '200px' }}/>Click to view full size</a></div>)}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = (tab: 'pending' | 'verified' | 'banned') => {
    const currentState = paginationState[tab];
    const { drivers, loading, hasMore, page } = currentState;

    if (loading && drivers.length === 0) {
      return <div className="text-center py-8">Loading drivers...</div>;
    }

    if (drivers.length === 0) {
      const emptyMessages = {
        pending: "No pending approvals",
        verified: "No verified drivers",
        banned: "No banned drivers"
      };
      return <div className="text-center py-8 text-muted-foreground">{emptyMessages[tab]}</div>;
    }

    return (
      <>
        <div className="space-y-4">
          {drivers.map(driver => (
            <DriverCard key={driver.id} driver={driver} />
          ))}
        </div>
        {hasMore && (
          <div className="flex justify-center mt-6">
            <Button 
              onClick={() => fetchDrivers(tab, page)} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </>
    );
  };

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
            <CardTitle>Driver Management</CardTitle>
            <CardDescription>Manage driver registrations and profiles</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending">
                    Pending ({paginationState.pending.drivers.length})
                  </TabsTrigger>
                  <TabsTrigger value="verified">
                    Verified ({paginationState.verified.drivers.length})
                  </TabsTrigger>
                  <TabsTrigger value="banned">
                    Banned ({paginationState.banned.drivers.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending" className="mt-6">
                  {renderTabContent('pending')}
                </TabsContent>
                
                <TabsContent value="verified" className="mt-6">
                  {renderTabContent('verified')}
                </TabsContent>
                
                <TabsContent value="banned" className="mt-6">
                  {renderTabContent('banned')}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}