class PaymentTypesApi {
	constructor() {
		this._url = 'http://142.93.115.206:3006/';
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

	getPaymentTypes() {
		let options = {
			method: 'GET',
		};
		let url = 'sema/payment_type'; 
		return fetch(this._url + url, options)
			.then(response => response.json())
			.then(responseJson => {
				console.log('Communications:getPaymentTypes: ', responseJson);
				return responseJson;
			})
			.catch(error => {
				console.log('Communications:getPaymentTypes: ', error);
				throw error;
			});
	}


}

export default new PaymentTypesApi();