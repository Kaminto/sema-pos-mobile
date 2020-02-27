import realm from '../init';
const uuidv1 = require('uuid/v1');
import { format, parseISO} from 'date-fns';
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
                let customers = realm.objects('Customer');
                realm.delete(customers);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    setLastCustomerSync(lastSyncTime) {
        realm.write(() => {
            let syncDate = realm.objects('CustomerSyncDate');
            syncDate[0].lastCustomerSync = lastSyncTime.toISOString()
        })
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


    createCustomer(
        phone,
        name,
        address,
        siteId,
        salesChannelId,
        customerTypeId,
        frequency,
        secondPhoneNumber) {
        const now = new Date();

        const newCustomer = {
            customerId: uuidv1(),
            name: name,
            phoneNumber: phone,
            address: address,
            siteId: siteId,
            dueAmount: 0,
            salesChannelId: salesChannelId,
            customerTypeId: customerTypeId,
            createdDate: now,
            updatedDate: now,
            frequency: frequency.toString(),
            secondPhoneNumber: secondPhoneNumber,
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
        try {
            realm.write(() => {
                let customerObj = realm.objects('Customer').filtered(`customerId = "${customer.customerId}"`);

                customerObj[0].name = name;
                customerObj[0].phoneNumber = phone;
                customerObj[0].address = address;
                customerObj[0].salesChannelId = salesChannelId;
                customerObj[0].customerTypeId = customerTypeId;
                customerObj[0].updatedDate = new Date();
                customerObj[0].syncAction = 'update';
                customerObj[0].frequency = frequency.toString();
                customerObj[0].secondPhoneNumber = secondPhoneNumber;
                customerObj[0].dueAmount = customer.dueAmount;

                if (customer.reminder_date) {
                    customerObj[0].reminder_date = format(parseISO(customer.reminder_date), 'yyyy-MM-dd')
                }



            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    updateCustomerDueAmount(
        customer,
        dueAmount,
    ) {
        try {
            realm.write(() => {
                let customerObj = realm.objects('Customer').filtered(`customerId = "${customer.customerId}"`);
                customerObj[0].updatedDate = new Date();
                customerObj[0].syncAction = 'update';;
                customerObj[0].dueAmount = dueAmount;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }


    updateCustomerWalletBalance(
        customer,
        walletBalance,
    ) {
        try {
            realm.write(() => {
                let customerObj = realm.objects('Customer').filtered(`customerId = "${customer.customerId}"`);
                customerObj[0].updatedDate = new Date();
                customerObj[0].syncAction = 'update';;
                customerObj[0].walletBalance = walletBalance;
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }


    synched(customer) {
        try {
            realm.write(() => {
                let customerObj = realm.objects('Customer').filtered(`customerId = "${customer.customerId}"`);
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
                let customers = realm.objects('Customer');
                let deleteCustomer = customers.filtered(`customerId = "${customer.customerId}"`);
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
                    let customerObj = realm.objects('Customer').filtered(`customerId = "${customer.customerId}"`);
                    customerObj[0].syncAction = 'delete';
                })
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createManyCustomers(customers) {
        try {
            realm.write(() => {
                customers.forEach(obj => {
                    realm.create('Customer', obj);
                });
            });
        } catch (e) {
            console.log("Error on creation", e);
        }

    }
}

export default new CustomerRealm();
