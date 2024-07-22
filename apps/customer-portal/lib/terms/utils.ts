import { InterestInterval, Period } from "../graphql/generated"

export const formatPeriod = (period: Period | undefined) => {
  if (!period) {
    return "NA"
  }

  return period.charAt(0).toUpperCase() + period.slice(1).toLowerCase()
}

export const formatInterval = (interval: InterestInterval | undefined) => {
  if (!interval) {
    return "NA"
  }

  return interval
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
