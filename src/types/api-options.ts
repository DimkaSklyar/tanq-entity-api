import {
  QueryKey,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import { ErrorResponse } from './api-call';

type PartialPick<T, F extends keyof T> = Omit<T, F> & Partial<Pick<T, F>>;

export type QueryOptions<TData> = Omit<
  UseQueryOptions<TData>,
  'queryKey' | 'queryFn'
>;
export type MutationOptions<TData, TError, TVariables> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  'mutationFn'
>;
export type InfiniteQueryOptions<InfiniteTData, TData, TPageParams> =
  PartialPick<
    Omit<
      UseInfiniteQueryOptions<
        TData,
        ErrorResponse,
        InfiniteTData,
        TData,
        QueryKey,
        TPageParams
      >,
      'queryKey' | 'queryFn'
    >,
    'getNextPageParam' | 'initialPageParam'
  >;

export type SlugQuery = number | string;
