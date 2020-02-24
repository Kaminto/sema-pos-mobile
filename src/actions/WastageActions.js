import PosStorage from '../database/PosStorage';
import ProductMRPRealm from '../database/productmrp/productmrp.operations';
import OrderRealm from '../database/orders/orders.operations';
export const SALES_REPORT_FROM_ORDERS = 'SALES_REPORT_FROM_ORDERS';
export const INVENTORY_REPORT = 'INVENTORY_REPORT';
export const REPORT_TYPE = 'REPORT_TYPE';
export const REPORT_FILTER = 'REPORT_FILTER';

import { parseISO, isSameDay} from 'date-fns';

const getSalesDatae = (beginDate, endDate) => {
	return new Promise(async (resolve, reject) => {
		const loggedReceipts = OrderRealm.getAllOrder();
		const filteredReceipts = loggedReceipts.filter(receipt =>
		   isSameDay(parseISO(receipt.created_at), beginDate)
		);
		const allReceiptLineItems = filteredReceipts.reduce(
			(lineItems, receipt) => {
				receipt.receipt_line_items = receipt.receipt_line_items.map(
					item => {
						item.product = {
							active: item.product.active,
							categoryId: item.product.category_id,
							cogsAmount: item.product.cogs_amount,
							wastageName: item.product.wastageName,
							description: item.product.description,
							maximumQuantity: item.product.maximum_quantity,
							minimumQuantity: item.product.minimum_quantity,
							name: item.product.name,
							priceAmount: item.product.price_amount,
							priceCurrency: item.product.price_currency,
							sku: item.product.sku,
							unitMeasure: item.product.unit_measure,
							unitPerProduct: item.product.unit_per_product
						};

						return item;
					}
				);
				lineItems.push(...receipt.receipt_line_items);

				return lineItems;
			},
			[]
		);
		if (!allReceiptLineItems.length) {
			return resolve({ totalLiters: 0, totalSales: 0, totalDebt: 0, salesItems: [] });
		}

		const finalData = allReceiptLineItems.reduce(
			(final, lineItem) => {
				const productIndex = final.mapping.get(lineItem.product.sku);

				const product =
					typeof productIndex !== 'undefined'
						? final.salesItems[productIndex]
						: {
							sku: lineItem.product.sku,
							wastageName: lineItem.product.wastageName,
							description: lineItem.product.description,
							quantity: Number(lineItem.quantity),
							category: Number(lineItem.product.categoryId),
							pricePerSku:
								parseFloat(lineItem.price_total) /
								Number(lineItem.quantity),
							totalSales: parseFloat(lineItem.price_total),
							litersPerSku: Number(
								lineItem.product.unitPerProduct
								// lineItem.litersPerSku
							),
							totalLiters:
								Number(lineItem.litersPerSku) *
								Number(lineItem.quantity),
							isNew: true
						};

				if (product.isNew) {
					delete product.isNew;

					final.salesItems.push(product);
					final.mapping.set(
						lineItem.product.sku,
						final.salesItems.length - 1
					);
				} else {
					product.quantity += Number(lineItem.quantity);
					product.totalSales += parseFloat(lineItem.price_total);
					product.totalLiters +=
						Number(lineItem.litersPerSku) *
						Number(lineItem.quantity);

					final.salesItems[productIndex] = product;
				}

				final.totalLiters +=
					Number(lineItem.litersPerSku) *
					Number(lineItem.quantity);
				final.totalSales += parseFloat(lineItem.price_total);
				return final;
			},
			{
				totalLiters: 0,
				totalSales: 0,
				salesItems: [],
				mapping: new Map()
			}
		);

		finalData.mapping.clear();
		delete finalData.mapping;
		resolve({ ...finalData });
	});
};
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
		return accumulator + Number(currentValue[property]);
	}, 0);
}
const getSalesData = (beginDate, endDate) => {
	const orders = OrderRealm.getAllOrder();
	const filteredOrders = orders.filter(receipt =>
		moment
			.tz(new Date(receipt.created_at), moment.tz.guess())
			.isBetween(beginDate, endDate)
	);

	let filteredOrderItems = filteredOrders.reduce(function (accumulator, currentValue) {
		return [...accumulator, ...currentValue.receipt_line_items]
	}, []);

	let groupedOrderItems = groupBySku(filteredOrderItems, "sku");

	let todaySales = [];
	for (let i of Object.getOwnPropertyNames(groupedOrderItems)) {
		todaySales.push({
			sku: groupedOrderItems[i][0].product.sku,
			wastageName: groupedOrderItems[i][0].product.wastageName,
			description: groupedOrderItems[i][0].product.description,
			quantity: totalByProperty(groupedOrderItems[i], "quantity"),
			category: groupedOrderItems[i][0].product.category_id ? Number(groupedOrderItems[i][0].product.category_id) : Number(groupedOrderItems[i][0].product.categoryId),
			pricePerSku: parseFloat(groupedOrderItems[i][0].price_total) / totalByProperty(groupedOrderItems[i], "quantity"),
			totalSales: parseFloat(groupedOrderItems[i][0].price_total) * totalByProperty(groupedOrderItems[i], "quantity"),
			litersPerSku: groupedOrderItems[i][0].product.unit_per_product ? Number(groupedOrderItems[i][0].product.unit_per_product) : Number(groupedOrderItems[i][0].product.unitPerProduct),
			totalLiters: groupedOrderItems[i][0].product.unit_per_product ? Number(groupedOrderItems[i][0].product.unit_per_product) * totalByProperty(groupedOrderItems[i], "quantity") : Number(groupedOrderItems[i][0].product.unitPerProduct) * totalByProperty(groupedOrderItems[i], "quantity")

		}
		);
	}

	const finalData = {
		totalLiters: totalByProperty(todaySales, "totalLiters"),
		totalSales: totalByProperty(todaySales, "totalSales"),
		salesItems: todaySales,
	}
	return { ...finalData };
};

export const getMrps = products => {
	let productMrp = ProductMRPRealm.getFilteredProductMRP();
	let ids = Object.keys(productMrp).map(key => productMrp[key].productId);

	let matchProducts = products.filter(prod => ids.includes(prod.productId));
	let waterProducts = matchProducts.filter(prod => 3 === prod.categoryId);
	return waterProducts;
};

export function GetInventoryReportData(beginDate, endDate, products) {
	return dispatch => {
		getWastageData(beginDate, endDate, getMrps(products))
			.then(inventoryData => {
				console.log('inventoryData', inventoryData);
				dispatch({
					type: INVENTORY_REPORT,
					data: { inventoryData: inventoryData }
				});
			})
			.catch(error => {
				dispatch({
					type: INVENTORY_REPORT,
					data: { inventoryData: [] }
				});
			});
	};
}

export const getWastageData = (beginDate, endDate, products) => {
	return new Promise((resolve, reject) => {				
				getInventoryItem(beginDate, products)
					.then(inventorySettings => {
						let inventoryData = createInventory(
							getSalesData(beginDate, endDate),
							inventorySettings,
							products
						);
						console.log('inventoryData', inventoryData);
						resolve(inventoryData);
					})
					.catch(error => {
						reject(error);
					});
		 
	});
};

const createInventory = (salesData, inventorySettings, products) => {
	let salesAndProducts = { ...salesData };
	salesAndProducts.salesItems = salesData.salesItems.slice();

	console.log("Well" + salesAndProducts.salesItems.length + JSON.stringify(salesAndProducts.salesItems))
	let emptyProducts = [];
	for (const prod of products) {
		if (isNotIncluded(prod, salesAndProducts.salesItems)) {
			emptyProducts.push({
				sku: prod.sku,
				description: prod.description,
				quantity: 0,
				totalSales: 0,
				totalLiters: 0,
				litersPerSku: prod.unitPerProduct,
				wastageName: prod.wastageName
			});
		}
	}
	salesAndProducts.salesItems = salesAndProducts.salesItems.concat(
		emptyProducts
	);

	const groupWastageName = groupBy('wastageName');

	let salesArray = Object.values(groupWastageName(salesAndProducts.salesItems));

	let newSalesArray = [];
	for (var i in salesArray) {
		salesTotal = 0;
		litersTotal = 0;
		litersPerSkuTotal = 0;
		quantityTotal = 0;
		for (var a in salesArray[i]) {
			if (salesArray[i][a].wastageName != null) {
				salesTotal = salesTotal + salesArray[i][a].totalSales;
				litersTotal = litersTotal + salesArray[i][a].totalLiters;
				litersPerSkuTotal = litersPerSkuTotal + salesArray[i][a].litersPerSku;
				quantityTotal = quantityTotal + salesArray[i][a].quantity;
			}
		}

		if (salesArray[i][0].wastageName != null) {
			newSalesArray.push({
				wastageName: salesArray[i][0].wastageName,
				totalSales: salesTotal,
				totalLiters: litersTotal,
				litersPerSku: litersPerSkuTotal,
				quantity: quantityTotal
			});
		}
	}

	salesAndProducts.salesItems = newSalesArray;
	let inventoryData = {
		salesAndProducts: salesAndProducts,
		inventory: inventorySettings
	};
	return inventoryData;
};

const isNotIncluded = (product, salesAndProducts) => {
	for (let index = 0; index < salesAndProducts.length; index++) {
		if (salesAndProducts[index].wastageName == product.wastageName) {
			return false;
		}
	}
	return true;
};

const groupBy = key => array =>
	array.reduce((objectsByKeyValue, obj) => {
		const value = obj[key];
		objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
		return objectsByKeyValue;
	}, {});

const getInventoryItem = (beginDate, products) => {
	return new Promise(resolve => {
		const promiseToday = PosStorage.getInventoryItem(beginDate);
		promiseToday.then(resultToday => {
			console.log('resultToday', resultToday);
		});
		const yesterday = new Date(beginDate.getTime() - 24 * 60 * 60 * 1000);
		const promiseYesterday = PosStorage.getInventoryItem(yesterday);
		promiseYesterday.then(resultYesterday => {
			console.log('resultYesterday', resultYesterday);
		});
		 
		Promise.all([promiseToday, promiseYesterday]).then(inventoryResults => {
			if (inventoryResults[0] != null) {
				if (inventoryResults[1]) {
					inventoryResults[0].previousProductSkus = inventoryResults[1].currentProductSkus;
					inventoryResults[0].previousMeter = inventoryResults[1].currentMeter;
				}
				resolve(inventoryResults[0]);
			} else {
				let newInventory = initializeInventory();
				newInventory.date = beginDate;

				newInventory.currentProductSkus = products.map(product => {
					return { sku: product.sku, wastageName: product.wastageName, quantity: 0, inventory: 0 };
				});


				newInventory.previousProductSkus = products.map(product => {
					return { sku: product.sku, wastageName: product.wastageName, quantity: 0, inventory: 0 };
				});

				const groupWastageName = groupBy('wastageName');

				let previousArray = Object.values(groupWastageName(newInventory.previousProductSkus));
				let currentArray = Object.values(groupWastageName(newInventory.currentProductSkus));
				let newpreviousArray = [];
				for (var i in previousArray) {
					inventoryTotal = 0;
					quantityTotal = 0;
					notDispatchedTotal = 0;
					for (var a in previousArray[i]) {
						if (previousArray[i][a].wastageName != null) {
							inventoryTotal = inventoryTotal + previousArray[i][a].inventory;
							quantityTotal = quantityTotal + previousArray[i][a].quantity;
							notDispatchedTotal = notDispatchedTotal + previousArray[i][a].notDispatched;
						}
					}

					if (previousArray[i][0].wastageName != null) {
						newpreviousArray.push({
							wastageName: previousArray[i][0].wastageName,
							product_id: previousArray[i][0].wastageName,
							inventory: inventoryTotal,
							notDispatched: notDispatchedTotal,
							kiosk_id: "",
							closingStockId: "",
							createdDate: "",
							quantity: quantityTotal
						});
					}
				}

				newInventory.previousProductSkus = newpreviousArray;

				let newcurrentArray = [];
				for (var i in currentArray) {
					inventoryTotal = 0;
					quantityTotal = 0;
					notDispatchedTotal = 0;
					for (var a in currentArray[i]) {
						if (currentArray[i][a].wastageName != null) {
							inventoryTotal = inventoryTotal + currentArray[i][a].inventory;
							quantityTotal = quantityTotal + currentArray[i][a].quantity;
							notDispatchedTotal = notDispatchedTotal + currentArray[i][a].notDispatched;
						}
					}

					if (currentArray[i][0].wastageName != null) {
						newcurrentArray.push({
							wastageName: currentArray[i][0].wastageName,
							product_id: previousArray[i][0].wastageName,
							inventory: inventoryTotal,
							notDispatched: notDispatchedTotal,
							kiosk_id: "",
							closingStockId: "",
							createdDate: "",
							quantity: quantityTotal
						});
					}
				}
				newInventory.currentProductSkus = newcurrentArray;

				if (inventoryResults[1]) {
					newInventory.previousProductSkus = inventoryResults[1].currentProductSkus;
					newInventory.previousMeter = inventoryResults[1].currentMeter;
				}
				console.log('newInventory', newInventory);
				resolve(newInventory);
			}
		});
	});
};

const initializeInventory = () => {
	return {
		date: null,
		currentMeter: null,
		currentProductSkus: [],
		previousMeter: null,
		previousProductSkus: []
	};
};

export const initializeSalesData = () => {
	return { totalLiters: null, totalSales: null, totalDebt: null, salesItems: [] };
};

export const initializeInventoryData = () => {
	return {
		salesAndProducts: initializeSalesData(),
		inventory: initializeInventory()
	};
};


