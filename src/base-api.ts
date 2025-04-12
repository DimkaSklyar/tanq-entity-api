/* eslint-disable @tanstack/query/exhaustive-deps */
import 'reflect-metadata';
import { BasePaginationRequest, PaginationResponse } from './models';
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useInfiniteQuery,
  UndefinedInitialDataInfiniteOptions,
  InfiniteData,
  QueryKey
} from '@tanstack/react-query';
import { plainToInstance, ClassConstructor, instanceToPlain } from 'class-transformer';
import { apiService } from './api';
import { isUndefined, omitBy } from 'lodash';
import { createEntityInstance } from './utils/create-entity-instance';
import { MutationOptions, QueryOptions, Identifier } from './types/api-options';
import { ErrorResponse } from './types/api-call';
import { getQueryClient } from './queries/get-query-client';

export function createApi<
  TEntity,
  TEntityRequest = unknown,
  TSearchRequest = BasePaginationRequest,
  TEntityCreate = TEntity,
  TEntityUpdate = Partial<TEntity>
>(options: {
  entityKey: string;
  baseEndpoint: string;
  entityConstructor: ClassConstructor<TEntity>;
  entityCreateConstructor?: ClassConstructor<TEntityCreate>;
  entityUpdateConstructor?: ClassConstructor<TEntityUpdate>;
  entityRequestConstructor?: ClassConstructor<TEntityRequest>;
  entityListRequestConstructor?: ClassConstructor<TSearchRequest>;
  fromInstancePartial?: boolean;
  invalidateQueryKeys?: ReadonlyArray<string>;
  additionalPaths?: {
    get?: string;
    getByID?: string;
    getArray?: string;
    list?: string;
    create?: string;
    update?: string;
    delete?: string;
  };
}) {
  const {
    entityKey,
    baseEndpoint,
    entityConstructor,
    entityCreateConstructor,
    entityUpdateConstructor,
    entityListRequestConstructor = BasePaginationRequest,
    entityRequestConstructor,
    fromInstancePartial = false,
    invalidateQueryKeys,
    additionalPaths
  } = options;

  const apiInstance = {
    getQueryConfig: (options?: {
      resourceParams?: { id: Identifier };
      paramsRequest?: TEntityRequest;
      queryOptions?: QueryOptions<TEntity>;
      cookies?: string;
    }) => {
      const { resourceParams, paramsRequest, queryOptions, cookies } = options || {};

      const request = entityRequestConstructor
        ? (new entityRequestConstructor(paramsRequest || {}) as TEntityRequest)
        : ({} as TEntityRequest);

      const queryKey: QueryKey = [entityKey, paramsRequest, resourceParams].filter((item) => item !== undefined);

      return {
        queryKey,
        queryFn: async () => {
          const endpoint = `${baseEndpoint}${additionalPaths?.get ?? ''}${resourceParams?.id ? `/${resourceParams.id}` : ''}`;

          const headers: Record<string, string> = cookies ? { Cookie: cookies } : {};

          const data = await apiService.get<TEntity>(
            endpoint,
            omitBy(instanceToPlain<TEntityRequest>(request), isUndefined),
            {
              headers
            }
          );

          return createEntityInstance<TEntity>(entityConstructor, data, { fromInstancePartial });
        },
        ...queryOptions
      };
    },

    getQueryArrayConfig: (
      paramsRequest?: TEntityRequest & { id?: Identifier },
      queryOptions?: QueryOptions<Array<TEntity>>
    ) => {
      const request = entityRequestConstructor
        ? (new entityRequestConstructor(paramsRequest || {}) as TEntityRequest)
        : ({} as TEntityRequest);

      return {
        queryKey: [entityKey, paramsRequest ?? {}],
        queryFn: async () => {
          const endpoint = additionalPaths?.getArray
            ? `${baseEndpoint}${additionalPaths.getArray}${paramsRequest?.id ? `/${paramsRequest.id}` : ''}`
            : `${baseEndpoint}${paramsRequest?.id ? `/${paramsRequest.id}` : ''}`;

          const data = await apiService.get<Array<TEntity>>(
            endpoint,
            omitBy(instanceToPlain<TEntityRequest>(request), isUndefined)
          );

          return data?.map((item) => createEntityInstance<TEntity>(entityConstructor, item, { fromInstancePartial }));
        },
        ...queryOptions
      };
    },

    getListQueryConfig: (options?: {
      resourceParams?: { id: Identifier };
      paramsRequest?: TSearchRequest;
      queryOptions?: Omit<QueryOptions<PaginationResponse<TEntity>>, 'queryKey' | 'queryFn'>;
      cookies?: string;
    }) => {
      const { resourceParams, paramsRequest, queryOptions, cookies } = options || {};

      const request = new entityListRequestConstructor(paramsRequest || {}) as TSearchRequest;

      const queryKey: QueryKey = [entityKey, paramsRequest, resourceParams].filter((item) => item !== undefined);

      return {
        queryKey,
        queryFn: async () => {
          const endpoint = `${baseEndpoint}${additionalPaths?.list ?? ''}${resourceParams?.id ? `/${resourceParams.id}` : ''}`;

          const headers: Record<string, string> = cookies ? { Cookie: cookies } : {};

          const response = await apiService.get<PaginationResponse<TEntity>>(
            endpoint,
            omitBy(instanceToPlain<TSearchRequest>(request), isUndefined),
            {
              headers
            }
          );

          const { items, ...pagination } = plainToInstance(PaginationResponse<TEntity>, response || {});

          return {
            ...pagination,
            items: items?.map((item) => createEntityInstance<TEntity>(entityConstructor, item, { fromInstancePartial }))
          } as PaginationResponse<TEntity>;
        },
        ...queryOptions
      };
    },

    useGetQueryWithOptions: (options: UseQueryOptions<TEntity>) => {
      return useQuery(options);
    },

    useGetListQueryWithOptions: (options: UseQueryOptions<PaginationResponse<TEntity>>) => {
      return useQuery(options);
    },

    useGetQuery: (options?: {
      paramsRequest?: TEntityRequest;
      queryOptions?: QueryOptions<TEntity>;
    }): UseQueryResult<TEntity> => {
      return useQuery<TEntity>(apiInstance.getQueryConfig(options));
    },

    useGetByIDQuery: (options: {
      resourceParams: { id: Identifier };
      paramsRequest?: TEntityRequest;
      queryOptions?: QueryOptions<TEntity>;
    }): UseQueryResult<TEntity> => {
      return useQuery<TEntity>(apiInstance.getQueryConfig(options));
    },

    useGetArrayQuery: (
      paramsRequest: TEntityRequest & { id?: Identifier },
      queryOptions?: QueryOptions<Array<TEntity>>
    ): UseQueryResult<Array<TEntity>> => {
      return useQuery<Array<TEntity>>(apiInstance.getQueryArrayConfig(paramsRequest, queryOptions));
    },

    useGetListQuery: (options?: {
      paramsRequest?: TSearchRequest;
      queryOptions?: Omit<QueryOptions<PaginationResponse<TEntity>>, 'queryKey' | 'queryFn'>;
    }): UseQueryResult<PaginationResponse<TEntity>> => {
      return useQuery<PaginationResponse<TEntity>>(apiInstance.getListQueryConfig(options));
    },

    useGetListByIDQuery: (options: {
      resourceParams: { id: Identifier };
      paramsRequest?: TSearchRequest;
      queryOptions?: Omit<QueryOptions<PaginationResponse<TEntity>>, 'queryKey' | 'queryFn'>;
    }): UseQueryResult<PaginationResponse<TEntity>> => {
      return useQuery<PaginationResponse<TEntity>>(apiInstance.getListQueryConfig(options));
    },

    useConfiguredQuery: (options: UseQueryOptions<TEntity>) => {
      return useQuery(options);
    },

    useConfiguredListQuery: (options: UseQueryOptions<PaginationResponse<TEntity>>) => {
      return useQuery(options);
    },

    getInfiniteListQueryConfig: (options?: {
      resourceParams?: { id: Identifier };
      paramsRequest?: TSearchRequest extends BasePaginationRequest ? TSearchRequest : never;
      queryOptions?: Omit<
        UndefinedInitialDataInfiniteOptions<
          PaginationResponse<TEntity>,
          ErrorResponse,
          InfiniteData<PaginationResponse<TEntity>>,
          QueryKey,
          TSearchRequest extends BasePaginationRequest ? TSearchRequest : never
        >,
        'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
      >;
    }): UndefinedInitialDataInfiniteOptions<
      PaginationResponse<TEntity>,
      ErrorResponse,
      InfiniteData<PaginationResponse<TEntity>>,
      QueryKey,
      TSearchRequest extends BasePaginationRequest ? TSearchRequest : never
    > => {
      const { resourceParams, paramsRequest, queryOptions } = options || {};

      const request = new entityListRequestConstructor(paramsRequest || {}) as TSearchRequest extends BasePaginationRequest
        ? TSearchRequest
        : never;

      const queryKey: QueryKey = [entityKey, paramsRequest, resourceParams].filter((item) => item !== undefined);

      return {
        queryKey,
        queryFn: async ({ pageParam }) => {
          const endpoint = `${baseEndpoint}${additionalPaths?.list ?? ''}${resourceParams?.id ? `/${resourceParams.id}` : ''}`;

          const response = await apiService.get<PaginationResponse<TEntity>>(
            endpoint,
            omitBy(
              instanceToPlain(pageParam as TSearchRequest extends BasePaginationRequest ? TSearchRequest : never),
              isUndefined
            )
          );

          const { items, ...pagination } = plainToInstance(PaginationResponse<TEntity>, response || {});

          return {
            ...pagination,
            items: items?.map((item) => createEntityInstance<TEntity>(entityConstructor, item, { fromInstancePartial }))
          } as PaginationResponse<TEntity>;
        },
        initialPageParam: request,
        getNextPageParam: (lastPage, _, lastPageParam) => {
          if (lastPageParam.page && lastPage.pages) {
            return lastPageParam.page < lastPage.pages
              ? (new entityListRequestConstructor({
                ...lastPageParam,
                page: lastPageParam.page + 1
              }) as TSearchRequest extends BasePaginationRequest ? TSearchRequest : never)
              : undefined;
          }

          return undefined;
        },
        ...queryOptions
      };
    },

    useGetInfiniteListQuery: (options?: {
      paramsRequest?: TSearchRequest extends BasePaginationRequest ? TSearchRequest : never;
      queryOptions?: Omit<
        UndefinedInitialDataInfiniteOptions<
          PaginationResponse<TEntity>,
          ErrorResponse,
          InfiniteData<PaginationResponse<TEntity>>,
          QueryKey,
          TSearchRequest extends BasePaginationRequest ? TSearchRequest : never
        >,
        'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
      >;
    }) => useInfiniteQuery(apiInstance.getInfiniteListQueryConfig(options)),

    useGetInfiniteListByIDQuery: (options: {
      resourceParams: { id: Identifier };
      paramsRequest?: TSearchRequest extends BasePaginationRequest ? TSearchRequest : never;
      queryOptions?: Omit<
        UndefinedInitialDataInfiniteOptions<
          PaginationResponse<TEntity>,
          ErrorResponse,
          InfiniteData<PaginationResponse<TEntity>>,
          QueryKey,
          TSearchRequest extends BasePaginationRequest ? TSearchRequest : never
        >,
        'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
      >;
    }) => useInfiniteQuery(apiInstance.getInfiniteListQueryConfig(options)),

    useCreateMutation: (
      mutationOptions?: MutationOptions<TEntity, unknown, TEntityCreate> & {
        onAfterSuccess?: (data: TEntity, variables: TEntityCreate, context: unknown) => void;
      }
    ) => {
      return useMutation<TEntity, unknown, TEntityCreate>({
        mutationFn: async (data) => {
          const endpoint = additionalPaths?.create ? `${baseEndpoint}${additionalPaths.create}` : `${baseEndpoint}`;

          const request = entityCreateConstructor
            ? (new entityCreateConstructor(data || {}) as TEntityCreate)
            : ({} as TEntityCreate);

          const response = await apiService.post<TEntity>(
            endpoint,
            omitBy(instanceToPlain<TEntityCreate>(request), isUndefined)
          );

          return plainToInstance<TEntity, TEntity>(entityConstructor, response);
        },
        onSuccess: async (data: TEntity, variables: TEntityCreate, context: unknown) => {
          mutationOptions?.onAfterSuccess?.(data, variables, context);

          const queryClient = getQueryClient();

          if (invalidateQueryKeys) {
            await Promise.all(invalidateQueryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
          } else {
            await queryClient.invalidateQueries({ queryKey: [entityKey] });
          }
        },
        ...mutationOptions
      });
    },

    useUpdateMutation: (
      mutationOptions?: MutationOptions<TEntity, ErrorResponse, Partial<TEntityUpdate>> & {
        onAfterSuccess?: (
          data: TEntity,
          variables: Partial<TEntityUpdate> & {
            id: Identifier;
          },
          context: unknown
        ) => void;
      }
    ) => {
      return useMutation<TEntity, ErrorResponse, Partial<TEntityUpdate> & { id: Identifier }>({
        mutationFn: async (data) => {
          const endpoint = additionalPaths?.update
            ? `${baseEndpoint}${additionalPaths.update}/${data.id}`
            : `${baseEndpoint}/${data.id}`;

          const request = entityUpdateConstructor
            ? (new entityUpdateConstructor(data || {}) as TEntityUpdate)
            : entityConstructor
              ? (new entityConstructor(data || {}) as TEntity)
              : ({} as TEntity);

          const response = await apiService.put<TEntity>(
            endpoint,
            omitBy(instanceToPlain<TEntityUpdate | TEntity>(request), isUndefined)
          );

          return plainToInstance<TEntity, TEntity>(entityConstructor, response);
        },
        onSuccess: async (
          data: TEntity,
          variables: Partial<TEntityUpdate> & {
            id: Identifier;
          },
          context: unknown
        ) => {
          mutationOptions?.onAfterSuccess?.(data, variables, context);

          const queryClient = getQueryClient();

          if (invalidateQueryKeys) {
            await Promise.all(invalidateQueryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
          } else {
            await queryClient.invalidateQueries({ queryKey: [entityKey] });
          }
        },
        ...mutationOptions
      });
    },

    useDeleteMutation: (
      mutationOptions?: MutationOptions<void, ErrorResponse, Identifier> & { onAfterSuccess?: () => void }
    ) => {
      return useMutation<void, ErrorResponse, Identifier>({
        mutationFn: async (id: Identifier) => {
          const endpoint = additionalPaths?.delete
            ? `${baseEndpoint}${additionalPaths.delete}/${id}`
            : `${baseEndpoint}/${id}`;

          await apiService.delete(endpoint);
        },
        onSuccess: async () => {
          mutationOptions?.onAfterSuccess?.();

          const queryClient = getQueryClient();

          if (invalidateQueryKeys) {
            await Promise.all(invalidateQueryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
          } else {
            await queryClient.invalidateQueries({ queryKey: [entityKey] });
          }
        },
        ...mutationOptions
      });
    }
  };

  return apiInstance;
}
