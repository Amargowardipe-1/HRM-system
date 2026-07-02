"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  // Restore session from localStorage on mount
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem("token");
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        const payload = await response.json();
        
        if (response.ok && payload.success !== false) {
          setToken(storedToken);
          setUser(payload.data);
          // Sync cookie
          document.cookie = `token=${storedToken}; path=/; max-age=86400; SameSite=Lax`;
        } else {
          // Token is invalid or expired
          localStorage.removeItem("token");
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        }
      } catch (error) {
        console.error("Error restoring session:", error);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  // Automatic route protection based on auth state
  useEffect(() => {
    if (loading) return;

    const isLoginPage = pathname === "/login";
    const isPublicPage = ["/login", "/forgot-password", "/reset-password"].includes(pathname);
    const isAuthenticated = !!user;

    if (!isAuthenticated && !isPublicPage) {
      router.push("/login");
    } else if (isAuthenticated && isLoginPage) {
      router.push("/dashboard");
    }
  }, [user, loading, pathname, router]);

  // Login method
  async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload.success === false) {
      throw new Error(payload.message || "Invalid credentials. Please try again.");
    }

    const { token: receivedToken, user: receivedUser } = payload.data;
    
    localStorage.setItem("token", receivedToken);
    document.cookie = `token=${receivedToken}; path=/; max-age=86400; SameSite=Lax`;
    setToken(receivedToken);
    setUser(receivedUser);
    
    router.push("/dashboard");
  }

  // Logout method
  function logout() {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setToken(null);
    setUser(null);
    router.push("/login");
  }

  // Refresh user profile details
  async function refreshUser() {
    const storedToken = localStorage.getItem("token") || token;
    if (!storedToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.success !== false) {
        setUser(payload.data);
      }
    } catch (err) {
      console.error("Failed to refresh user session:", err);
    }
  }

  // Render a clean loading screen during initial session restore
  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "var(--bg)",
        fontFamily: "sans-serif",
      }}>
        <div className="spin" style={{
          width: "40px",
          height: "40px",
          border: "4px solid var(--border)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
        }} />
        <p style={{ marginTop: "16px", color: "var(--muted)", fontWeight: "600", fontSize: "14px" }}>
          Securing session...
        </p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
