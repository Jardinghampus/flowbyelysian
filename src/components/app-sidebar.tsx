"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  MessageCircle,
  Calendar,
  Users,
  GraduationCap,
  Sparkles,
  UserCog,
  Settings,
  LogOut,
  Moon,
  Sun,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useClerk, useUser } from "@clerk/nextjs"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Building2,
  },
  {
    title: "Performance",
    url: "/performance",
    icon: TrendingUp,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Training",
    url: "/training",
    icon: GraduationCap,
  },
  {
    title: "RERA Assistant",
    url: "/ai-assistant",
    icon: Sparkles,
  },
  {
    title: "Admin",
    url: "/admin",
    icon: UserCog,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { signOut } = useClerk()
  const { user } = useUser()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleSignOut = () => {
    signOut({ redirectUrl: "/sign-in" })
  }

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.firstName?.[0] || "U"

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={22} className="text-current" />
                </div>
                {!isCollapsed && (
                  <span className="font-bold text-lg tracking-tight">FLOW</span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* User Profile Section */}
      <div className={cn(
        "px-3 py-4 border-b border-sidebar-border",
        isCollapsed && "px-2 py-3"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center"
        )}>
          <Avatar className={cn("h-10 w-10", isCollapsed && "h-8 w-8")}>
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {user?.fullName || "Flow User"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                Real Estate Agent
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <SidebarContent className="px-2 py-2">
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "relative h-10 transition-colors",
                    isActive && "bg-primary/10 text-primary font-medium",
                    isActive && "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:rounded-r-full before:bg-primary"
                  )}
                >
                  <Link href={item.url}>
                    <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border px-2 py-2">
        <SidebarMenu className="space-y-1">
          {/* Settings */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              className="h-10"
              isActive={pathname.startsWith("/settings")}
            >
              <Link href="/settings/user">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="h-10 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Dark Mode Toggle */}
          <SidebarMenuItem>
            <div className={cn(
              "flex items-center h-10 px-2 rounded-md",
              isCollapsed && "justify-center"
            )}>
              {isCollapsed ? (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-1 rounded-md hover:bg-sidebar-accent"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <>
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <span className="ml-3 text-sm flex-1">Dark Mode</span>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    className="data-[state=checked]:bg-primary"
                  />
                </>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
