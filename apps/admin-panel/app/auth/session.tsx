"use client"

import {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
  useMemo,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import dynamic from "next/dynamic"

import { AppLayout } from "../app-layout"

import { getSession, logoutUser } from "./ory"

const AuthenticatedStore = createContext({
  // eslint-disable-next-line no-empty-function
  logoutInAuthState: () => {},
})

type Props = {
  children: React.ReactNode
}

const AuthenticatedGuard: React.FC<Props> = ({ children }) => {
  const router = useRouter()
  const pathName = usePathname()

  const [isAuthSetInLocalStorage, setIsAuthSetInLocalStorage] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const logoutInAuthState = useMemo(
    () => () => {
      setIsAuthSetInLocalStorage(false)
      setIsAuthenticated(false)
      if (typeof window !== "undefined") {
        localStorage.removeItem("isAuthenticated")
      }
    },
    [setIsAuthSetInLocalStorage, setIsAuthenticated],
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authFromLocalStorage = localStorage.getItem("isAuthenticated")
      setIsAuthSetInLocalStorage(!!authFromLocalStorage)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        await getSession()
        setIsAuthenticated(true)

        if (typeof window !== "undefined") {
          localStorage.setItem("isAuthenticated", "true")
        }
        if (pathName === "/") router.push("/dashboard")
      } catch (error) {
        setIsAuthenticated(false)
        if (typeof window !== "undefined") {
          localStorage.removeItem("isAuthenticated")
        }
        if (!pathName.startsWith("/auth")) router.push("/auth/login")
      }
    })()
  }, [pathName, router])

  const Stack =
    isAuthenticated || (isAuthenticated === null && isAuthSetInLocalStorage) ? (
      // If we know the user is authenticated or is marked authenticated in localStorage
      <AppLayout>{children}</AppLayout>
    ) : (
      // Otherwise, just render the children (loading states, or unauthenticated routes)
      <main className="h-screen w-full flex flex-col">{children}</main>
    )

  return (
    <AuthenticatedStore.Provider value={{ logoutInAuthState }}>
      {Stack}
    </AuthenticatedStore.Provider>
  )
}

export const Authenticated = dynamic(() => Promise.resolve(AuthenticatedGuard), {
  ssr: false,
})

export const useLogout = () => {
  const router = useRouter()
  const { logoutInAuthState } = useContext(AuthenticatedStore)

  const logout = useCallback(async () => {
    await logoutUser()
    logoutInAuthState()
    router.push("/")
  }, [router, logoutInAuthState])

  return { logout }
}
