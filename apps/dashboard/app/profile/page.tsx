"use client"

import { ProfileForm } from "@/components/profile/profile-form"
import { AppearanceSettings } from "@/components/profile/appearance-settings"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your business settings and preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm />
        <AppearanceSettings />
      </div>
    </div>
  )
}
