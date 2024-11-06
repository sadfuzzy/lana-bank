"use client"

import { useEffect, useRef } from "react"

import { Input } from "@/components/primitive/input"

const SearchInput: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "k" && (event.ctrlKey || event.metaKey)) || event.key === "/") {
        inputRef.current?.focus()
        event.preventDefault()
      } else if (event.key === "Escape" || event.key === "Esc") {
        inputRef?.current?.blur()
        event.preventDefault()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder="Hit '/' or click here to search for customers or credit facilities"
    />
  )
}

export { SearchInput }
