# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListDeliveries*](#listdeliveries)
  - [*GetDeliveryDetails*](#getdeliverydetails)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateDeliveryStatus*](#updatedeliverystatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListDeliveries
You can execute the `ListDeliveries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listDeliveries(): QueryPromise<ListDeliveriesData, undefined>;

interface ListDeliveriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListDeliveriesData, undefined>;
}
export const listDeliveriesRef: ListDeliveriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listDeliveries(dc: DataConnect): QueryPromise<ListDeliveriesData, undefined>;

interface ListDeliveriesRef {
  ...
  (dc: DataConnect): QueryRef<ListDeliveriesData, undefined>;
}
export const listDeliveriesRef: ListDeliveriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listDeliveriesRef:
```typescript
const name = listDeliveriesRef.operationName;
console.log(name);
```

### Variables
The `ListDeliveries` query has no variables.
### Return Type
Recall that executing the `ListDeliveries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListDeliveriesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListDeliveriesData {
  deliveries: ({
    id: UUIDString;
    pickupAddress: string;
    dropoffAddress: string;
    status: string;
  } & Delivery_Key)[];
}
```
### Using `ListDeliveries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listDeliveries } from '@dataconnect/generated';


// Call the `listDeliveries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listDeliveries();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listDeliveries(dataConnect);

console.log(data.deliveries);

// Or, you can use the `Promise` API.
listDeliveries().then((response) => {
  const data = response.data;
  console.log(data.deliveries);
});
```

### Using `ListDeliveries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listDeliveriesRef } from '@dataconnect/generated';


// Call the `listDeliveriesRef()` function to get a reference to the query.
const ref = listDeliveriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listDeliveriesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.deliveries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.deliveries);
});
```

## GetDeliveryDetails
You can execute the `GetDeliveryDetails` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getDeliveryDetails(vars: GetDeliveryDetailsVariables): QueryPromise<GetDeliveryDetailsData, GetDeliveryDetailsVariables>;

interface GetDeliveryDetailsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDeliveryDetailsVariables): QueryRef<GetDeliveryDetailsData, GetDeliveryDetailsVariables>;
}
export const getDeliveryDetailsRef: GetDeliveryDetailsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getDeliveryDetails(dc: DataConnect, vars: GetDeliveryDetailsVariables): QueryPromise<GetDeliveryDetailsData, GetDeliveryDetailsVariables>;

interface GetDeliveryDetailsRef {
  ...
  (dc: DataConnect, vars: GetDeliveryDetailsVariables): QueryRef<GetDeliveryDetailsData, GetDeliveryDetailsVariables>;
}
export const getDeliveryDetailsRef: GetDeliveryDetailsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getDeliveryDetailsRef:
```typescript
const name = getDeliveryDetailsRef.operationName;
console.log(name);
```

### Variables
The `GetDeliveryDetails` query requires an argument of type `GetDeliveryDetailsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetDeliveryDetailsVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetDeliveryDetails` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetDeliveryDetailsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetDeliveryDetailsData {
  delivery?: {
    id: UUIDString;
    pickupAddress: string;
    dropoffAddress: string;
    status: string;
    itemDescription?: string | null;
    estimatedCost?: number | null;
    actualCost?: number | null;
    customer: {
      displayName: string;
      phoneNumber: string;
    };
      agent?: {
        displayName: string;
        phoneNumber: string;
      };
  } & Delivery_Key;
}
```
### Using `GetDeliveryDetails`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getDeliveryDetails, GetDeliveryDetailsVariables } from '@dataconnect/generated';

// The `GetDeliveryDetails` query requires an argument of type `GetDeliveryDetailsVariables`:
const getDeliveryDetailsVars: GetDeliveryDetailsVariables = {
  id: ..., 
};

// Call the `getDeliveryDetails()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getDeliveryDetails(getDeliveryDetailsVars);
// Variables can be defined inline as well.
const { data } = await getDeliveryDetails({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getDeliveryDetails(dataConnect, getDeliveryDetailsVars);

console.log(data.delivery);

// Or, you can use the `Promise` API.
getDeliveryDetails(getDeliveryDetailsVars).then((response) => {
  const data = response.data;
  console.log(data.delivery);
});
```

### Using `GetDeliveryDetails`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getDeliveryDetailsRef, GetDeliveryDetailsVariables } from '@dataconnect/generated';

// The `GetDeliveryDetails` query requires an argument of type `GetDeliveryDetailsVariables`:
const getDeliveryDetailsVars: GetDeliveryDetailsVariables = {
  id: ..., 
};

// Call the `getDeliveryDetailsRef()` function to get a reference to the query.
const ref = getDeliveryDetailsRef(getDeliveryDetailsVars);
// Variables can be defined inline as well.
const ref = getDeliveryDetailsRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getDeliveryDetailsRef(dataConnect, getDeliveryDetailsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.delivery);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.delivery);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation has no variables.
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser } from '@dataconnect/generated';


// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef } from '@dataconnect/generated';


// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateDeliveryStatus
You can execute the `UpdateDeliveryStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateDeliveryStatus(vars: UpdateDeliveryStatusVariables): MutationPromise<UpdateDeliveryStatusData, UpdateDeliveryStatusVariables>;

interface UpdateDeliveryStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDeliveryStatusVariables): MutationRef<UpdateDeliveryStatusData, UpdateDeliveryStatusVariables>;
}
export const updateDeliveryStatusRef: UpdateDeliveryStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateDeliveryStatus(dc: DataConnect, vars: UpdateDeliveryStatusVariables): MutationPromise<UpdateDeliveryStatusData, UpdateDeliveryStatusVariables>;

interface UpdateDeliveryStatusRef {
  ...
  (dc: DataConnect, vars: UpdateDeliveryStatusVariables): MutationRef<UpdateDeliveryStatusData, UpdateDeliveryStatusVariables>;
}
export const updateDeliveryStatusRef: UpdateDeliveryStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateDeliveryStatusRef:
```typescript
const name = updateDeliveryStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateDeliveryStatus` mutation requires an argument of type `UpdateDeliveryStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateDeliveryStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateDeliveryStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateDeliveryStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateDeliveryStatusData {
  delivery_update?: Delivery_Key | null;
}
```
### Using `UpdateDeliveryStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateDeliveryStatus, UpdateDeliveryStatusVariables } from '@dataconnect/generated';

// The `UpdateDeliveryStatus` mutation requires an argument of type `UpdateDeliveryStatusVariables`:
const updateDeliveryStatusVars: UpdateDeliveryStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateDeliveryStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateDeliveryStatus(updateDeliveryStatusVars);
// Variables can be defined inline as well.
const { data } = await updateDeliveryStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateDeliveryStatus(dataConnect, updateDeliveryStatusVars);

console.log(data.delivery_update);

// Or, you can use the `Promise` API.
updateDeliveryStatus(updateDeliveryStatusVars).then((response) => {
  const data = response.data;
  console.log(data.delivery_update);
});
```

### Using `UpdateDeliveryStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateDeliveryStatusRef, UpdateDeliveryStatusVariables } from '@dataconnect/generated';

// The `UpdateDeliveryStatus` mutation requires an argument of type `UpdateDeliveryStatusVariables`:
const updateDeliveryStatusVars: UpdateDeliveryStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateDeliveryStatusRef()` function to get a reference to the mutation.
const ref = updateDeliveryStatusRef(updateDeliveryStatusVars);
// Variables can be defined inline as well.
const ref = updateDeliveryStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateDeliveryStatusRef(dataConnect, updateDeliveryStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.delivery_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.delivery_update);
});
```

