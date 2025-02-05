import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@lana/web/ui/card"

const InformationCard = () => {
  return (
    <Card className="md:w-3/6 md:ml-8" variant="transparent">
      <CardHeader className="pt-2 pb-4">
        <CardTitle className="text-2xl">
          <div>Bitcoin backed loans. Based in Bitcoin Country.</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          lana is offers loan products for bitcoin holders. Post Bitcoin as collateral and
          withdraw Dollars or USDT.
        </p>
      </CardContent>
      <CardFooter>
        <ul className="list-disc list-inside">
          <li>Fixed or variable rate loans </li>
          <li>High-touch customer service</li>
        </ul>
      </CardFooter>
    </Card>
  )
}

export { InformationCard }
