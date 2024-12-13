import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import {
  HiChevronUp,
  HiChevronDown,
  HiSelector,
  HiChevronLeft,
  HiChevronRight,
  HiFilter,
} from "react-icons/hi"

import { Separator } from "../../ui/separator"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/ui/dropdown-menu"
import { Button } from "@/ui/button"
import { Skeleton } from "@/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table"

export type Column<T> = {
  [K in keyof T]: {
    key: K
    label: string
    sortable?: boolean
    filterValues?: Array<T[K]>
    render?: (value: T[K], record: T) => React.ReactNode
  }
}[keyof T]

interface PageInfo {
  endCursor: string
  startCursor: string
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedData<T> {
  edges: { node: T; cursor: string }[]
  pageInfo: PageInfo
}

interface PaginatedTableProps<T> {
  columns: Column<T>[]
  loading: boolean
  data?: PaginatedData<T>
  pageSize: number
  fetchMore: (cursor: string) => Promise<unknown>
  onSort?: (column: keyof T, sortDirection: "ASC" | "DESC") => void
  onFilter?: (column: keyof T, value: T[keyof T] | undefined) => void
  onClick?: (record: T) => void
  showHeader?: boolean
  navigateTo?: (record: T) => string
}

const PaginatedTable = <T,>({
  columns,
  loading,
  data,
  pageSize,
  fetchMore,
  onSort,
  onFilter,
  onClick,
  showHeader = true,
  navigateTo,
}: PaginatedTableProps<T>): React.ReactElement => {
  const [sortState, setSortState] = useState<{
    column: keyof T | null
    direction: "ASC" | "DESC" | null
  }>({ column: null, direction: null })

  const [filterState, setFilterState] = useState<Partial<Record<keyof T, T[keyof T]>>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [displayData, setDisplayData] = useState<{ node: T }[]>([])

  useEffect(() => {
    const startIdx = (currentPage - 1) * pageSize
    const endIdx = startIdx + pageSize
    data && setDisplayData(data.edges.slice(startIdx, endIdx))
  }, [data, currentPage, pageSize])

  const handleSort = (columnKey: keyof T) => {
    let newDirection: "ASC" | "DESC" = "ASC"
    if (sortState.column === columnKey && sortState.direction === "ASC") {
      newDirection = "DESC"
    }
    setSortState({ column: columnKey, direction: newDirection })
    onSort && onSort(columnKey, newDirection)
  }

  const handleFilter = (columnKey: keyof T, value: T[keyof T] | undefined) => {
    setFilterState({ [columnKey]: value } as Partial<Record<keyof T, T[keyof T]>>)
    onFilter && onFilter(columnKey, value)
  }

  const handleNextPage = async () => {
    const totalDataLoaded = data?.edges.length || 0
    const maxDataRequired = currentPage * pageSize + pageSize

    if (totalDataLoaded < maxDataRequired && data && data.pageInfo.hasNextPage) {
      await fetchMore(data.pageInfo.endCursor)
    }
    setCurrentPage((prevPage) => prevPage + 1)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1)
    }
  }

  if (data?.edges.length === 0 && Object.keys(filterState).length === 0) {
    return <div className="text-sm">No data to display</div>
  }

  return (
    <>
      <div className="overflow-x-auto border rounded-md">
        <Table className="table-fixed w-full">
          {showHeader && (
            <TableHeader className="bg-secondary [&_tr:hover]:!bg-secondary">
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key as string}>
                    <div className="flex items-center space-x-2 justify-between">
                      <span>{col.label}</span>
                      {col.sortable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSort(col.key)}
                        >
                          {sortState.column === col.key ? (
                            sortState.direction === "ASC" ? (
                              <HiChevronUp className="h-4 w-4 text-blue-500" />
                            ) : (
                              <HiChevronDown className="h-4 w-4 text-blue-500" />
                            )
                          ) : (
                            <HiSelector className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {col.filterValues && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <HiFilter
                                className={`h-4 w-4 ${
                                  filterState[col.key] ? "text-blue-500" : ""
                                }`}
                              />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuCheckboxItem
                              checked={!filterState[col.key]}
                              onCheckedChange={() => handleFilter(col.key, undefined)}
                            >
                              All
                            </DropdownMenuCheckboxItem>
                            {col.filterValues.map((value, idx) => (
                              <DropdownMenuCheckboxItem
                                key={idx}
                                checked={filterState[col.key] === value}
                                onCheckedChange={() => handleFilter(col.key, value)}
                                className="capitalize"
                              >
                                {String(value).split("_").join(" ").toLowerCase()}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableHead>
                ))}
                {navigateTo && <TableHead className="w-24"></TableHead>}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {loading
              ? Array.from({ length: displayData.length || pageSize }).map(
                  (_, rowIndex) => (
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
                  ),
                )
              : displayData.map(({ node }, idx) => (
                  <TableRow
                    key={idx}
                    data-testid={`table-row-${idx}`}
                    onClick={() => onClick?.(node)}
                    className={onClick ? "cursor-pointer" : ""}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key as string}
                        className="whitespace-normal break-words"
                      >
                        {col.render
                          ? col.render(node[col.key], node)
                          : String(node[col.key])}
                      </TableCell>
                    ))}
                    {navigateTo && (
                      <TableCell>
                        <Link href={navigateTo(node)}>
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
        <Separator />
        <div className="flex items-center justify-end space-x-4 py-2 mr-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <HiChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{currentPage}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={displayData.length < pageSize && !data?.pageInfo.hasNextPage}
          >
            <HiChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

export default PaginatedTable

export const DEFAULT_PAGESIZE = 10
