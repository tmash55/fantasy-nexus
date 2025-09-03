"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const links = [
    { href: "/profile/overview", label: "Overview" },
    { href: "/profile/manage-subscription", label: "Manage Subscription" },
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-6">
        <aside className="bg-background border border-border rounded-lg p-4 h-fit">
          <div className="text-sm font-semibold text-muted-foreground mb-3">Settings</div>
          <nav className="flex flex-col gap-1">
            {links.map((l) => {
              const active = pathname === l.href
              return (
                <Link key={l.href} href={l.href} className={cn(
                  "px-3 py-2 rounded-md text-sm transition-colors",
                  active ? "bg-primary text-primary-foreground" : "hover:bg-muted/60"
                )}>
                  {l.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="min-h-[50vh]">{children}</main>
      </div>
    </div>
  )
}


