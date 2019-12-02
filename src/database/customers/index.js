import { capitalizeWord } from '../services/Utilities';
import Events from 'react-native-simple-events';
import moment from 'moment-timezone';

import realm from '../database/PosStorage';

const uuidv1 = require('uuid/v1');

const customersKey = '@Sema:CustomersKey';
const customerItemKey = '@Sema:CustomerItemKey';
const lastCustomerSyncKey = '@Sema:LastCustomerSyncKey';
const pendingCustomersKey = '@Sema:PendingCustomersKey';
const customerTypesKey = '@Sema:CustomerTypesKey';

class Customers {
    constructor() {
        // Customers are saved in the form customerItemKey + Customer.id
        // For example "@Sema:CustomerItemKey_ea6c365a-7338-11e8-a3c9-ac87a31a5361"
        // Array of customer keys
        this.customersKeys = [];
        // Last sync DateTime is the last date time that items were synchronized with the server
        let firstSyncDate = new Date('November 7, 1973');
        this.lastCustomerSync = firstSyncDate;

        // Pending customers is the array of customers, stored locally but not yet sent to the server
        this.pendingCustomers = [];
        this.customerTypes = [];// De-referenced customers
    }

    initialLocalDb() {
        let keyArray = [
            [customersKey, this.stringify(this.customersKeys)],
            [
                lastCustomerSyncKey,
                this.lastCustomerSync.toISOString()
            ],
            [
                pendingCustomersKey,
                this.stringify(this.pendingCustomers)
            ],
            [
                customerTypesKey,
                this.stringify(this.customerTypes)
            ],
        ]
        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected : ' + rows);
                return true;

            })
            .catch(error => {
                console.log(error);
                return false;
            });
        return 'Local DB Initialised';
    }

    loadLocalData() {
        let keyArray = [
            customersKey,
            lastCustomerSyncKey,
            pendingCustomersKey,
            customerTypesKey,
        ];

        let results = this.getMany(keyArray);
        this.customersKeys = this.parseJson(
            results[0][1]
        );
        this.lastCustomerSync = new Date(results[1][1]); // Last customer sync time
        this.pendingCustomers = this.parseJson(
            results[2][1]
        ); // Array of pending customers
        this.customerTypes = this.parseJson(
            results[3][1]
        ); // array of customer types
        return 'Data Exists';
    }

    clearDataOnly() {
        this.customersKeys = [];
        this.pendingCustomers = [];
        let firstSyncDate = new Date('November 7, 1973');
        this.lastCustomerSync = firstSyncDate;
        let keyArray = [
            [customersKey, this.stringify(this.customersKeys)],
            [lastCustomerSyncKey, this.lastCustomerSync.toISOString()],
            [pendingCustomersKey, this.stringify(this.pendingCustomers)],
            [customerTypesKey, this.stringify(this.customerTypes)],
        ]

        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected Rows: ' + rows);
            })
            .catch(error => {
                console.log('PosStorage:clearDataOnly: Error: ' + error);
            });
    }

    clearDataBeforeSynch() {
        this.customersKeys = [];
        let firstSyncDate = new Date('November 7, 1973');
        this.lastCustomerSync = firstSyncDate;
        this.pendingCustomers = [];
        let keyArray = [
            [customersKey, this.stringify(this.customersKeys)],
            [lastCustomerSyncKey, this.lastCustomerSync.toISOString()],
            [pendingCustomersKey, this.stringify(this.pendingCustomers)],
            [customerTypesKey, this.stringify(this.customerTypes)],
        ]
        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected rows ' + rows);
            })
            .catch(error => {
                console.log('PosStorage:clearDataOnly: Error: ' + error);
            });
    }

    getCustomerTypesForDisplay(salesChannelId = 0) {
        let customerTypesForDisplay = [];
        if (salesChannelId != 0) {
            this.customerTypes.forEach(customerType => {
                if (customerType.name !== 'anonymous' && customerType.salesChannelId == salesChannelId) {
                    customerTypesForDisplay.push({
                        id: customerType.id,
                        name: customerType.name,
                        displayName: capitalizeWord(customerType.name),
                        salesChannelId: customerType.salesChannelId
                    });
                }
            });
        }
        else {
            this.customerTypes.forEach(customerType => {
                if (customerType.name !== 'anonymous' && salesChannelId == 0) {
                    customerTypesForDisplay.push({
                        id: customerType.id,
                        name: customerType.name,
                        displayName: capitalizeWord(customerType.name),
                        salesChannelId: customerType.salesChannelId
                    });
                }
            });

        }
        return customerTypesForDisplay;
    }

    getCustomerTypes() {
        return this.customerTypes;
    }

    getCustomerTypeByName(name) {
        for (let i = 0; i < this.customerTypes.length; i++) {
            if (this.customerTypes[i].name === name) {
                return this.customerTypes[i];
            }
        }
        return null;
    }


    makeCustomerKey(customer) {
        return customerItemKey + '_' + customer.customerId;
    }

    customerIdFromKey(customerKey) {
        const prefix = customerItemKey + '_';
        return customerKey.slice(prefix.length);
    }

    saveCustomerTypes(customerTypesArray) {
        this.customerTypes = customerTypesArray;
        this.setKey(customerTypesKey, this.stringify(customerTypesArray));
    }


    createCustomer(
        phone,
        name,
        address,
        siteId,
        salesChannelId,
        customerTypeId,
        frequency,
        secondPhoneNumber
    ) {
        const now = new Date();
        return this.createCustomerFull(
            phone,
            name,
            address,
            siteId,
            salesChannelId,
            customerTypeId,
            now,
            now,
            frequency,
            secondPhoneNumber
        );
    }

    createCustomerFull(
        phone,
        name,
        address,
        siteId,
        salesChannelId,
        customerTypeId,
        createdDate,
        updatedDate,
        frequency,
        secondPhoneNumber
    ) {
        const newCustomer = {
            customerId: uuidv1(),
            name: name,
            phoneNumber: phone,
            address: address,
            siteId: siteId,
            dueAmount: 0,
            salesChannelId: salesChannelId,
            customerTypeId: customerTypeId,
            createdDate: createdDate,
            updatedDate: updatedDate,
            frequency: frequency,
            secondPhoneNumber: secondPhoneNumber
        };

        let key = this.makeCustomerKey(newCustomer);
        this.customers.push(newCustomer);
        newCustomer.syncAction = 'create';
        this.customersKeys.push(key);
        this.pendingCustomers.push(key);
        let keyArray = [
            [customersKey, this.stringify(this.customersKeys)], // Array of customer keys
            [key, this.stringify(newCustomer)], // The new customer
            [pendingCustomersKey, this.stringify(this.pendingCustomers)] // Array pending customer
        ];

        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected rows ' + rows);
            })
            .catch(error => {
                console.log('PosStorage:createCustomer: Error: ' + error);
            });
        return newCustomer;
    }

    setReminderDate(customer, customerFrequency) {
        let reminder_date = moment().add(customerFrequency, 'day').format("YYYY-MM-DD");
        console.log('Setting reminderDate ===>' + reminder_date);
        customer.reminder_date = reminder_date;
        let key = this.makeCustomerKey(customer);
        customer.syncAction = "update";
        //customer.reminder_date = reminder_date;
        console.log(customer);
        this.pendingCustomers.push(key);

        let keyArray = [
            [key, this.stringify(customer)], // Customer keys
            [pendingCustomersKey, this.stringify(this.pendingCustomers)] // Array pending customer
        ];
        this.multiSet(keyArray).then(error => {
            if (error) {
                console.log("PosStorage:updateCustomer: Error: " + error);
            }
        });

    }


    deleteCustomer(customer) {
        let key = this.makeCustomerKey(customer);
        let index = this.customers.indexOf(customer);
        if (index > -1) {
            let customer = this.customers[index];
            customer.syncAction = 'delete';
            this.customers.splice(index, 1);
            index = this.customersKeys.indexOf(key);
            if (index > -1) {
                this.customersKeys.splice(index, 1);
            }
            this.pendingCustomers.push(key);
            let keyArray = [
                [customersKey, this.stringify(this.customersKeys)], // Array of customer keys
                [key, this.stringify(customer)], // The customer being deleted
                [pendingCustomersKey, this.stringify(this.pendingCustomers)] // Array pending customer
            ];

            this.multiSet(keyArray)
                .then(rows => {
                    console.log('Affected rows: ' + rows);
                })
                .catch(error => {
                    console.log('PosStorage:deleteCustomer: Error: ' + error);
                });
        }
    }

    // TODO: Only accept the new customer object
    updateCustomer(
        customer,
        phone,
        name,
        address,
        salesChannelId,
        customerTypeId,
        frequency,
        secondPhoneNumber
    ) {
        let key = this.makeCustomerKey(customer);
        customer.name = name;
        customer.phoneNumber = phone;
        customer.address = address;
        customer.salesChannelId = salesChannelId;
        customer.customerTypeId = customerTypeId;
        customer.updatedDate = new Date();
        customer.syncAction = 'update';
        customer.frequency = frequency;
        customer.secondPhoneNumber = secondPhoneNumber

        if (customer.reminder_date) {
            customer.reminder_date = moment(customer.reminder_date).format(
                'YYYY-MM-DD'
            );
        }

        console.log('THE CUSTOMER REMINDER DATE===>' + customer.reminder_date);
        this.pendingCustomers.push(key);

        let keyArray = [
            [key, this.stringify(customer)], // Customer keys
            [pendingCustomersKey, this.stringify(this.pendingCustomers)] // Array pending customer
        ];

        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected rows ' + rows);
            })
            .catch(error => {
                console.log('PosStorage:updateCustomer: Error: ' + error);
            });
    }

    addRemoteCustomers(customerArray) {
        console.log(
            'PosStorage:addCustomers: No existing customers no need to merge....'
        );
        this.customers = [];
        let keyValueArray = [];
        let keyArray = [];
        for (let index = 0; index < customerArray.length; index++) {
            if (customerArray[index].active) {
                keyValueArray.push([
                    this.makeCustomerKey(customerArray[index]),
                    this.stringify(customerArray[index])
                ]);
                keyArray.push(this.makeCustomerKey(customerArray[index]));
                this.customers.push(customerArray[index]);
            }
        }
        this.customersKeys = keyArray;
        keyValueArray.push([customersKey, this.stringify(keyArray)]);

        this.multiSet(keyValueArray)
            .then(rows => {
                console.log('Affected rows: ' + rows);
            })
            .catch(error => {
                console.log('PosStorage:addCustomers: Error: ' + error);
            });
    }

    // Merge new customers into existing ones
    mergeCustomers(remoteCustomers) {
        console.log(
            'PosStorage:mergeCustomers Number of remote customers: ' +
            remoteCustomers.length
        );
        let newCustomersAdded = remoteCustomers.length > 0 ? true : false;
        if (this.customers.length == 0) {
            this.addRemoteCustomers(remoteCustomers);
            return {
                pendingCustomers: this.pendingCustomers.slice(),
                updated: newCustomersAdded
            };
        } else {
            // Need to merge webCustomers with existing and pending customers
            console.log(
                'PosStorage:mergeCustomers. Merging ' +
                remoteCustomers.length +
                ' web Customers into existing and pending customers'
            );
            let webCustomersToUpdate = [];
            let isPendingModified = false;
            remoteCustomers.forEach(remoteCustomer => {
                const webCustomerKey = this.makeCustomerKey(remoteCustomer);
                const pendingIndex = this.pendingCustomers.indexOf(
                    webCustomerKey
                );
                if (pendingIndex != -1) {
                    let localCustomer = this.getLocalCustomer(
                        remoteCustomer.customerId
                    );
                    if (localCustomer) {
                        console.log(
                            'PostStorage - mergeCustomers. Local Date ' +
                            new Date(localCustomer.updatedDate) +
                            ' Remote Date ' +
                            remoteCustomer.updatedDate
                        );
                    }
                    if (
                        localCustomer &&
                        remoteCustomer.updatedDate >
                        new Date(localCustomer.updatedDate)
                    ) {
                        // remoteCustomer is the latest
                        console.log(
                            'PostStorage - mergeCustomers. Remote customer ' +
                            remoteCustomer.name +
                            ' is later:'
                        );
                        webCustomersToUpdate.push(remoteCustomer);
                        this.pendingCustomers.splice(pendingIndex, 1);
                        isPendingModified = true;
                    } else {
                        console.log(
                            'PostStorage - mergeCustomers. Local customer ' +
                            localCustomer.name +
                            ' is later:'
                        );
                    }
                } else {
                    webCustomersToUpdate.push(remoteCustomer);
                }
            });
            if (isPendingModified) {
                this.setKey(
                    pendingCustomersKey,
                    this.stringify(this.pendingCustomers)
                );
            }
            this.mergeRemoteCustomers(webCustomersToUpdate);
            return {
                pendingCustomers: this.pendingCustomers.slice(),
                updated: newCustomersAdded
            };
        }
    }

    mergeRemoteCustomers(remoteCustomers) {
        let isNewCustomers = false;
        remoteCustomers.forEach(
            function (customer) {
                let customerKey = this.makeCustomerKey(customer);
                let keyIndex = this.customersKeys.indexOf(customerKey);
                if (keyIndex === -1) {
                    if (customer.active) {
                        isNewCustomers = true;
                        this.customersKeys.push(customerKey);
                        this.customers.push(customer);
                        this.setKey(customerKey, this.stringify(customer));
                    }
                } else {
                    if (customer.active) {
                        this.setKey(customerKey, this.stringify(customer)); // Just update the existing customer
                        this.setLocalCustomer(customer);
                    } else {
                        // Remove an inactivated customer
                        let index = this.getLocalCustomerIndex(
                            customer.customerId
                        );
                        if (index > -1) {
                            this.customers.splice(index, 1);
                            index = this.customersKeys.indexOf(customerKey);
                            if (index > -1) {
                                this.customersKeys.splice(index, 1);
                            }
                            let keyArray = [
                                [
                                    customersKey,
                                    this.stringify(this.customersKeys)
                                ], // Array of customer keys
                                [customerKey, this.stringify(customer)] // The customer being deleted
                            ];

                            this.multiSet(keyArray)
                                .then(rows => {
                                    console.log('Affected rows ' + rows);
                                })
                                .catch(error => {
                                    console.log(
                                        'PosStorage:mergeRemoteCustomers: Error: ' +
                                        error
                                    );
                                });
                        }
                    }
                }
            }.bind(this)
        );
        if (isNewCustomers) {
            this.setKey(customersKey, this.stringify(this.customersKeys));
        }
    }

    loadCustomersFromKeys() {
        console.log(
            'loadCustomersFromKeys. No of customers: ' +
            this.customersKeys.length
        );
        return new Promise((resolve, reject) => {
            try {
                let that = this;
                this.multiGet(this.customersKeys).then(results => {
                    that.customers = results.map(result => {
                        return that.parseJson(result[1]);
                    });
                    resolve(true);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    loadCustomersFromKeys2() {
        console.log(
            'loadCustomersFromKeys. No of customers: ' +
            this.customersKeys.length
        );

        let that = this;
        let results = this.getMany(this.customersKeys);
        return that.customers = results.map(result => {
            return that.parseJson(result[1]);
        });
    }

    removePendingCustomer(customerKey) {
        console.log('PostStorage:removePendingCustomer');
        const index = this.pendingCustomers.indexOf(customerKey);
        if (index > -1) {
            this.pendingCustomers.splice(index, 1);
            let keyArray = [
                [pendingCustomersKey, this.stringify(this.pendingCustomers)]
            ];

            this.multiSet(keyArray)
                .then(rows => {
                    console.log('Affected rows: ' + rows);
                })
                .catch(error => {
                    console.log(
                        'PosStorage:removePendingCustomer: Error: ' + error
                    );
                });
        }
    }

    setLastCustomerSync(lastSyncTime) {
        this.lastCustomerSync = lastSyncTime;
        this.setKey(lastCustomerSyncKey, this.lastCustomerSync.toISOString());
    }

    stringify(jsObject) {
        return JSON.stringify(jsObject);
    }

    parseJson(jsonString) {
        if (typeof jsonString === 'string') {
            return JSON.parse(jsonString);
        }
        return null;
    }

    async getKey(key) {
        try {
            const value = await this.getItem(key);
            return value;
        } catch (error) {
            console.log('Pos Storage Error retrieving data');
        }
    }

    async setKey(key, stringValue) {
        console.log(
            'Pos Storage:setKey() Key: ' + key + ' Value: ' + stringValue
        );
        return await this.setItem(key, stringValue);
    }



    async removeKey(key) {
        try {
            await this.removeItem(key);
        } catch (error) {
            console.log('Pos Storage Error removing data' + error);
        }
    }


    // Realm access methods start
    getItem(key) {
        let value;
        realm.write(() => {
            value = realm.objectForPrimaryKey('SemaRealm', key);
        });
        console.log(value.data);
        return value.data;
    }

    setItem(key, value) {
        return new Promise((resolve, reject) => {
            try {
                realm.write(() => {
                    let obj = realm.objectForPrimaryKey('SemaRealm', key);
                    if (obj != null) {
                        realm.create('SemaRealm', { id: key, data: value }, true);
                    }
                    else {
                        realm.create('SemaRealm', { id: key, data: value });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    removeItem(key) {
        return new Promise((resolve, reject) => {
            try {
                realm.write(() => {
                    let semaobject = realm.objectForPrimaryKey(
                        'SemaRealm',
                        key
                    );
                    realm.delete(semaobject);
                    resolve(semaobject);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    multiGet = keyArray => {
        var promise = new Promise(function (resolve, reject) {
            let result = [];
            realm.write(() => {
                for (i = 0; i < keyArray.length; i++) {
                    let value = realm.objectForPrimaryKey(
                        'SemaRealm',
                        keyArray[i]
                    );
                    let semaobject = [keyArray[i], value.data];
                    //console.log(value.data);
                    // semaobjects[i] = semaobject;
                    result.push(semaobject);
                }
            });
            resolve(result);
        });

        return promise;
    };

    getMany = keyArray => {
        let result = [];
        for (i = 0; i < keyArray.length; i++) {
            let value = realm.objectForPrimaryKey(
                'SemaRealm',
                keyArray[i]
            );
            let semaobject = [keyArray[i], value.data];
            //console.log(value.data);
            // semaobjects[i] = semaobject;
            result.push(semaobject);
        }
        return result;

    };

    multInsert(keyArray) {
        let count = 0;
        for (i = 0; i < keyArray.length; i++) {
            count++;
            let key = keyArray[i][0];
            let value = keyArray[i][1];
            // realm.create('SemaRealm', {id: key, data: value})
            let obj = realm.objectForPrimaryKey('SemaRealm', key);
            if (obj != null)
                realm.create('SemaRealm', { id: key, data: value }, true);
            else
                realm.create('SemaRealm', { id: key, data: value });
        }
        console.log(count);
        return { rows: count };

    }


    multiSet(keyArray) {
        return new Promise((resolve, reject) => {
            realm.write(() => {
                try {
                    let count = 0;
                    for (i = 0; i < keyArray.length; i++) {
                        count++;
                        let key = keyArray[i][0];
                        let value = keyArray[i][1];
                        // realm.create('SemaRealm', {id: key, data: value})
                        let obj = realm.objectForPrimaryKey('SemaRealm', key);
                        if (obj != null)
                            realm.create('SemaRealm', { id: key, data: value }, true);
                        else
                            realm.create('SemaRealm', { id: key, data: value });
                    }
                    console.log(count);
                    resolve({ rows: count });
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    // End of Realm methods


}

export default new Customers();