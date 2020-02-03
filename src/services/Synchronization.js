import PosStorage from '../database/PosStorage';
import CreditRealm from '../database/credit/credit.operations';
import InventroyRealm from '../database/inventory/inventory.operations';
import SettingRealm from '../database/settings/settings.operations';
import Communications from '../services/Communications';


import Events from 'react-native-simple-events';
import * as _ from 'lodash';
import InventorySync from './sync/inventory.sync';
import CreditSync from './sync/credit.sync';
import CustomerSync from './sync/customer.sync';
import ProductSync from './sync/product.sync';
import ProductMRPSync from './sync/productmrp.sync';
import SalesChannelSync from './sync/sales-channel.sync';
import CustomerTypeSync from './sync/customer-types.sync';
import OrderSync from './sync/orders.sync';
import DiscountSync from './sync/discounts.sync';
import PaymentTypeSync from './sync/payment-type.sync';

import RecieptPaymentTypesSync from './sync/reciept-payment-types.sync';
import CustomerDebtsSync from './sync/customer-debt.sync';

class Synchronization {


	constructor() {
	}

	initialize(lastCustomerSync, lastProductSync, lastSalesSync, lastCreditSync, lastInventorySync) {
		console.log('Synchronization:initialize');
		this.lastCustomerSync = lastCustomerSync;
		this.lastProductSync = lastProductSync;
		this.lastSalesSync = lastSalesSync;
		this.intervalId = null;
		this.firstSyncId = null;
		this.isConnected = false;
		this.lastCreditSync = lastCreditSync;
		this.lastInventorySync = lastInventorySync;
	}

	setConnected(isConnected) {
		console.log('Synchronization:setConnected - ' + isConnected);
		this.isConnected = isConnected;
	}

	scheduleSync() {
		console.log('Synchronization:scheduleSync - Starting synchronization');
		let timeoutX = 10000; // Sync after 10 seconds
		if (this.firstSyncId != null) {
			clearTimeout(this.firstSyncId);
		}

		if (this.intervalId != null) {
			clearInterval(this.intervalId);
		}

		if (
			PosStorage.getCustomers().length == 0 ||
			PosStorage.getProducts().length == 0 ||
			CreditRealm.getAllCredit().length == 0 ||
			InventroyRealm.getAllInventory().length == 0
		) {
			// No local customers or products, sync now
			timeoutX = 1000;
		}

		let that = this;
		this.firstSyncId = setTimeout(() => {
			console.log('Synchronizing...');
			//that.doSynchronize();
			that.synchronize();
		}, timeoutX);

		let syncInterval = PosStorage.getGetSyncInterval();
		console.log('Synchronization interval (ms)' + syncInterval);

		//Sync sales separately every two minutes
		setInterval(() => {
			this.synchronizeSales();
		}, 120000);

		this.intervalId = setInterval(() => {
			that.doSynchronize();
		}, syncInterval);
	}

	updateLastCustomerSync() {
		this.lastCustomerSync = new Date();
		PosStorage.setLastCustomerSync(this.lastCustomerSync);
	}
	updateLastProductSync() {
		this.lastProductSync = new Date();
		PosStorage.setLastProductSync(this.lastProductSync);
	}
	updateLastSalesSync() {
		this.lastSalesSync = new Date();
		PosStorage.setLastSalesSync(this.lastSalesSync);
	}

	updateLastTopUpSync() {
		this.lastCreditSync = new Date();
		CreditRealm.setLastCreditSync(this.lastCreditSync);
	}


	updateInventorySync() {
		this.lastInventorySync = new Date();
		InventroyRealm.setLastInventorySync(this.lastInventorySync);
	}

	doSynchronize() {
		if (this.isConnected) {
			//this.synchronize();
			//Sync customers
			CustomerSync.synchronizeCustomers();

			// //Sync Sales
			// this.synchronizeSales();

			//Sync Receipts
			this.synchronizeReceipts();
			//Synchronize receipts
			this.synchReceipts();
		} else {
			console.log(
				"Communications:doSynchronize - Won't sync - Network not connected"
			);
		}
	}

	synchronize() {
		let syncResult = { status: 'success', error: '' };
		console.log('setter', SettingRealm.getAllSetting());
		return new Promise(resolve => {
			try {
				this._refreshToken()
					.then(() => {
						let lastProductSync = this.lastProductSync;
						const promiseSalesChannels = SalesChannelSync.synchronizeSalesChannels();
						const promiseCustomerTypes = CustomerTypeSync.synchronizeCustomerTypes();
						const promisePaymentTypes = PaymentTypeSync.synchronizePaymentTypes();

						Promise.all([
							promiseSalesChannels,
							promiseCustomerTypes,
							promisePaymentTypes
						]).then(values => {
							console.log(
								'synchronize - SalesChannels and Customer Types: ',
								values
							);

							const promiseCustomerDebts = CustomerDebtsSync.synchronizeCustomerDebts().then(
								customerDebtSync => {
									console.log("customerDebtSync", customerDebtSync);
									// syncResult.customers = customerSync;
									// return customerSync;
								}
							);

							const promiseRecieptPaymentTypes = RecieptPaymentTypesSync.synchronizeRecieptPaymentTypes().then(
								recieptPaymentTypesSync => {
									console.log("recieptPaymentTypesSync", recieptPaymentTypesSync);
									// syncResult.customers = customerSync;
									// return customerSync;
								}
							);

							const promiseCustomers = CustomerSync.synchronizeCustomers().then(
								customerSync => {
									syncResult.customers = customerSync;
									return customerSync;
								}
							);

							const promiseTopUps = CreditSync.synchronizeCredits().then(
								topUpSync => {
									// console.log('topUpSync', topUpSync);
									//this.updateLastTopUpSync()
									syncResult.topups = topUpSync;
									return topUpSync;
								}
							);

							const promiseInventory = InventorySync.synchronizeInventory(this.lastInventorySync).then(
								inventorySync => {
									// console.log('topUpSync', topUpSync);
									//this.updateInventorySync();
									syncResult.inventory = inventorySync;
									return inventorySync;
								}
							);


							const promiseProducts = ProductSync.synchronizeProducts().then(
								productSync => {
									syncResult.products = productSync;
									return productSync;
								}
							);

							const promiseProductMrps = ProductMRPSync.synchronizeProductMrps(
								lastProductSync
							).then(productMrpSync => {
								syncResult.productMrps = productMrpSync;
								return productMrpSync;
							});

							let settings = SettingRealm.getAllSetting();
							const promiseOrders = OrderSync.synchronizeSales(settings.siteId).then(
								saleSync => {
									console.log(saleSync);
									syncResult.sales = saleSync;
									return saleSync;
								}
							);

							const promiseDiscounts = DiscountSync.synchronizeDiscount(settings.siteId).then(
								discountSync => {
									console.log(discountSync);
									syncResult.discounts = discountSync;
									return discountSync;
								}
							);

							// const promiseSales = this.synchronizeSales().then(
							// 	saleSync => {
							// 		syncResult.sales = saleSync;
							// 		return saleSync;
							// 	}
							// );							

							// const promiseReceipts = this.synchronizeReceipts().then(
							// 	results => {
							// 		syncResult.receipts = results;
							// 		return results;
							// 	}
							// );


							// This will make sure they run synchronously
							[
								promiseCustomers,
								promiseTopUps,
								promiseInventory,
								promiseProducts,
								promiseProductMrps,
								promiseOrders
								// promiseSales,
								// promiseReceipts
							]
								.reduce((promiseChain, currentTask) => {
									return promiseChain.then(chainResults =>
										currentTask.then(currentResult => [
											...chainResults,
											currentResult
										])
									);
								}, Promise.resolve([]))
								.then(arrayOfResults => {
									resolve(syncResult);
								});

							// Promise.all([promiseCustomers, promiseProducts, promiseSales, promiseProductMrps, promiseReceipts])
							// 	.then(values => {
							// 		resolve(syncResult);
							// 	});
						});
					})
					.catch(error => {
						syncResult.error = error;
						syncResult.status = 'failure';
						resolve(syncResult);
						console.log(error);
					});
			} catch (error) {
				console.log('error', error);
				syncResult.error = error;
				syncResult.status = 'failure';
				resolve(syncResult);
				console.log(error);
			}
		});
	}


	synchronizeSales() {
		return new Promise(resolve => {
			console.log('Synchronization:synchronizeSales - Begin');
			PosStorage.loadSalesReceipts(this.lastSalesSync)
				.then(salesReceipts => {
					console.log(
						'Synchronization:synchronizeSales - Number of sales receipts: ' +
						salesReceipts.length
					);
					console.log(
						'Synchronization:synchronizeSales - Number of sales receipts: ',
						salesReceipts
					);
					resolve({
						error: null,
						localReceipts: salesReceipts.length
					});
					salesReceipts.forEach(receipt => {
						console.log("***********************")
						console.log(receipt.sale)
						console.log("***********************")

						Communications.createReceipt(receipt.sale)
							.then(result => {
								console.log(
									'Synchronization:synchronizeSales - success: '
								);
								PosStorage.removePendingSale(
									receipt.key,
									receipt.sale.id
								);
							})
							.catch(error => {
								console.log(
									'Synchronization:synchronizeSales Create receipt failed: error-' +
									error
								);
								if (error === 400) {
									// This is unre-coverable... remove the pending sale
									PosStorage.removePendingSale(
										receipt.key,
										receipt.sale.id
									);
								}
							});
					});
				})
				.catch(error => {
					resolve({ error: error, localReceipts: null });
					console.log(
						'Synchronization.synchronizeSales - error ', error
					);
				});
		});
	}



	async synchronizeReceipts() {
		let settings = SettingRealm.getAllSetting();
		let remoteReceipts = await PosStorage.loadRemoteReceipts();
		console.log('remoteReceiptsremoteReceipts', remoteReceipts);
		const receiptIds = [];
		remoteReceipts = remoteReceipts
			.map(receipt => {
				let receiptData = {
					id: receipt.id,
					active: receipt.active,
					lineItems: [],
					isLocal: receipt.isLocal
				};

				if (receipt.updated) {
					receiptData.lineItems = receipt.receipt_line_items.map(
						lineItem => {
							return {
								id: lineItem.id,
								active: lineItem.active
							};
						}
					);

					receiptData.updated = true;
				}

				receiptIds.push(receipt.id);
				return receiptData;
			})
			// Making sure we don't enter local receipts twice - synchronizeSales is already taking care of this
			// We do this after the map because we don't want to pull their remote equivalent from the DB,
			// so we're sending their IDs too.
			// Sending only remote receipts and local receipts that have been updated.
			.filter(receipt => receipt.updated || !receipt.isLocal);
		console.log('remoteReceipts', remoteReceipts);
		console.log('receiptIds', receiptIds);
		return Communications.sendLoggedReceipts(
			settings.siteId,
			remoteReceipts,
			receiptIds
		).then(result => {
			// result.newReceipts is the list of today's receipts that we don't have in the local storage already
			return new Promise(resolve => {
				if (!result.newReceipts.length) {
					Events.trigger('ReceiptsFetched', []);
					return resolve();
				}
				PosStorage.addRemoteReceipts(result.newReceipts).then(
					allReceipts => {
						resolve({
							error: null,
							receipts: result.newReceipts.length
						});
						Events.trigger('ReceiptsFetched', allReceipts);
					}
				);
			});
		});
	}

	synchReceipts() {
		let date = new Date();
		let settings = SettingRealm.getAllSetting();
		date.setMinutes(date.getMinutes() - 12);
		Communications.getReceiptsBySiteIdAndDate(settings.siteId, date).then(
			json => {
				console.log(JSON.stringify(json));
				console.log('receipt json', json);
				if (json) {
					PosStorage.addRemoteReceipts(json).then(saved => {
						Events.trigger('ReceiptsFetched', saved);
					});
				}
			}
		);
	}

	getLatestSales() {
		let date = new Date();
		//date.setDate(date.getDate() - 30);
		date.setDate(date.getDate() - 7);
		let settings = SettingRealm.getAllSetting();
		Communications.getReceiptsBySiteIdAndDate(settings.siteId, date).then(
			json => {
				console.log('receipt json', json);
				PosStorage.addRemoteReceipts(json).then(saved => {
					Events.trigger('ReceiptsFetched', saved);
				});
			}
		);
	}


	_refreshToken() {
		// Check if token exists or has expired
		return new Promise((resolve, reject) => {
			let settings = SettingRealm.getAllSetting();
			let tokenExpirationDate = SettingRealm.getTokenExpiration();
			let currentDateTime = new Date();

			if (
				settings.token.length === 0 ||
				currentDateTime > tokenExpirationDate
			) {
				// Either user has previously logged out or its time for a new token
				console.log(
					'No token or token has expired - Getting a new one'
				);
				Communications.login()
					.then(result => {
						if (result.status === 200) {
							console.log('New token Acquired');
							SettingRealm.saveSettings(
								settings.semaUrl,
								settings.site,
								settings.user,
								settings.password,
								settings.uiLanguage,
								result.response.token,
								settings.siteId,
								false
							);
							Communications.setToken(result.response.token);
							SettingRealm.setTokenExpiration();
						}
						resolve();
					})
					.catch(result => {
						console.log(
							'Failed- status ' +
							result.status +
							' ' +
							result.response
						);
						reject(result.response);
					});
			} else {
				console.log('Existing token is valid');
				resolve();
			}
		});
	}


}
export default new Synchronization();
