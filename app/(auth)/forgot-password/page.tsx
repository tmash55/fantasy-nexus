"use client"
import React from "react"
import { useState } from "react"
import { createClient } from "@/libs/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsSending(true)
    try {
      const baseUrl = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL) || (typeof window !== 'undefined' ? window.location.origin : '')
      const redirectTo = `${baseUrl}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      toast.success("Password reset email sent. Check your inbox.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to send reset email")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" disabled={isSending} className="w-full">
              {isSending ? "Sending..." : "Send reset link"}
            </Button>
            <div className="text-sm text-muted-foreground text-center">
              Remembered it? <Link href="/sign-in" className="underline">Back to sign in</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


