export const SET_PAYMENT_TYPES = 'SET_PAYMENT_TYPES';
export const SET_SELECTED_PAYMENT_TYPES = 'SET_SELECTED_PAYMENT_TYPES';
export const UPDATE_SELECTED_PAYMENT_TYPES = 'UPDATE_SELECTED_PAYMENT_TYPES';
export const REMOVE_SELECTED_PAYMENT_TYPES = 'REMOVE_SELECTED_PAYMENT_TYPES';
export const SET_DELIVERY = 'SET_DELIVERY';
export const SET_CUSTOMER_DEBT = 'SET_CUSTOMER_DEBT';

export function setPaymentTypes(paymentTypes) {
    return (dispatch) => { dispatch({ type: SET_PAYMENT_TYPES, data: paymentTypes }) };
}

export function setCustomerDebt(customerDebt) {
    return (dispatch) => { dispatch({ type: SET_CUSTOMER_DEBT, data: customerDebt }) };
}

export function setSelectedPaymentTypes(selectedPaymentTypes) {
    return (dispatch) => { dispatch({ type: SET_SELECTED_PAYMENT_TYPES, data: selectedPaymentTypes }) };
}

export function updateSelectedPaymentType(selectedPaymentType, index) {
    return (dispatch) => { dispatch({ type: UPDATE_SELECTED_PAYMENT_TYPES, data: { selectedPaymentType, index } }) };
}

export function removeSelectedPaymentType(selectedPaymentType, index) {
    return (dispatch) => { dispatch({ type: REMOVE_SELECTED_PAYMENT_TYPES, data: { selectedPaymentType, index } }) };
}

export function setDelivery(delivery) {
    return (dispatch) => { dispatch({ type: SET_DELIVERY, data: delivery }) };
}
