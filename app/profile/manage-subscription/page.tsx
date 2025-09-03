"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ManageSubscriptionPage() {
  const [loading, setLoading] = useState(false)

  const openPortal = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: typeof window !== 'undefined' ? window.location.href : '/' }),
      })
      if (!res.ok) throw new Error('Failed to open billing portal')
      const { url } = await res.json()
      window.location.href = url
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Subscription</CardTitle>
        <CardDescription>Update payment methods, cancel, or view invoices.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={openPortal} disabled={loading}>
          {loading ? 'Opening…' : 'Open Billing Portal'}
        </Button>
      </CardContent>
    </Card>
  )
}