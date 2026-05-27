declare namespace API {
  interface Response<T = any> {
    code: number
    data: T
    message: string
  }

  interface PageParams {
    current?: number
    pageSize?: number
  }

  interface PageResult<T> {
    list: T[]
    total: number
  }
}
