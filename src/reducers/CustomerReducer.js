
import { CUSTOMER_SELECTED, CUSTOMERS_PAYMENT_TYPE_SEARCH, CUSTOMERS_SET, CUSTOMERS_SEARCH, CUSTOMERS_TYPE_SEARCH, CUSTOMER_EDIT, CUSTOMERS_CHANNEL_SEARCH } from "../actions/CustomerActions";
let initialState = { selectedCustomer: {}, customers: [], searchString: "", paymentTypeFilter: "", customerTypeFilter: "", channelFilterString: "", isEdit: false };

const customerReducer = (state = initialState, action) => {
	let newState;
	switch (action.type) {
		case CUSTOMER_SELECTED:
			newState = { ...state };
			newState.selectedCustomer = action.data;
			return newState;
		case CUSTOMERS_SET:
			newState = { ...state };
			newState.customers = action.data.slice();
			return newState;
		case CUSTOMERS_SEARCH:
			newState = { ...state };
			newState.searchString = action.data;
			return newState;
		case CUSTOMERS_CHANNEL_SEARCH:
			newState = { ...state };
			newState.channelFilterString = action.data;
			return newState;
		case CUSTOMERS_TYPE_SEARCH:
			newState = { ...state };
			newState.customerTypeFilter = action.data;
			return newState;
		case CUSTOMERS_PAYMENT_TYPE_SEARCH:
			newState = { ...state };
			newState.paymentTypeFilter = action.data;
			return newState;
		case CUSTOMER_EDIT:
			newState = { ...state };
			newState.isEdit = action.data;
			return newState;
		default:
			return state;
	}
};

export default customerReducer;

