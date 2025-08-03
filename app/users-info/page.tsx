// app/users-info/page.tsx
"use client"
import { supabase } from "@/lib/supabase"
import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Ban, Eye } from "lucide-react"
import { Navbar } from "@/components/navbar"

const PAGE_LIMIT = 20;

interface User {
  id: string
  phone: string
  role: string
  created_at: string
  is_banned?: boolean
  total_bookings?: number
  total_spent?: number
  last_booking?: string
}

export default function UsersInfoPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  const fetchUsers = useCallback(async (page: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);
    try {
        const start = page * PAGE_LIMIT;
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("role", "user")
            .order("created_at", { ascending: false })
            .range(start, start + PAGE_LIMIT - 1);

        if (error) throw error;
        if (!data || data.length < PAGE_LIMIT) setHasMore(false);

        const newUsers = (data as User[]) || [];
        setUsers(prev => page === 0 ? newUsers : [...prev, ...newUsers]);
        setPage(page + 1);
    } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Check your database connection.");
    } finally {
        setLoading(false);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    fetchUsers(0);
  }, [fetchUsers]);

  const handleUserAction = async (userId: string, action: string) => {
    if (processingIds.has(userId)) return

    try {
      setProcessingIds(prev => new Set(prev).add(userId))
      let success = false

      switch (action) {
        case 'ban':
          const { error: banError } = await supabase
            .from("users")
            .update({ is_banned: true })
            .eq("id", userId)
          if (banError) throw banError
          success = true
          break
        case 'unban':
          const { error: unbanError } = await supabase
            .from("users")
            .update({ is_banned: false })
            .eq("id", userId)
          if (unbanError) throw unbanError
          success = true
          break
      }

      if (success) {
        setPage(0);
        setHasMore(true);
        setUsers([]);
        fetchUsers(0);
        alert(`User ${action}ned successfully!`)
      }
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
            <Button size="sm" variant={user.is_banned ? "outline" : "destructive"} onClick={() => handleUserAction(user.id, user.is_banned ? 'unban' : 'ban')} disabled={processingIds.has(user.id)}>
              <Ban className="h-4 w-4 mr-1" /> {user.is_banned ? 'Unban' : 'Ban'}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> View Profile</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>User Profile</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><h3 className="font-semibold text-lg">{user.phone}</h3><p className="text-muted-foreground">Customer Account</p></div>
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

  const activeUsersCount = useMemo(() => users.filter(u => !u.is_banned).length, [users]);
  const bannedUsersCount = useMemo(() => users.filter(u => u.is_banned).length, [users]);

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
            <CardTitle>Customer Management</CardTitle>
            <CardDescription>Manage customer accounts and profiles</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <Tabs defaultValue="active">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Active Users ({activeUsersCount})</TabsTrigger>
                  <TabsTrigger value="banned">Banned Users ({bannedUsersCount})</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="space-y-4 mt-6">
                  {loading && page === 0 ? (<div className="text-center py-8">Loading users...</div>) : users.filter(u => !u.is_banned).length === 0 ? (<div className="text-center py-8 text-muted-foreground">No active users</div>) : (
                    <>
                      {users.filter(u => !u.is_banned).map(user => (<UserCard key={user.id} user={user} />))}
                      {hasMore && (<div className="flex justify-center mt-4"><Button onClick={() => fetchUsers(page)} disabled={loading}>{loading ? 'Loading...' : 'Load More'}</Button></div>)}
                    </>
                  )}
                </TabsContent>
                <TabsContent value="banned" className="space-y-4 mt-6">
                  {loading && page === 0 ? (<div className="text-center py-8">Loading users...</div>) : users.filter(u => u.is_banned).length === 0 ? (<div className="text-center py-8 text-muted-foreground">No banned users</div>) : (
                    <>
                      {users.filter(u => u.is_banned).map(user => (<UserCard key={user.id} user={user} />))}
                      {hasMore && (<div className="flex justify-center mt-4"><Button onClick={() => fetchUsers(page)} disabled={loading}>{loading ? 'Loading...' : 'Load More'}</Button></div>)}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}