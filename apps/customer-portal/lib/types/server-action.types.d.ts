interface ServerActionError {
  id?: number
  message: string
}

interface ServerActionSuccess<T> {
  data: T
  error: null
}

interface ServerActionFailure {
  data: null
  error: ServerActionError
}

type ServerActionResponse<T> = ServerActionSuccess<T> | ServerActionFailure
