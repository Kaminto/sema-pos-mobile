import { SET_PAYMENT_TYPES, REMOVE_SELECTED_PAYMENT_TYPES, UPDATE_SELECTED_PAYMENT_TYPES, SET_SELECTED_PAYMENT_TYPES } from "../actions/PaymentTypesActions";

let initialState = { paymentTypes: [], selectedPaymentTypes: [] };

const paymentTypesReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case SET_PAYMENT_TYPES:
            newState = { ...state };
            newState.paymentTypes = action.data.slice();
            return newState;
        case SET_SELECTED_PAYMENT_TYPES:
            newState = { ...state };
            newState.selectedPaymentTypes.push(action.data);
            return newState;
        case UPDATE_SELECTED_PAYMENT_TYPES:
            newState = { ...state };
            newState.selectedPaymentTypes[action.data.index] = action.data.selectedPaymentType;
            return newState;
        case REMOVE_SELECTED_PAYMENT_TYPES:
            newState = { ...state };
            newState.selectedPaymentTypes = [];
			for (let selectedPaymentType of state.selectedPaymentTypes) {
				if (selectedPaymentType.id !== action.data.selectedPaymentType.id) {
					newState.selectedPaymentTypes.push(selectedPaymentType);
				}
			}
			return newState;
        default:
            return state;
    }
};

export default paymentTypesReducer;

