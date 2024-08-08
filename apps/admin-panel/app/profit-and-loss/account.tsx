"use client"
import { gql } from "@apollo/client"
import { useState } from "react"

import { IoCaretDownSharp, IoCaretForwardSharp } from "react-icons/io5"

import {
  AccountSetSubAccountWithBalance,
  usePnlAccountSetWithBalanceQuery,
} from "@/lib/graphql/generated"
import Balance, { Currency } from "@/components/balance/balance"
import { TableCell, TableRow } from "@/components/primitive/table"

gql`
  query PnlAccountSetWithBalance($accountSetId: UUID!, $first: Int!, $after: String) {
    accountSetWithBalance(accountSetId: $accountSetId) {
      id
      name
      balance {
        ...balancesByCurrency
      }
      subAccounts(first: $first, after: $after) {
        edges {
          cursor
          node {
            __typename
            ... on AccountWithBalance {
              __typename
              id
              name
              balance {
                ...balancesByCurrency
              }
            }
            ... on AccountSetWithBalance {
              __typename
              id
              name
              hasSubAccounts
              balance {
                ...balancesByCurrency
              }
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`

export const Account = ({
  account,
  currency,
  depth = 0,
  layer,
}: {
  account: AccountSetSubAccountWithBalance
  currency: Currency
  depth?: number
  layer: Layers
}) => {
  const [showingSubAccounts, setShowingSubAccounts] = useState(false)
  const hasSubAccounts =
    account.__typename === "AccountSetWithBalance" && account.hasSubAccounts

  return (
    <>
      <TableRow
        key={account.id}
        className={hasSubAccounts ? "cursor-pointer" : ""}
        onClick={() => setShowingSubAccounts((toggle) => !toggle)}
      >
        <TableCell className="flex items-center">
          {Array.from({ length: depth }).map((_, i) => (
            <div key={i} className="w-8" />
          ))}
          <div className="w-8">
            {hasSubAccounts &&
              (showingSubAccounts ? <IoCaretDownSharp /> : <IoCaretForwardSharp />)}
          </div>
          <div>{account.name}</div>
        </TableCell>
        <TableCell>
          <Balance
            currency={currency}
            amount={account.balance[currency][layer].netCredit}
          />
        </TableCell>
      </TableRow>

      {hasSubAccounts && showingSubAccounts && (
        <SubAccountsForAccountSet
          currency={currency}
          account={account}
          depth={depth}
          layer={layer}
        />
      )}
    </>
  )
}

const SubAccountsForAccountSet = ({
  account,
  depth = 0,
  currency,
  layer,
}: {
  account: AccountSetSubAccountWithBalance
  depth?: number
  currency: Currency
  layer: Layers
}) => {
  const { data, fetchMore } = usePnlAccountSetWithBalanceQuery({
    variables: {
      accountSetId: account.id,
      first: 2,
    },
  })

  const hasMoreSubAccounts = data?.accountSetWithBalance?.subAccounts.pageInfo.hasNextPage
  const subAccounts = data?.accountSetWithBalance?.subAccounts.edges

  return (
    <>
      {subAccounts?.map((subAccount) => (
        <Account
          currency={currency}
          key={subAccount.node.id}
          account={subAccount.node}
          depth={depth + 1}
          layer={layer}
        />
      ))}
      {hasMoreSubAccounts && subAccounts && (
        <TableRow>
          <TableCell
            className="flex items-center cursor-pointer"
            onClick={() =>
              fetchMore({
                variables: {
                  after: subAccounts[subAccounts.length - 1].cursor,
                },
              })
            }
          >
            {Array.from({ length: depth + 1 }).map((_, i) => (
              <div key={i} className="w-8" />
            ))}
            <div className="w-8" />
            <div className="font-thin italic">show more...</div>
          </TableCell>
          <TableCell></TableCell>
        </TableRow>
      )}
    </>
  )
}
