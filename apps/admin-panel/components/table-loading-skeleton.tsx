import { Skeleton } from "./primitive/skeleton"
import { Table, TableBody, TableCell, TableRow } from "./primitive/table"

export const TableLoadingSkeleton = ({
  rows = 10,
  columns = 3,
}: {
  rows?: number
  columns?: number
}) => {
  return (
    <div>
      <Table>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
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
