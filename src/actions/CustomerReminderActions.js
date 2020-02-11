export const RESET_CUSTOMER_REMINDER = 'RESET_CUSTOMER_REMINDER';
export const SET_CUSTOMER_REMINDER = 'SET_CUSTOMER_REMINDER';
export const UPDATE_CUSTOMER_REMINDER = 'UPDATE_CUSTOMER_REMINDER';
export const REMOVE_CUSTOMER_REMINDER = 'REMOVE_CUSTOMER_REMINDER';

export function resetCustomerReminder() {
	return (dispatch) => { dispatch({ type: RESET_CUSTOMER_REMINDER, data: [] }) };
}

export function setCustomerReminders(customerReminder) {
    return (dispatch) => { dispatch({ type: SET_CUSTOMER_REMINDER, data: customerReminder }) };
}

export function updateCustomerReminder(customerReminder, index) {
    return (dispatch) => { dispatch({ type: UPDATE_CUSTOMER_REMINDER, data: { customerReminder, index } }) };
}

export function removeCustomerReminder(customerReminder, index) {
    return (dispatch) => { dispatch({ type: REMOVE_CUSTOMER_REMINDER, data: { customerReminder, index } }) };
}