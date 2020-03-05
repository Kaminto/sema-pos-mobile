import { format, sub } from 'date-fns';
class OrderApi {
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


    createReceipt(receipt) {

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

	deleteOrder(receipt) {
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

		let url = `sema/site/receipts/${siteId}?date=${format(sub(new Date(), {days: 30}), 'yyyy-MM-dd')}`;
		console.log('Communications:getReceipts: ');
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

}

export default new OrderApi();
