import { Skeleton } from "../ui/skeleton"

export const DetailsPageSkeleton = ({
  tabs = 2,
  detailItems = 4,
  tabsCards = 2,
}: {
  tabs?: number
  detailItems?: number
  tabsCards?: number
}) => {
  return (
    <div className="space-y-4 max-w-7xl m-auto" data-testid="loading-skeleton">
      <div className="p-6 rounded-lg border bg-card">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {Array.from({ length: detailItems * 2 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex gap-1">
          {Array.from({ length: tabs }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28" />
          ))}
        </div>

        <div className="mt-6">
          <div className="flex flex-col gap-2">
            {Array.from({ length: tabsCards }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
