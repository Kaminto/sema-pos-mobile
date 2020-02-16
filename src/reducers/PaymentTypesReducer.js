import {
    SET_PAYMENT_TYPES,
    SET_RECIEPT_PAYMENT_TYPES,
    SET_CUSTOMER_PAID_DEBT,
    REMOVE_SELECTED_PAYMENT_TYPES,
    UPDATE_SELECTED_PAYMENT_TYPES,
    SET_DELIVERY,
    REMOVE_SELECTED_DEBT_PAYMENT_TYPES,
    RESET_SELECTED_PAYMENT_TYPES,
    SET_SELECTED_DEBT_PAYMENT_TYPES,
    RESET_SELECTED_DEBT_PAYMENT_TYPES,
    UPDATE_SELECTED_DEBT_PAYMENT_TYPES,
    SET_SELECTED_PAYMENT_TYPES
} from "../actions/PaymentTypesActions";

let initialState = {
    paymentTypes: [],
    selectedPaymentTypes: [],
    receiptsPaymentTypes: [],
    selectedDebtPaymentTypes: [],
    customerPaidDebt: [],
    delivery: 'delivery'
};

const paymentTypesReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case SET_PAYMENT_TYPES:
            newState = { ...state };
            newState.paymentTypes = action.data.slice();
            return newState;
        case SET_RECIEPT_PAYMENT_TYPES:
            newState = { ...state };
            newState.receiptsPaymentTypes = action.data.slice();
            return newState;
        case RESET_SELECTED_DEBT_PAYMENT_TYPES:
            newState = { ...state };
            newState.selectedDebtPaymentTypes = [];
            return newState;
        case RESET_SELECTED_PAYMENT_TYPES:
            newState = { ...state };
            newState.selectedPaymentTypes = [];
            return newState;
        case SET_CUSTOMER_PAID_DEBT:
            newState = { ...state };
            newState.customerPaidDebt = action.data.slice();
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
        case SET_SELECTED_DEBT_PAYMENT_TYPES:
            newState = { ...state };
            newState.selectedDebtPaymentTypes.push(action.data);
            return newState;
        case UPDATE_SELECTED_DEBT_PAYMENT_TYPES:
            newState = { ...state };
            newState.selectedDebtPaymentTypes[action.data.index] = action.data.selectedDebtPaymentType;
            return newState;
        case REMOVE_SELECTED_DEBT_PAYMENT_TYPES:
            newState = { ...state };
            newState.selectedDebtPaymentTypes = [];
            for (let selectedDebtPaymentType of state.selectedDebtPaymentTypes) {
                if (selectedDebtPaymentType.id !== action.data.selectedDebtPaymentType.id) {
                    newState.selectedDebtPaymentTypes.push(selectedDebtPaymentType);
                }
            }
            return newState;
        case SET_DELIVERY:
            newState = { ...state };
            newState.delivery = action.data;
            return newState;
        default:
            return state;
    }
};

export default paymentTypesReducer;

