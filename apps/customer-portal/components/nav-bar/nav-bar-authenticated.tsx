"use client"
import React, { useState } from "react"
import Link from "next/link"

import { CrossIcon, LavaBankIcon, PersonIcon } from "../icons"
import { Card, CardContent, CardHeader, CardTitle } from "../primitive/card"
import { Button } from "../primitive/button"

export type NavBarAuthenticatedProps = {
  email: string
}

export function NavBarAuthenticated({ email }: NavBarAuthenticatedProps) {
  const [openMenu, setOpenMenu] = useState(false)

  return (
    <>
      <nav
        className={`max-w-[70rem] m-auto flex justify-between items-center mt-2 relative `}
      >
        <div className="flex items-center gap-4">
          <Link href="/">
            <LavaBankIcon />
          </Link>
          <p className="mt-4">Bitcoin Backed Loans</p>
        </div>
        <div className="flex items-center gap-4 p-4">
          <p>{email}</p>
          <div
            onClick={() => {
              setOpenMenu(true)
            }}
            className="border border-primary p-2 rounded-full cursor-pointer"
          >
            <PersonIcon className="w-6 h-6" />
          </div>
          {openMenu && (
            <div className="absolute right-0 top-0 z-20">
              <Card className="w-80 border-none">
                <div className=" flex justify-between items-center p-4">
                  <Button
                    variant="ghost"
                    className="p-1"
                    onClick={() => {
                      setOpenMenu(false)
                    }}
                  >
                    <CrossIcon className="w-6 h-6 " />
                  </Button>
                  <div className="flex justify-end items-center gap-4">
                    <p>{email}</p>
                    <div className="border border-primary p-2 rounded-full">
                      <PersonIcon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <Card variant="transparent">
                  <CardHeader className="pt-0 pb-4">
                    <CardTitle>Account</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex flex-col gap-2 text-sm">
                    <div className="flex  justify-between">
                      <p className="text-textColor-secondary">Email</p>
                      <p>{email}</p>
                    </div>
                    <div className="flex  justify-between">
                      <p className="text-textColor-secondary">Two-Factor Auth</p>
                      <p>Enabled</p>
                    </div>
                    <Button className="mt-4">Logout</Button>
                  </CardContent>
                </Card>
              </Card>
            </div>
          )}
        </div>
      </nav>
      {openMenu && (
        <div
          onClick={() => setOpenMenu(false)}
          className="fixed inset-0 bg-black bg-opacity-65 z-10"
        />
      )}
    </>
  )
}
