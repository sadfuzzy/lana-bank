import { OperationVariables, DocumentNode } from "@apollo/client"

import { getClient } from "@/lib/core-admin-client/rsc"

export async function performMutation<TData, TVariables extends OperationVariables>(
  mutationDocument: DocumentNode,
  variables: TVariables,
): Promise<Error | TData> {
  try {
    const response = await getClient().mutate<TData, { input: TVariables }>({
      mutation: mutationDocument,
      variables: { input: variables },
    })

    if (response.errors) {
      throw new Error(response.errors.map((e) => e.message).join(", "))
    }

    if (response.data) {
      return response.data
    } else {
      throw new Error("No data returned from mutation.")
    }
  } catch (err) {
    return err instanceof Error
      ? err
      : new Error("An error occurred while processing the mutation")
  }
}
