"use client"

import { gql } from "@apollo/client"
import { signOut } from "next-auth/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu"
import { Badge } from "@/ui/badge"
import { Skeleton } from "@/ui/skeleton"
import { ID } from "@/components/id"
import { useAvatarQuery } from "@/lib/graphql/generated"

gql`
  query Avatar {
    me {
      user {
        userId
        email
        roles
      }
    }
  }
`

const LoadingSkeleton = () => {
  return (
    <div className="relative">
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  )
}

const AvatarComponent = () => {
  const { data, loading } = useAvatarQuery()

  if (loading) return <LoadingSkeleton />
  if (!data) return null

  const userEmail = data.me.user.email
  const userName = userEmail.split("@")[0]
  const userRoles = data.me.user.roles
  const userId = data.me.user.userId
  const userRef = ""

  const initials = userName[0].toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center">
          <span className="text-primary-foreground text-base font-semibold">
            {initials}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {userRoles.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="font-medium capitalize">{userName}</div>
            {userRef && <div className="text-sm">#{userRef}</div>}
          </div>
          <div className="text-sm text-muted-foreground">{userEmail}</div>
          <ID type="Your" id={userId} />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={() => signOut()}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AvatarComponent
