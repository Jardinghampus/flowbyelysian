"use client"

import { useState } from "react"
import { DataTable } from "./components/data-table"

import initialUsersData from "./data.json"

export interface User {
  id: number
  name: string
  area: string
  role: "Leasing" | "Sales"
  whatsapp: string
  title: string
}

export interface UserFormValues {
  name: string
  area: string
  role: "Leasing" | "Sales"
  whatsapp: string
  title: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsersData as User[])

  const handleAddUser = (userData: UserFormValues) => {
    const newUser: User = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      name: userData.name,
      area: userData.area,
      role: userData.role,
      whatsapp: userData.whatsapp,
      title: userData.title,
    }
    setUsers(prev => [newUser, ...prev])
  }

  const handleDeleteUser = (id: number) => {
    setUsers(prev => prev.filter(user => user.id !== id))
  }

  const handleEditUser = (user: User) => {
    console.log("Edit user:", user)
  }

  const handleExport = () => {
    const headers = ["Name", "Area", "Role", "WhatsApp", "Title"]
    const csvContent = [
      headers.join(","),
      ...users.map(user =>
        [user.name, user.area, user.role, user.whatsapp, user.title]
          .map(field => `"${field}"`)
          .join(",")
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `team-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="px-4 lg:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your team members and their information
          </p>
        </div>
        <DataTable
          users={users}
          onDeleteUser={handleDeleteUser}
          onEditUser={handleEditUser}
          onAddUser={handleAddUser}
          onExport={handleExport}
        />
      </div>
    </div>
  )
}
