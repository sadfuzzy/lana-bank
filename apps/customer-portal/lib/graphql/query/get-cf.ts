import {
  GetCreditFacilityDocument,
  GetCreditFacilityQuery,
  GetCreditFacilityQueryVariables,
} from "../generated"

import { executeQuery } from "."

export const getCreditFacility = async ({ id }: { id: string }) => {
  const result = await executeQuery<
    GetCreditFacilityQuery,
    GetCreditFacilityQueryVariables
  >({
    document: GetCreditFacilityDocument,
    variables: {},
  })

  if (result instanceof Error) {
    return result
  }

  const creditFacility = result.me?.customer.creditFacilities.find(
    (cf) => cf.creditFacilityId === id,
  )
  return creditFacility
}
