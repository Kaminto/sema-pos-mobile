export const CUSTOMER_SELECTED = 'CUSTOMER_SELECTED';
export const CUSTOMERS_LOADED = 'CUSTOMERS_LOADED';
export const CUSTOMERS_SET = 'CUSTOMERS_SET';
export const CUSTOMERS_SEARCH = 'CUSTOMERS_SEARCH';
export const CUSTOMER_EDIT = 'CUSTOMER_EDIT';
export const IS_LOADING = 'IS_LOADING' 
export const CUSTOMERS_CHANNEL_SEARCH = 'CUSTOMERS_CHANNEL_SEARCH';
export const CUSTOMERS_TYPE_SEARCH = 'CUSTOMERS_TYPE_SEARCH';
export const CUSTOMERS_PAYMENT_TYPE_SEARCH = 'CUSTOMERS_PAYMENT_TYPE_SEARCH';
export const CUSTOMER_PROPS = 'CUSTOMER_PROPS';
export const IS_UPDATE = 'IS_UPDATE';

export function CustomerSelected(customer) {
	const data = customer;
	return (dispatch) => { dispatch({ type: CUSTOMER_SELECTED, data: data });	};
}

export function SetCustomerProp(customer) {
	const data = customer;
	return (dispatch) => { dispatch({ type: CUSTOMER_PROPS, data: data });	};
}

export function setCustomers(customers) {
	return (dispatch) => { dispatch({ type: CUSTOMERS_SET, data: customers }) };

}

export function SearchCustomers(searchString) {
	return (dispatch) => { dispatch({ type: CUSTOMERS_SEARCH, data: searchString }) };
}

export function SearchCustomersChannel(channelFilterString) {
	return (dispatch) => { dispatch({ type: CUSTOMERS_CHANNEL_SEARCH, data: channelFilterString }) };
}

export function SearchCustomerTypes(customerTypeFilter) {
	return (dispatch) => { dispatch({ type: CUSTOMERS_TYPE_SEARCH, data: customerTypeFilter }) };
}

export function SearchPaymentType(paymentTypeFilter) {
	return (dispatch) => { dispatch({ type: CUSTOMERS_PAYMENT_TYPE_SEARCH, data: paymentTypeFilter }) };
}


export function setCustomerEditStatus(status) {
	return (dispatch) => { dispatch({ type: CUSTOMER_EDIT, data: status }) };
}

export function setIsLoading(status) {
	return (dispatch) => { dispatch({ type: IS_LOADING, data: status }) };
}

export function setIsUpate(status) {
	return (dispatch) => { dispatch({ type: IS_UPDATE, data: status }) };
}

