export const NETWORK_CONNECTION_CHANGE = 'NETWORK_CONNECTION_CHANGE';

export function NetworkConnection( isNWConnected){
	return (dispatch) => { dispatch({type: NETWORK_CONNECTION_CHANGE, data:isNWConnected});};
}
