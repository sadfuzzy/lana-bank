import { InterestInterval, Period } from "../graphql/generated"

export const formatPeriod = (period: Period) => {
  return period.charAt(0).toUpperCase() + period.slice(1).toLowerCase()
}

export const formatInterval = (interval: InterestInterval) => {
  return interval
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
