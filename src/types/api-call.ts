/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosRequestConfig } from 'axios';
import { AxiosResponse } from 'axios';

export type HttpClientProps = {
  baseUrl: string;
  headers: AxiosRequestConfig['headers'];
};

export type ErrorResponse = {
  message?: string;
  code?: string;
  status?: number;
  data?: {
    detail?: string;
    status?: number;
    message?: string;
  };
};

type DataOnly = <T = unknown>(
  endpoint: string,
  data?: any,
  options?: AxiosRequestConfig & { fullResponse?: false }
) => Promise<T>;

type FullResponse = <T = unknown>(
  endpoint: string,
  data?: any,
  options?: AxiosRequestConfig & { fullResponse: true }
) => Promise<AxiosResponse<T>>;

export type ApiCall = DataOnly & FullResponse;
