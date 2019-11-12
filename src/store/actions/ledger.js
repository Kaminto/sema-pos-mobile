import { NavigationActions } from 'react-navigation'
export const SET_CLIENT_LEDGER = 'SET_CLIENT_LEDGER';
export const LOAD_CLIENT_LEDGER = 'LOAD_CLIENT_LEDGER';
export const WITHDRAW_CHARGE = 'WITHDRAW_CHARGE';
export const MAKE_PAYMENT = 'MAKE_PAYMENT';

export const getClientLedger = (client_id) => {
    console.log("search client_id", client_id);
    return dispatch => {
        fetch("http://35.177.161.105/api/v2/ledger.php", {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ method: 'get_ledgerByClient', client_id}),
        })
            .catch(err => {
                alert("Something went wrong, sorry :/");
                console.log(err);
            })
            .then(res => res.json())
            .then(parsedRes => {
                console.log("parsedRes", parsedRes);
                // return parsedRes;
                dispatch(setClientLedger(parsedRes));
                NavigationActions.navigate({ routeName: 'Tabs' })
               // return 1;
            });
    };
};

export const setClientLedger = data => {
    return {
        type: SET_CLIENT_LEDGER,
        data
    };
};

