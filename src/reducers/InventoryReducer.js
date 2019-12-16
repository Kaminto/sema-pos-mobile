
import { INVENTORY_SET, SET_METER_READING } from "../actions/InventoryActions";

let initialState = { inventory: [], meterReadings: [] };

const inventoryReducer = (state = initialState, action) => {
	let newState;
	switch (action.type) {
		case INVENTORY_SET:
			newState = { ...state };
			newState.inventory = action.data.slice();
            return newState;
            case SET_METER_READING:
			newState = { ...state };
			newState.meterReadings = action.data.slice();
			return newState;
		default:
			return state;
	}
};

export default inventoryReducer;

