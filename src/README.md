# Tanq-Entity-API

Tanq-Entity-API is a high-level utility designed to simplify CRUD operations (Create, Read, Update, Delete) in React-based applications by integrating with [TanStack Query](https://tanstack.com/query/v5), [axios](https://github.com/axios/axios), and [class-transformer](https://github.com/typestack/class-transformer).

The primary goal of this library is to reduce repetitive code for common server operations such as fetching, updating, or deleting data, while also handling data transformation between classes and plain objects.

## Key Features

1. **Encapsulation of CRUD Operations**:
   - Provides hooks for all major data operations using `useQuery`, `useMutation`, `useInfiniteQuery`, and more.
   - Full set of methods available: `useGetQuery`, `useGetByIDQuery`, `useGetListByIDQuery`, `useGetListQuery`, `useCreateMutation`, `useUpdateMutation`, `useDeleteMutation`.

2. **Pagination and Array Handling**:
   - Special methods for paginated data fetching (`useGetListQuery`, `useGetInfiniteListQuery`).
   - Support for fetching arrays of entities using `useGetArrayQuery`.

3. **Integration with TanStack Query**:
   - Leverages React Query hooks for query state management (caching, refetching, parallel queries).
   - Supports `invalidateQueries` for automatic data synchronization after successful mutations (create, update, delete).

4. **Axios as HTTP Client**:
   - Executes all HTTP requests via axios, enabling flexible request configuration and support for authentication, interceptors, and other axios features.

5. **Class-Transformer for Data Handling**:
   - Transforms data between plain objects (from APIs) and class objects using class-transformer.
   - Simplifies serialization and deserialization of complex objects, making data state management easier.

6. **Flexible API Endpoint Configuration**:
   - Allows specifying additional paths for custom requests via the `additionalPaths` parameter in the API configuration.
   - Quickly adapts to different APIs without modifying the core logic.

7. **TypeScript Support**:
   - Provides strong TypeScript support for entity and query typing.
   - Includes generic types for queries, mutations, and paginated data handling.

## Benefits of Using Tanq-Entity-API

- **Reduced Boilerplate Code**: Most of the work for API interaction and data handling is abstracted, allowing you to focus on your application's business logic.
- **Easy Integration**: Seamlessly integrates with existing projects using axios and React Query.
- **Scalability for Complex Projects**: With robust typing and flexible configuration, the library is suitable for applications with complex API logic and diverse data handling requirements.

## Features

- **Entity Management**: Simplifies the creation and management of API entities.
- **Query and Mutation Hooks**: Provides pre-configured hooks for fetching, updating, creating, and deleting data.
- **Pagination Support**: Built-in support for paginated API responses.
- **Infinite Queries**: Easily manage infinite scrolling or paginated data fetching.
- **Customizable**: Highly configurable to suit your API structure and requirements.

## Installation

Install the package using npm or yarn:

```bash
npm install tanstack-query-wrapper class-transformer lodash axios @tanstack/react-query
```

or

```bash
yarn add tanstack-query-wrapper class-transformer lodash axios @tanstack/react-query
```

## Usage

### 1. Setting Up an API Instance

Use the `createApi` function to define an API instance for your entity:

```typescript
import { createApi } from './base-api';
import { MyEntity, MyEntityRequest, MyEntityCreate, MyEntityUpdate } from './models';

const myEntityApi = createApi({
  entityKey: 'myEntity',
  baseEndpoint: '/api/my-entity',
  entityConstructor: MyEntity,
  entityCreateConstructor: MyEntityCreate,
  entityUpdateConstructor: MyEntityUpdate,
  entityRequestConstructor: MyEntityRequest,
  fromInstancePartial: true,
  invalidateQueryKeys: ['myEntityList'],
  additionalPaths: {
    get: '/get',
    list: '/list',
    create: '/create',
    update: '/update',
    delete: '/delete',
  },
});
```

### 2. Using Query Hooks

#### Fetching a Single Entity

```typescript
const { data, isLoading, error } = myEntityApi.useGetQuery({
  paramsRequest: { id: 1 },
});
```

#### Fetching a List of Entities

```typescript
const { data, isLoading, error } = myEntityApi.useGetListQuery({
  paramsRequest: { page: 1, pageSize: 10 },
});
```

#### Infinite List Query

```typescript
const { data, fetchNextPage, hasNextPage } = myEntityApi.useGetInfiniteListQuery({
  paramsRequest: { pageSize: 10 },
});
```

### 3. Using Mutation Hooks

#### Creating an Entity

```typescript
const mutation = myEntityApi.useCreateMutation({
  onSuccess: () => {
    console.log('Entity created successfully!');
  },
});

mutation.mutate({ name: 'New Entity' });
```

#### Updating an Entity

```typescript
const mutation = myEntityApi.useUpdateMutation({
  onSuccess: () => {
    console.log('Entity updated successfully!');
  },
});

mutation.mutate({ id: 1, name: 'Updated Entity' });
```

#### Deleting an Entity

```typescript
const mutation = myEntityApi.useDeleteMutation({
  onSuccess: () => {
    console.log('Entity deleted successfully!');
  },
});

mutation.mutate(1);
```

### 4. Customizing Query Configurations

You can customize query configurations using the `getQueryConfig` or `getListQueryConfig` methods:

```typescript
const queryConfig = myEntityApi.getQueryConfig({
  resourceParams: { id: 1 },
  queryOptions: {
    staleTime: 5000,
  },
});
```

### 5. Pagination Support

The library provides built-in support for paginated responses. Use the `PaginationResponse` model to handle paginated data:

```typescript
const { data } = myEntityApi.useGetListQuery({
  paramsRequest: { page: 1, pageSize: 10 },
});

if (data) {
  console.log('Total Pages:', data.pages);
  console.log('Items:', data.items);
}
```

## Utilities

### `createEntityInstance`

A utility function to create an entity instance from plain data:

```typescript
import { createEntityInstance } from './utils/create-entity-instance';

const entity = createEntityInstance(MyEntity, plainData);
```

## Project Structure

The project is organized into the following main directories and files:

- **`package.json`**: Contains project metadata and dependencies.
- **`tsconfig.json`**: TypeScript configuration file.
- **`src/`**: Main source code directory.
  - **`api.ts`**: Entry point for API-related logic.
  - **`base-api.ts`**: Base API implementation for creating API instances.
  - **`README.md`**: Documentation file for the project.
  - **`models/`**: Contains data models and interfaces.
    - **`index.ts`**: Entry point for exporting models.
    - **`pagination-request.ts`**: Model for handling paginated API requests.
    - **`pagination-response.ts`**: Model for handling paginated API responses.
  - **`queries/`**: Contains query-related utilities.
    - **`get-query-client.ts`**: Utility for creating and managing a query client.
  - **`types/`**: Contains TypeScript type definitions.
    - **`api-call.ts`**: Types for API call configurations.
    - **`api-options.ts`**: Types for API options.
    - **`index.ts`**: Entry point for exporting types.
  - **`utils/`**: Contains utility functions.
    - **`create-entity-instance.ts`**: Utility for creating entity instances from plain data.

## Dependencies

- [TanStack Query](https://tanstack.com/query/v5)
- [Class Transformer](https://github.com/typestack/class-transformer)
- [Lodash](https://lodash.com/)
- [Axios](https://axios-http.com/)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.