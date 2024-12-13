"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table"
import { Button } from "@/ui/button"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/ui/skeleton"

export type Column<T> = {
  [K in keyof T]: {
    key: K
    header: string | React.ReactNode
    width?: string
    align?: "left" | "center" | "right"
    render?: (value: T[K], record: T) => React.ReactNode
  }
}[keyof T]

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  className?: string
  headerClassName?: string
  rowClassName?: string | ((item: T, index: number) => string)
  cellClassName?: string | ((column: Column<T>, item: T) => string)
  onRowClick?: (item: T) => void
  emptyMessage?: React.ReactNode
  loading?: boolean
  navigateTo?: (record: T) => string
}

const DataTable = <T,>({
  data,
  columns,
  className,
  headerClassName,
  rowClassName,
  cellClassName,
  onRowClick,
  emptyMessage = "No data to display",
  loading = false,
  navigateTo,
}: DataTableProps<T>) => {
  if (loading) {
    return (
      <div className="w-full overflow-x-auto border rounded-md">
        <Table className={className}>
          <TableHeader className="bg-secondary [&_tr:hover]:!bg-secondary">
            <TableRow className={headerClassName}>
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </TableHead>
              ))}
              {navigateTo && <TableHead className="w-24"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
                {navigateTo && (
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!data.length) {
    return <div className="text-sm">{emptyMessage}</div>
  }

  return (
    <div className="w-full overflow-x-auto border rounded-md">
      <Table className={className}>
        <TableHeader className="bg-secondary [&_tr:hover]:!bg-secondary">
          <TableRow className={headerClassName}>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn(
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                )}
                style={{ width: column.width }}
              >
                {column.header}
              </TableHead>
            ))}
            {navigateTo && <TableHead className="w-24"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow
              data-testid={`table-row-${rowIndex}`}
              key={rowIndex}
              onClick={() => onRowClick?.(item)}
              className={cn(
                typeof rowClassName === "function"
                  ? rowClassName(item, rowIndex)
                  : rowClassName,
                onRowClick && "cursor-pointer",
              )}
            >
              {columns.map((column, colIndex) => (
                <TableCell
                  key={colIndex}
                  className={cn(
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    typeof cellClassName === "function"
                      ? cellClassName(column, item)
                      : cellClassName,
                  )}
                >
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key])}
                </TableCell>
              ))}
              {navigateTo && (
                <TableCell>
                  <Link href={navigateTo(item)}>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-between"
                    >
                      View
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTable
