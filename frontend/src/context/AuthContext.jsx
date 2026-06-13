import { useMemo, useState, useEffect } from 'react'
import { AuthContext } from './AuthContextCore'
import api from '../services/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchProfile(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async (token) => {
    try {
      const response = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setUser(response.data.user)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      })

      if (response.data.success) {
        if (response.data.requiresOTP) {
          return { success: true, requiresOTP: true, email: response.data.email }
        }
        const { token, user } = response.data
        if (token) {
          localStorage.setItem('token', token)
          setUser(user)
          return { success: true }
        }
        return { success: false, message: response.data.message || 'Login failed' }
      } else {
        return { success: false, message: response.data.message || 'Login failed' }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred during login'
      return { success: false, message }
    }
  }

  const verifyLoginOTP = async ({ email, otp }) => {
    try {
      const response = await api.post('/auth/verify-login-otp', { email, otp })

      if (response.data.success) {
        const { token, user } = response.data
        localStorage.setItem('token', token)
        setUser(user)
        return { success: true }
      } else {
        return { success: false, message: response.data.message || 'Invalid OTP' }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed'
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      verifyLoginOTP,
      logout,
      loading,
      setUser,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}