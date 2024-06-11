"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/loan", label: "Loan" },
  { href: "/user", label: "User" },
]

const NavigationLinks = () => {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-4 text-textColor-secondary">
      {navLinks.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          prefetch={false}
          className={`hover:text-textColor-primary ${pathname === link.href && "text-primary"}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

export { NavigationLinks }
