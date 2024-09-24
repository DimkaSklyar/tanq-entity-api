import { QueryKey, UseInfiniteQueryOptions, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { ErrorResponse } from './api-call';

export type QueryOptions<TData> = Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;
export type MutationOptions<TData, TError, TVariables> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  'mutationFn'
>;
export type InfiniteQueryOptions<InfiniteTData, TData, TPageParams> = Omit<
  UseInfiniteQueryOptions<TData, ErrorResponse, InfiniteTData, TData, QueryKey, TPageParams>,
  'queryKey' | 'queryFn'
>;

export type SlugQuery = number | string;
