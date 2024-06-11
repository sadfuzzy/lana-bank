import { DocumentNode, OperationVariables } from "@apollo/client"

import { getClient } from "@/lib/core-admin-client/rsc"

export async function performQuery<TData, TVariables extends OperationVariables>(
  queryDocument: DocumentNode,
  input: TVariables,
): Promise<TData | Error> {
  try {
    const response = await getClient().query<TData, TVariables>({
      query: queryDocument,
      variables: input,
    })

    if (response.errors) {
      throw new Error(response.errors.map((e) => e.message).join(", "))
    }

    if (response.data) {
      return response.data
    } else {
      throw new Error("No data returned from query.")
    }
  } catch (err) {
    return err instanceof Error
      ? err
      : new Error("An error occurred while fetching the data")
  }
}
