/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';
import { ApiCall } from './types';

export class Api {
  public readonly post: ApiCall;
  public readonly get: ApiCall;
  public readonly patch: ApiCall;
  public readonly put: ApiCall;
  public readonly delete: ApiCall;

  private readonly httpClient: AxiosInstance;

  constructor(baseURL: string = '/', baseConfig?: AxiosRequestConfig) {
    const config: AxiosRequestConfig = {
      baseURL,
      ...baseConfig,
    };

    this.httpClient = axios.create(config);

    this.post = this.request('post');
    this.get = this.request('get');
    this.patch = this.request('patch');
    this.put = this.request('put');
    this.delete = this.request('delete');
  }

  public static isAxiosError<T>(
    error: AxiosError | any
  ): error is AxiosError<T> {
    return error && error.isAxiosError;
  }

  private request(
    method: Method,
    httpClient: AxiosInstance = this.httpClient
  ): ApiCall {
    function apiCall<T = unknown>(
      endpoint: string,
      data?: unknown,
      options?: AxiosRequestConfig & { fullResponse?: false }
    ): Promise<T>;
    function apiCall<T = unknown>(
      endpoint: string,
      data?: unknown,
      options?: AxiosRequestConfig & { fullResponse: true }
    ): Promise<AxiosResponse<T>>;
    async function apiCall<T = unknown>(
      endpoint: string,
      data?: unknown,
      options?: AxiosRequestConfig & { fullResponse?: boolean }
    ): Promise<AxiosResponse<T> | T> {
      const payload = ['get'].includes(method) ? { params: data } : { data };

      try {
        const res = await httpClient.request({
          method,
          url: endpoint,
          ...options,
          ...payload,
        });

        return options?.fullResponse ? res : res.data;
      } catch (error: any) {
        throw error.response.data;
      }
    }

    return apiCall;
  }
}

export const apiService = new Api();
