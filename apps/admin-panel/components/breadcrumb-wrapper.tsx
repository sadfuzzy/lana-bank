import React from "react"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb"

interface BaseBreadcrumbLink {
  title: string
}

interface ClickableBreadcrumbLink extends BaseBreadcrumbLink {
  isCurrentPage?: false
  href: string
}

interface CurrentPageBreadcrumbLink extends BaseBreadcrumbLink {
  isCurrentPage: true
  href?: never
}

export type BreadcrumbLink = ClickableBreadcrumbLink | CurrentPageBreadcrumbLink

interface FlexibleBreadcrumbProps {
  links: BreadcrumbLink[]
}

const BreadCrumbWrapper = ({ links }: FlexibleBreadcrumbProps) => {
  return (
    <Breadcrumb className="px-2">
      <BreadcrumbList>
        {links.map((link, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {link.isCurrentPage ? (
                <BreadcrumbPage>{link.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={link.href}>{link.title}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < links.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export const ListPageBreadcrumb = ({ currentPage }: { currentPage: string }) => {
  const links: BreadcrumbLink[] = [
    { title: "Dashboard", href: "/dashboard" },
    { title: currentPage, isCurrentPage: true },
  ]

  return <BreadCrumbWrapper links={links} />
}

export { BreadCrumbWrapper }
