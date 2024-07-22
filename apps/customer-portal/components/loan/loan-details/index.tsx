import { CardContent } from "@/components/primitive/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitive/table"

export const LoanDetailsTable = () => {
  return (
    <CardContent>
      <Table className="w-11/12 m-auto mb-20 mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Amount (BTC)</TableHead>
            <TableHead>USD Value</TableHead>
            <TableHead className="text-right">Entry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>2021-09-01</TableCell>
            <TableCell>Loan Disbursement</TableCell>
            <TableCell>0x1234</TableCell>
            <TableCell>0.1</TableCell>
            <TableCell>$1000</TableCell>
            <TableCell className="text-right"> -$165.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>2021-09-01</TableCell>
            <TableCell>Loan Disbursement</TableCell>
            <TableCell>0x1234</TableCell>
            <TableCell>0.1</TableCell>
            <TableCell>$1000</TableCell>
            <TableCell className="text-right"> -$165.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>2021-09-01</TableCell>
            <TableCell>Loan Disbursement</TableCell>
            <TableCell>0x1234</TableCell>
            <TableCell>0.1</TableCell>
            <TableCell>$1000</TableCell>
            <TableCell className="text-right"> -$165.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  )
}
