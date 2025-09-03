"use client"

import { useState, useEffect } from "react"
import type { JSX } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { BarChart3, TrendingUp, ListOrdered, GitCompare, Menu, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { UserIcon, LogOut } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import config from "@/config"

const adpLinks: {
  href: string
  label: string
  shortLabel?: string
  description: string
  icon: any
}[] = [
  {
    href: "/adp",
    label: "ADP Smashboard",
    shortLabel: "ADP",
    description: "Compare rankings across platforms",
    icon: BarChart3,
  },
  {
    href: "/adp/values",
    label: "Values & Busts",
    shortLabel: "Values",
    description: "Find hidden gems and avoid traps",
    icon: TrendingUp,
  },
]

const nflLinks: {
  href: string
  label: string
  shortLabel?: string
  description: string
  icon: any
}[] = [
  {
    href: "/nfl/rankings",
    label: "NFL Rankings",
    shortLabel: "Rankings",
    description: "Weekly fantasy rankings",
    icon: ListOrdered,
  },
  {
    href: "/nfl/start-sit",
    label: "Start/Sit",
    shortLabel: "Start/Sit",
    description: "Compare players to start",
    icon: GitCompare,
  },
]

const pricingLink = {
  href: "/pricing",
  label: "Pricing",
  description: "View subscription plans",
  icon: DollarSign,
}

const themeToggle: JSX.Element = <ThemeToggle />

// A combined header with logo, ADP navigation, and theme toggle
const Header = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { user, signOut } = useAuth()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false)
    setIsMobileMenuOpen(false)
  }, [searchParams])

  const allNavLinks = [...nflLinks, ...adpLinks, ...(user ? [] : [pricingLink])]

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <nav
        className="container flex items-center justify-between px-3 sm:px-4 lg:px-8 py-2 lg:py-3 mx-auto"
        aria-label="Global"
      >
        {/* Logo/name */}
        <div className="flex flex-1">
          <Link className="flex items-center gap-1.5 sm:gap-2 shrink-0" href="/" title={`${config.appName} homepage`}>
            <span className="font-extrabold text-sm sm:text-base">{config.appName}</span>
          </Link>
        </div>

        <div className="hidden md:flex justify-center gap-1.5 sm:gap-2 items-center mx-1 sm:mx-2">
          <TooltipProvider>
            {nflLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Tooltip key={item.href} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1.5 transition-all duration-200",
                          isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted/60",
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm hidden xs:block">
                          {item.shortLabel || item.label}
                        </span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="hidden sm:block max-w-[200px]" sideOffset={4}>
                    <div className="text-sm font-medium mb-0.5">{item.label}</div>
                    <div className="text-xs text-foreground/80 dark:text-white/70">{item.description}</div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
            {adpLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Tooltip key={item.href} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1.5 transition-all duration-200",
                          isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted/60",
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="font-medium text-xs sm:text-sm hidden xs:block">
                          {item.shortLabel || item.label}
                        </span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="hidden sm:block max-w-[200px]" sideOffset={4}>
                    <div className="text-sm font-medium mb-0.5">{item.label}</div>
                    <div className="text-xs text-foreground/80 dark:text-white/70">{item.description}</div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
            {!user && (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link href={pricingLink.href}>
                    <Button
                      variant={pathname === pricingLink.href ? "default" : "ghost"}
                      className={cn(
                        "h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1.5 transition-all duration-200",
                        pathname === pricingLink.href
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-muted/60",
                      )}
                    >
                      <pricingLink.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="font-medium text-xs sm:text-sm hidden xs:block">{pricingLink.label}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="hidden sm:block max-w-[200px]" sideOffset={4}>
                  <div className="text-sm font-medium mb-0.5">{pricingLink.label}</div>
                  <div className="text-xs text-foreground/80 dark:text-white/70">{pricingLink.description}</div>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>

        {/* Theme toggle + Auth actions + Mobile menu */}
        <div className="flex justify-end items-center gap-2 flex-1">
          <ThemeToggle />

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {allNavLinks.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-muted/80 flex items-center justify-center text-xs font-semibold">
                    {(() => {
                      const meta: any = (user as any)?.user_metadata || {}
                      const name: string = meta.full_name || meta.name || ""
                      const email: string = (user as any)?.email || ""
                      const fromName = name
                        ? name
                            .trim()
                            .split(/\s+/)
                            .map((p: string) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        : ""
                      const fromEmail = !fromName && email ? email[0].toUpperCase() : ""
                      const text = fromName || fromEmail
                      return text ? text : <UserIcon className="h-4 w-4" />
                    })()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{(user as any)?.email || "Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile/overview">Profile Overview</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/manage-subscription">Manage Subscription</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/sign-in">
              <Button variant="ghost" className="h-8 px-3 text-sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header
