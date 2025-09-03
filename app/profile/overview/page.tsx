"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ProfileOverviewPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Overview</CardTitle>
        <CardDescription>Basic details about your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">More profile info coming soon.</div>
      </CardContent>
    </Card>
  )
}