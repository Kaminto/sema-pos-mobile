
import { SELECTED_CLIENT, SET_CLIENT, SEARCH_CLIENTS } from "../actions/clients";

let initialState = { selectedClient: {}, clients: [], searchString: "" };

const clientReducer = (state = initialState, action) => {
	console.log("client Reducer: ", action);
	let newState;
	switch (action.type) {
		case SELECTED_CLIENT:
			newState = { ...state };
			newState.selectedClient = action.data;
			return newState;
		case SET_CLIENT:
			newState = { ...state };
			console.log(action);
			newState.clients = action.data.slice();
			return newState;
		case SEARCH_CLIENTS:
			newState = { ...state };
			newState.searchString = action.data;
			return newState;
		default:
			return state;
	}
};

export default clientReducer;

