import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'frontend',
  location: 'us-east4'
};

export const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';

export function createUser(dc) {
  return executeMutation(createUserRef(dc));
}

export const listDeliveriesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDeliveries');
}
listDeliveriesRef.operationName = 'ListDeliveries';

export function listDeliveries(dc) {
  return executeQuery(listDeliveriesRef(dc));
}

export const updateDeliveryStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateDeliveryStatus', inputVars);
}
updateDeliveryStatusRef.operationName = 'UpdateDeliveryStatus';

export function updateDeliveryStatus(dcOrVars, vars) {
  return executeMutation(updateDeliveryStatusRef(dcOrVars, vars));
}

export const getDeliveryDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDeliveryDetails', inputVars);
}
getDeliveryDetailsRef.operationName = 'GetDeliveryDetails';

export function getDeliveryDetails(dcOrVars, vars) {
  return executeQuery(getDeliveryDetailsRef(dcOrVars, vars));
}

