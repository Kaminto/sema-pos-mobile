import PosStorage from '../database/PosStorage';
import ProductMRPRealm from '../database/productmrp/productmrp.operations';
import OrderRealm from '../database/orders/orders.operations';
import { REMOVE_PRODUCT } from './OrderActions';
import moment from 'moment-timezone';

export const SALES_REPORT_FROM_ORDERS = 'SALES_REPORT_FROM_ORDERS';
export const INVENTORY_REPORT = 'INVENTORY_REPORT';
export const REPORT_TYPE = 'REPORT_TYPE';
export const REPORT_FILTER = 'REPORT_FILTER';
export const REMINDER_REPORT = 'REMINDER_REPORT';
export const ADD_REMINDER = 'ADD_REMINDER';

export function GetSalesReportData(beginDate, endDate) {
	// console.log('GetSalesReportData - action');

	return dispatch => {
		getSalesData(beginDate, endDate)
			.then(salesData => {
				dispatch({
					type: SALES_REPORT_FROM_ORDERS,
					data: { salesData: salesData }
				});
			})
			.catch(error => {
				console.log('GetSalesReportData - Error ' + error);
				dispatch({
					type: SALES_REPORT_FROM_ORDERS,
					data: { salesData: [] }
				});
			});
	};
}

export function setReportType(reportType) {
	// console.log('setReportType - action');
	return dispatch => {
		dispatch({ type: REPORT_TYPE, data: reportType });
	};
}

export function setReportFilter(startDate, endDate) {
	// console.log('setReportFilter - action');
	return dispatch => {
		dispatch({
			type: REPORT_FILTER,
			data: { startDate: startDate, endDate: endDate }
		});
	};
}

const getSalesData = (beginDate, endDate) => {
	return new Promise(async (resolve, reject) => {
		const loggedReceipts = OrderRealm.getAllOrder();
		//const loggedReceipts = PosStorage.getRemoteReceipts();
		console.log('loggedReceipts', loggedReceipts)
		const filteredReceipts = loggedReceipts.filter(receipt =>
			moment
				.tz(new Date(receipt.created_at), moment.tz.guess())
				.isBetween(beginDate, endDate)
		);

		const allReceiptLineItems = filteredReceipts.reduce(
			(lineItems, receipt) => {
				// We only show data for active receipts
				if (!receipt.active) return lineItems;

				if (!receipt.isLocal) {
					receipt.receipt_line_items = receipt.receipt_line_items.map(
						item => {
							console.log('item', item)
							item.product = {
								active: item.product.active,
								categoryId: item.product.category_id,
								cogsAmount: item.product.cogs_amount,
								wastageName: item.product.wastage_name,
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
				} else {
					// Get rid of the image property from the product of pending receipt line items
					// too heavy to carry around. We're not using it here anyway
					receipt.receipt_line_items.forEach(item => {
						delete item.product.base64encodedImage;
					});
				}

				lineItems.push(...receipt.receipt_line_items);

				return lineItems;
			},
			[]
		);

		if (!allReceiptLineItems.length) {
			return resolve({ totalLiters: 0, totalSales: 0, salesItems: [] });
		}

		const finalData = allReceiptLineItems.reduce(
			(final, lineItem) => {
				const productIndex = final.mapping.get(lineItem.product.sku);
				console.log('lineItem', lineItem)
				// Note how we explicitly check it's undefined. The index could be 0
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
							),
							totalLiters:
								Number(lineItem.product.unitPerProduct) *
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
						Number(lineItem.product.unitPerProduct) *
						Number(lineItem.quantity);

					final.salesItems[productIndex] = product;
				}

				final.totalLiters +=
					Number(lineItem.product.unitPerProduct) *
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

		console.log('finalData', finalData)

		resolve(finalData);
	});
};

const getMrps = products => {
	let productMrp = ProductMRPRealm.getFilteredProductMRP();
	console.log('productMrp', productMrp);
	console.log('Object.keys', Object.keys(productMrp));
	let ids = Object.keys(productMrp).map(key => productMrp[key].productId);
	console.log('idsids', ids);

	let matchProducts = products.filter(prod => ids.includes(prod.productId));
	console.log('matchProducts', matchProducts);
	let waterProducts = matchProducts.filter(prod => 3 === prod.categoryId);
	console.log('waterProducts', waterProducts);
	return waterProducts;
};

export function GetInventoryReportData(beginDate, endDate, products) {
	console.log('GetInventoryReportData - action');
	console.log('GetInventoryReportData - products', products);
	return dispatch => {
		getInventoryData(beginDate, endDate, getMrps(products))
			.then(inventoryData => {
				console.log('GetInventoryReportData - products', INVENTORY_REPORT);
				dispatch({
					type: INVENTORY_REPORT,
					data: { inventoryData: inventoryData }
				});
			})
			.catch(error => {
				console.log('GetInventoryReportData - Error ' + error);
				dispatch({
					type: INVENTORY_REPORT,
					data: { inventoryData: [] }
				});
			});
	};
}

const getInventoryData = (beginDate, endDate, products) => {
	return new Promise((resolve, reject) => {
		getSalesData(beginDate, endDate)
			.then(salesData => {
				console.log('salesData', salesData);
				console.log('products', products);
				getInventoryItem(beginDate, products)
					.then(inventorySettings => {
						console.log('inventorySettings', inventorySettings);
						let inventoryData = createInventory(
							salesData,
							inventorySettings,
							products
						);
						resolve(inventoryData);
					})
					.catch(error => {
						reject(error);
					});
			})
			.catch(error => {
				reject(error);
			});
	});
};

const createInventory = (salesData, inventorySettings, products) => {
	let salesAndProducts = { ...salesData };
	salesAndProducts.salesItems = salesData.salesItems.slice();
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

	console.log('salesAndProducts', salesAndProducts.salesItems);

	const groupWastageName = groupBy('wastageName');

	console.log('groupSales', groupWastageName(salesAndProducts.salesItems));

	console.log('SalesObject', Object.values(groupWastageName(salesAndProducts.salesItems)));
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
	console.log('newSalesArray', newSalesArray);


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
		const yesterday = new Date(beginDate.getTime() - 24 * 60 * 60 * 1000);
		const promiseYesterday = PosStorage.getInventoryItem(yesterday);
		Promise.all([promiseToday, promiseYesterday]).then(inventoryResults => {
			console.log('inventoryResults', inventoryResults);
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

				console.log('groupPreviousProductSkus', groupWastageName(newInventory.previousProductSkus));
				console.log('groupCurrentProductSkus', groupWastageName(newInventory.currentProductSkus));

				console.log('Object', Object.values(groupWastageName(newInventory.previousProductSkus)))
				console.log('Object2', Object.values(groupWastageName(newInventory.currentProductSkus)))
				let previousArray = Object.values(groupWastageName(newInventory.previousProductSkus));
				let currentArray = Object.values(groupWastageName(newInventory.currentProductSkus));
				let newpreviousArray = [];
				for (var i in previousArray) {
					inventoryTotal = 0;
					quantityTotal = 0;
					for (var a in previousArray[i]) {
						if (previousArray[i][a].wastageName != null) {
							inventoryTotal = inventoryTotal + previousArray[i][a].inventory;
							quantityTotal = quantityTotal + previousArray[i][a].quantity;
						}
					}

					if (previousArray[i][0].wastageName != null) {
						newpreviousArray.push({
							wastageName: previousArray[i][0].wastageName,
							product_id: previousArray[i][0].wastageName,
							inventory: inventoryTotal,
							kiosk_id: "",
							closingStockId: "",
							createdDate: "",
							quantity: quantityTotal
						});
					}
				}
				console.log(newpreviousArray);
				newInventory.previousProductSkus = newpreviousArray;

				///

				let newcurrentArray = [];
				for (var i in currentArray) {
					inventoryTotal = 0;
					quantityTotal = 0;
					for (var a in currentArray[i]) {
						if (currentArray[i][a].wastageName != null) {
							inventoryTotal = inventoryTotal + currentArray[i][a].inventory;
							quantityTotal = quantityTotal + currentArray[i][a].quantity;
						}
					}

					if (currentArray[i][0].wastageName != null) {
						newcurrentArray.push({
							wastageName: currentArray[i][0].wastageName,
							product_id: previousArray[i][0].wastageName,
							inventory: inventoryTotal,
							kiosk_id: "",
							closingStockId: "",
							createdDate: "",
							quantity: quantityTotal
						});
					}
				}
				console.log(newcurrentArray);
				newInventory.currentProductSkus = newcurrentArray;


				if (inventoryResults[1]) {
					newInventory.previousProductSkus = inventoryResults[1].currentProductSkus;
					newInventory.previousMeter = inventoryResults[1].currentMeter;
				}
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
	return { totalLiters: null, totalSales: null, salesItems: [] };
};

export const initializeInventoryData = () => {
	return {
		salesAndProducts: initializeSalesData(),
		inventory: initializeInventory()
	};
};

// export function getRemindersReport(date) {
// 	console.log("Getting Reminder Reports ");

// 	return (dispatch) => {
// 		getRemindersAction().then((remindersdata) => {
// 			console.log("COMEON WORK" + remindersdata.length);
// 			console.table(remindersdata);
// 			let rem = filterReminders(remindersdata, date);
// 			console.log("PREPARED REMINDERS=>" + rem);
// 			dispatch({ type: REMINDER_REPORT, data: { reminderdata: rem } });
// 		}).catch((error) => {
// 			console.log(error);
// 			dispatch({ type: REMINDER_REPORT, data: { reminderdata: [] } });
// 		});
// 		//let reminderz  = getRemindersAction(date);
// 		//dispatch({type:REMINDER_REPORT, data:{reminderdata:reminderz}});
// 	};
// }


// const getRemindersAction = () => {
// 	//console.log("GETTING REMINDERS FOR =>"+date);
// 	return new Promise(async (resolve, reject) => {
// 		let reminders = PosStorage.getRemindersPos();
// 		resolve(reminders);
// 	});
// 	//let reminders = PosStorage.getRemindersPos();
// 	// let filterReminders = reminders.filter(reminder =>{ reminder.reminder_date == moment(date).add('days',1).format("YYYY-MM-DD");});
// 	// return reminders;
// };

// const filterReminders = (reminders, date) => {
// 	console.log("This is in FILTERS " + Object.keys(reminders));
// 	let filteredReminders = reminders.filter(reminder => {
// 		return reminder.reminder_date == moment(date).add(1, 'days').format("YYYY-MM-DD");
// 	});

// 	console.table(filteredReminders);
// 	return filteredReminders;
// };

export function getRemindersReport(date){
    console.log("Getting Reminder Reports ");

        return (dispatch) => {
    	    getRemindersAction().then((remindersdata) => {

		console.log("REMINDERS LENGTH"+  remindersdata.length);

		console.log("COMEON WORK"+  remindersdata.length);
		console.table(remindersdata);
	    	let rem = filterReminders(remindersdata,date);
	    	console.log("PREPARED REMINDERS=>"+ rem);
	    		dispatch({type:REMINDER_REPORT, data:{reminderdata:rem}});
	    }).catch((error)=>{
	    	console.log(error);
	    	    	dispatch({type:REMINDER_REPORT, data:{reminderdata:[]}});
	    });
   	    //let reminderz  = getRemindersAction(date);
	    //dispatch({type:REMINDER_REPORT, data:{reminderdata:reminderz}});
	};





}


const getRemindersAction = () => {
    //console.log("GETTING REMINDERS FOR =>"+date);
    return new Promise(async (resolve,reject)=>{
    	let reminders = PosStorage.getRemindersPos();
    	resolve(reminders);
    });
    //let reminders = PosStorage.getRemindersPos();
    // let filterReminders = reminders.filter(reminder =>{ reminder.reminder_date == moment(date).add('days',1).format("YYYY-MM-DD");});
    // return reminders;
};

const filterReminders = (reminders,date)=>{
    console.log("This is in FILTERS"+Object.keys(reminders));
    let filteredReminders = reminders.filter(reminder =>{
	return reminder.reminder_date == moment(date).add(1,'days').format("YYYY-MM-DD");
    });

    console.table(filteredReminders);
    return filteredReminders;
};


