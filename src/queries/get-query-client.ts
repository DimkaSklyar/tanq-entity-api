import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount: number, error: Error | AxiosError) => {
          if (axios.isAxiosError(error) && (error?.response?.status === 400 || error?.response?.status === 401)) {
            return false;
          }

          return failureCount <= 1;
        }
      },
      hydrate: {
        deserializeData: (data) => JSON.parse(data)
      },
      dehydrate: {
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
        serializeData: (data) => JSON.stringify(data)
      }
    }
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
