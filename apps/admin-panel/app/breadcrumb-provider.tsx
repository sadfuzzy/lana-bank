import { createContext, useContext, useState } from "react"

import { usePathname } from "next/navigation"

import type { BreadcrumbLink } from "@/components/breadcrumb-wrapper"

interface BreadcrumbContextType {
  links: BreadcrumbLink[]
  setCustomLinks: (links: BreadcrumbLink[]) => void
  resetToDefault: () => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

function generateDefaultLinks(pathname: string): BreadcrumbLink[] {
  const segments = pathname.split("/").filter(Boolean)
  const links: BreadcrumbLink[] = [{ title: "Dashboard", href: "/dashboard" }]
  segments.forEach((segment, index) => {
    if (segment === "dashboard") return
    const href = "/" + segments.slice(0, index + 1).join("/")

    const title = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    links.push({
      title,
      ...(index === segments.length - 1 ? { isCurrentPage: true as const } : { href }),
    })
  })

  if (pathname === "/" || pathname === "/dashboard") {
    links[0] = { title: "Dashboard", isCurrentPage: true as const }
  }

  return links
}

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [customLinks, setCustomLinks] = useState<BreadcrumbLink[] | null>(null)

  const links = customLinks ?? generateDefaultLinks(pathname)

  return (
    <BreadcrumbContext.Provider
      value={{
        links,
        setCustomLinks: (newLinks) => setCustomLinks(newLinks),
        resetToDefault: () => setCustomLinks(null),
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  )
}

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext)
  if (!context) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider")
  }
  return context
}
