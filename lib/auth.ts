import { supabase } from "./supabase"

// Simple authentication system for demo
export async function hashPassword(password: string): Promise<string> {
  return btoa(password) // Base64 encoding for demo
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return btoa(password) === hash
}

export async function authenticateUser(phone: string, password: string) {
  try {
    console.log("🔐 Authenticating user:", phone)

    // Clean phone number
    const cleanPhone = phone.trim()

    // Query database
    const { data: users, error } = await supabase.from("users").select("*").eq("phone", cleanPhone)

    console.log("📊 Database response:", { users, error })

    if (error) {
      console.error("❌ Database error:", error)
      return { success: false, error: `Database error: ${error.message}` }
    }

    if (!users || users.length === 0) {
      console.log("❌ No user found")
      return { success: false, error: "User not found" }
    }

    const user = users[0] 
    console.log("👤 Found user:", user)

    // Special handling for admin
    if (user.role === "admin" && cleanPhone === "7017003942") {
      console.log("🔑 Admin login attempt")
      if (password === "mayank321") {
        console.log("✅ Admin login successful")
        return { success: true, user }
      } else {
        console.log("❌ Invalid admin password")
        return { success: false, error: "Invalid admin password" }
      }
    }

    // Check password for regular users
    if (!user.password_hash) {
      return { success: false, error: "Password not set for this user" }
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)
    console.log("🔍 Password check result:", isValidPassword)

    if (!isValidPassword) {
      return { success: false, error: "Invalid password" }
    }

    console.log("✅ Login successful")
    return { success: true, user }
  } catch (error) {
    console.error("💥 Authentication error:", error)
    return { success: false, error: `Authentication failed: ${error.message}` }
  }
}

export async function createUser(phone: string, password: string, role: "user" | "driver") {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("phone", phone)
      .single()

    if (existingUser) {
      return {
        success: false,
        error: "User with this phone number already exists",
        user: null
      }
    }

    // Create new user
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          phone,
          password: await hashPassword(password), // Make sure to hash the password
          role,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        user: null
      }
    }

    return {
      success: true,
      error: null,
      user: data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
      user: null
    }
  }
}

// Admin credentials
export const ADMIN_CREDENTIALS = {
  phone: "+91 99999 99999",
  password: "admin123",
}

// Test credentials
export const TEST_CREDENTIALS = {
  phone: "+91 98765 43210",
  password: "test123",
}

// Test driver credentials
export const TEST_DRIVER_CREDENTIALS = {
  phone: "+91 98765 54321",
  password: "driver123",
}
