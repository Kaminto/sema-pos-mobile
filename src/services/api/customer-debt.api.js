class CustomerDebtApi {
	constructor() {
		this._url = 'http://142.93.115.206:3006/';
		this._site = '';
		this._user = '';
		this._password = '';
		this._token = '';
		this._siteId = '';
		this.customer_account_id = '';
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
	}

	setToken(token) {
		this._token = token;
	}
	setSiteId(siteId) {
		this._siteId = siteId;
	}

	getCustomerDebts(updatedSince) {
		let options = {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + this._token
			}
		};
		let url = 'sema/customer_debt';
		console.log('this._url', this._url);
		// if (updatedSince) {
		// 	url = url + '?updated-date=' + updatedSince;
		// }

		return fetch(this._url + url, options)
		.then(response => response.json())
			.then(responseJson => {
				return responseJson;
			})
			.catch(error => {
				console.log('Communications: Customer Debt: ' + error);
				throw error;
			});
	}

	createCustomerDebt(customerDebt) {
		let options = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify(customerDebt)
		};
		console.log('this._url', this._url);
		return new Promise((resolve, reject) => {
			fetch(this._url + 'sema/customer_debt', options)
				.then(response => {
					if (response.status === 200) {
						response
							.json()
							.then(responseJson => {
								console.log(
									'responseJson - Parse JSON: ' +
									responseJson
								);
								resolve(responseJson);
							})
							.catch(error => {
								console.log(
									'createCustomerDebt - Parse JSON: ' +
									error
								);
								reject();
							});
					} else {
						console.log(
							'createCustomerDebt - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('createCustomerDebt - Fetch: ' + error);
					reject();
				});
		});
    }

	deleteCustomerDebt(customerDebt) {
		let options = {
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify({
				active: false
			})
		};
		return new Promise((resolve, reject) => {
			fetch(
				this._url + 'sema/customer_debt/' + customerDebt.customer_debt_id,
				options
			)
				.then(response => {
					if (response.status === 200 || response.status === 404) {
						resolve();
					} else {
						console.log(
							'deleteCustomerDebt - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('deleteCustomerDebt - Fetch: ' + error);
					reject();
				});
		});
	}

	updateCustomerDebt(customerDebt) {
		let options = {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify(customerDebt)
		};
		return new Promise((resolve, reject) => {
			fetch(
				this._url + 'sema/customer_debt/' + customerDebt.customer_debt_id,
				options
			)
				.then(response => {
					if (response.status === 200) {
						response
							.json()
							.then(responseJson => {
								resolve(responseJson);
							})
							.catch(error => {
								console.log(
									'updateCustomerDebt - Parse JSON: ' +
									error
								);
								reject();
							});
					} else {
						console.log(
							'updateCustomerDebt - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('createCustomerDebt - Fetch: ' + error);
					reject();
				});
		});
	}
}

export default new CustomerDebtApi();
