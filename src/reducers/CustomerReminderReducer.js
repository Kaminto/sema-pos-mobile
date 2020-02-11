import {
    RESET_CUSTOMER_REMINDER,
    SET_CUSTOMER_REMINDER,
    UPDATE_CUSTOMER_REMINDER,
    REMOVE_CUSTOMER_REMINDER,
} from "../actions/CustomerReminderActions";

let initialState = {
    customerReminder: [],
};


const customerReminderReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case RESET_CUSTOMER_REMINDER:
            newState = { ...state };
            newState.customerReminder = [];
            return newState;
        case SET_CUSTOMER_REMINDER:
            newState = { ...state };
            newState.customerReminder = action.data.slice();
            return newState;
        case UPDATE_CUSTOMER_REMINDER:
            newState = { ...state };
            newState.customerReminder[action.data.index] = action.data.customerReminder;
            return newState;
        case REMOVE_CUSTOMER_REMINDER:
            newState = { ...state };
            newState.customerReminder = [];
            for (let element of state.customerReminder) {
                if (element.id !== action.data.customerReminder.id) {
                    newState.customerReminder.push(element);
                }
            }
            return newState;
        default:
            return state;
    }
};

export default customerReminderReducer;
