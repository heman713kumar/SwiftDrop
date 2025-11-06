import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateUserData {
  user_insert: User_Key;
}

export interface Delivery_Key {
  id: UUIDString;
  __typename?: 'Delivery_Key';
}

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

export interface GetDeliveryDetailsVariables {
  id: UUIDString;
}

export interface Item_Key {
  id: UUIDString;
  __typename?: 'Item_Key';
}

export interface ListDeliveriesData {
  deliveries: ({
    id: UUIDString;
    pickupAddress: string;
    dropoffAddress: string;
    status: string;
  } & Delivery_Key)[];
}

export interface Payment_Key {
  id: UUIDString;
  __typename?: 'Payment_Key';
}

export interface Rating_Key {
  id: UUIDString;
  __typename?: 'Rating_Key';
}

export interface UpdateDeliveryStatusData {
  delivery_update?: Delivery_Key | null;
}

export interface UpdateDeliveryStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface ListDeliveriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListDeliveriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListDeliveriesData, undefined>;
  operationName: string;
}
export const listDeliveriesRef: ListDeliveriesRef;

export function listDeliveries(): QueryPromise<ListDeliveriesData, undefined>;
export function listDeliveries(dc: DataConnect): QueryPromise<ListDeliveriesData, undefined>;

interface UpdateDeliveryStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDeliveryStatusVariables): MutationRef<UpdateDeliveryStatusData, UpdateDeliveryStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateDeliveryStatusVariables): MutationRef<UpdateDeliveryStatusData, UpdateDeliveryStatusVariables>;
  operationName: string;
}
export const updateDeliveryStatusRef: UpdateDeliveryStatusRef;

export function updateDeliveryStatus(vars: UpdateDeliveryStatusVariables): MutationPromise<UpdateDeliveryStatusData, UpdateDeliveryStatusVariables>;
export function updateDeliveryStatus(dc: DataConnect, vars: UpdateDeliveryStatusVariables): MutationPromise<UpdateDeliveryStatusData, UpdateDeliveryStatusVariables>;

interface GetDeliveryDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDeliveryDetailsVariables): QueryRef<GetDeliveryDetailsData, GetDeliveryDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetDeliveryDetailsVariables): QueryRef<GetDeliveryDetailsData, GetDeliveryDetailsVariables>;
  operationName: string;
}
export const getDeliveryDetailsRef: GetDeliveryDetailsRef;

export function getDeliveryDetails(vars: GetDeliveryDetailsVariables): QueryPromise<GetDeliveryDetailsData, GetDeliveryDetailsVariables>;
export function getDeliveryDetails(dc: DataConnect, vars: GetDeliveryDetailsVariables): QueryPromise<GetDeliveryDetailsData, GetDeliveryDetailsVariables>;

