import {
	CUSTOMER_SELECTED,
	CUSTOMERS_PAYMENT_TYPE_SEARCH,
	CUSTOMERS_SET, CUSTOMERS_SEARCH,
	CUSTOMERS_TYPE_SEARCH,
	CUSTOMER_EDIT,
	CUSTOMER_PROPS,
	CUSTOMERS_CHANNEL_SEARCH,
	IS_LOADING,
	IS_UPDATE
} from "../actions/CustomerActions";
let initialState = {
	selectedCustomer: {},
	customers: [],
	searchString: "",
	paymentTypeFilter: "",
	customerProps: {
		isDueAmount: 0,
		isCustomerSelected: false,
		customerName: '',
		customerTypeValue: 'all',
	},
	customerTypeFilter: "all",
	isEdit: false,
	isLoading: false,
	isUpdate: false,
};

const customerReducer = (state = initialState, action) => {
	let newState;
	switch (action.type) {
		case CUSTOMER_SELECTED:
			newState = { ...state };
			//	newState.selectedCustomer = action.data;
			return { ...newState, selectedCustomer: action.data };
		case CUSTOMER_PROPS:
			newState = { ...state };
			newState.customerProps = action.data;
			return newState;
		case CUSTOMERS_SET:
			newState = { ...state };
			newState.customers = action.data.slice();
			return newState;
		case CUSTOMERS_SEARCH:
			newState = { ...state };
			newState.searchString = action.data;
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
		case IS_LOADING:
			newState = { ...state };
			newState.isLoading = action.data;
			return newState;

		case IS_UPDATE:
			newState = { ...state };
			newState.isUpdate = action.data;
			return newState;

		default:
			return state;
	}
};

export default customerReducer;

