import * as Network from 'expo-network';

export const isConnected = async () => {
  const networkState = await Network.getNetworkStateAsync();
  return networkState.isConnected;
};
