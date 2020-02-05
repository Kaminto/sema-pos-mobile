export const SET_PAYMENT_TYPES = 'SET_PAYMENT_TYPES';
export const SET_SELECTED_PAYMENT_TYPES = 'SET_SELECTED_PAYMENT_TYPES';
export const UPDATE_SELECTED_PAYMENT_TYPES = 'UPDATE_SELECTED_PAYMENT_TYPES';
export const REMOVE_SELECTED_PAYMENT_TYPES = 'REMOVE_SELECTED_PAYMENT_TYPES';
export const SET_DELIVERY = 'SET_DELIVERY';
export const SET_CUSTOMER_PAID_DEBT = 'SET_CUSTOMER_PAID_DEBT';
export const SET_RECIEPT_PAYMENT_TYPES = 'SET_RECIEPT_PAYMENT_TYPES';
export const RESET_SELECTED_DEBT_PAYMENT_TYPES = 'RESET_SELECTED_DEBT_PAYMENT_TYPES';

export const SET_SELECTED_DEBT_PAYMENT_TYPES = 'SET_SELECTED_DEBT_PAYMENT_TYPES';
export const UPDATE_SELECTED_DEBT_PAYMENT_TYPES = 'UPDATE_SELECTED_DEBT_PAYMENT_TYPES';
export const REMOVE_SELECTED_DEBT_PAYMENT_TYPES = 'REMOVE_SELECTED_DEBT_PAYMENT_TYPES';

export function setPaymentTypes(paymentTypes) {
    return (dispatch) => { dispatch({ type: SET_PAYMENT_TYPES, data: paymentTypes }) };
}

export function resetSelectedDebt() {
	return (dispatch) => { dispatch({ type: RESET_SELECTED_DEBT_PAYMENT_TYPES, data: [] }) };

}

export function setRecieptPaymentTypes(receiptsPaymentTypes) {
    return (dispatch) => { dispatch({ type: SET_RECIEPT_PAYMENT_TYPES, data: receiptsPaymentTypes }) };
}

export function setCustomerPaidDebt(customerPaidDebt) {
    return (dispatch) => { dispatch({ type: SET_CUSTOMER_PAID_DEBT, data: customerPaidDebt }) };
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


export function setSelectedDebtPaymentTypes(selectedDebtPaymentTypes) {
    console.log('selectedDebtPaymentTypes', selectedDebtPaymentTypes)
    return (dispatch) => { dispatch({ type: SET_SELECTED_DEBT_PAYMENT_TYPES, data: selectedDebtPaymentTypes }) };
}

export function updateSelectedDebtPaymentType(selectedDebtPaymentType, index) {
    return (dispatch) => { dispatch({ type: UPDATE_SELECTED_DEBT_PAYMENT_TYPES, data: { selectedDebtPaymentType, index } }) };
}

export function removeSelectedDebtPaymentType(selectedDebtPaymentType, index) {
    return (dispatch) => { dispatch({ type: REMOVE_SELECTED_DEBT_PAYMENT_TYPES, data: { selectedDebtPaymentType, index } }) };
}