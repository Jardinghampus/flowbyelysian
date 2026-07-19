"use client"

import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  initialsFromName,
  TEAM_COLOR,
  TEAM_COMPANY_NAME,
  TEAM_COMPANY_WEBSITE,
  type AgentProfile,
} from "@/lib/brand"

const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  jobTitle: z.string().optional(),
  brn: z.string().optional(),
  language: z.string().optional(),
})

type UserFormValues = z.infer<typeof userFormSchema>

export function UserSettingsForm() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("")

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      jobTitle: "",
      brn: "",
      language: "english",
    },
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/user/profile", { cache: "no-store" })
        if (!res.ok) throw new Error("Could not load profile")
        const data = (await res.json()) as { profile: AgentProfile }
        const p = data.profile
        form.reset({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          location: p.location,
          jobTitle: p.jobTitle,
          brn: p.brn,
          language: p.language || "english",
        })
        setProfileImage(p.profileImageUrl)
        setDisplayName(p.fullName)
      } catch {
        toast.error("Failed to load your profile")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [form])

  async function onSubmit(data: UserFormValues) {
    setSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          location: data.location,
          jobTitle: data.jobTitle,
          brn: data.brn,
          language: data.language,
          profileImageUrl: profileImage,
        }),
      })
      if (!res.ok) throw new Error("Save failed")
      const json = (await res.json()) as { profile: AgentProfile }
      setDisplayName(json.profile.fullName)
      toast.success("Profile saved")
    } catch {
      toast.error("Could not save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 800 * 1024) {
      toast.error("Image must be under 800KB")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => setProfileImage(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const nameForInitials = displayName || `${form.watch("firstName")} ${form.watch("lastName")}`.trim()

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="border-[color:var(--team-border)]" style={{ ["--team-border" as string]: `${TEAM_COLOR}22` }}>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Your details sync across listings, feed, and landlord reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 rounded-full ring-2 ring-[#1e3a5f]/30 ring-offset-2">
                <AvatarImage src={profileImage || undefined} alt={nameForInitials} />
                <AvatarFallback className="rounded-full text-white text-lg" style={{ backgroundColor: TEAM_COLOR }}>
                  {initialsFromName(nameForInitials)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload photo
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setProfileImage(null)}>
                    Remove
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF · max 800KB · shown round on listings</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 rounded-xl border bg-muted/20 p-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Company</p>
                <p className="mt-1 text-sm font-medium">{TEAM_COMPANY_NAME}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Website</p>
                <p className="mt-1 text-sm font-medium" style={{ color: TEAM_COLOR }}>
                  {TEAM_COMPANY_WEBSITE}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role / Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sales Director" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BRN Number</FormLabel>
                    <FormControl>
                      <Input placeholder="BRN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+971 …" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Dubai, UAE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="arabic">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving} style={{ backgroundColor: TEAM_COLOR }}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
