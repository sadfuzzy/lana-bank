import { KeyValueGroup, KeyValueCell, Key, Value } from "../primitive/aligned-key-value"
import { Button } from "../primitive/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../primitive/card"

export type Balance = {
  currency: string
  amount: number | string
}

export const BalanceCard = ({ balance }: { balance: Balance[] }) => {
  return (
    <Card className="w-1/3 flex-col h-full">
      <CardHeader>
        <CardTitle>Balance</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        {balance.map((b) => (
          <KeyValueGroup key={b.currency}>
            <KeyValueCell>
              <Key>{b.currency}</Key>
              <Value>{b.amount}</Value>
            </KeyValueCell>
          </KeyValueGroup>
        ))}
      </CardContent>
      <CardFooter className="justify-center gap-2">
        <Button>Deposit BTC</Button>
        <Button variant="secondary">Withdraw</Button>
      </CardFooter>
    </Card>
  )
}
