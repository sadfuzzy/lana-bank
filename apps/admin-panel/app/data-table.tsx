"use client"

import React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/primitive/skeleton"

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
}

const DataTable = <T extends Record<string, unknown>>({
  data,
  columns,
  className,
  headerClassName,
  rowClassName,
  cellClassName,
  onRowClick,
  emptyMessage = "No data available",
  loading = false,
}: DataTableProps<T>) => {
  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <Table className={className}>
          <TableHeader>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!data.length) {
    return <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table className={className}>
        <TableHeader>
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default DataTable
