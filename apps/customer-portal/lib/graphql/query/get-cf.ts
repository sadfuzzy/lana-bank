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
    variables: {
      id,
    },
  })

  return result
}
