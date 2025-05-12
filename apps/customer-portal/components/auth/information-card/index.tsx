import { Card, CardContent, CardHeader, CardTitle } from "@lana/web/ui/card"

import { LanaBankIcon } from "@/components/icons"

const InformationCard = () => {
  return (
    <Card className="md:w-3/6 md:ml-8" variant="transparent">
      <CardHeader>
        <LanaBankIcon className="w-20 h-10" />
        <CardTitle className="text-2xl pt-0">
          <div>Simple, secure Bitcoin-collateralized loans</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        Get access to dollars without selling your Bitcoin using Bitcoin-backed loans from
        Lana Bank.
      </CardContent>
    </Card>
  )
}

export { InformationCard }
