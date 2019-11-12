
import { SET_CLIENT_LEDGER } from "../actions/ledger";

let initialState = { clientLegder: {} };

const clientLedgerReducer = (state = initialState, action) => {
    console.log("client Ledger Reducer:-- ", action);
    let newState;
    switch (action.type) {
        case SET_CLIENT_LEDGER:
            newState = { ...state };
            console.log(action);
            newState.clientLegder = action.data;
            return newState;
        default:
            return state;
    }
};

export default clientLedgerReducer;

