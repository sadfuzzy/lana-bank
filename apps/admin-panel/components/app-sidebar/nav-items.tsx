import {
  Home,
  TriangleAlert,
  Users,
  ClipboardList,
  UserCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Globe,
  PieChart,
  DollarSign,
  LineChart,
  Users2,
  GanttChart,
  BookText,
  FileText,
  LayoutTemplate,
  Grid2x2,
} from "lucide-react"

import type { NavItem } from "./nav-section"

export const navDashboardItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Actions", url: "/actions", icon: TriangleAlert },
]

export const navLoansItems: NavItem[] = [
  { title: "Term Templates", url: "/terms-templates", icon: LayoutTemplate },
  { title: "Credit Facilities", url: "/credit-facilities", icon: Grid2x2 },
  { title: "Disbursals", url: "/disbursals", icon: ClipboardList },
]

export const navCustomersItems: NavItem[] = [
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Policies", url: "/policies", icon: GanttChart },
]

export const navTransactionItems: NavItem[] = [
  { title: "Deposits", url: "/deposits", icon: ArrowDownCircle },
  { title: "Withdrawals", url: "/withdrawals", icon: ArrowUpCircle },
]

export const navAdminItems: NavItem[] = [
  { title: "Users", url: "/users", icon: UserCircle },
  { title: "Commities", url: "/committees", icon: Users2 },
  { title: "Audit Logs", url: "/audit", icon: BookText },
]

export const navFinanceItems: NavItem[] = [
  {
    title: "Regulatory Reporting",
    url: "/regulatory-reporting/customers",
    icon: FileText,
  },
  { title: "Chart of Accounts", url: "/chart-of-accounts", icon: Globe },
  { title: "Balance Sheet", url: "/balance-sheet", icon: PieChart },
  { title: "Profit & Loss", url: "/profit-and-loss", icon: DollarSign },
  { title: "Trial Balance", url: "/trial-balance", icon: LineChart },
]
