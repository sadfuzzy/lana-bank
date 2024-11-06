"use client"

import { toast } from "sonner"

type IDProps = {
  id: string
  type?: string
}

const ID: React.FC<IDProps> = ({ id, type }) => {
  const copyID = () => {
    navigator.clipboard.writeText(id)
    toast.success((type ? type + " " : "") + "ID is copied to clipboard")
  }

  return (
    <div className="text-sm">
      <span className="text-mono">{id.slice(0, 7)}...</span>
      <span className="text-blue-600 cursor-pointer" onClick={copyID}>
        Copy ID
      </span>
    </div>
  )
}

export default ID
