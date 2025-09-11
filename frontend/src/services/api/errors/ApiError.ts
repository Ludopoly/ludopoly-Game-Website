// src/services/api/errors/ApiError.ts
export class ApiError extends Error {
  public statusCode: number
  public data?: any

  constructor(message: string, statusCode: number, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.data = data
  }

  public isNetworkError(): boolean {
    return this.statusCode === 0
  }

  public isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500
  }

  public isServerError(): boolean {
    return this.statusCode >= 500
  }

  public getErrorType(): 'network' | 'client' | 'server' | 'unknown' {
    if (this.isNetworkError()) return 'network'
    if (this.isClientError()) return 'client'
    if (this.isServerError()) return 'server'
    return 'unknown'
  }
}

export const createApiErrorHandler = (dispatch: any) => {
  return (error: ApiError) => {
    const errorType = error.getErrorType()
    
    switch (errorType) {
      case 'network':
        dispatch(/* Network error snackbar */)
        break
      case 'client':
        dispatch(/* Client error snackbar */)
        break
      case 'server':
        dispatch(/* Server error snackbar */)
        break
      default:
        dispatch(/* Unknown error snackbar */)
    }
  }
}
