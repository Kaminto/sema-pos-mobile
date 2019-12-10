// import mock_customers from "../mock_data/customers";
import PosStorage from '../database/PosStorage';
import TopUps from '../database/topup/index';
import Communications from '../services/Communications';
import TopUpService from '../services/topup';
import Events from 'react-native-simple-events';
import * as _ from 'lodash';

class Synchronization {
	initialize(lastCustomerSync, lastProductSync, lastSalesSync, lastTopUpSync) {
		console.log('Synchronization:initialize');
		this.lastCustomerSync = lastCustomerSync;
		this.lastProductSync = lastProductSync;
		this.lastSalesSync = lastSalesSync;
		this.intervalId = null;
		this.firstSyncId = null;
		this.isConnected = false;
		this.lastTopUpSync = lastTopUpSync;
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
			TopUps.getTopUps().length == 0
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
		this.lastTopUpSync = new Date();
		TopUps.setLastTopUpSync(this.lastTopUpSync);
	}

	doSynchronize() {
		if (this.isConnected) {
			//this.synchronize();
			//Sync customers
			this.synchronizeCustomers();

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
		return new Promise(resolve => {
			try {
				this._refreshToken()
					.then(() => {
						let lastProductSync = this.lastProductSync;
						const promiseSalesChannels = this.synchronizeSalesChannels();
						const promiseCustomerTypes = this.synchronizeCustomerTypes();
						Promise.all([
							promiseSalesChannels,
							promiseCustomerTypes
						]).then(values => {
							console.log(
								'synchronize - SalesChannels and Customer Types: ' +
								values
							);
							const promiseCustomers = this.synchronizeCustomers().then(
								customerSync => {
									syncResult.customers = customerSync;
									return customerSync;
								}
							);

							const promiseTopUps = this.synchronizeCredits().then(
								topUpSync => {
									// console.log('topUpSync', topUpSync);
									syncResult.topups = topUpSync;
									return topUpSync;
								}
							);


							const promiseProducts = this.synchronizeProducts().then(
								productSync => {
									syncResult.products = productSync;
									return productSync;
								}
							);
							const promiseSales = this.synchronizeSales().then(
								saleSync => {
									syncResult.sales = saleSync;
									return saleSync;
								}
							);
							const promiseProductMrps = this.synchronizeProductMrps(
								lastProductSync
							).then(productMrpSync => {
								syncResult.productMrps = productMrpSync;
								return productMrpSync;
							});

							const promiseReceipts = this.synchronizeReceipts().then(
								results => {
									syncResult.receipts = results;
									return results;
								}
							);



							// This will make sure they run synchronously
							[
								promiseCustomers,
								promiseTopUps,
								promiseProducts,
								promiseSales,
								promiseProductMrps,
								promiseReceipts
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
						syncResult.error = error.message;
						syncResult.status = 'failure';
						resolve(syncResult);
						console.log(error.message);
					});
			} catch (error) {
				syncResult.error = error.message;
				syncResult.status = 'failure';
				resolve(syncResult);
				console.log(error.message);
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
									'Synchronization:synchronizeCustomers Create receipt failed: error-' +
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
					resolve({ error: error.message, localReceipts: null });
					console.log(
						'Synchronization.synchronizeSales - error ' + error
					);
				});
		});
	}

	synchronizeCredits() {
		return new Promise(resolve => {
			console.log('Synchronization:synchronizeCredits - Begin');
			TopUpService.getTopUps(this.lastTopUpSync)
				.then(web_topup => {
					console.log('web_topup',web_topup);
					if (web_topup.hasOwnProperty('topup')) {
						this.updateLastTopUpSync();
						console.log(
							'Synchronization:synchronizeCredits No of new remote Credits: ' +
							web_topup.topup.length
						);
						// Get the list of Credits that need to be sent to the server
						let {
							pendingTopUps,
							updated
						} = TopUps.mergeTopUps(web_topup.topup);
						console.log(
							'Synchronization:synchronizeTopUps No of local pending Credits: ' +
							pendingTopUps.length
						);
						
						pendingTopUps.forEach(topup => {
							//console.log('topup',topup);
							// TopUps.getTopUpFromKey(topUpKey).then(
							// 	topup => {
								//	console.log('topup',topup)
									if (topup != null) {
										if (topup.syncAction === 'create') {
											console.log(
												'Synchronization:synchronizetopUp - creating TopUp - ' +
												topup.topup
											);
											TopUpService.createTopUp(
												topup
											)
												.then(() => {
													console.log(
														'Synchronization:synchronizetopUp - Removing topup from pending list - ' +
														topup.topup
													);
													TopUps.removePendingTopUp(
														topUpKey
													);
												})
												.catch(error => {
													console.log(
														'Synchronization:synchronizeTopUp Create TopUp failed'
													);
												});
										} else if (
											topup.syncAction === 'delete'
										) {
											console.log(
												'Synchronization:synchronizeTopUp -deleting TopUp - ' +
												topup.topup
											);
											TopUpService.deleteTopUp(
												topup
											)
												.then(() => {
													console.log(
														'Synchronization:synchronizetopup - Removing topup from pending list - ' +
														topup.topup
													);
													TopUps.removePendingTopUp(
														topUpKey
													);
												})
												.catch(error => {
													console.log(
														'Synchronization:synchronizetopup Delete topup failed ' +
														error
													);
												});
										} else if (
											topup.syncAction === 'update'
										) {
											console.log(
												'Synchronization:synchronizeCustomers -updating customer - ' +
												topup.topup
											);
											TopUpService.updateCustomerCredit(
												topup
											)
												.then(() => {
													console.log(
														'Synchronization:synchronizeTopup - Removing topup from pending list - ' +
														topup.topup
													);
													TopUps.removePendingTopUp(
														topUpKey
													);
												})
												.catch(error => {
													console.log(
														'Synchronization:synchronizeTopup Update topup failed ' +
														error
													);
												});
										}
									} else {
										TopUps.removePendingTopUp(
											topUpKey
										);
									}
								// });
						});

						resolve({
							error: null,
							localTopup: pendingTopUps.length,
							remoteTopup: web_topup.topup.length
						});

						if (updated) {
							Events.trigger('synchronizeTopup', {});
						}
					}
				})
				.catch(error => {
					console.log(
						'Synchronization.getTopup - error ' + error
					);
					resolve({
						error: error.message,
						localTopup: null,
						remoteTopup: null
					});
				});
		});
	}

	synchronizeCustomers() {
		return new Promise(resolve => {
			console.log('Synchronization:synchronizeCustomers - Begin');
			Communications.getCustomers(this.lastCustomerSync)
				.then(web_customers => {
					if (web_customers.hasOwnProperty('customers')) {
						this.updateLastCustomerSync();
						console.log(
							'Synchronization:synchronizeCustomers No of new remote customers: ' +
							web_customers.customers.length
						);
						// Get the list of customers that need to be sent to the server
						let {
							pendingCustomers,
							updated
						} = PosStorage.mergeCustomers(web_customers.customers);
						console.log(
							'Synchronization:synchronizeCustomers No of local pending customers: ' +
							pendingCustomers.length
						);
						resolve({
							error: null,
							localCustomers: pendingCustomers.length,
							remoteCustomers: web_customers.customers.length
						});
						pendingCustomers.forEach(customerKey => {
							PosStorage.getCustomerFromKey(customerKey).then(
								customer => {
									if (customer != null) {
										if (customer.syncAction === 'create') {
											console.log(
												'Synchronization:synchronizeCustomers -creating customer - ' +
												customer.name
											);
											Communications.createCustomer(
												customer
											)
												.then(() => {
													console.log(
														'Synchronization:synchronizeCustomers - Removing customer from pending list - ' +
														customer.name
													);
													PosStorage.removePendingCustomer(
														customerKey
													);
												})
												.catch(error => {
													console.log(
														'Synchronization:synchronizeCustomers Create Customer failed'
													);
												});
										} else if (
											customer.syncAction === 'delete'
										) {
											console.log(
												'Synchronization:synchronizeCustomers -deleting customer - ' +
												customer.name
											);
											Communications.deleteCustomer(
												customer
											)
												.then(() => {
													console.log(
														'Synchronization:synchronizeCustomers - Removing customer from pending list - ' +
														customer.name
													);
													PosStorage.removePendingCustomer(
														customerKey
													);
												})
												.catch(error => {
													console.log(
														'Synchronization:synchronizeCustomers Delete Customer failed ' +
														error
													);
												});
										} else if (
											customer.syncAction === 'update'
										) {
											console.log(
												'Synchronization:synchronizeCustomers -updating customer - ' +
												customer.name
											);
											Communications.updateCustomer(
												customer
											)
												.then(() => {
													console.log(
														'Synchronization:synchronizeCustomers - Removing customer from pending list - ' +
														customer.name
													);
													PosStorage.removePendingCustomer(
														customerKey
													);
												})
												.catch(error => {
													console.log(
														'Synchronization:synchronizeCustomers Update Customer failed ' +
														error
													);
												});
										}
									} else {
										PosStorage.removePendingCustomer(
											customerKey
										);
									}
								}
							);
						});
						if (updated) {
							Events.trigger('CustomersUpdated', {});
						}
					}
				})
				.catch(error => {
					console.log(
						'Synchronization.getCustomers - error ' + error
					);
					resolve({
						error: error.message,
						localCustomers: null,
						remoteCustomers: null
					});
				});
		});
	}

	synchronizeProducts() {
		return new Promise(resolve => {
			console.log('Synchronization:synchronizeProducts - Begin');
			// Temporary get rid of this.lastProductSync
			// TODO: Figure out why it wouldn't pull new products when using this.lastProductSync
			Communications.getProducts()
				.then(products => {
					resolve({
						error: null,
						remoteProducts: products.products.length
					});

					if (products.hasOwnProperty('products')) {
						this.updateLastProductSync();
						console.log(
							'Synchronization:synchronizeProducts. No of new remote products: ' +
							products.products.length
						);
						console.log(
							'Synchronization:synchronizeProducts. No of new remote products: ' ,
							products.products
						);
						const updated = PosStorage.mergeProducts(
							products.products
						);
						if (updated) {
							Events.trigger('ProductsUpdated', {});
						}
					}
				})
				.catch(error => {
					resolve({ error: error.message, remoteProducts: null });
					console.log('Synchronization.getProducts - error ' + error);
				});
		});
	}

	synchronizeSalesChannels() {
		return new Promise(async resolve => {
			console.log('Synchronization:synchronizeSalesChannels - Begin');
			const savedSalesChannels = await PosStorage.loadSalesChannels();
			Communications.getSalesChannels()
				.then(salesChannels => {
					if (salesChannels.hasOwnProperty('salesChannels')) {
						console.log(
							'Synchronization:synchronizeSalesChannels. No of sales channels: ' +
							salesChannels.salesChannels.length
						);
						if (
							!_.isEqual(
								savedSalesChannels,
								salesChannels.salesChannels
							)
						) {
							PosStorage.saveSalesChannels(
								salesChannels.salesChannels
							);
							Events.trigger('SalesChannelsUpdated', {});
						}
					}
					resolve(salesChannels);
				})
				.catch(error => {
					console.log(
						'Synchronization.getSalesChannels - error ' + error
					);
					resolve(null);
				});
		});
	}

	synchronizeCustomerTypes() {
		return new Promise(resolve => {
			console.log('Synchronization:synchronizeCustomerTypes - Begin');
			Communications.getCustomerTypes()
				.then(customerTypes => {
					if (customerTypes.hasOwnProperty('customerTypes')) {
						console.log(
							'Synchronization:synchronizeCustomerTypes. No of customer types: ' +
							customerTypes.customerTypes.length
						);
						PosStorage.saveCustomerTypes(
							customerTypes.customerTypes
						);
					}
					resolve(customerTypes);
				})
				.catch(error => {
					console.log(
						'Synchronization.getCustomerTypes - error ' + error
					);
					resolve(null);
				});
		});
	}



	async synchronizeReceipts() {
		let settings = PosStorage.getSettings();
		let remoteReceipts = await PosStorage.loadRemoteReceipts();
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
		let settings = PosStorage.getSettings();
		date.setMinutes(date.getMinutes() - 12);
		Communications.getReceiptsBySiteIdAndDate(settings.siteId, date).then(
			json => {
				console.log(JSON.stringify(json));

				if (json) {
					PosStorage.addRemoteReceipts(json).then(saved => {
						Events.trigger('ReceiptsFetched', saved);
					});
				}
			}
		);
	}

	synchronizeProductMrps(lastProductSync) {
		return new Promise(async resolve => {
			console.log('Synchronization:synchronizeProductMrps - Begin');
			// Note- Because product mrps, do not currently have an 'active' flag,
			// if a user 'deletes' a mapping by removing the row in the table, the delta won't get detected
			// The current work around is return all mappings, (i.e. no deltas and re-write the mappings each time
			// Note that this won't scale too well with many productMrps
			// Communications.getProductMrps(lastProductSync)
			const savedProductMrps = await PosStorage.loadProductMrps();
			// TODO: Figure out a more scalable approach to this. As the product_mrp table may grow fast.
			Communications.getProductMrps(null, false)
				.then(productMrps => {
					console.log('productMrps',productMrps);
					if (productMrps.hasOwnProperty('productMRPs')) {
						console.log(
							'Synchronization:synchronizeProductMrps. No of remote product MRPs: ' +
							productMrps.productMRPs.length
						);
						if (
							!_.isEqual(
								savedProductMrps,
								productMrps.productMRPs
							)
						) {
							PosStorage.saveProductMrps(productMrps.productMRPs);
							Events.trigger('ProductMrpsUpdated', {});
						}
						resolve({
							error: null,
							remoteProductMrps: productMrps.productMRPs.length
						});
					}
				})
				.catch(error => {

					resolve({ error: error.message, remoteProducts: null });
					console.log(
						'Synchronization.ProductsMrpsUpdated - error ' + error
					);
				});
		});
	}

	synchronizeProductMrpsBySiteid(siteId) {
		return new Promise(async resolve => {
			console.log('Synchronization:synchronizeProductMrps - Begin');
			Communications.getProductMrpsBySiteId(siteId)
				.then(productMrps => {
					if (productMrps.hasOwnProperty('productMRPs')) {
						console.log(
							'Synchronization:synchronizeProductMrps. No of remote product MRPs: ' +
							productMrps.productMRPs.length
						);
						if (
							!_.isEqual(
								savedProductMrps,
								productMrps.productMRPs
							)
						) {
							PosStorage.saveProductMrps(productMrps.productMRPs);
							Events.trigger('ProductMrpsUpdated', {});
						}
						resolve({
							error: null,
							remoteProductMrps: productMrps.productMRPs.length
						});
					}
				})
				.catch(error => {
					resolve({ error: error.message, remoteProducts: null });
					console.log(
						'Synchronization.ProductsMrpsUpdated - error ' + error
					);
				});
		});
	}

	_refreshToken() {
		// Check if token exists or has expired
		return new Promise((resolve, reject) => {
			let settings = PosStorage.getSettings();
			let tokenExpirationDate = PosStorage.getTokenExpiration();
			let currentDateTime = new Date();

			if (
				settings.token.length == 0 ||
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
							PosStorage.saveSettings(
								settings.semaUrl,
								settings.site,
								settings.user,
								settings.password,
								settings.uiLanguage,
								result.response.token,
								settings.siteId
							);
							Communications.setToken(result.response.token);
							PosStorage.setTokenExpiration();
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

	getLatestSales() {
		let date = new Date();
		//date.setDate(date.getDate() - 30);
		date.setDate(date.getDate() - 7);
		let settings = PosStorage.getSettings();
		Communications.getReceiptsBySiteIdAndDate(settings.siteId, date).then(
			json => {
				PosStorage.addRemoteReceipts(json).then(saved => {
					Events.trigger('ReceiptsFetched', saved);
				});
			}
		);
	}
}
export default new Synchronization();
