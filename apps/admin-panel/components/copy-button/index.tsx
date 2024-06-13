"use client"
import { useState } from "react"

import { Button } from "../primitive/button"
import { CheckMark, Copy } from "../icons"

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
      {hasCopied ? <CheckMark className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}

export { CopyButton }
