import {
    SET_REMOTE_RECEIPTS,
    SET_RECEIPTS,
    ADD_REMOTE_RECEIPT,
    SET_TRANSACTIONS,
    UPDATE_REMOTE_RECEIPT,
    UPDATE_LOCAL_RECEIPT,
    UPDATE_RECEIPT_LINE_ITEM,
    REMOVE_LOCAL_RECEIPT,
    RECEIPT_SEARCH,
    CLEAR_LOGGED_RECEIPTS
} from "../actions/ReceiptActions";
// import { format, isSameDay, parseISO} from 'date-fns';

let initialState = {
    transactions: [],
    remoteReceipts: [],
    receipts: [],
    updatedRemoteReceipts: [],
    recieptSearchString: ""
};

const receiptReducer = (state = initialState, action) => {
    let newState;

    switch (action.type) {
        case SET_RECEIPTS:
            let { receipts } = action.data;
            newState = { ...state };
            receipts = receipts.length ? receipts : newState.receipts;
            receipts = receipts.map(receipt => {
                // Make sure we don't sync a logged receipt for no reason on next sync
                if (receipt.updated) {
                    receipt.updated = false;
                }
				receipt.isLocal = false;
                return receipt;
            })
                // Take care of receipts that are not from this weeks
                // .filter(receipt => {
                //     let date = new Date(Date.now());
				// 	date.setDate(date.getDate() - 7);
				// 	let this_week = format(date, 'yyyy-MM-dd');
				// 	return isSameDay(new Date(receipt.created_at), parseISO(this_week));
                // });
            newState.receipts = receipts;
            return newState;
        case SET_REMOTE_RECEIPTS:
            let { remoteReceipts } = action.data;
            newState = { ...state };
            remoteReceipts = remoteReceipts.length ? remoteReceipts : newState.remoteReceipts;
            remoteReceipts = remoteReceipts.map(receipt => {
                // Make sure we don't sync a logged receipt for no reason on next sync
                if (receipt.updated) {
                    receipt.updated = false;
                }
				receipt.isLocal = false;
                return receipt;
            })
                // Take care of receipts that are not from this weeks
                // .filter(receipt => {
                //     let date = new Date(Date.now());
				// 	date.setDate(date.getDate() - 7);
				// 	let this_week = format(date, 'yyyy-MM-dd');
				// 	return isSameDay(new Date(receipt.created_at), parseISO(this_week));

                // });
            newState.remoteReceipts = remoteReceipts;
            return newState;
        case ADD_REMOTE_RECEIPT:
            let { receipt } = action.data;
            newState = { ...state };
            newState.remoteReceipts.push(receipt);
            return newState;
        case SET_TRANSACTIONS:
            let { transactions } = action.data;
            newState = { ...state };
            newState.transactions = transactions;
            return newState;
        case UPDATE_REMOTE_RECEIPT:
            let {
                remoteReceiptIndex,
                updatedRemoteFields
            } = action.data;
            newState = { ...state };
            newState.remoteReceipts[remoteReceiptIndex] = { ...newState.remoteReceipts[remoteReceiptIndex], ...updatedRemoteFields, updated: true };
            newState.remoteReceipts[remoteReceiptIndex].receipt_line_items = newState.remoteReceipts[remoteReceiptIndex].receipt_line_items.map(item => {
                item.active = updatedRemoteFields.active;
                return item;
            });
            return newState;
        case UPDATE_RECEIPT_LINE_ITEM:
            let {
                receiptIndex,
                lineItemIndex,
                updatedLineItemFields
            } = action.data;
            newState = { ...state };
            newState.remoteReceipts[receiptIndex] = { ...newState.remoteReceipts[receiptIndex], updated: true, updatedLineItem: true };
            newState.remoteReceipts[receiptIndex].receipt_line_items[lineItemIndex] = { ...newState.remoteReceipts[receiptIndex].receipt_line_items[lineItemIndex], ...updatedLineItemFields };
            return newState;
        case UPDATE_LOCAL_RECEIPT:
            let {
                localReceiptIndex,
                updatedLocalFields
            } = action.data;
            newState = { ...state };
            newState.transactions[localReceiptIndex] = { ...newState.transactions[localReceiptIndex], ...updatedLocalFields };
            return newState;
        case REMOVE_LOCAL_RECEIPT:
            let {
                receiptId
            } = action.data;
            newState = { ...state };
            newState.remoteReceipts = newState.remoteReceipts.map(receipt => {
                if (receipt.id === receiptId) {
                    receipt.isLocal = false;
                }
                return receipt;
            });
            return newState;
        case RECEIPT_SEARCH:
            newState = { ...state };
            newState.recieptSearchString = action.data;
            return newState;
        case CLEAR_LOGGED_RECEIPTS:
            newState = { ...initialState };
            return newState;
        default:
            return state;
    }
};

export default receiptReducer;


