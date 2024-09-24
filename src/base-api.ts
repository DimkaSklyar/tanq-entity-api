/* eslint-disable @tanstack/query/exhaustive-deps */
import 'reflect-metadata';
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useInfiniteQuery,
  UseInfiniteQueryResult
} from '@tanstack/react-query';
import { plainToInstance, ClassConstructor, instanceToPlain } from 'class-transformer';
import { apiService } from './api';
import { isUndefined, omitBy } from 'lodash';
import { createEntityInstance } from './utils/create-entity-instance';
import { InfiniteQueryOptions, MutationOptions, QueryOptions, SlugQuery } from './types/api-options';
import { ErrorResponse } from './types/api-call';
import { BasePaginationRequest, BasePaginationResponse } from './models';
import { getQueryClient } from './queries/get-query-client';

export function createApi<
  TEntity,
  TEntityRequest = unknown,
  TSearchRequest = BasePaginationRequest,
  TEntityCreate = TEntity
>(options: {
  entityKey: string;
  baseEndpoint: string;
  entityConstructor: ClassConstructor<TEntity>;
  entityCreateConstructor?: ClassConstructor<TEntityCreate>;
  entityRequestConstructor?: ClassConstructor<TEntityRequest>;
  entityListRequestConstructor?: ClassConstructor<TSearchRequest>;
  fromInstancePartial?: boolean;
  invalidateQueryKeys?: ReadonlyArray<string>;
  additionalPaths?: {
    get?: string;
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
    entityListRequestConstructor = BasePaginationRequest,
    entityRequestConstructor,
    fromInstancePartial = false,
    invalidateQueryKeys,
    additionalPaths
  } = options;

  const apiInstance = {
    getQueryConfig: (paramsRequest?: TEntityRequest & { slug?: SlugQuery }, queryOptions?: QueryOptions<TEntity>) => {
      const request = entityRequestConstructor
        ? (new entityRequestConstructor(paramsRequest || {}) as TEntityRequest)
        : ({} as TEntityRequest);

      return {
        queryKey: [entityKey, paramsRequest],
        queryFn: async () => {
          const endpoint = additionalPaths?.get
            ? `${baseEndpoint}${additionalPaths.get}${paramsRequest?.slug ? `/${paramsRequest.slug}` : ''}`
            : `${baseEndpoint}${paramsRequest?.slug ? `/${paramsRequest.slug}` : ''}`;

          const data = await apiService.get<TEntity>(
            endpoint,
            omitBy(instanceToPlain<TEntityRequest>(request), isUndefined)
          );

          return createEntityInstance<TEntity>(entityConstructor, data, { fromInstancePartial });
        },
        ...queryOptions
      };
    },

    getQueryArrayConfig: (
      paramsRequest?: TEntityRequest & { slug?: SlugQuery },
      queryOptions?: QueryOptions<Array<TEntity>>
    ) => {
      const request = entityRequestConstructor
        ? (new entityRequestConstructor(paramsRequest || {}) as TEntityRequest)
        : ({} as TEntityRequest);

      return {
        queryKey: [entityKey, paramsRequest],
        queryFn: async () => {
          const endpoint = additionalPaths?.getArray
            ? `${baseEndpoint}${additionalPaths.getArray}${paramsRequest?.slug ? `/${paramsRequest.slug}` : ''}`
            : `${baseEndpoint}${paramsRequest?.slug ? `/${paramsRequest.slug}` : ''}`;

          const data = await apiService.get<Array<TEntity>>(
            endpoint,
            omitBy(instanceToPlain<TEntityRequest>(request), isUndefined)
          );

          return data?.map((item) => createEntityInstance<TEntity>(entityConstructor, item, { fromInstancePartial }));
        },
        ...queryOptions
      };
    },

    getListQueryConfig: (
      paramsRequest?: TSearchRequest,
      queryOptions?: Omit<QueryOptions<BasePaginationResponse<TEntity>>, 'queryKey' | 'queryFn'>
    ) => {
      const request = new entityListRequestConstructor(paramsRequest || {}) as TSearchRequest;

      return {
        queryKey: [entityKey, paramsRequest ?? {}],
        queryFn: async () => {
          const endpoint = additionalPaths?.list ? `${baseEndpoint}${additionalPaths.list}` : `${baseEndpoint}`;

          const response = await apiService.get<BasePaginationResponse<TEntity>>(
            endpoint,
            omitBy(instanceToPlain<TSearchRequest>(request), isUndefined)
          );

          const { items, ...pagination } = plainToInstance(BasePaginationResponse<TEntity>, response || {});

          return {
            ...pagination,
            items: items?.map((item) => createEntityInstance<TEntity>(entityConstructor, item, { fromInstancePartial }))
          } as BasePaginationResponse<TEntity>;
        },
        ...queryOptions
      };
    },

    useGetQuery: (
      paramsRequest: TEntityRequest & { slug?: SlugQuery },
      queryOptions?: QueryOptions<TEntity>
    ): UseQueryResult<TEntity> => {
      return useQuery<TEntity>(apiInstance.getQueryConfig(paramsRequest, queryOptions));
    },

    useGetArrayQuery: (
      paramsRequest: TEntityRequest & { slug?: SlugQuery },
      queryOptions?: QueryOptions<Array<TEntity>>
    ): UseQueryResult<Array<TEntity>> => {
      return useQuery<Array<TEntity>>(apiInstance.getQueryArrayConfig(paramsRequest, queryOptions));
    },

    useGetListQuery: (
      paramsRequest?: TSearchRequest,
      queryOptions?: Omit<QueryOptions<BasePaginationResponse<TEntity>>, 'queryKey' | 'queryFn'>
    ): UseQueryResult<BasePaginationResponse<TEntity>> => {
      return useQuery<BasePaginationResponse<TEntity>>(apiInstance.getListQueryConfig(paramsRequest, queryOptions));
    },

    useConfiguredQuery: (options: UseQueryOptions<TEntity>) => {
      return useQuery(options);
    },

    useConfiguredListQuery: (options: UseQueryOptions<BasePaginationResponse<TEntity>>) => {
      return useQuery(options);
    },

    useGetInfiniteListQuery: (
      paramsRequest?: TSearchRequest extends BasePaginationRequest ? TSearchRequest : never,
      queryOptions?: InfiniteQueryOptions<
        {
          pages: Array<BasePaginationResponse<TEntity>>;
          pageParams: TSearchRequest extends BasePaginationRequest ? TSearchRequest : never;
        },
        BasePaginationResponse<TEntity>,
        TSearchRequest extends BasePaginationRequest ? TSearchRequest : never
      >
    ): UseInfiniteQueryResult<
      {
        pages: Array<BasePaginationResponse<TEntity>>;
        pageParams: TSearchRequest extends BasePaginationRequest ? TSearchRequest : never;
      },
      ErrorResponse
    > => {
      const request = new entityListRequestConstructor(paramsRequest || {}) as TSearchRequest extends BasePaginationRequest
        ? TSearchRequest
        : never;

      return useInfiniteQuery({
        queryKey: [entityKey, paramsRequest ?? {}],
        queryFn: async ({ pageParam }) => {
          const endpoint = additionalPaths?.list ? `${baseEndpoint}${additionalPaths.list}` : `${baseEndpoint}`;

          const response = await apiService.get<BasePaginationResponse<TEntity>>(
            endpoint,
            omitBy(
              instanceToPlain<TSearchRequest extends BasePaginationRequest ? TSearchRequest : never>(
                pageParam as TSearchRequest extends BasePaginationRequest ? TSearchRequest : never
              ),
              isUndefined
            )
          );

          const { items, ...pagination } = plainToInstance(BasePaginationResponse<TEntity>, response || {});

          return {
            ...pagination,
            items: items?.map((item) => createEntityInstance<TEntity>(entityConstructor, item, { fromInstancePartial }))
          } as BasePaginationResponse<TEntity>;
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
      });
    },

    useCreateMutation: (
      mutationOptions?: MutationOptions<TEntity, unknown, TEntityCreate> & { onAfterSuccess?: () => void }
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
        onSuccess: async () => {
          const queryClient = getQueryClient();

          if (invalidateQueryKeys) {
            await Promise.all(invalidateQueryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
          } else {
            await queryClient.invalidateQueries({ queryKey: [entityKey] });
          }
          mutationOptions?.onAfterSuccess?.();
        },
        ...mutationOptions
      });
    },

    useUpdateMutation: (
      mutationOptions?: MutationOptions<TEntity, ErrorResponse, Partial<TEntity>> & {
        onAfterSuccess?: () => void;
      }
    ) => {
      return useMutation<TEntity, ErrorResponse, Partial<TEntity> & { id: SlugQuery }>({
        mutationFn: async (data) => {
          const endpoint = additionalPaths?.update
            ? `${baseEndpoint}${additionalPaths.update}/${data.id}`
            : `${baseEndpoint}/${data.id}`;

          const request = entityConstructor ? (new entityConstructor(data || {}) as TEntity) : ({} as TEntity);

          const response = await apiService.put<TEntity>(
            endpoint,
            omitBy(instanceToPlain<Partial<TEntity>>(request), isUndefined)
          );

          return plainToInstance<TEntity, TEntity>(entityConstructor, response);
        },
        onSuccess: async () => {
          const queryClient = getQueryClient();

          if (invalidateQueryKeys) {
            await Promise.all(invalidateQueryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
          } else {
            await queryClient.invalidateQueries({ queryKey: [entityKey] });
          }
          mutationOptions?.onAfterSuccess?.();
        },
        ...mutationOptions
      });
    },

    useDeleteMutation: (
      mutationOptions?: MutationOptions<void, ErrorResponse, SlugQuery> & { onAfterSuccess?: () => void }
    ) => {
      return useMutation<void, ErrorResponse, SlugQuery>({
        mutationFn: async (id: SlugQuery) => {
          const endpoint = additionalPaths?.delete
            ? `${baseEndpoint}${additionalPaths.delete}/${id}`
            : `${baseEndpoint}/${id}`;

          await apiService.delete(endpoint);
        },
        onSuccess: async () => {
          const queryClient = getQueryClient();

          if (invalidateQueryKeys) {
            await Promise.all(invalidateQueryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
          } else {
            await queryClient.invalidateQueries({ queryKey: [entityKey] });
          }
          mutationOptions?.onAfterSuccess?.();
        },
        ...mutationOptions
      });
    }
  };

  return apiInstance;
}
