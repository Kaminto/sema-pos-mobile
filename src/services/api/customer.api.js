class CustomerApi {
    constructor() {
        this._url = 'http://142.93.115.206:3002/';
        //this._url = 'http://192.168.43.153:3002/';
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
        //this._url = url;
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

    getCustomers(updatedSince) {
        let options = {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + this._token
            }
        };

        let url = `sema/site/customers/${this._siteId}/${updatedSince}`;
        // if (updatedSince) {
        //     console.log('updatedSince', typeof updatedSince);
        //     console.log('updatedSince', updatedSince);
        //     url = url + '&updated-date=' + updatedSince;
        // }
        console.log(this._url + url);
        return fetch(this._url + url, options)
            .then(response => response.json())
            .then(responseJson => {
                return responseJson;
            })
            .catch(error => {
                console.log('Communications:getCustomers: ' + error);
                throw error;
            });
    }

    createCustomer(customer) {
        // TODO - Resolve customer type.... Is it needed, currently hardcoded...
        customer.customerType = 128; // FRAGILE
        let options = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this._token
            },
            body: JSON.stringify(customer)
        };
        return new Promise((resolve, reject) => {
            console.log(this._url + 'sema/site/customers');
            fetch(this._url + 'sema/site/customers', options)
                .then(response => {
                    console.log('createCustomer - Fetchresponse: ', response);
                    if (response.status === 200) {
                        response
                            .json()
                            .then(responseJson => {
                                resolve(responseJson);
                            })
                            .catch(error => {
                                console.log(
                                    'createCustomer - Parse JSON: ' +
                                    error
                                );
                                reject();
                            });
                    } else {
                        console.log(
                            'createCustomer - Fetch status: ' + response.status
                        );
                        reject();
                    }
                })
                .catch(error => {
                    console.log('createCustomer - Fetch: ' + error);
                    reject();
                });
        });
    }
    // Note that deleting a csutomer actually just deactivates the customer
    deleteCustomer(customer) {
        let options = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this._token
            },
            body: JSON.stringify(customer)
        };
        return new Promise((resolve, reject) => {
            fetch(
                this._url + 'sema/site/customers/' + customer.customerId,
                options
            )
                .then(response => {
                    if (response.status === 200 || response.status === 404) {
                        resolve();
                    } else {
                        console.log(
                            'deleteCustomer - Fetch status: ' + response.status
                        );
                        reject();
                    }
                })
                .catch(error => {
                    console.log('deleteCustomer - Fetch: ' + error);
                    reject();
                });
        });
    }

    updateCustomer(customer) {
        let options = {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this._token
            },
            body: JSON.stringify(customer)
        };
        return new Promise((resolve, reject) => {
            fetch(
                this._url + 'sema/site/customers/' + customer.customerId,
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
                                    'updateCustomer - Parse JSON: ' +
                                    error
                                );
                                reject();
                            });
                    } else {
                        console.log(
                            'updateCustomer - Fetch status: ' + response.status
                        );
                        reject();
                    }
                })
                .catch(error => {
                    console.log('createCustomer - Fetch: ' + error);
                    reject();
                });
        });
    }


}

export default new CustomerApi();
