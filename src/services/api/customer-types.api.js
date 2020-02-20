class CustomerTypeApi {
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

    getCustomerTypes() {
		let options = {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + this._token
			}
		};
		let url = 'sema/customer-types';
		console.log('this._url + url', this._url + url);
		console.log('this._token', this._token);
		return fetch(this._url + url, options)
			.then(response => response.json())
			.then(responseJson => {
				return responseJson;
			})
			.catch(error => {
				console.log('Communications:getCustomerTypes: ' + error);
				throw error;
			});
	}


}

export default new CustomerTypeApi();
