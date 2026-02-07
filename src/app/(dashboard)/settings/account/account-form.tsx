"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useUser } from "@clerk/nextjs"
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
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const accountFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  area: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export default function AccountSettings() {
  const { user, isLoaded } = useUser()
  const [saving, setSaving] = useState(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      area: "",
    },
  })

  // Load user data when available
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: (user.publicMetadata?.phone as string) || "",
        area: (user.publicMetadata?.area as string) || "",
      })
    }
  }, [user, form])

  async function onSubmit(data: AccountFormValues) {
    setSaving(true)
    try {
      // Update user profile via Clerk
      await user?.update({
        firstName: data.firstName,
        lastName: data.lastName,
      })

      // Update metadata via API
      const res = await fetch("/api/user/metadata", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: data.phone,
          area: data.area,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update profile")
      }

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information that will be displayed on your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} />
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
                        <Input placeholder="Enter your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  value={user?.primaryEmailAddress?.emailAddress || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email changes are managed through Clerk security settings.
                </p>
              </div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone / WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="+971 50 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Area</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your primary area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tilal-al-ghaf">Tilal Al Ghaf</SelectItem>
                        <SelectItem value="palm-jumeirah">Palm Jumeirah</SelectItem>
                        <SelectItem value="dubai-marina">Dubai Marina</SelectItem>
                        <SelectItem value="downtown-dubai">Downtown Dubai</SelectItem>
                        <SelectItem value="arabian-ranches">Arabian Ranches</SelectItem>
                        <SelectItem value="emirates-hills">Emirates Hills</SelectItem>
                        <SelectItem value="business-bay">Business Bay</SelectItem>
                        <SelectItem value="jbr">JBR</SelectItem>
                        <SelectItem value="difc">DIFC</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your account security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div>
                  <h4 className="font-semibold">Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Change your password through Clerk security settings.
                  </p>
                </div>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => window.open("https://accounts.clerk.dev/user/security", "_blank")}
                  className="cursor-pointer"
                >
                  Manage Security
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div>
                  <h4 className="font-semibold">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <Button variant="destructive" type="button" className="cursor-pointer">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-2">
            <Button type="submit" disabled={saving} className="cursor-pointer">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => form.reset()}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
