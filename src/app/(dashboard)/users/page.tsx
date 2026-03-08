"use client"

import { useState } from "react"
import { LayoutGrid, List } from "lucide-react"
import { DataTable } from "./components/data-table"
import { ContactCard, type Contact } from "./components/contact-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

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

// Enrich base user data with CRM fields for card view
function enrichContact(user: User, index: number): Contact {
  const sampleEmails = [
    "ahmad@zaylo.ae", "sarah@zaylo.ae", "mohammed@zaylo.ae",
    "emma@zaylo.ae", "khalid@zaylo.ae", "lisa@zaylo.ae",
  ]
  const sampleNotes = [
    "Top performer Q1 2026. Specializes in luxury villas.",
    "Strong network in marina community. Manages 40+ units.",
    "New joiner, excellent with off-plan projects.",
    "",
    "Corporate relocation specialist. Fluent in 4 languages.",
    "Closing rate above 30%. Focus on high-net-worth buyers.",
  ]
  const sampleTags = [
    ["VIP", "Luxury"], ["Residential"], ["Off-Plan", "New"],
    ["Leasing"], ["Corporate"], ["HNW"],
  ]
  return {
    ...user,
    email: sampleEmails[index % sampleEmails.length],
    notes: sampleNotes[index % sampleNotes.length] || undefined,
    tags: sampleTags[index % sampleTags.length],
    lastContact: index < 3 ? "Today" : index < 6 ? "Yesterday" : "3 days ago",
    dealCount: Math.floor(Math.random() * 20) + 1,
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsersData as User[])
  const [view, setView] = useState<"table" | "cards">("table")
  const [cardSearch, setCardSearch] = useState("")
  const [cardRoleFilter, setCardRoleFilter] = useState<string>("all")

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

  // Filter contacts for card view
  const contacts: Contact[] = users.map((u, i) => enrichContact(u, i))
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = cardSearch === "" ||
      c.name.toLowerCase().includes(cardSearch.toLowerCase()) ||
      c.area.toLowerCase().includes(cardSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(cardSearch.toLowerCase())
    const matchesRole = cardRoleFilter === "all" || c.role === cardRoleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Contacts</h1>
            <p className="text-muted-foreground">
              Manage your team members and contacts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                className="rounded-none h-8"
                onClick={() => setView("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "cards" ? "default" : "ghost"}
                size="sm"
                className="rounded-none h-8"
                onClick={() => setView("cards")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {view === "table" ? (
          <DataTable
            users={users}
            onDeleteUser={handleDeleteUser}
            onEditUser={handleEditUser}
            onAddUser={handleAddUser}
            onExport={handleExport}
          />
        ) : (
          <div className="space-y-4">
            {/* Card view filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={cardSearch}
                  onChange={(e) => setCardSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={cardRoleFilter} onValueChange={setCardRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Leasing">Leasing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Card grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={(c) => handleEditUser(c as User)}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>

            {filteredContacts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No contacts found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
