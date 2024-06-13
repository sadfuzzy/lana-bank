import React, { ReactNode } from "react"

const PageHeading = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <title>{children}</title>
      <h1 className="scroll-m-20 pb-8 text-4xl font-semibold tracking-tight first:mt-0">
        {children}
      </h1>
    </>
  )
}
export { PageHeading }
