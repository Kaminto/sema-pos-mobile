class ReminderApi {
	constructor() {
		this._url = 'http://142.93.115.206:3002/';
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

	getReminders(kiosk_id,updatedSince) {
		let options = {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + this._token
			}
		};
		let url = `sema/reminders/${kiosk_id}`;
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

	createReminder(customerDebt) {
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
			fetch(this._url + 'sema/reminders', options)
				.then(response => {
					if (response.status === 200) {
						response
							.json()
							.then(responseJson => {

								resolve(responseJson);
							})
							.catch(error => {
								console.log(
									'createReminder - Parse JSON: ' +
									error
								);
								reject();
							});
					} else {
						console.log(
							'createReminder - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('createReminder - Fetch: ' + error);
					reject();
				});
		});
    }

	deleteReminder(customerDebt) {
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
				this._url + 'sema/reminders/' + customerDebt.customer_debt_id,
				options
			)
				.then(response => {
					if (response.status === 200 || response.status === 404) {
						resolve();
					} else {
						console.log(
							'deleteReminder - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('deleteReminder - Fetch: ' + error);
					reject();
				});
		});
	}

	updateReminder(customerDebt) {
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
				this._url + 'sema/reminders/' + customerDebt.customer_debt_id,
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
									'updateReminder - Parse JSON: ' +
									error
								);
								reject();
							});
					} else {
						console.log(
							'updateReminder - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('createReminder - Fetch: ' + error);
					reject();
				});
		});
	}
}

export default new ReminderApi();
