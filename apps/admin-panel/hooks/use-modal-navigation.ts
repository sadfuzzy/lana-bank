import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

interface UseModalNavigationProps {
  onNavigate?: () => void
  closeModal: () => void
}

export const useModalNavigation = ({
  onNavigate,
  closeModal,
}: UseModalNavigationProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const lastPathRef = useRef(pathname)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    if (pathname !== lastPathRef.current) {
      closeModal()
      onNavigate?.()
      setIsNavigating(false)
    }
    lastPathRef.current = pathname
  }, [pathname, closeModal, onNavigate])

  const navigate = useCallback(
    (url: string) => {
      setIsNavigating(true)
      router.push(url)
    },
    [router],
  )

  return { navigate, isNavigating }
}
