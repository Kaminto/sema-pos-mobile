export const SET_PAYMENT_TYPES = 'SET_PAYMENT_TYPES';
export const SET_SELECTED_PAYMENT_TYPES = 'SET_SELECTED_PAYMENT_TYPES';
export const UPDATE_SELECTED_PAYMENT_TYPES = 'UPDATE_SELECTED_PAYMENT_TYPES';
export const REMOVE_SELECTED_PAYMENT_TYPES = 'REMOVE_SELECTED_PAYMENT_TYPES';

export function setPaymentTypes(paymentTypes) {
    return (dispatch) => { dispatch({ type: SET_PAYMENT_TYPES, data: paymentTypes }) };
}

export function setSelectedPaymentTypes(selectedPaymentTypes) {
    return (dispatch) => { dispatch({ type: SET_SELECTED_PAYMENT_TYPES, data: selectedPaymentTypes }) };
}

export function updateSelectedPaymentType(selectedPaymentType, index) {
    return (dispatch) => { dispatch({ type: UPDATE_SELECTED_PAYMENT_TYPES, data: { selectedPaymentType, index } }) };
}
