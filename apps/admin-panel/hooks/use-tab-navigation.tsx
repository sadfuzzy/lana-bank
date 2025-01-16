"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useCallback } from "react"

type Tab = {
  url: string
  tabLabel: string
}

export function useTabNavigation(tabs: Tab[], entityId: string) {
  const router = useRouter()
  const pathname = usePathname()

  const getCurrentTab = useCallback(() => {
    const pathAfterEntity = pathname.split(entityId)[1]
    if (!pathAfterEntity || pathAfterEntity === "/") {
      return tabs[0].url
    }
    return pathAfterEntity
  }, [pathname, entityId, tabs])

  const currentTab = getCurrentTab()
  const handleTabChange = useCallback(
    (value: string) => {
      const basePath = pathname.split(entityId)[0] + entityId
      const newPath = value === tabs[0].url ? basePath : `${basePath}${value}`
      router.push(newPath)
    },
    [pathname, entityId, router, tabs],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const tagName = document.activeElement?.tagName
      if (
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return
      }

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return
      }

      event.preventDefault()
      const currentIndex = tabs.findIndex((tab) => tab.url === currentTab)
      if (currentIndex === -1) return

      let newIndex = currentIndex
      if (event.key === "ArrowRight") {
        if (currentIndex < tabs.length - 1) {
          newIndex = currentIndex + 1
        }
      } else if (event.key === "ArrowLeft") {
        if (currentIndex > 0) {
          newIndex = currentIndex - 1
        }
      }

      if (newIndex !== currentIndex) {
        const nextTab = tabs[newIndex]
        handleTabChange(nextTab.url)
      }
    },
    [tabs, currentTab, handleTabChange],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  return {
    currentTab,
    handleTabChange,
  }
}
