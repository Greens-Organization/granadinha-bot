interface IHttpError {
  message: string
  status: number
  url: string
  data: any
}

export class HttpError extends Error {
  status: number
  url: string
  data: any

  constructor({ message, url, status, data }: IHttpError) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.url = url
    this.data = data
  }
}
