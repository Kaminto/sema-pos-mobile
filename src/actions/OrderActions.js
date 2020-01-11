export const ADD_PRODUCT_TO_ORDER = 'ADD_PRODUCT';
export const CLEAR_ORDER = 'CLEAR_ORDER';
export const LOAD_SELECTED_DISCOUNTS = 'LOAD_SELECTED_DISCOUNTS';
export const REMOVE_PRODUCT = 'REMOVE_PRODUCT';
export const SET_PRODUCT_QUANTITY = 'SET_PRODUCT_QUANTITY';
export const SET_ORDER_CHANNEL = 'SET_CHANNEL';
export const SET_ORDER_FLOW = 'SET_ORDER_FLOW';
export const SET_PAYMENT = 'SET_PAYMENT';
export const SET_DISCOUNTS = 'SET_DISCOUNTS';
export const REMOVE_PRODUCT_DISCOUNT = 'REMOVE_PRODUCT_DISCOUNT';

export function AddProductToOrder(product, quantity, price) {
	// console.log("AddProductToOrder - action");
	return dispatch => {
		dispatch({
			type: ADD_PRODUCT_TO_ORDER,
			data: { product: product, quantity: quantity, unitPrice: price }
		});
	};
}

export function RemoveProductFromOrder(product, price) {
	// console.log("RemoveProductFromOrder - action");
	return dispatch => {
		dispatch({ type: REMOVE_PRODUCT, data: { product: product, unitPrice: price } });
	};
}

export function SetProductQuantity(product, quantity, price) {
	// console.log("SetProductQuantity - action");
	return dispatch => {
		dispatch({
			type: SET_PRODUCT_QUANTITY,
			data: { product: product, quantity: quantity, unitPrice: price }
		});
	};
}

export function SetOrderChannel(channel) {
	// console.log("SetOrderChannel - action");
	return dispatch => {
		dispatch({
			type: SET_ORDER_CHANNEL,
			data: { channel: { salesChannel: channel } }
		});
	};
}


export function SetOrderDiscounts(isCustom, customDiscount, product, discount, totalPrice) {
	return dispatch => {
		dispatch({
			type: SET_DISCOUNTS,
			data: { isCustom, product, discount, totalPrice,  customDiscount  }
		});
	};
}

export function RemoveProductDiscountsFromOrder(product, discount, discountId) {
	 console.log("REMOVE_PRODUCT_DISCOUNT - action");
	return dispatch => {
		dispatch({ type: REMOVE_PRODUCT_DISCOUNT, data: { product, discount, discountId } });
	};
}


export function SetOrderFlow(page) {
	// console.log("SetOrderFlow - action");
	return dispatch => {
		dispatch({ type: SET_ORDER_FLOW, data: { flow: { page: page } } });
	};
}

export function SetPayment(payment) {
	// console.log("SetPayment - action");
	return dispatch => {
		dispatch({ type: SET_PAYMENT, data: { payment: payment } });
	};
}

export function ClearOrder() {
	// console.log("ClearOrder - action");
	return dispatch => {
		dispatch({ type: CLEAR_ORDER, data: {} });
	};
}
