import { DISCOUNTS_SET } from "../actions/DiscountActions";

let initialState = { discounts: [] };

const discountReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case DISCOUNTS_SET:
            newState = { ...state };
            newState.discounts = action.data.slice();
            return newState;
        default:
            return state;
    }
};

export default discountReducer;

