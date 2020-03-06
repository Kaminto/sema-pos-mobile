import CustomerDebtRealm from '../database/customer_debt/customer_debt.operations';
import OrderRealm from '../database/orders/orders.operations';
import { parseISO, isSameDay } from 'date-fns';
export const SALES_REPORT_FROM_ORDERS = 'SALES_REPORT_FROM_ORDERS';
export const INVENTORY_REPORT = 'INVENTORY_REPORT';
export const REPORT_FILTER = 'REPORT_FILTER';
export const REMINDER_REPORT = 'REMINDER_REPORT';
export const ADD_REMINDER = 'ADD_REMINDER';

import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import ReceiptPaymentTypeRealm from '../database/reciept_payment_types/reciept_payment_types.operations';


export function GetSalesReportData(beginDate, endDate) {
	return dispatch => {
		dispatch({
			type: SALES_REPORT_FROM_ORDERS,
			data: { salesData: { ...getSalesData(beginDate, endDate), totalDebt: getTotalDebt(beginDate, endDate) } }
		});
	};
}

function getTotalDebt(beginDate, endDate) {
	const customerDebts = CustomerDebtRealm.getCustomerDebts();
	const filteredDebt = customerDebts.filter(debt =>
		isSameDay(parseISO(debt.created_at), beginDate)
	)
	return filteredDebt.reduce((total, item) => { return (total + item.due_amount) }, 0);
}

export function setReportFilter(startDate, endDate) {
	return dispatch => {
		dispatch({
			type: REPORT_FILTER,
			data: { startDate: startDate, endDate: endDate }
		});
	};
}

function groupBySku(objectArray, property) {
	return objectArray.reduce(function (acc, obj) {
		let key = obj.product[property];
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(obj);
		return acc;
	}, {});
}

function totalByProperty(objectArray, property) {
	return objectArray.reduce((accumulator, currentValue) => {
		return accumulator + (!isNaN(Number(currentValue[property])) ? Number(currentValue[property]) : 0);
	}, 0);
}


function getTotalTypes(beginDate, filteredOrders) {
	let groupedTypes = { ...groupPaymentTypes(beginDate, filteredOrders) };
	let groupedTotals = [];
	let objKeys = [...Object.keys(groupedTypes)];
	let totalEarnings = 0;
	for (let key of objKeys) {
		let amount = groupedTypes[key].reduce((total, item) => {
			return total + item.amount;
		}, 0);
		groupedTotals.push({
			name: key,
			totalAmount: amount
		});
		totalEarnings = totalEarnings + amount;
	}
	groupedTotals.push({
		name: 'TOTAL EARNINGS',
		totalAmount: totalEarnings
	});

	return groupedTotals;
}

function groupPaymentTypes(beginDate, filteredOrders) {
	let types = [...comparePaymentTypeReceipts(beginDate, filteredOrders)],
		result = types.reduce(function (r, a) {
			r[a.name] = r[a.name] || [];
			r[a.name].push(a);
			return r;
		}, Object.create(null));
	return result;
}

function comparePaymentTypes(beginDate) {
	let filteredReceiptPaymentTypes = [];
		filteredReceiptPaymentTypes = ReceiptPaymentTypeRealm.getReceiptPaymentTypes().filter(receiptpayment =>
			isSameDay(parseISO(receiptpayment.created_at), beginDate)
		);
	

	let paymentTypes = [...PaymentTypeRealm.getPaymentTypes()];
	let finalreceiptsPaymentTypes = [];
	for (let receiptsPaymentType of filteredReceiptPaymentTypes) {
		const rpIndex = paymentTypes.map(function (e) { return e.id }).indexOf(receiptsPaymentType.payment_type_id);
		if (rpIndex >= 0) {
			receiptsPaymentType.name = paymentTypes[rpIndex].name;
			finalreceiptsPaymentTypes.push(receiptsPaymentType);
		}
	}
	return finalreceiptsPaymentTypes;
}

function comparePaymentTypeReceipts(beginDate, receipts) {
	let receiptsPaymentTypes = comparePaymentTypes(beginDate);
	let customerReceipts = receipts;
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


const getSalesData = (beginDate) => {
	const orders = OrderRealm.getActiveOrders();
	const filteredOrders = orders.filter(receipt =>
		isSameDay(parseISO(receipt.created_at), beginDate) && receipt.is_delete !== 0
	);

	let totalTypes = getTotalTypes(beginDate, filteredOrders);

	let filteredOrderItems = filteredOrders.reduce(function (accumulator, currentValue) {
		return [...accumulator, ...currentValue.receipt_line_items]
	}, []);

	let groupedOrderItems = groupBySku(filteredOrderItems, "sku");
	let todaySales = [];
	for (let i of Object.getOwnPropertyNames(groupedOrderItems)) {

		let totalAmount = totalByProperty(groupedOrderItems[i], "price_total");
		todaySales.push({
			sku: groupedOrderItems[i][0].product.sku,
			wastageName: groupedOrderItems[i][0].product.wastageName,
			description: groupedOrderItems[i][0].product.description,
			quantity: groupedOrderItems[i][0].product.description.includes('delivery') || groupedOrderItems[i][0].product.description.includes('discount') ? 1 : totalByProperty(groupedOrderItems[i], "quantity"),
			category: groupedOrderItems[i][0].product.category_id ? Number(groupedOrderItems[i][0].product.category_id) : Number(groupedOrderItems[i][0].product.categoryId),
			pricePerSku: parseFloat(groupedOrderItems[i][0].price_total) / totalByProperty(groupedOrderItems[i], "quantity"),
			totalSales: groupedOrderItems[i][0].product.description.includes('delivery') || groupedOrderItems[i][0].product.description.includes('discount') ?
				parseFloat(totalAmount)
				: parseFloat(totalAmount),
				// * totalByProperty(groupedOrderItems[i], "quantity"),
			litersPerSku: groupedOrderItems[i][0].product.unit_per_product ? Number(groupedOrderItems[i][0].product.unit_per_product) : Number(groupedOrderItems[i][0].product.unitPerProduct),
			totalLiters: groupedOrderItems[i][0].product.unit_per_product ? Number(groupedOrderItems[i][0].product.unit_per_product) * totalByProperty(groupedOrderItems[i], "quantity") : Number(groupedOrderItems[i][0].product.unitPerProduct) * totalByProperty(groupedOrderItems[i], "quantity")
		});
	}

	const finalData = {
		totalLiters: totalByProperty(todaySales, "totalLiters"),
		totalSales: totalByProperty(todaySales, "totalSales"),
		salesItems: todaySales,
		totalTypes: totalTypes
	}
	return { ...finalData };
};

