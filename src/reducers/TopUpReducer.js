
import { TOPUP_TOTAL, TOPUPS_SET, TOPUP_BALANCE } from "../actions/TopUpActions";

let initialState = { total: 0, topups: [], balance: 0 };

const topupReducer = (state = initialState, action) => {
	let newState;
	switch (action.type) {
		case TOPUP_TOTAL:
			newState = { ...state };
			newState.total = action.data;
			return newState;
		case TOPUPS_SET:
			newState = { ...state };
			newState.topups = action.data.slice();
			return newState;
		case TOPUP_BALANCE:
			newState = { ...state };
			newState.balance = action.data;
			return newState;
		default:
			return state;
	}
};

export default topupReducer;

