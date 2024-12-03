import { useRouter, usePathname } from "next/navigation"

type Tab = {
  url: string
  tabLabel: string
}

export function useTabNavigation(tabs: Tab[], entityId: string) {
  const router = useRouter()
  const pathname = usePathname()

  const getCurrentTab = () => {
    const pathAfterEntity = pathname.split(entityId)[1]
    if (!pathAfterEntity || pathAfterEntity === "/") {
      return tabs[0].url
    }
    return pathAfterEntity
  }

  const handleTabChange = (value: string) => {
    const basePath = pathname.split(entityId)[0] + entityId
    const newPath = value === tabs[0].url ? basePath : `${basePath}${value}`
    router.push(newPath)
  }

  return {
    currentTab: getCurrentTab(),
    handleTabChange,
  }
}
