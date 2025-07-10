"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { authenticateUser, ADMIN_CREDENTIALS } from "@/lib/auth"

export default function DebugLogin() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testDatabaseConnection = async () => {
    setLoading(true)
    addLog("Testing database connection...")

    try {
      const { data, error } = await supabase.from("users").select("count").single()
      if (error) {
        addLog(`Database error: ${error.message}`)
      } else {
        addLog("Database connection successful")
      }
    } catch (error) {
      addLog(`Database connection failed: ${error.message}`)
    }

    setLoading(false)
  }

  const checkAdminUser = async () => {
    setLoading(true)
    addLog("Checking for admin user...")

    try {
      const { data, error } = await supabase.from("users").select("*").eq("phone", ADMIN_CREDENTIALS.phone).single()

      if (error) {
        addLog(`Admin user not found: ${error.message}`)
      } else {
        addLog(`Admin user found: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      addLog(`Error checking admin user: ${error.message}`)
    }

    setLoading(false)
  }

  const createAdminUser = async () => {
    setLoading(true)
    addLog("Creating admin user...")

    try {
      const { data, error } = await supabase
        .from("users")
        .upsert({
          id: "00000000-0000-0000-0000-000000000001",
          phone: ADMIN_CREDENTIALS.phone,
          role: "admin",
          password_hash: "YWRtaW4xMjM=", // base64 of 'admin123'
        })
        .select()

      if (error) {
        addLog(`Failed to create admin: ${error.message}`)
      } else {
        addLog(`Admin user created: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      addLog(`Error creating admin user: ${error.message}`)
    }

    setLoading(false)
  }

  const testAdminLogin = async () => {
    setLoading(true)
    addLog("Testing admin login...")

    try {
      const result = await authenticateUser(ADMIN_CREDENTIALS.phone, ADMIN_CREDENTIALS.password)
      addLog(`Login result: ${JSON.stringify(result)}`)
    } catch (error) {
      addLog(`Login test failed: ${error.message}`)
    }

    setLoading(false)
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Debug Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={testDatabaseConnection} disabled={loading}>
                Test Database
              </Button>
              <Button onClick={checkAdminUser} disabled={loading}>
                Check Admin User
              </Button>
              <Button onClick={createAdminUser} disabled={loading}>
                Create Admin User
              </Button>
              <Button onClick={testAdminLogin} disabled={loading}>
                Test Admin Login
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Debug Logs:</h3>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                Clear Logs
              </Button>
            </div>

            <div className="bg-muted p-4 rounded max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">No logs yet. Click a button to start debugging.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded">
              <h4 className="font-semibold mb-2">Admin Credentials:</h4>
              <p>
                <strong>Phone:</strong> {ADMIN_CREDENTIALS.phone}
              </p>
              <p>
                <strong>Password:</strong> {ADMIN_CREDENTIALS.password}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
