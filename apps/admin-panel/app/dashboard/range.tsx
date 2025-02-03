"use client"

import { LuChevronDown } from "react-icons/lu"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lana/web/ui/dropdown-menu"

export type TimeRange =
  | "LastDay"
  | "LastWeek"
  | "LastMonth"
  | "LastQuarter"
  | "LastYear"
  | "AllTime"

type TimeRangeSelectProps = {
  range: TimeRange
  setRange: React.Dispatch<React.SetStateAction<TimeRange>>
}

const TimeRangeSelect: React.FC<TimeRangeSelectProps> = ({ range, setRange }) => {
  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: "Last Day", value: "LastDay" },
    { label: "Last Week", value: "LastWeek" },
    { label: "Last Month", value: "LastMonth" },
    { label: "Last Quarter", value: "LastQuarter" },
    { label: "Last Year", value: "LastYear" },
    { label: "All Time", value: "AllTime" },
  ]

  const selectedLabel = timeRanges.find((tr) => tr.value === range)?.label || ""

  return (
    <div className="absolute top-0 right-0 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex justify-between items-center px-2 py-1 text-sm font-medium border bg-background rounded-tl-none rounded-br-none rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none">
          {selectedLabel}
          <LuChevronDown className="w-4 h-4 ml-2" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {timeRanges.map((tr) => (
            <DropdownMenuItem
              key={tr.value}
              onClick={() => setRange(tr.value)}
              className={range === tr.value ? "bg-accent" : ""}
            >
              {tr.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default TimeRangeSelect
