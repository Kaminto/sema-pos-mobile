import realm from '../init';
const uuidv1 = require('uuid/v1');

class CustomerRealm {
    constructor() {
        this.customer = [];
        let firstSyncDate = new Date('November 7, 1973');
        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerSyncDate')))).length == 0) {
                realm.create('CustomerSyncDate', { lastCustomerSync: firstSyncDate });
            }
        });
        this.lastCustomerSync = firstSyncDate;
    }

    getLastCustomerSync() {
        return this.lastCustomerSync = JSON.parse(JSON.stringify(realm.objects('CustomerSyncDate')))['0'].lastCustomerSync;
    }

    truncate() {
        try {
            realm.write(() => {
                let inventories = realm.objects('Customer');
                realm.delete(inventories);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    setLastCustomerSync(lastSyncTime) {
        let syncDate = realm.objects('CustomerSyncDate');
        syncDate[0].quantity = lastSyncTime.toISOString()
    }

    getAllCustomer() {
        return this.customer = Object.values(JSON.parse(JSON.stringify(realm.objects('Customer'))));
    }

    initialise() {
        return this.getAllCustomer();
    }

    formatDay(date) {
        date = new Date(date);
        var day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();
        if (month.toString().length == 1) {
            month = "0" + month;
        }
        if (day.toString().length == 1) {
            day = "0" + day;
        }

        return date = year + '-' + month + '-' + day;
    }


    createCustomer(kiosk_id, product_id, quantity, filterDate) {
        let existingCustomer = this.getAllCustomer().filter(customer => this.formatDay(customer.created_at) === this.formatDay(filterDate) && customer.product_id === product_id);
        console.log('existingCustomer', existingCustomer)
        const now = new Date();
        if (existingCustomer.length === 0) {
            const newCustomer = {
                closingStockId: uuidv1(),
                kiosk_id,
                product_id,
                quantity,
                created_at: now,
                updated_at: now,
                syncAction: 'create',
                active: false
            };
            try {
                realm.write(() => {
                    realm.create('Customer', newCustomer);
                });
            } catch (e) {
                console.log("Error on creation", e);
            }
        }

        if (existingCustomer.length > 0) {
            return this.updateCustomer(
                { ...existingCustomer[0], quantity: quantity, updated_at: now, syncAction: 'update' }
            )
        }
    }

    updateCustomer(customer) {
        try {
            realm.write(() => {
                let customerObj = realm.objects('Customer').filtered(`closingStockId = "${customer.closingStockId}"`);
                customerObj[0].quantity = customer.quantity;
                customerObj[0].updated_at = customer.updated_at;
                customerObj[0].syncAction = customer.syncAction;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    synched(customer) {
        try {
            realm.write(() => {
                let customerObj = realm.objects('Customer').filtered(`closingStockId = "${customer.closingStockId}"`);
                customerObj[0].active = true;
                customerObj[0].syncAction = null;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }


  // Hard delete when active property is false or when active property and syncAction is delete

    hardDeleteCustomer(customer) {
        try {
            realm.write(() => {
                console.log("customer", customer);
                let inventories = realm.objects('Customer');
                let deleteCustomer = inventories.filtered(`closingStockId = "${customer.closingStockId}"`);
                realm.delete(deleteCustomer);
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    softDeleteCustomer(customer) {
        try {
            realm.write(() => {
                realm.write(() => {
                    let customerObj = realm.objects('Customer').filtered(`closingStockId = "${customer.closingStockId}"`);
                    customerObj[0].syncAction = 'delete';
                })
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createManyInventories(inventories) {
        console.log('inventories', inventories)
        try {
            realm.write(() => {
                inventories.forEach(obj => {
                    realm.create('Customer', obj);
                });
            });

        } catch (e) {
            console.log("Error on creation", e);
        }

    }
}

export default new CustomerRealm();
