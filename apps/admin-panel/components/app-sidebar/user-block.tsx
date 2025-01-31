"use client"

import { gql } from "@apollo/client"
import { ChevronsUpDown, LogOut } from "lucide-react"

import { useAvatarQuery } from "@/lib/graphql/generated"
import { Skeleton } from "@/ui/skeleton"
import { Badge } from "@/ui/badge"
import { ID } from "@/components/id"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu"
import { useLogout } from "@/app/auth/session"

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

export function UserBlock() {
  const { logout } = useLogout()
  const { data, loading } = useAvatarQuery()

  if (loading && !data) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!data?.me.user) return null
  const { email, roles, userId } = data.me.user
  const userName = email.split("@")[0]
  const initials = userName[0].toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" tabIndex={-1}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-medium">{initials}</span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium capitalize">{userName}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56" align="end" sideOffset={4}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-2 p-1">
                <div className="flex flex-wrap gap-1">
                  {roles.map((role) => (
                    <Badge key={role} variant="secondary" className="capitalize">
                      {role.toLowerCase()}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm">{email}</div>
                <ID type="Your" id={userId} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
