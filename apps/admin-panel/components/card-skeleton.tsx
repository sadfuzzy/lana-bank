import { Card, CardHeader, CardContent } from "@lana/web/ui/card"

import { Skeleton } from "@lana/web/ui/skeleton"

export const CardSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <div className="flex flex-col">
        <Skeleton className="h-[27px] w-24" />
        <Skeleton className="h-9 w-32 mt-1" />
      </div>
      <Skeleton className="h-6 w-48 mt-6" />
      <Skeleton className="h-4 w-64 mt-1.5" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-start mt-1">
        <Skeleton className="h-9 w-28" />
      </div>
    </CardContent>
  </Card>
)
