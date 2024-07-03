"use client"
import React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"
import { SetupAuthenticator } from "@/components/settings/authenticator"
import { SetupWebAuth } from "@/components/settings/webauth"

const SettingsPage = () => {
  return (
    <main className="md:max-w-[70rem] m-auto w-[90%]">
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Setup Two Factor Authentication</CardTitle>
          <CardDescription>Choose a method for securing your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <SetupAuthenticator />
          <SetupWebAuth />
        </CardContent>
      </Card>
    </main>
  )
}

export default SettingsPage
