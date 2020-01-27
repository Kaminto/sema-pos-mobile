import { SET_PAYMENT_TYPES, SET_RECIEPT_PAYMENT_TYPES, REMOVE_SELECTED_PAYMENT_TYPES, UPDATE_SELECTED_PAYMENT_TYPES, SET_SELECTED_PAYMENT_TYPES, SET_CUSTOMER_DEBT } from "../actions/PaymentTypesActions";

let initialState = { customerDebt: [], paymentTypes: [], selectedDebtPaymentTypes: [], receiptsPaymentTypes: [] };

const customerDebtReducer = (state = initialState, action) => {
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
        case SET_CUSTOMER_DEBT:
            newState = { ...state };
            newState.customerDebt = action.data.slice();
            return newState;
        case SET_SELECTED_PAYMENT_TYPES:
            newState = { ...state };
            newState.selectedDebtPaymentTypes.push(action.data);
            return newState;
        case UPDATE_SELECTED_PAYMENT_TYPES:
            newState = { ...state };
            console.log('selectedDebtPaymentType', action.data.selectedDebtPaymentType);
            console.log('index', action.data.index);
            console.log('data.index', newState.selectedDebtPaymentTypes[action.data.index]);
            newState.selectedDebtPaymentTypes[action.data.index] = action.data.selectedDebtPaymentType;
            return newState;
        case REMOVE_SELECTED_PAYMENT_TYPES:
            newState = { ...state };
            newState.selectedDebtPaymentTypes = [];
            for (let selectedDebtPaymentType of state.selectedDebtPaymentTypes) {
                if (selectedDebtPaymentType.id !== action.data.selectedDebtPaymentType.id) {
                    newState.selectedDebtPaymentTypes.push(selectedDebtPaymentType);
                }
            }
            return newState;
        default:
            return state;
    }
};

export default customerDebtReducer;

