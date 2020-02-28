import  PaymentTypeRealm  from '../payment_types/payment_types.operations';
import  ReceiptPaymentTypeRealm  from '../reciept_payment_types/reciept_payment_types.operations';
import  OrderRealm  from '../orders/orders.operations';
import { format, parseISO, isBefore } from 'date-fns';

class TransactionOperations { 
    getTransactions() {
       return this.prepareSectionedData();
    }

    groupBySectionTitle(objectArray, property) {
		return objectArray.reduce(function (acc, obj) {
			let key = obj[property];
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(obj);
			return acc;
		}, {});
    }
    

    prepareSectionedData() {
		// Used for enumerating receipts 

		let transformedarray = this.groupBySectionTitle(this.sortTransactions(), 'sectiontitle');

		let newarray = [];
		for (let i of Object.getOwnPropertyNames(transformedarray)) {
			newarray.push({
				title: i,
				data: transformedarray[i],
			});
        }
       
		return newarray;
	}

    sortTransactions(){
        let receipts = this.comparePaymentTypeReceipts().map((receipt, index) => {
            return {
                    active: receipt.active,
                    id: receipt.id,
                    receiptId: receipt.id,
                    createdAt: receipt.created_at,
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
                    currency: receipt.currency_code,
                    totalAmount: receipt.total
                };
            });    
            receipts.sort((a, b) => {
                return isBefore(new Date(a.createdAt), new Date(b.createdAt))
                        ? 1
                        : -1;
            });
            return [...receipts];
    }

    comparePaymentTypeReceipts() {
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
		console.log(JSON.stringify(finalCustomerReceiptsPaymentTypes))
		return finalCustomerReceiptsPaymentTypes;
	}

    comparePaymentTypes() {
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

}

export default new TransactionOperations();