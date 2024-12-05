import { useBreadcrumb } from "./breadcrumb-provider"

import { BreadCrumbWrapper } from "@/components/breadcrumb-wrapper"

export function DynamicBreadcrumb() {
  const { links } = useBreadcrumb()
  return <BreadCrumbWrapper links={links} />
}
