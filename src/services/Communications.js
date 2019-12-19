import moment from 'moment-timezone';
import CreditApi from './api/credit.api';
import InventoryApi from './api/inventory.api';
import CustomerApi from './api/customer.api';
import ProductApi from './api/product.api';
import SalesChannelApi from './api/sales-channel.api';
import CustomerTypeApi from './api/customer-types.api';


class Communications {
	constructor() {
		this._url = 'h';
		this._site = '';
		this._user = '';
		this._password = '';
		this._token = '';
		this._siteId = '';
	}
	initialize(url, site, user, password, token, siteId) {
		if (!url.endsWith('/')) {
			url = url + '/';
		}
		this._url = url;
		this._site = site;
		this._user = user;
		this._password = password;
		this._token = token;
		this._siteId = siteId;
 

		CreditApi.initialize(
			url,
			site,
			user,
			password,
			token,
			siteId
		); 


		InventoryApi.initialize(
			url,
			site,
			user,
			password,
			token,
			siteId
		); 
		
		CustomerApi.initialize(
			url,
			site,
			user,
			password,
			token,
			siteId
		); 

		ProductApi.initialize(
			url,
			site,
			user,
			password,
			token,
			siteId
		); 

		CustomerTypeApi.initialize(
			url,
			site,
			user,
			password,
			token,
			siteId
		); 

		SalesChannelApi.initialize(
			url,
			site,
			user,
			password,
			token,
			siteId
		); 


	}

	setToken(token) {
		this._token = token;
		SalesChannelApi.setToken(token);
		CreditApi.setToken(token);
		InventoryApi.setToken(token);
		CustomerApi.setToken(token);
		ProductApi.setToken(token);
		CustomerTypeApi.setToken(token);
		SalesChannelApi.setToken(token);

	}
	setSiteId(siteId) {
		this._siteId = siteId;
		SalesChannelApi.setSiteId(siteId);
		CreditApi.setSiteId(siteId);
		InventoryApi.setSiteId(siteId);
		CustomerApi.setSiteId(siteId);
		ProductApi.setSiteId(siteId);
		CustomerTypeApi.setSiteId(siteId);
		SalesChannelApi.setSiteId(siteId);
	}

	login() {
		console.log("loginin");
		let options = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			// body: JSON.stringify({
			// 	usernameOrEmail: this._user,
			// 	password: this._password
			// })
			body: JSON.stringify({
				usernameOrEmail: "administrator",
				password: "Let'sGrow"
			})
		};
		console.log(this._url);
		return new Promise((resolve, reject) => {
			try {
				console.log('hereh heresettings.semaUrl');
				fetch(this._url + 'sema/login', options)
					.then(response => {
						console.log("Status " + response.status);
						console.log("responseresponse " + response);
						if (response.status == 200) {
							response
								.json()
								.then(responseJson => {
									resolve({
										status: response.status,
										response: responseJson
									});
								})
								.catch(error => {
									console.log(
										error +
										' INNER ' +
										JSON.stringify(error)
									);
									reject({
										status: response.status,
										response: error
									});
								});
						} else {
							let reason = '';
							if (response.status === 401) {
								reason = '- Invalid credentials ';
							} else if (response.status === 404) {
								reason = '- Service URL not found ';
							}
							console.log(reason);
							reject({
								status: response.status,
								response: {
									message:
										'Cannot connect to the Sema service. ' +
										reason
								}
							});
						}
					})
					.catch(error => {

						console.log(error + ' OUTER ' + JSON.stringify(error));
						reject({
							status: 418,
							response: error
						}); // This is the "I'm a teapot error"
					});
			} catch (error) {
				reject({
					status: 418,
					response: error
				});
			}
		});
	}

	

	createReceipt(receipt) {
		console.log('==============================');
		console.log(JSON.stringify(receipt) + ' is being sent to the backend');
		console.log('==============================');
		let options = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify(this._remoteReceiptFromReceipt(receipt))
		};
		return new Promise((resolve, reject) => {
			fetch(this._url + 'sema/site/receipts', options)
				.then(response => {
					if (response.status === 200) {
						response
							.json()
							.then(responseJson => {
								resolve(responseJson);
							})
							.catch(error => {
								console.log(
									'createReceipt - Parse JSON: ' +
									error
								);
								reject();
							});
					} else if (response.status === 409) {
						// Indicates this receipt has already been added
						console.log('createReceipt - Receipt already exists');
						resolve({});
					} else {
						console.log(
							'createReceipt - Fetch status: ' + response.status
						);
						reject(response.status);
					}
				})
				.catch(error => {
					console.log('createReceipt - Fetch: ' + error);
					reject();
				});
		});
	}



	_remoteReceiptFromReceipt(receipt) {
		return receipt;
	}

	getReceipts(siteId) {
		let options = {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer ' + this._token
			}
		};

		let url = `sema/site/receipts/${siteId}?date=${moment
			.tz(new Date(Date.now()), moment.tz.guess())
			.format('YYYY-MM-DD')}`;
		console.log('Communications:getReceipts: ');
		console.log(
			moment.tz(new Date(Date.now()), moment.tz.guess()).format('YYYY-MM-DD')
		);
		return fetch(this._url + url, options)
			.then(async response => await response.json())
			.catch(error => {
				console.log('Communications:getReceipts: ' + error);
				throw error;
			});
	}

	getReceiptsBySiteIdAndDate(siteId, date) {
		date = date.toISOString();
		let options = {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer ' + this._token
			}
		};

		let url = `sema/site/receipts/${siteId}?date=${date}`;
		console.log(url);

		return fetch(this._url + url, options)
			.then(async response => await response.json())
			.catch(error => {
				console.log('Communications:getReceipts: ' + error);
				throw error;
			});
	}

	// Sends the kiosk ID, the logged receipts and the list of IDs that the client already
	// has to the API
	sendLoggedReceipts(siteId, receipts, exceptionList) {
		let options = {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify({
				receipts,
				exceptionList
			})
		};

		let url = `sema/site/receipts/${siteId}?date=${moment
			.tz(new Date(Date.now()), moment.tz.guess())
			.format('YYYY-MM-DD')}`;
		console.log(this._url + url);
		return fetch(this._url + url, options)
			.then(response => response.json())
			.catch(error => {
				console.log('Communications:sendUpdatedReceipts: ' + error);
				throw error;
			});
	}

	// getReminders() {
	// 	let options = {
	// 		method: 'GET',
	// 		headers: {
	// 			Accept: 'application/json',
	// 			Authorization: 'Bearer' + this._token
	// 		}
	// 	};
	// 	let url = 'sema/reminders?site-id='+ this._siteId;
	// 	that = this;
	// 	return fetch(that._url + url, options)
	// 		.then(response => response.json())
	// 		.catch(error => console.log('ERROR ' + error));
	// }

	getReminders() {
		let options = {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer' + this._token
			}
		};
		let urlr = 'sema/reminders?site-id=' + this._siteId;
		that = this;
		return fetch(that._url + urlr, options).then(response =>

			response.json()

		).catch(error => console.log("ERROR " + error));


	}

	// let remoteReceipt = {
	// 	receiptId: receipt.receiptId,
	// 	customerId: receipt.customerId,
	// 	siteId: receipt.siteId,
	// 	createdDate: new Date(receipt.createdDate),
	// 	totalSales: receipt.cash + receipt.credit + receipt.mobile,
	// 	salesChannelId: 122,
	// 	cogs:"0",		// TODO - Implement this...
	// 	products: []
	// };
	// 	receipt.products.forEach( product => {
	// 		let remoteProduct = {
	// 			productId:product.id,
	// 			quantity: product.quantity,
	// 			receiptId: remoteReceipt.receiptId,
	// 			salesPrice:product.priceAmount
	// 		}
	// 		remoteReceipt.products.push( remoteProduct);
	// 	});
	// 	return remoteReceipt;
	// }
}
export default new Communications();
