import { gql } from "@apollo/client"

import {
  SumsubTokenCreateDocument,
  SumsubTokenCreateMutation,
  SumsubTokenCreateMutationVariables,
} from "../generated"

import { executeMutation } from "."

gql`
  mutation SumsubTokenCreate {
    sumsubTokenCreate {
      token
    }
  }
`
export const sumSubTokenCreate = async () => {
  return executeMutation<SumsubTokenCreateMutation, SumsubTokenCreateMutationVariables>({
    document: SumsubTokenCreateDocument,
    variables: {},
  })
}
