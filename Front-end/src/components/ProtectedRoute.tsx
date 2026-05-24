import type { JSX } from "react"
import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../api/axios"
import type { User } from "../types/user"

interface Props {
  children: JSX.Element
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")))

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      return
    }

    api.get<User>('/auth/me').then(res => {
      setUser(res.data)
    }).catch(() => {
      localStorage.removeItem('token')
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />
  }

  return children
}
