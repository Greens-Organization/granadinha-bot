import { ConfigRequest } from './config-request'
import { HttpError } from './http-error'

type primitives = string
type Headers = Record<string, primitives>

interface HttpRequestProps<T extends Headers = Headers> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: T
  body?: any | null
}

type QueryParams = Record<string, string | number | boolean>

interface HttpClientConfig extends HttpRequestProps {
  api_response?: boolean
  queryParams?: QueryParams
}

/**
 * Classe para realizar requisições HTTP.
 * @class
 */
export class http {
  /**
   * Adiciona parâmetros de consulta a uma URL.
   * @static
   * @param {string} url - A URL base.
   * @param {QueryParams} [queryParams] - Os parâmetros de consulta a serem adicionados.
   * @returns {string} A URL com os parâmetros de consulta adicionados.
   * @example
   * const url = 'https://api.example.com/users';
   * const params = { page: 1, limit: 10 };
   * const fullUrl = Http.appendQueryParamsToUrl(url, params);
   * // Retorna: 'https://api.example.com/users?page=1&limit=10'
   */
  static appendQueryParamsToUrl(
    url: string,
    queryParams?: QueryParams
  ): string {
    if (!queryParams) return url

    const searchParams = new URLSearchParams()

    for (const key in queryParams) {
      if (Object.prototype.hasOwnProperty.call(queryParams, key)) {
        searchParams.append(key, queryParams[key].toString())
      }
    }

    return url.includes('?')
      ? `${url}&${searchParams.toString()}`
      : `${url}?${searchParams.toString()}`
  }

  /**
   * Realiza uma requisição HTTP.
   * @static
   * @template ReturnProps
   * @param {string} urlRequest - A URL base da requisição.
   * @param {string} endpoint - O endpoint da API.
   * @param {HttpClientConfig & RequestInit} [config] - Configurações da requisição.
   * @returns {Promise<ReturnProps>} Uma promessa que resolve com os dados da resposta.
   * @throws {Error} Se a resposta não for bem-sucedida.
   * @example
   * interface User {
   *   id: number;
   *   name: string;
   * }
   *
   * const users = await Http.fetch<User[]>('https://api.example.com', '/users', {
   *   method: 'GET',
   *   headers: { 'Authorization': 'Bearer token123' },
   *   queryParams: { role: 'admin' }
   * });
   *
   * @example
   * const newUser = await Http.fetch<User>('https://api.example.com', '/users', {
   *   method: 'POST',
   *   headers: { 'Authorization': 'Bearer token123' },
   *   body: JSON.stringify({ name: 'John Doe' })
   * });
   */
  static async fetch<ReturnProps>(
    urlRequest: string,
    endpoint?: string,
    config?: HttpClientConfig & RequestInit
  ): Promise<ReturnProps> {
    const {
      method = 'GET',
      queryParams,
      api_response = false,
      ...custom
    } = config || {}

    const makeUrl = endpoint ? `${urlRequest}${endpoint}` : urlRequest
    const url = http.appendQueryParamsToUrl(makeUrl, queryParams)
    custom.headers = {
      ...custom.headers,
      [ConfigRequest.Headers.CONTENT_TYPE]: 'application/json',
      [ConfigRequest.Headers.USER_AGENT]: ConfigRequest.getUserAgent()
    }

    if (method && method !== 'GET') {
      custom.headers = {
        ...custom.headers
      }
    }

    const fetchFn = async () => {
      try {
        const response = await fetch(url, {
          ...custom,
          method
        })

        let responseData: any
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.indexOf('application/json') !== -1) {
          responseData = await response.json()
        } else {
          responseData = await response.text()
        }

        if (response.ok) {
          if (api_response) {
            const apiResponse = {
              url: url,
              status: response.status,
              headers: response.headers
            }
            return Object.assign(responseData, {
              api_response: apiResponse
            }) as ReturnProps
          }

          return responseData as ReturnProps
        }
        throw new HttpError({
          message: 'Request failed',
          status: response.status,
          url: url,
          data: responseData
        })
      } catch (e) {
        if (e instanceof HttpError) {
          throw new HttpError({
            message: e.message,
            status: e.status,
            url: url,
            data: null
          })
        }
        throw e
      }
    }
    return await fetchFn()
  }
}
