"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  IoPersonOutline,
  IoReceiptOutline,
  IoCashOutline,
  IoDocumentOutline,
} from "react-icons/io5"
import { RiAdminLine } from "react-icons/ri"
import { MdAccountTree } from "react-icons/md"

const navLinks = [
  { href: "/customer", label: "Customers", icon: IoPersonOutline },
  { href: "/loan", label: "Loan", icon: IoReceiptOutline },
  { href: "/trial-balance", label: "Trial Balance", icon: IoCashOutline },
  {
    href: "/chart-of-accounts",
    label: "Chart of Accounts",
    icon: MdAccountTree,
  },
  { href: "/terms", label: "Terms", icon: IoDocumentOutline },
  { href: "/users", label: "Users", icon: RiAdminLine },
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
          <div className="flex items-center gap-4 rounded-md">
            <link.icon className="w-4 h-4" />
            {link.label}
          </div>
        </Link>
      ))}
    </nav>
  )
}

export { NavigationLinks }
