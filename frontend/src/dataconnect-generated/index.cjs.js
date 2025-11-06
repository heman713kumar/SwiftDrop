const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'frontend',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dc) {
  return executeMutation(createUserRef(dc));
};

const listDeliveriesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDeliveries');
}
listDeliveriesRef.operationName = 'ListDeliveries';
exports.listDeliveriesRef = listDeliveriesRef;

exports.listDeliveries = function listDeliveries(dc) {
  return executeQuery(listDeliveriesRef(dc));
};

const updateDeliveryStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateDeliveryStatus', inputVars);
}
updateDeliveryStatusRef.operationName = 'UpdateDeliveryStatus';
exports.updateDeliveryStatusRef = updateDeliveryStatusRef;

exports.updateDeliveryStatus = function updateDeliveryStatus(dcOrVars, vars) {
  return executeMutation(updateDeliveryStatusRef(dcOrVars, vars));
};

const getDeliveryDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDeliveryDetails', inputVars);
}
getDeliveryDetailsRef.operationName = 'GetDeliveryDetails';
exports.getDeliveryDetailsRef = getDeliveryDetailsRef;

exports.getDeliveryDetails = function getDeliveryDetails(dcOrVars, vars) {
  return executeQuery(getDeliveryDetailsRef(dcOrVars, vars));
};
