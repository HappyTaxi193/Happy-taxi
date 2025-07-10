"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authenticateUser, ADMIN_CREDENTIALS } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export default function TestAuth() {
  const [phone, setPhone] = useState(ADMIN_CREDENTIALS.phone)
  const [password, setPassword] = useState(ADMIN_CREDENTIALS.password)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    try {
      const authResult = await authenticateUser(phone, password)
      setResult(authResult)
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testDatabase = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("users").select("*").eq("phone", phone)
      setResult({ database: true, data, error })
    } catch (error) {
      setResult({ database: true, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label>Phone:</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label>Password:</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="flex space-x-2">
              <Button onClick={testAuth} disabled={loading}>
                Test Auth
              </Button>
              <Button onClick={testDatabase} disabled={loading} variant="outline">
                Test DB
              </Button>
            </div>
            {result && (
              <div className="bg-muted p-4 rounded">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
