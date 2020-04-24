class ReminderApi {

	constructor() {
		this._url = 'http://142.93.115.206:3002/';
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
		this._url = 'http://142.93.115.206:3002/';
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

	getCustomerReminder(kiosk_id, date) {
		let options = {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + this._token
			}
		};
		let url = `sema/customer_reminders/${kiosk_id}/${date}`;

		// if (updatedSince) {
		// 	url = url + '&updated-date=' + updatedSince;
		// }
		console.log('Customer Reminder link', this._url + url);
		return fetch(this._url + url, options)
			.then(response => response.json())
			.then(responseJson => {
				return responseJson;
			})
			.catch(error => {
				console.log('Communications:getCustomerReminder: ' + error);
				throw error;
			});
	}

	createCustomerReminder(CustomerReminder) {
		// TODO - Resolve CustomerReminder.... Is it needed, currently hardcoded...

		let options = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify(CustomerReminder)
		};
		console.log('this._url', this._url);
		return new Promise((resolve, reject) => {
			fetch(this._url + 'sema/customer_reminders/', options)
				.then(response => {
					console.log('header', response.headers.map.message);
					
					if (response.status === 200) {
						response
							.json()
							.then(responseJson => {
								resolve(responseJson);
							})
							.catch(error => {
								console.log(
									'createCustomerReminder - Parse JSON: ' +
									error
								);
								reject();
							});
					} else {
						console.log(
							'createCustomerReminder - Fetch message: ' + response.headers.map.message
						);
						reject(response.headers.map.message);
					}
				})
				.catch(error => {
					console.log('createCustomerReminder - messag: ' + response.headers.map.message);
					reject();
				});
		});
	}
	// Note that deleting a CustomerReminder actually just deactivates the CustomerReminder
	deleteCustomerReminder(CustomerReminder) {
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
				this._url + 'sema/customer_reminders/' + CustomerReminder.reminder_id,
				options
			)
				.then(response => {
					if (response.status === 200 || response.status === 404) {
						resolve();
					} else {
						console.log(
							'deleteCustomerReminder - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('deleteCustomerReminder - Fetch: ' + error);
					reject();
				});
		});
	}

	updateCustomerReminder(CustomerReminder) {
		let options = {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify(CustomerReminder)
		};
		return new Promise((resolve, reject) => {
			fetch(
				this._url + 'sema/customer_reminders/' + CustomerReminder.reminder_id,
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
									'updateCustomerReminder - Parse JSON: ' +
									error
								);
								reject();
							});
					} else {
						console.log(
							'updateCustomerReminder - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('createCustomerReminder - Fetch: ' + error);
					reject();
				});
		});
	}


}

export default new ReminderApi();
