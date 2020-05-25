import {
    SET_REMOTE_RECEIPTS,
    SET_RECEIPTS,
    ADD_REMOTE_RECEIPT,
    SET_LOCAL_RECEIPTS,
    UPDATE_REMOTE_RECEIPT,
    UPDATE_LOCAL_RECEIPT,
    UPDATE_RECEIPT_LINE_ITEM,
    REMOVE_LOCAL_RECEIPT,
    RECEIPT_SEARCH,
    CLEAR_LOGGED_RECEIPTS,
    IS_UPDATE,
    SET_TRANSACTION
} from "../actions/ReceiptActions";
import CreditRealm from '../database/credit/credit.operations';
import CustomerDebtRealm from '../database/customer_debt/customer_debt.operations';
import OrderRealm from '../database/orders/orders.operations';
import ReceiptPaymentTypeRealm from '../database/reciept_payment_types/reciept_payment_types.operations';
import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import CustomerRealm from '../database/customers/customer.operations';
import { format, parseISO, isBefore } from 'date-fns';


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
            });
            newState.receipts = receipts;
            return newState;
        case IS_UPDATE:
            newState = { ...state };
            newState.isUpdate = action.data;
            return newState;
        case SET_TRANSACTION:
            newState = { ...state };
            newState.transactions = this.prepareSectionedData();
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

            newState.remoteReceipts = remoteReceipts;
            return newState;
        case ADD_REMOTE_RECEIPT:
            let { receipt } = action.data;
            newState = { ...state };
            newState.remoteReceipts.push(receipt);
            return newState;
        case SET_LOCAL_RECEIPTS:
            let { localReceipts } = action.data;
            newState = { ...state };
            newState.localReceipts = localReceipts;
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
            newState.localReceipts[localReceiptIndex] = { ...newState.localReceipts[localReceiptIndex], ...updatedLocalFields };
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


comparePaymentTypeReceipts = () => {
    let receiptsPaymentTypes = this.comparePaymentTypes();
    let customerReceipts = OrderRealm.getAllOrder();
    let finalCustomerReceiptsPaymentTypes = [];
    for (let customerReceipt of customerReceipts) {
        let paymentTypes = [];
        for (let receiptsPaymentType of receiptsPaymentTypes) {
            if (receiptsPaymentType.receipt_id === customerReceipt.id) {
                paymentTypes.push(receiptsPaymentType);
            }
        }
        customerReceipt.paymentTypes = paymentTypes;
        finalCustomerReceiptsPaymentTypes.push(customerReceipt);

    }
    return finalCustomerReceiptsPaymentTypes;
}

comparePaymentTypes = () => {
    let receiptsPaymentTypes = ReceiptPaymentTypeRealm.getReceiptPaymentTypes();
    let paymentTypes = PaymentTypeRealm.getPaymentTypes();

    let finalreceiptsPaymentTypes = [];

    for (let receiptsPaymentType of receiptsPaymentTypes) {
        const rpIndex = paymentTypes.map(function (e) { return e.id }).indexOf(receiptsPaymentType.payment_type_id);
        if (rpIndex >= 0) {
            receiptsPaymentType.name = paymentTypes[rpIndex].name;
            finalreceiptsPaymentTypes.push(receiptsPaymentType);

        }
    }
    return finalreceiptsPaymentTypes;
}



prepareData = () => {
    // Used for enumerating receipts
    const totalCount = OrderRealm.getAllOrder().length;

    let receipts = this.comparePaymentTypeReceipts().map((receipt, index) => {
        return {
            active: receipt.active,
            synched: receipt.synched,
            id: receipt.id,
            receiptId: receipt.id,
            createdAt: receipt.created_at,
            topUp: CreditRealm.getCreditByRecieptId(receipt.id),
            debt: CustomerDebtRealm.getCustomerDebtByRecieptId(receipt.id),
            isDebt: CustomerDebtRealm.getCustomerDebtByRecieptId(receipt.id) === undefined ? false : true,
            isTopUp: CreditRealm.getCreditByRecieptId(receipt.id) === undefined ? false : true,
            sectiontitle: format(parseISO(receipt.created_at), 'iiii d MMM yyyy'),
            customerAccount: receipt.customer_account,
            receiptLineItems: receipt.receipt_line_items,
            paymentTypes: receipt.paymentTypes,
            isLocal: receipt.isLocal || false,
            key: receipt.isLocal ? receipt.key : null,
            index,
            updated: receipt.updated,
            is_delete: receipt.is_delete,
            amountLoan: receipt.amount_loan,
            totalCount,
            currency: receipt.currency_code,
            isReceipt: true,
            type: 'Receipt',
            totalAmount: receipt.total,
            notes: receipt.notes
        };
    });

    receipts.sort((a, b) => {
        return isBefore(new Date(a.createdAt), new Date(b.createdAt))
            ? 1
            : -1;
    });
    // receipts = this.filterItems(receipts);

    return [...receipts];
}

prepareCustomerDebt = () => {
    let debtArray = CustomerDebtRealm.getCustomerDebtsTransactions();
    const totalCount = debtArray.length;

    let debtPayment = debtArray.map((receipt, index) => {
        return {
            active: receipt.active,
            synched: receipt.synched,
            notes: receipt.notes,
            id: receipt.customer_debt_id,
            customer_debt_id: receipt.customer_debt_id,
            receiptId: receipt.receipt_id,
            createdAt: receipt.created_at,
            sectiontitle: format(parseISO(receipt.created_at), 'iiii d MMM yyyy'),
            customerAccount: CustomerRealm.getCustomerById(receipt.customer_account_id) ? CustomerRealm.getCustomerById(receipt.customer_account_id) : receipt.customer_account_id,
            receiptLineItems: undefined,
            paymentTypes: undefined,
            description: [{ amount: receipt.due_amount, name: 'cash' }],
            isLocal: receipt.isLocal || false,
            key: null,
            index,
            updated: receipt.updated_at,
            // is_delete: receipt.is_delete,
            // amountLoan: receipt.amount_loan,
            totalCount,
            // currency: receipt.currency_code,
            isReceipt: false,
            isDebt: true,
            isTopUp: false,
            type: 'Debt Payment',
            totalAmount: receipt.due_amount,
            balance: receipt.balance
        };
    });

    debtPayment.sort((a, b) => {
        return isBefore(new Date(a.createdAt), new Date(b.createdAt))
            ? 1
            : -1;
    });
    return [...debtPayment];
}

prepareTopUpData = () => {
    // Used for enumerating receipts
    let creditArray = CreditRealm.getCreditTransactions();
    const totalCount = creditArray.length;
    let topups = creditArray.map((receipt, index) => {
        return {
            active: receipt.active,
            synched: receipt.synched,
            id: receipt.top_up_id,
            top_up_id: receipt.top_up_id,
            notes: receipt.notes,
            receiptId: receipt.receipt_id,
            createdAt: receipt.created_at,
            sectiontitle: format(parseISO(receipt.created_at), 'iiii d MMM yyyy'),
            customerAccount: CustomerRealm.getCustomerById(receipt.customer_account_id) ? CustomerRealm.getCustomerById(receipt.customer_account_id) : receipt.customer_account_id,
            receiptLineItems: undefined,
            paymentTypes: undefined,
            description: [{ amount: receipt.due_amount, name: 'cash' }],
            isLocal: receipt.isLocal || false,
            key: null,
            index,
            updated: receipt.updated_at,
            // is_delete: receipt.is_delete,
            // amountLoan: receipt.amount_loan,
            totalCount,
            // currency: receipt.currency_code,
            isReceipt: false,
            isDebt: false,
            isTopUp: true,
            type: 'Top Up',
            balance: receipt.balance,
            totalAmount: receipt.topup
        };
    });

    topups.sort((a, b) => {
        return isBefore(new Date(a.createdAt), new Date(b.createdAt))
            ? 1
            : -1;
    });
    return [...topups];
}

groupBySectionTitle = (objectArray, property) => {
    return objectArray.reduce(function (acc, obj) {
        let key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
}

prepareSectionedData = () => {
    // Used for enumerating receipts
    let receipts = this.prepareData();
    let topups = this.prepareTopUpData();
    let deptPayment = this.prepareCustomerDebt();
    let finalArray = (deptPayment.concat(topups)).concat(receipts).sort((a, b) => {
        return isBefore(new Date(a.createdAt), new Date(b.createdAt))
            ? 1
            : -1;
    });

    let transformedarray = this.groupBySectionTitle(finalArray, 'sectiontitle');
    let newarray = [];
    for (let i of Object.getOwnPropertyNames(transformedarray)) {
        newarray.push({
            title: i,
            data: transformedarray[i],
        });
    }
    return newarray;
}


let initialState = {
    localReceipts: [],
    remoteReceipts: [],
    receipts: [],
    transactions: this.prepareSectionedData(),
    updatedRemoteReceipts: [],
    recieptSearchString: "",
    isUpdate: false,
};
export default receiptReducer;


