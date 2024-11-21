"use client"

import Link from "next/link"

import { Button } from "@/ui/button"

const Error: React.FC = () => (
  <>
    <h1 className="font-semibold leading-none tracking-tight text-xl">Access Denied</h1>
    <div className="space-y-[10px]">
      <div className="text-md text-destructive">Oops, we could not sign you in</div>
      <div className="text-md font-light text-destructive">
        Please recheck your credentials and try again. Repeated attempts with wrong email
        might ban your IP from the system.
      </div>
    </div>
    <Link href="/auth/login">
      <Button>Back to login</Button>
    </Link>
  </>
)

export default Error
