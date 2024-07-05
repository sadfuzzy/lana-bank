import { gql } from "@apollo/client"

import {
  SumsubPermalinkCreateDocument,
  SumsubPermalinkCreateMutation,
  SumsubPermalinkCreateMutationVariables,
} from "../generated"

import { executeMutation } from "."

gql`
  mutation SumsubPermalinkCreate {
    sumsubPermalinkCreate {
      url
    }
  }
`
export const sumSubPermalinkCreate = async () => {
  return executeMutation<
    SumsubPermalinkCreateMutation,
    SumsubPermalinkCreateMutationVariables
  >({
    document: SumsubPermalinkCreateDocument,
    variables: {},
  })
}
