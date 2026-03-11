import type { JSX } from "react"
import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../api/axios"

interface Props {
  children: JSX.Element
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      api.get('/auth/me').then(res => {
        setUser(res.data)
      }).catch(() => {
        localStorage.removeItem('token')
      }).finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
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