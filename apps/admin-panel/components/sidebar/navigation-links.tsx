"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { IoPerson, IoReceipt, IoCash, IoDocument } from "react-icons/io5"
import { MdAccountTree } from "react-icons/md"

const navLinks = [
  { href: "/loan", label: "Loan", icon: IoReceipt },
  { href: "/customer", label: "customers", icon: IoPerson },
  { href: "/trial-balance", label: "Trial Balance", icon: IoCash },
  {
    href: "/chart-of-accounts",
    label: "Chart of Accounts",
    icon: MdAccountTree,
  },
  { href: "/terms", label: "Terms", icon: IoDocument },
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
