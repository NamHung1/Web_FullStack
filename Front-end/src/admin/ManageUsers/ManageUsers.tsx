import { Table, Button, message } from "antd"
import styles from "./ManageUsers.module.css"
import { useEffect, useState } from "react"
import api from "../../api/axios"

interface User {

  _id: string
  name: string
  email: string
  role: string

}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users")
      setUsers(res.data)
    } catch (error) {
      message.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(users.filter(u => u._id !== id))
      message.success("User deleted")
    } catch (error) {
      message.error("Failed to delete user")
    }
  }

  const columns = [

    {
      title: "Name",
      dataIndex: "name"
    },

    {
      title: "Email",
      dataIndex: "email"
    },

    {
      title: "Role",
      dataIndex: "role"
    },

    {
      title: "Action",
      render: (record: User) => (
        <Button danger onClick={() => deleteUser(record._id)}>Delete</Button>
      )
    }

  ]

  return (

    <div className={styles.container}>

      <h1 className={styles.title}>Manage Users</h1>

      <Table

        dataSource={users}

        columns={columns}

        loading={loading}

        rowKey="_id"

      />

    </div>

  )
}