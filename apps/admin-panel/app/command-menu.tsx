"use client"

import React from "react"
import { usePathname, useRouter } from "next/navigation"
import { HiPlus } from "react-icons/hi"

import { CreateCustomerDialog } from "./customers/create"
import { CreateDepositDialog } from "./deposits/create"
import { WithdrawalInitiateDialog } from "./withdrawals/initiate"
import { CreateCreditFacilityDialog } from "./credit-facilities/create"
import { CreditFacilityPartialPaymentDialog } from "./credit-facilities/partial-payment"
import { CreateUserDialog } from "./users/create"
import { CreateTermsTemplateDialog } from "./terms-templates/create"
import { CreateCommitteeDialog } from "./committees/create"
import { CreditFacilityDisbursalInitiateDialog } from "./disbursals/create"

import { PATH_CONFIGS, useCreateContext } from "./create"

import {
  navDashboardItems,
  navLoansItems,
  navCustomersItems,
  navTransactionItems,
  navAdminItems,
  navFinanceItems,
} from "@/components/app-sidebar/nav-items"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/ui/command"
import { CreditFacilityStatus } from "@/lib/graphql/generated"

const isItemAllowedOnCurrentPath = (
  allowedPaths: (string | RegExp)[],
  currentPath: string,
) => {
  return allowedPaths.some((path) => {
    if (typeof path === "string") {
      return path === currentPath
    } else if (path instanceof RegExp) {
      return path.test(currentPath)
    }
    return false
  })
}

const allNavItems = [
  ...navDashboardItems,
  ...navLoansItems,
  ...navCustomersItems,
  ...navTransactionItems,
  ...navAdminItems,
  ...navFinanceItems,
]

const CommandMenu = () => {
  const router = useRouter()
  const pathName = usePathname()

  const [open, setOpen] = React.useState(false)
  const [pages, setPages] = React.useState<"main" | "navigation">("main")

  const [createCustomer, setCreateCustomer] = React.useState(false)
  const [createDeposit, setCreateDeposit] = React.useState(false)
  const [createWithdrawal, setCreateWithdrawal] = React.useState(false)
  const [createFacility, setCreateFacility] = React.useState(false)
  const [initiateDisbursal, setInitiateDisbursal] = React.useState(false)
  const [makePayment, setMakePayment] = React.useState(false)
  const [openCreateUserDialog, setOpenCreateUserDialog] = React.useState(false)
  const [openCreateTermsTemplateDialog, setOpenCreateTermsTemplateDialog] =
    React.useState(false)
  const [openCreateCommitteeDialog, setOpenCreateCommitteeDialog] = React.useState(false)

  const { customer, facility, setCustomer } = useCreateContext()

  const userIsInCustomerDetailsPage = Boolean(pathName.match(/^\/customers\/.+$/))
  const setCustomerToNullIfNotInCustomerDetails = () => {
    if (!userIsInCustomerDetailsPage) setCustomer(null)
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPages("main")
        setOpen((open) => !open)
      }
      if (e.shiftKey && e.key === "N") {
        const activeElement = document.activeElement?.tagName?.toLowerCase()
        const ignoredElements = ["input", "textarea", "select"]
        if (activeElement && !ignoredElements.includes(activeElement)) {
          e.preventDefault()
          setOpen((open) => !open)
          setPages("navigation")
        }
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const menuItems = [
    {
      label: "Create Deposit",
      icon: HiPlus,
      action: () => {
        if (!customer) return
        setCreateDeposit(true)
        setOpen(false)
      },
      allowedPaths: [PATH_CONFIGS.CUSTOMER_DETAILS],
    },
    {
      label: "Create Withdrawal",
      icon: HiPlus,
      action: () => {
        if (!customer) return
        setCreateWithdrawal(true)
        setOpen(false)
      },
      allowedPaths: [PATH_CONFIGS.CUSTOMER_DETAILS],
    },
    {
      label: "Create Customer",
      icon: HiPlus,
      action: () => {
        setCreateCustomer(true)
        setOpen(false)
      },
      allowedPaths: [PATH_CONFIGS.CUSTOMERS, PATH_CONFIGS.CUSTOMER_DETAILS],
    },
    {
      label: "Create Credit Facility",
      icon: HiPlus,
      action: () => {
        if (!customer) return
        setCreateFacility(true)
        setOpen(false)
      },
      allowedPaths: [PATH_CONFIGS.CUSTOMER_DETAILS],
    },
    {
      label: "Create Disbursal",
      icon: HiPlus,
      action: () => {
        if (!facility) return
        setInitiateDisbursal(true)
        setOpen(false)
      },
      allowedPaths: [PATH_CONFIGS.CREDIT_FACILITY_DETAILS],
      condition: () => facility?.status === CreditFacilityStatus.Active,
    },
    {
      label: "Make Payment",
      icon: HiPlus,
      action: () => {
        if (!facility) return
        setMakePayment(true)
        setOpen(false)
      },
      allowedPaths: [PATH_CONFIGS.CREDIT_FACILITY_DETAILS],
      condition: () => facility?.status === CreditFacilityStatus.Active,
    },
    {
      label: "Create User",
      icon: HiPlus,
      action: () => {
        setOpenCreateUserDialog(true)
        setOpen(false)
      },
      allowedPaths: [PATH_CONFIGS.USERS, PATH_CONFIGS.USER_DETAILS],
    },
    {
      label: "Create Terms Template",
      icon: HiPlus,
      action: () => {
        setOpenCreateTermsTemplateDialog(true)
        setOpen(false)
      },
      allowedPaths: [PATH_CONFIGS.TERMS_TEMPLATES, PATH_CONFIGS.TERMS_TEMPLATE_DETAILS],
    },
    {
      label: "Create Committee",
      icon: HiPlus,
      action: () => {
        setOpenCreateCommitteeDialog(true)
        setOpen(false)
      },
      allowedPaths: [PATH_CONFIGS.COMMITTEES, PATH_CONFIGS.COMMITTEE_DETAILS],
    },
  ]

  const availableItems = menuItems.filter((item) =>
    isItemAllowedOnCurrentPath(item.allowedPaths, pathName),
  )

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder={
              pages === "navigation" ? "Search navigation..." : "What do you need?"
            }
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {pages === "main" ? (
              <>
                {availableItems.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Available Actions">
                      {availableItems.map((item) => (
                        <CommandItem
                          key={item.label}
                          disabled={item.condition && !item.condition()}
                          onSelect={() => {
                            item.action()
                          }}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}

                <CommandSeparator />

                <CommandGroup
                  heading={
                    <div className="flex items-center justify-between">
                      <span>Navigation</span>
                      <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">Shift +</span>N
                      </kbd>
                    </div>
                  }
                >
                  {allNavItems.map((item) => (
                    <CommandItem
                      key={item.url}
                      onSelect={() => {
                        router.push(item.url)
                        setOpen(false)
                      }}
                      className="flex items-center gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : (
              <CommandGroup heading="Navigation">
                {allNavItems.map((item) => (
                  <CommandItem
                    key={item.url}
                    onSelect={() => {
                      setOpen(false)
                      router.push(item.url)
                    }}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>

      <CreateCustomerDialog
        openCreateCustomerDialog={createCustomer}
        setOpenCreateCustomerDialog={setCreateCustomer}
      />

      <CreateUserDialog
        openCreateUserDialog={openCreateUserDialog}
        setOpenCreateUserDialog={setOpenCreateUserDialog}
      />

      <CreateTermsTemplateDialog
        openCreateTermsTemplateDialog={openCreateTermsTemplateDialog}
        setOpenCreateTermsTemplateDialog={setOpenCreateTermsTemplateDialog}
      />

      <CreateCommitteeDialog
        openCreateCommitteeDialog={openCreateCommitteeDialog}
        setOpenCreateCommitteeDialog={setOpenCreateCommitteeDialog}
      />

      {customer && (
        <>
          <CreateDepositDialog
            openCreateDepositDialog={createDeposit}
            setOpenCreateDepositDialog={() => {
              setCustomerToNullIfNotInCustomerDetails()
              setCreateDeposit(false)
            }}
            depositAccountId={customer.depositAccount.depositAccountId}
          />

          <WithdrawalInitiateDialog
            openWithdrawalInitiateDialog={createWithdrawal}
            setOpenWithdrawalInitiateDialog={() => {
              setCustomerToNullIfNotInCustomerDetails()
              setCreateWithdrawal(false)
            }}
            depositAccountId={customer.depositAccount.depositAccountId}
          />

          <CreateCreditFacilityDialog
            openCreateCreditFacilityDialog={createFacility}
            setOpenCreateCreditFacilityDialog={() => {
              setCustomerToNullIfNotInCustomerDetails()
              setCreateFacility(false)
            }}
            customerId={customer.customerId}
          />
        </>
      )}

      {facility && (
        <>
          <CreditFacilityDisbursalInitiateDialog
            creditFacilityId={facility.creditFacilityId}
            openDialog={initiateDisbursal}
            setOpenDialog={() => {
              setInitiateDisbursal(false)
            }}
          />

          <CreditFacilityPartialPaymentDialog
            creditFacilityId={facility.creditFacilityId}
            openDialog={makePayment}
            setOpenDialog={() => {
              setMakePayment(false)
            }}
          />
        </>
      )}
    </>
  )
}

export { CommandMenu }
