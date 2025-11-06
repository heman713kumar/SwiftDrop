import { CreateUserData, ListDeliveriesData, UpdateDeliveryStatusData, UpdateDeliveryStatusVariables, GetDeliveryDetailsData, GetDeliveryDetailsVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useListDeliveries(options?: useDataConnectQueryOptions<ListDeliveriesData>): UseDataConnectQueryResult<ListDeliveriesData, undefined>;
export function useListDeliveries(dc: DataConnect, options?: useDataConnectQueryOptions<ListDeliveriesData>): UseDataConnectQueryResult<ListDeliveriesData, undefined>;

export function useUpdateDeliveryStatus(options?: useDataConnectMutationOptions<UpdateDeliveryStatusData, FirebaseError, UpdateDeliveryStatusVariables>): UseDataConnectMutationResult<UpdateDeliveryStatusData, UpdateDeliveryStatusVariables>;
export function useUpdateDeliveryStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateDeliveryStatusData, FirebaseError, UpdateDeliveryStatusVariables>): UseDataConnectMutationResult<UpdateDeliveryStatusData, UpdateDeliveryStatusVariables>;

export function useGetDeliveryDetails(vars: GetDeliveryDetailsVariables, options?: useDataConnectQueryOptions<GetDeliveryDetailsData>): UseDataConnectQueryResult<GetDeliveryDetailsData, GetDeliveryDetailsVariables>;
export function useGetDeliveryDetails(dc: DataConnect, vars: GetDeliveryDetailsVariables, options?: useDataConnectQueryOptions<GetDeliveryDetailsData>): UseDataConnectQueryResult<GetDeliveryDetailsData, GetDeliveryDetailsVariables>;
