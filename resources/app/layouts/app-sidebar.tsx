"use client"

import React, { useState, useEffect, useMemo, useCallback, memo } from "react"
import {
  UserIcon,
  Sun,
  Moon,
  Menu,
  Settings,
  LogOut,
  ChevronDown,
  Coins,
  Crown,
  X,
  HammerIcon,
  LayoutGrid,
  LucideMegaphone,
  LucidePenTool,
  LucideBookA,
  LucideNotebookPen,
  LucideWalletCards,
  LucideUser,
  ChevronLeft,
  UserCog,
  BarChart4,
  FileText,
  MessageSquare,
  Flag,
  Bell,
  ShieldAlert,
  Users,
  BadgeDollarSign,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Switch } from "@/components/ui/switch"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Footer from "@/elements/Footer/Footer"
import { Link, NavLink, useLocation } from "react-router-dom"
import useSSRData from "@/hooks/SSR-hook"
import AppLogo from "@/elements/Logo/AppLogo"
import QuickDB from "@/lib/quickDB"

// Create a context to store and share sidebar state
const SidebarContext = React.createContext({
  isDarkMode: false,
  isSidebarCollapsed: false,
  toggleTheme: () => {},
  toggleSidebarCollapse: () => {},
})

interface MenuItemProps {
  icon: React.ElementType
  label: string
  href: string
  isActive?: boolean
  badge?: string | number
  variant?: "default" | "admin" | "danger"
}

// Memoize MenuItem component
const MenuItem = memo(
  ({
    icon: Icon,
    label,
    href,
    isActive = false,
    collapsed = false,
    badge,
    variant = "default",
  }: MenuItemProps & { collapsed?: boolean }) => {
    const content = (
      <NavLink
        to={href}
        className={cn(
          "flex items-center text-sm rounded-md transition-all relative group",
          collapsed ? "justify-center w-10 h-10 mx-auto my-1" : "px-3 py-2 w-full",
          isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground",
          variant === "admin" && "text-blue-600 dark:text-blue-400",
          variant === "danger" && "text-red-600 dark:text-red-400",
          isActive && variant === "admin" && "bg-blue-100/50 dark:bg-blue-900/20",
          isActive && variant === "danger" && "bg-red-100/50 dark:bg-red-900/20",
          !isActive && "hover:bg-accent/50",
        )}
      >
        <Icon
          className={cn(
            collapsed ? "h-5 w-5" : "h-4 w-4",
            variant === "admin" && "text-blue-600 dark:text-blue-400",
            variant === "danger" && "text-red-600 dark:text-red-400",
          )}
        />

        {!collapsed && <span className="ml-3 truncate">{label}</span>}

        {badge && (
          <Badge
            variant={variant === "admin" ? "secondary" : variant === "danger" ? "destructive" : "default"}
            className={cn(
              "text-xs",
              collapsed
                ? "absolute -right-1 -top-1 min-w-[18px] h-[18px] flex items-center justify-center p-0"
                : "ml-auto",
            )}
          >
            {badge}
          </Badge>
        )}
      </NavLink>
    )

    if (collapsed) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              <p>{label}</p>
              {badge && (
                <Badge
                  className="ml-1"
                  variant={variant === "admin" ? "secondary" : variant === "danger" ? "destructive" : "default"}
                >
                  {badge}
                </Badge>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return content
  },
)
MenuItem.displayName = "MenuItem"

interface MenuSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  collapsed?: boolean
  variant?: "default" | "admin" | "danger"
}

// Memoize MenuSection component
const MenuSection = memo(
  ({ title, children, defaultOpen = true, collapsed = false, variant = "default" }: MenuSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    if (collapsed) {
      return (
        <div className="py-2">
          <div
            className={cn(
              "h-6 flex items-center justify-center text-xs font-semibold uppercase mb-1",
              variant === "admin" && "text-blue-600 dark:text-blue-400",
              variant === "danger" && "text-red-600 dark:text-red-400",
            )}
          >
            <div className="w-8 h-[1px] bg-border opacity-70"></div>
          </div>
          {children}
        </div>
      )
    }

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger
          className={cn(
            "flex items-center w-full px-3 py-2 text-xs font-medium uppercase hover:text-foreground",
            variant === "default" && "text-muted-foreground",
            variant === "admin" && "text-blue-600 dark:text-blue-400",
            variant === "danger" && "text-red-600 dark:text-red-400",
          )}
        >
          <ChevronDown className={cn("h-4 w-4 mr-1 transition-transform", isOpen && "-rotate-180")} />
          {title}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 px-1">{children}</CollapsibleContent>
      </Collapsible>
    )
  },
)
MenuSection.displayName = "MenuSection"

interface AuthenticatedLayoutProps {
  header: React.ReactNode
  children: React.ReactNode
  sidebartab?: string
}

// Create a SidebarProvider component to manage state
const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state from localStorage only once
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("dark-mode")
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      return savedMode ? savedMode === "true" : prefersDark
    }
    return false
  })

  const [isSidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true"
    }
    return false
  })

  // Apply dark mode class on mount and when isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const newValue = !prev
      localStorage.setItem("dark-mode", newValue.toString())
      return newValue
    })
  }, [])

  const toggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const newValue = !prev
      localStorage.setItem("sidebar-collapsed", newValue.toString())
      return newValue
    })
  }, [])

  const value = useMemo(
    () => ({
      isDarkMode,
      isSidebarCollapsed,
      toggleTheme,
      toggleSidebarCollapse,
    }),
    [isDarkMode, isSidebarCollapsed, toggleTheme, toggleSidebarCollapse],
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

// Create a hook to use the sidebar context
const useSidebar = () => {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// User avatar component for the sidebar
const UserAvatar = memo(({ collapsed = false }: { collapsed?: boolean }) => {
  const userData = useSSRData().user || { name: "", is_admin: false, coins: 0 }
  const isAdmin = userData.is_admin === true

  const user = QuickDB.User.get('auth')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full transition-all",
            collapsed
              ? "h-10 w-10 rounded-full p-0 justify-center mx-auto"
              : "justify-start px-3 py-2 text-sm hover:bg-accent/50",
          )}
        >
          <div className={cn("relative flex items-center justify-center", collapsed ? "w-8 h-8" : "w-6 h-6 mr-3")}>
            {isAdmin ? (
              <div
                className={cn(
                  "rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center",
                  collapsed ? "w-8 h-8" : "w-6 h-6",
                )}
              >
                <HammerIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            ) : userData.premium ? (
              <div
                className={cn(
                  "rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center",
                  collapsed ? "w-8 h-8" : "w-6 h-6",
                )}
              >
                <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            ) : (
              <div
                className={cn(
                  "rounded-full bg-muted flex items-center justify-center",
                  collapsed ? "w-8 h-8" : "w-6 h-6",
                )}
              >
                <UserIcon className="h-4 w-4" />
              </div>
            )}

            {/* Status indicator */}
            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-1 ring-white dark:ring-black"></span>
          </div>

          {!collapsed && <span className="truncate">{user.name || "User"}</span>}

          {!collapsed && (isAdmin || userData.premium) && (
            <Badge variant={isAdmin ? "secondary" : "default"} className="ml-auto">
              {isAdmin ? "Admin" : "Premium"}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align={collapsed ? "center" : "start"}>
        <DropdownMenuItem>
          <Link to="/account" className="flex items-center w-full">
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Link>
        </DropdownMenuItem>

        {isAdmin && (
          <DropdownMenuItem>
            <Link to="/admin/dashboard" className="flex items-center w-full">
              <ShieldAlert className="mr-2 h-4 w-4 text-blue-500" />
              <span className="text-blue-600 dark:text-blue-400">Admin Panel</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem>
          <Link to="/notifications" className="flex items-center w-full">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300">
          <Link to="/logout" className="flex items-center w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
UserAvatar.displayName = "UserAvatar"

// Memoize the sidebar content
const SidebarContent = memo(() => {
  const { isSidebarCollapsed } = useSidebar()
  const location = useLocation()
  const userData = useSSRData().user || { name: "", is_admin: false, coins: 0 }
  const isAdmin = userData.is_admin === true

  // Determine active tab based on current path
  const activeTab = useMemo(() => {
    const path = location.pathname

    if (path.startsWith("/dashboard")) return "dashboard"
    if (path.startsWith("/news")) return "news"
    if (path.startsWith("/courses")) return "courses"
    if (path.startsWith("/books")) return "books"
    if (path.startsWith("/resources")) return "resources"
    if (path.startsWith("/collections")) return "collections"
    if (path.startsWith("/account")) return "profile"

    // Admin routes
    if (path.startsWith("/admin/dashboard")) return "admin-dashboard"
    if (path.startsWith("/admin/users")) return "admin-users"
    if (path.startsWith("/admin/content")) return "admin-content"
    if (path.startsWith("/admin/reports")) return "admin-reports"
    if (path.startsWith("/admin/settings")) return "admin-settings"
    if (path.startsWith("/admin/payments")) return "admin-payments"

    return ""
  }, [location.pathname])

  return (
    <>
      <CardContent className={cn("flex-grow overflow-y-auto space-y-2", isSidebarCollapsed ? "px-2 py-4" : "p-2")}>
        {/* User navigation section */}
        <div className={cn("flex flex-col", isSidebarCollapsed ? "gap-1" : "gap-1")}>
          <MenuItem
            icon={LayoutGrid}
            label="Dashboard"
            href="/dashboard"
            isActive={activeTab === "dashboard"}
            collapsed={isSidebarCollapsed}
          />
          <MenuItem
            icon={LucideMegaphone}
            label="News & Updates"
            href="/news"
            isActive={activeTab === "news"}
            collapsed={isSidebarCollapsed}
            
          />
          <MenuItem
            icon={LucidePenTool}
            label="Courses"
            href="/courses"
            isActive={activeTab === "courses"}
            collapsed={isSidebarCollapsed}
          />
          <MenuItem
            icon={LucideBookA}
            label="Books"
            href="/books"
            isActive={activeTab === "books"}
            collapsed={isSidebarCollapsed}
          />
          <MenuItem
            icon={LucideNotebookPen}
            label="Resources"
            href="/resources"
            isActive={activeTab === "resources"}
            collapsed={isSidebarCollapsed}
          />
          <MenuItem
            icon={LucideWalletCards}
            label="Collections"
            href="/collections"
            isActive={activeTab === "collections"}
            collapsed={isSidebarCollapsed}
          />
          <MenuItem
            icon={LucideUser}
            label="Profile"
            href="/account"
            isActive={activeTab === "profile"}
            collapsed={isSidebarCollapsed}
          />
        </div>

        
        {isAdmin && (
          <MenuSection title="Administration" defaultOpen={true} collapsed={isSidebarCollapsed} variant="admin">
            <MenuItem
              icon={BarChart4}
              label="Admin Dashboard"
              href="/admin/dashboard"
              isActive={activeTab === "admin-dashboard"}
              collapsed={isSidebarCollapsed}
              variant="admin"
            />
            <MenuItem
              icon={Users}
              label="User Management"
              href="/admin/users"
              isActive={activeTab === "admin-users"}
              collapsed={isSidebarCollapsed}
              variant="admin"
            />
            <MenuItem
              icon={FileText}
              label="Content Management"
              href="/admin/content"
              isActive={activeTab === "admin-content"}
              collapsed={isSidebarCollapsed}
              variant="admin"
            />
            <MenuItem
              icon={BadgeDollarSign}
              label="Payment Management"
              href="/admin/payments"
              isActive={activeTab === "admin-payments"}
              collapsed={isSidebarCollapsed}
              variant="admin"
            />
            <MenuItem
              icon={Flag}
              label="Report Management"
              href="/admin/reports"
              isActive={activeTab === "admin-reports"}
              collapsed={isSidebarCollapsed}
              variant="admin"
              
            />
            <MenuItem
              icon={UserCog}
              label="Admin Settings"
              href="/admin/settings"
              isActive={activeTab === "admin-settings"}
              collapsed={isSidebarCollapsed}
              variant="admin"
            />
          </MenuSection>
        )}

        {/* If needed, add a moderator section with fewer privileges */}
        {userData.isModerator && (
          <MenuSection title="Moderation" defaultOpen={false} collapsed={isSidebarCollapsed} variant="admin">
            <MenuItem
              icon={MessageSquare}
              label="Comments"
              href="/mod/comments"
              isActive={activeTab === "mod-comments"}
              collapsed={isSidebarCollapsed}
              variant="admin"
              badge={12}
            />
            <MenuItem
              icon={Flag}
              label="Reports"
              href="/mod/reports"
              isActive={activeTab === "mod-reports"}
              collapsed={isSidebarCollapsed}
              variant="admin"
              badge={3}
            />
          </MenuSection>
        )}
      </CardContent>

      <CardFooter className={cn("border-t", isSidebarCollapsed ? "p-2 pb-4" : "p-2")}>
        <div className="w-full space-y-2">
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between px-3 py-2 text-sm bg-muted/50 rounded-md">
              <div className="flex items-center">
                <Coins className="h-4 w-4 mr-2 text-yellow-500" />
                <span>{userData.coins || 0} Coins</span>
              </div>
            </div>
          )}

          <UserAvatar collapsed={isSidebarCollapsed} />
        </div>
      </CardFooter>
    </>
  )
})
SidebarContent.displayName = "SidebarContent"

// Main AppSidebar component
function AppSidebar({ header, children }: AuthenticatedLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { isDarkMode, isSidebarCollapsed, toggleTheme, toggleSidebarCollapse } = useSidebar()
  const userData = useSSRData().user || {}
  const isAdmin = userData.is_admin === true

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  return (
    <div className="flex h-screen w-screen bg-background">
      <Card
        className={cn(
          "fixed inset-y-0 left-0 z-50 rounded-none flex flex-col shadow-md",
          "lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isSidebarCollapsed ? "w-[70px]" : "w-64",
          isAdmin && "border-blue-500/20 dark:border-blue-500/10",
        )}
      >
        <CardHeader
          className={cn(
            "border-b flex justify-between items-center",
            isSidebarCollapsed ? "px-2 py-3" : "p-4",
            isAdmin && "bg-blue-50/40 dark:bg-blue-950/20",
          )}
        >
          <Link to="/" className={cn("flex items-center justify-center", isSidebarCollapsed ? "w-full" : "")}>
            <AppLogo className={cn("h-full", isSidebarCollapsed ? "w-8" : "w-auto")} />
          </Link>

          {!isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex h-8 w-8 rounded-full hover:bg-accent/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex h-8 w-8 rounded-full hover:bg-accent/50"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden h-8 w-8 rounded-full hover:bg-accent/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <SidebarContent />
      </Card>

      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Card
          className={cn(
            "rounded-none border-b shadow-sm",
            isAdmin &&
              "border-blue-500/20 bg-gradient-to-r from-white via-blue-50/40 to-white dark:from-black dark:via-blue-950/10 dark:to-black ",
            !isAdmin && "bg-background",
          )}
        >
          <CardContent className="p-0">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="mr-4 lg:hidden h-9 w-9 rounded-full"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                {isAdmin && !isSidebarCollapsed && (
                  <Badge
                    variant="outline"
                    className="mr-2 bg-blue-100/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                  >
                    Admin Mode
                  </Badge>
                )}
                {header}
              </div>
              <div className="flex items-center space-x-4">
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-primary/80"
                />
                <span className="text-muted-foreground">
                  {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div
          className={cn(
            "flex-1 overflow-hidden",
            isAdmin ? "bg-blue-50/30 dark:bg-background" : "bg-muted/30 dark:bg-background",
          )}
        >
          <div className="h-full overflow-y-auto p-4">
            <div className="mx-auto">
              {children}
              <Footer />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleSidebar}></div>
      )}
    </div>
  )
}

// Wrap the AppSidebar with the SidebarProvider
const MemoizedAppSidebar = memo(({ header, children }: AuthenticatedLayoutProps) => (
  <SidebarProvider>
    <AppSidebar header={header} children={children} />
  </SidebarProvider>
))
MemoizedAppSidebar.displayName = "MemoizedAppSidebar"

export default MemoizedAppSidebar


