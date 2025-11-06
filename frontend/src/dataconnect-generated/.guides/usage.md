# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateUser, useListDeliveries, useUpdateDeliveryStatus, useGetDeliveryDetails } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateUser();

const { data, isPending, isSuccess, isError, error } = useListDeliveries();

const { data, isPending, isSuccess, isError, error } = useUpdateDeliveryStatus(updateDeliveryStatusVars);

const { data, isPending, isSuccess, isError, error } = useGetDeliveryDetails(getDeliveryDetailsVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, listDeliveries, updateDeliveryStatus, getDeliveryDetails } from '@dataconnect/generated';


// Operation CreateUser: 
const { data } = await CreateUser(dataConnect);

// Operation ListDeliveries: 
const { data } = await ListDeliveries(dataConnect);

// Operation UpdateDeliveryStatus:  For variables, look at type UpdateDeliveryStatusVars in ../index.d.ts
const { data } = await UpdateDeliveryStatus(dataConnect, updateDeliveryStatusVars);

// Operation GetDeliveryDetails:  For variables, look at type GetDeliveryDetailsVars in ../index.d.ts
const { data } = await GetDeliveryDetails(dataConnect, getDeliveryDetailsVars);


```