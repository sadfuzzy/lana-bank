"use client"
import { useState } from "react"

import { CheckMarkIcon, CopyIcon } from "@/components/icons"

import { Button } from "@/components/primitive/button"

function CopyButton({ value }: { value: string }) {
  const [hasCopied, setHasCopied] = useState(false)

  return (
    <Button
      className="p-1 rounded-md bg-secondary-foreground text-textColor-primary"
      onClick={() => {
        navigator.clipboard.writeText(value)
        setHasCopied(true)
        setTimeout(() => {
          setHasCopied(false)
        }, 1000)
      }}
    >
      {hasCopied ? (
        <CheckMarkIcon className="h-4 w-4" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
    </Button>
  )
}

export { CopyButton }
