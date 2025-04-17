"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@lana/web/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@lana/web/ui/avatar"
import { Laptop, LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Badge } from "@lana/web/ui/badge"

import { useState, useCallback } from "react"

import { LanaBankIcon } from "../icons"

import { KycLevel, MeQuery } from "@/lib/graphql/generated"

import { useLogout } from "@/hooks/use-logout"

interface MenuItem {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  href?: string
}

function NavBar({ meQueryData }: { meQueryData: MeQuery }) {
  const { setTheme } = useTheme()
  const { logout } = useLogout()
  const [isOpen, setIsOpen] = useState(false)
  const avatarCallback = meQueryData.me.customer.email[0].toUpperCase()

  const menuItems: MenuItem[] = [
    {
      label: "Logout",
      icon: <LogOut className="mr-2 h-4 w-4" />,
      onClick: () => logout(),
    },
  ]

  const handleMenuItemClick = useCallback((item: MenuItem) => {
    if (item.onClick) {
      item.onClick()
    }
    if (item.href) {
      console.log(`Navigate to: ${item.href}`)
    }
    setIsOpen(false)
  }, [])

  const handleThemeChange = useCallback(
    (theme: string) => {
      setTheme(theme)
      setIsOpen(false)
    },
    [setTheme],
  )

  return (
    <nav>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <LanaBankIcon className="h-10 w-24" />
          </div>
          <div className="flex gap-2">
            <KYCBadge level={meQueryData.me.customer.level} />
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer rounded-md [&>span]:rounded-md">
                  <AvatarFallback>{avatarCallback}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                {menuItems.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onSelect={() => handleMenuItemClick(item)}
                    className="flex items-center cursor-pointer"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onSelect={() => handleThemeChange("light")}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleThemeChange("dark")}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleThemeChange("system")}>
                      <Laptop className="mr-2 h-4 w-4" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar

import { cn } from "@/lib/utils"
import { Button } from "@lana/web/ui/button"
import { createSumsubPermalink } from "./server-actions"

interface KYCBadgeProps {
  level: KycLevel
  className?: string
}

const levelStyles = {
  [KycLevel.NotKyced]:
    "border-destructive/50 text-destructive bg-destructive/10 hover:bg-destructive/20",
  [KycLevel.Basic]:
    "border-orange-500/50 text-orange-700 dark:text-orange-400 bg-orange-100/50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30",
  [KycLevel.Advanced]:
    "border-emerald-500/50 text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
}

const levelLabels = {
  [KycLevel.NotKyced]: "Not KYCed",
  [KycLevel.Basic]: "Basic KYC",
  [KycLevel.Advanced]: "Advanced KYC",
}

export function KYCBadge({ level, className }: KYCBadgeProps) {
  const [isStartKycLoading, setStartKycLoading] = useState(false)

  const startYourKyc = async () => {
    setStartKycLoading(true)
    try {
      const sumsubPermalink = await createSumsubPermalink()
      window.open(sumsubPermalink, "_blank")
    } finally {
      setStartKycLoading(false)
    }
  }

  if (level === KycLevel.NotKyced) {
    return (
      <div className={isStartKycLoading ? "cursor-wait" : ""}>
        <Button onClick={startYourKyc} variant="link" disabled={isStartKycLoading}>
          Start your KYC process
        </Button>
      </div>
    )
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-lg font-semibold transition-colors duration-200",
        levelStyles[level],
        className,
      )}
    >
      {levelLabels[level]}
    </Badge>
  )
}
