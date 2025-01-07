/* eslint-disable no-empty-function */
"use client"

import { useState, useContext, createContext } from "react"
import { HiPlus } from "react-icons/hi"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

import { CreateCustomerDialog } from "./customers/create"
import { CreateDepositDialog } from "./deposits/create"
import { WithdrawalInitiateDialog } from "./withdrawals/initiate"
import { CreateCreditFacilityDialog } from "./credit-facilities/create"

import { CreditFacilityPartialPaymentDialog } from "./credit-facilities/partial-payment"
import { CreateUserDialog } from "./users/create"
import { CreateTermsTemplateDialog } from "./terms-templates/create"
import { CreateCommitteeDialog } from "./committees/create"
import CustomerSelector from "./customers/selector"

import { CreditFacilityDisbursalInitiateDialog } from "./disbursals/create"

import { CreditFacility, Customer, CreditFacilityStatus } from "@/lib/graphql/generated"
import { Button } from "@/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu"

export const PATH_CONFIGS = {
  COMMITTEES: "/committees",
  COMMITTEE_DETAILS: /^\/committees\/[^/]+/,

  CREDIT_FACILITIES: "/credit-facilities",
  CREDIT_FACILITY_DETAILS: /^\/credit-facilities\/[^/]+/,

  CUSTOMERS: "/customers",
  CUSTOMER_DETAILS: /^\/customers\/[^/]+/,

  DASHBOARD: "/dashboard",

  DEPOSITS: "/deposits",

  USERS: "/users",
  USER_DETAILS: /^\/users\/[^/]+/,

  TERMS_TEMPLATES: "/terms-templates",
  TERMS_TEMPLATE_DETAILS: /^\/terms-templates\/[^/]+/,

  WITHDRAWALS: "/withdrawals",
  WITHDRAW_DETAILS: /^\/withdrawals\/[^/]+/,
}

const showCreateButton = (currentPath: string) => {
  const allowedPaths = Object.values(PATH_CONFIGS)
  return allowedPaths.some((path) => {
    if (typeof path === "string") {
      return path === currentPath
    } else if (path instanceof RegExp) {
      return path.test(currentPath)
    }
    return false
  })
}

const isItemAllowedOnCurrentPath = (
  allowedPaths: (string | RegExp)[],
  currentPath: string,
) => {
  if (currentPath === PATH_CONFIGS.DASHBOARD) return true
  return allowedPaths.some((path) => {
    if (typeof path === "string") {
      return path === currentPath
    } else if (path instanceof RegExp) {
      return path.test(currentPath)
    }
    return false
  })
}

type MenuItem = {
  label: string
  onClick: () => void
  dataTestId: string
  allowedPaths: (string | RegExp)[]
  conditions?: () => boolean | undefined
}

const CreateButton = () => {
  const [createCustomer, setCreateCustomer] = useState(false)
  const [createDeposit, setCreateDeposit] = useState(false)
  const [createWithdrawal, setCreateWithdrawal] = useState(false)
  const [createFacility, setCreateFacility] = useState(false)
  const [initiateDisbursal, setInitiateDisbursal] = useState(false)
  const [makePayment, setMakePayment] = useState(false)
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false)
  const [openCreateTermsTemplateDialog, setOpenCreateTermsTemplateDialog] =
    useState(false)
  const [openCreateCommitteeDialog, setOpenCreateCommitteeDialog] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const { customer, facility, setCustomer } = useCreateContext()
  const [openCustomerSelector, setOpenCustomerSelector] = useState(false)

  const pathName = usePathname()
  const userIsInCustomerDetailsPage = Boolean(pathName.match(/^\/customers\/.+$/))
  const setCustomerToNullIfNotInCustomerDetails = () => {
    if (!userIsInCustomerDetailsPage) setCustomer(null)
  }

  const menuItems: MenuItem[] = [
    {
      label: "Deposit",
      onClick: () => {
        if (!customer) setOpenCustomerSelector(true)
        setCreateDeposit(true)
      },
      dataTestId: "create-deposit-button",
      allowedPaths: [PATH_CONFIGS.CUSTOMER_DETAILS, PATH_CONFIGS.DEPOSITS],
    },
    {
      label: "Withdrawal",
      onClick: () => {
        if (!customer) setOpenCustomerSelector(true)
        setCreateWithdrawal(true)
      },
      dataTestId: "create-withdrawal-button",
      allowedPaths: [
        PATH_CONFIGS.CUSTOMER_DETAILS,
        PATH_CONFIGS.WITHDRAWALS,
        PATH_CONFIGS.WITHDRAW_DETAILS,
      ],
    },
    {
      label: "Customer",
      onClick: () => setCreateCustomer(true),
      dataTestId: "create-customer-button",
      allowedPaths: [PATH_CONFIGS.CUSTOMERS, PATH_CONFIGS.CUSTOMER_DETAILS],
    },
    {
      label: "Credit Facility",
      onClick: () => {
        if (!customer) setOpenCustomerSelector(true)
        setCreateFacility(true)
      },
      dataTestId: "create-credit-facility-button",
      allowedPaths: [
        PATH_CONFIGS.CUSTOMER_DETAILS,
        PATH_CONFIGS.CREDIT_FACILITIES,
        PATH_CONFIGS.CREDIT_FACILITY_DETAILS,
      ],
    },
    {
      label: "Disbursal",
      onClick: () => {
        if (!facility) {
          toast.message("Please select a credit facility first")
          return
        }
        setInitiateDisbursal(true)
      },
      dataTestId: "initiate-disbursal-button",
      allowedPaths: [PATH_CONFIGS.CREDIT_FACILITY_DETAILS],
      conditions: () =>
        facility?.subjectCanInitiateDisbursal &&
        facility?.status === CreditFacilityStatus.Active,
    },
    {
      label: "Payment",
      onClick: () => {
        if (!facility) {
          toast.message("Please select a credit facility first")
          return
        }
        setMakePayment(true)
      },
      dataTestId: "make-payment-button",
      allowedPaths: [PATH_CONFIGS.CREDIT_FACILITY_DETAILS],
      conditions: () =>
        facility?.subjectCanRecordPayment &&
        facility?.status === CreditFacilityStatus.Active,
    },
    {
      label: "User",
      onClick: () => setOpenCreateUserDialog(true),
      dataTestId: "create-user-button",
      allowedPaths: [PATH_CONFIGS.USERS, PATH_CONFIGS.USER_DETAILS],
    },
    {
      label: "Terms Template",
      onClick: () => setOpenCreateTermsTemplateDialog(true),
      dataTestId: "create-terms-template-button",
      allowedPaths: [PATH_CONFIGS.TERMS_TEMPLATES, PATH_CONFIGS.TERMS_TEMPLATE_DETAILS],
    },
    {
      label: "Committee",
      onClick: () => setOpenCreateCommitteeDialog(true),
      dataTestId: "create-committee-button",
      allowedPaths: [PATH_CONFIGS.COMMITTEES, PATH_CONFIGS.COMMITTEE_DETAILS],
    },
  ]

  let creationType = ""
  if (createDeposit) creationType = "Deposit"
  if (createWithdrawal) creationType = "Withdrawal"
  if (createFacility) creationType = "Credit Facility"

  const decideCreation = () => {
    setShowMenu(false)

    const allowedItems = menuItems.filter((item) => {
      const isAllowedOnPath = isItemAllowedOnCurrentPath(item.allowedPaths, pathName)
      const meetsConditions = !item.conditions || item.conditions()
      return isAllowedOnPath && meetsConditions
    })

    if (allowedItems.length === 1) {
      allowedItems[0].onClick()
      return
    }

    if (pathName === "/customers") {
      setCreateCustomer(true)
    } else if (pathName === "/users") {
      setOpenCreateUserDialog(true)
    } else if (pathName === "/terms-templates") {
      setOpenCreateTermsTemplateDialog(true)
    } else if (pathName === "/committees") {
      setOpenCreateCommitteeDialog(true)
    } else if (pathName === "/deposits") {
      if (!customer) setOpenCustomerSelector(true)
      setCreateDeposit(true)
    } else if (pathName === "/withdrawals") {
      if (!customer) setOpenCustomerSelector(true)
      setCreateWithdrawal(true)
    } else if (pathName === "/credit-facilities") {
      if (!customer) setOpenCustomerSelector(true)
      setCreateFacility(true)
    } else if (pathName === "/disbursals") {
      toast.message("Disbursals can be initiated from credit facility page")
    } else if (allowedItems.length > 1) {
      setShowMenu(true)
    }
  }

  if (!showCreateButton(pathName))
    return <div className="invisible w-[88px] h-[36px]" aria-hidden="true" />

  return (
    <>
      <DropdownMenu
        open={showMenu}
        onOpenChange={(open) => {
          if (open) decideCreation()
          else setShowMenu(false)
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button data-testid="global-create-button">
            <HiPlus className="h-4 w-4" />
            Create
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          {menuItems
            .filter(
              (item) =>
                isItemAllowedOnCurrentPath(item.allowedPaths, pathName) &&
                (!item.conditions || item.conditions()),
            )
            .map((item) => (
              <DropdownMenuItem
                data-testid={item.dataTestId}
                key={item.label}
                onClick={item.onClick}
                className="cursor-pointer"
              >
                {item.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomerSelector
        show={openCustomerSelector}
        setShow={setOpenCustomerSelector}
        setCustomer={setCustomer}
        onClose={() => {
          setCustomer(null)
          setCreateDeposit(false)
          setCreateWithdrawal(false)
          setCreateFacility(false)
        }}
        title={`Select customer for ${creationType}`}
      />

      <CreateCustomerDialog
        setOpenCreateCustomerDialog={setCreateCustomer}
        openCreateCustomerDialog={createCustomer}
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
            customerId={customer.customerId}
          />

          <WithdrawalInitiateDialog
            openWithdrawalInitiateDialog={createWithdrawal}
            setOpenWithdrawalInitiateDialog={() => {
              setCustomerToNullIfNotInCustomerDetails()
              setCreateWithdrawal(false)
            }}
            customerId={customer.customerId}
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

export default CreateButton

type ICustomer = Customer | null
type IFacility = CreditFacility | null

type CreateContext = {
  customer: ICustomer
  facility: IFacility
  setCustomer: React.Dispatch<React.SetStateAction<ICustomer>>
  setFacility: React.Dispatch<React.SetStateAction<IFacility>>
}

const CreateContext = createContext<CreateContext>({
  customer: null,
  facility: null,
  setCustomer: () => {},
  setFacility: () => {},
})

export const CreateContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [customer, setCustomer] = useState<ICustomer>(null)
  const [facility, setFacility] = useState<IFacility>(null)

  return (
    <CreateContext.Provider
      value={{
        customer,
        facility,
        setCustomer,
        setFacility,
      }}
    >
      {children}
    </CreateContext.Provider>
  )
}

export const useCreateContext = () => useContext(CreateContext)
