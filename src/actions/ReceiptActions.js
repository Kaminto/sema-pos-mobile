export const SET_REMOTE_RECEIPTS = 'SET_REMOTE_RECEIPTS';
export const ADD_REMOTE_RECEIPT = 'ADD_REMOTE_RECEIPT';
export const SET_LOCAL_RECEIPTS = 'SET_LOCAL_RECEIPTS';
export const UPDATE_REMOTE_RECEIPT = 'UPDATE_REMOTE_RECEIPT';
export const UPDATE_LOCAL_RECEIPT = 'UPDATE_LOCAL_RECEIPT';
export const UPDATE_RECEIPT_LINE_ITEM = 'UPDATE_RECEIPT_LINE_ITEM';
export const REMOVE_LOCAL_RECEIPT = 'REMOVE_LOCAL_RECEIPT';
export const RECEIPT_SEARCH = 'RECEIPT_SEARCH';
export const CLEAR_LOGGED_RECEIPTS = 'CLEAR_LOGGED_RECEIPTS';
export const SET_RECEIPTS = 'SET_RECEIPTS';
export const IS_UPDATE = 'IS_UPDATE';
export const SET_TRANSACTION = 'SET_TRANSACTION';
export const UPDATE_TRANSACTION = 'UPDATE_TRANSACTION';

export function setRemoteReceipts(remoteReceipts) {
    return (dispatch) => { dispatch({ type: SET_REMOTE_RECEIPTS, data: { remoteReceipts } }) };
}


export function setReceipts(receipts) {
    return (dispatch) => { dispatch({ type: SET_RECEIPTS, data: { receipts } }) };
}


export function setTransaction() {
    return (dispatch) => { dispatch({ type: SET_TRANSACTION }) };
}

export function updateTransaction(data) {
    return (dispatch) => { dispatch({ type: UPDATE_TRANSACTION, data }) };
}


export function addRemoteReceipt(receipt) {
    return dispatch => { dispatch({ type: ADD_REMOTE_RECEIPT, data: { receipt } }) };
}

export function clearLoggedReceipts(receipt) {
    return dispatch => { dispatch({ type: CLEAR_LOGGED_RECEIPTS, data: {} }) };
}

export function setLocalReceipts(localReceipts) {
    return dispatch => { dispatch({ type: SET_LOCAL_RECEIPTS, data: { localReceipts } }) };
}

export function removeLocalReceipt(receiptId) {
    return dispatch => { dispatch({ type: REMOVE_LOCAL_RECEIPT, data: { receiptId } }) };
}

export function updateRemoteReceipt(receiptIndex, updatedFields) {
    return dispatch => {
        dispatch({
            type: UPDATE_REMOTE_RECEIPT,
            data: {
                remoteReceiptIndex: receiptIndex,
                updatedRemoteFields: updatedFields
            }
        })
    };
}

export function SearchReceipts(searchString) {
    return (dispatch) => { dispatch({ type: RECEIPT_SEARCH, data: searchString }) };
}

export function updateReceiptLineItem(receiptIndex, lineItemIndex, updatedFields) {
    return dispatch => {
        dispatch({
            type: UPDATE_RECEIPT_LINE_ITEM,
            data: {
                receiptIndex,
                lineItemIndex,
                updatedLineItemFields: updatedFields
            }
        })
    };
}

export function setIsUpate(status) {
    return (dispatch) => { dispatch({ type: IS_UPDATE, data: status }) };
}


