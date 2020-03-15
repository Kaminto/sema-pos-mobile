import CreditRealm from '../database/credit/credit.operations';
import InventroyRealm from '../database/inventory/inventory.operations';
import SettingRealm from '../database/settings/settings.operations';
import Communications from '../services/Communications';

import * as _ from 'lodash';
import InventorySync from './sync/inventory.sync';
import CreditSync from './sync/credit.sync';
import MeterReadingSync from './sync/meter-reading.sync'
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
		this.isConnected = isConnected;
	}

	scheduleSync() {
		let timeoutX = 10000; // Sync after 10 seconds
		if (this.firstSyncId != null) {
			clearTimeout(this.firstSyncId);
		}

		if (this.intervalId != null) {
			clearInterval(this.intervalId);
		}

		if (
			CreditRealm.getAllCredit().length == 0 ||
			InventroyRealm.getAllInventory().length == 0
		) {
			// No local customers or products, sync now
			timeoutX = 1000;
		}

		let that = this;
		this.firstSyncId = setTimeout(() => {
			//that.doSynchronize();
			that.synchronize();
		}, timeoutX);

		//Sync sales separately every two minutes
		setInterval(() => {
			//this.synchronizeSales();
		}, 120000);

		this.intervalId = setInterval(() => {
			that.doSynchronize();
		}, syncInterval);
	}

	updateLastCustomerSync() {
		this.lastCustomerSync = new Date();
	}
	updateLastProductSync() {
		this.lastProductSync = new Date();
	}
	updateLastSalesSync() {
		this.lastSalesSync = new Date();
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

			//Synchronize receipts
			//this.synchReceipts();
		} else {

		}
	}

	synchronize() {
		let syncResult = { status: 'success', error: '' };
		return new Promise(resolve => {
			try {
				this._refreshToken()
					.then(() => {
						let lastProductSync = this.lastProductSync;
						let settings = SettingRealm.getAllSetting();


						// const promiseSalesChannels = SalesChannelSync.synchronizeSalesChannels();
						// const promiseCustomerTypes = CustomerTypeSync.synchronizeCustomerTypes();
						// const promisePaymentTypes = PaymentTypeSync.synchronizePaymentTypes();

						const promiseCustomers = CustomerSync.synchronizeCustomers().then(
							customerSync => {
								syncResult.customers = customerSync;
								return customerSync;
							}
						);
						// const promiseOrders = OrderSync.synchronizeSales(settings.siteId).then(
						// 	saleSync => {
						// 		syncResult.sales = saleSync;
						// 		return saleSync;
						// 	}
						// );

						// const promiseMeterReading = MeterReadingSync.synchronizeMeterReading(settings.siteId).then(
						// 	meterReadingSync => {
						// 		syncResult.meterReading = meterReadingSync;
						// 		return meterReadingSync;
						// 	}
						// );

						// const promiseInventory = InventorySync.synchronizeInventory(settings.siteId).then(
						// 	inventorySync => {
						// 		syncResult.inventory = inventorySync;
						// 		return inventorySync;
						// 	}
						// );

						// const promiseCustomerDebts = CustomerDebtsSync.synchronizeCustomerDebts().then(
						// 	customerDebtSync => {
						// 		syncResult.customerDebt = customerDebtSync;
						// 		return customerDebtSync;
						// 	}
						// );

						// const promiseRecieptPaymentTypes = RecieptPaymentTypesSync.synchronizeRecieptPaymentTypes(settings.siteId).then(
						// 	recieptPaymentTypesSync => {

						// 		syncResult.recieptPaymentTypes = recieptPaymentTypesSync;
						// 		return recieptPaymentTypesSync;
						// 	}
						// );



						// const promiseTopUps = CreditSync.synchronizeCredits().then(
						// 	topUpSync => {
						// 		syncResult.topups = topUpSync;
						// 		return topUpSync;
						// 	}
						// );

						


						// const promiseProducts = ProductSync.synchronizeProducts().then(
						// 	productSync => {
						// 		syncResult.products = productSync;
						// 		return productSync;
						// 	}
						// );

						// const promiseProductMrps = ProductMRPSync.synchronizeProductMrps(
						// 	lastProductSync
						// ).then(productMrpSync => {
						// 	syncResult.productMrps = productMrpSync;
						// 	return productMrpSync;
						// });



						// const promiseDiscounts = DiscountSync.synchronizeDiscount(settings.siteId).then(
						// 	discountSync => {
						// 		syncResult.discounts = discountSync;
						// 		return discountSync;
						// 	}
						// );



						// This will make sure they run synchronously
						[
						//	promiseOrders,
							promiseCustomers,
							// promiseMeterReading,
							// promiseInventory,
							// promiseSalesChannels,
							// promiseCustomerTypes,
							// promiseRecieptPaymentTypes,
							// promisePaymentTypes,							
							// promiseTopUps,
							// promiseProducts,
							// promiseProductMrps,
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

					})
					.catch(error => {
						syncResult.error = error;
						syncResult.status = 'failure';
						resolve(syncResult);
					});
			} catch (error) {
				syncResult.error = error;
				syncResult.status = 'failure';
				resolve(syncResult);
			}
		});
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
				Communications.login(settings.user, settings.password)
					.then(result => {
						if (result.status === 200) {
							SettingRealm.saveSettings(
								settings.semaUrl,
								settings.site,
								settings.user,
								settings.password,
								settings.uiLanguage,
								result.response.token,
								settings.siteId,
								false,
								settings.currency
							);
							Communications.setToken(result.response.token);
							SettingRealm.setTokenExpiration();
						}
						resolve();
					})
					.catch(result => {
						reject(result.response);
					});
			} else {
				resolve();
			}
		});
	}


}
export default new Synchronization();
