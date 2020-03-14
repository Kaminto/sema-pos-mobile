import realm from '../init';
const uuidv1 = require('uuid/v1');
import { format, parseISO, sub, compareAsc } from 'date-fns';
class CustomerRealm {
    constructor() {
        this.customer = [];
        let firstSyncDate = format(sub(new Date(), { days: 180 }), 'yyyy-MM-dd');
        // console.log('firstSyncDate',firstSyncDate)
        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerSyncDate')))).length == 0) {
                realm.create('CustomerSyncDate', { lastCustomerSync: firstSyncDate });
            }
            //   let syncDate = realm.objects('CustomerSyncDate');
            //  syncDate[0].lastCustomerSync = firstSyncDate;
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

    setLastCustomerSync() {
        realm.write(() => {
            console.log('update sync date');
            let syncDate = realm.objects('CustomerSyncDate');
            syncDate[0].lastCustomerSync = new Date()
        })
    }

    getAllCustomer() {
        let customers = Object.values(JSON.parse(JSON.stringify(realm.objects('Customer'))));
        return customers.filter(r => {
            return r.is_delete === null || r.is_delete === 1;
        })
    }

    getCustomerByCreatedDate(date) {
        try {
            let orderObj = Object.values(JSON.parse(JSON.stringify(realm.objects('Customer'))));
            return orderObj.filter(r => {
            return compareAsc(parseISO(r.createdDate), parseISO(date)) === 1 || compareAsc(parseISO(r.updatedDate), parseISO(date)) === 1;
            }
            );
        } catch (e) {
            console.log("Error on get customers", e);
            return e;
        }
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
                customerObj[0].walletBalance = customer.walletBalance;


                if (customer.reminder_date) {
                    customerObj[0].reminder_date = format(parseISO(customer.reminder_date), 'yyyy-MM-dd')
                }



            })

        } catch (e) {
            console.log("Error on update customer ", e);
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
            console.log("Error on update customer due amount", e);
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
            console.log("Error on update customer bal", e);
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
            console.log("Error on synch", e);
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
            console.log("Error on delete hard customer ", e);
        }
    }

    softDeleteCustomer(customer) {
        try {
            realm.write(() => {
                let customerObj = realm.objects('Customer').filtered(`customerId = "${customer.customerId}"`);
                customerObj[0].syncAction = 'delete';
                customerObj[0].is_delete = 0;
                customerObj[0].updatedDate = new Date();
            })

        } catch (e) {
            console.log("Error on soft delete customer ", e);
        }
    }

    createManyCustomers(customers) {
        try {
            realm.write(() => {
                customers.forEach(obj => {
                    realm.create('Customer', 
                    {
                        customerId: obj.id,
                        name: obj.name,
                        customerTypeId: obj.customer_type_id,
                        salesChannelId: obj.sales_channel_id,
                        siteId: obj.kiosk_id,
                        is_delete: obj.is_delete,
                        reminder_date: obj.reminder_date,
                        frequency: obj.frequency,
                        dueAmount: obj.due_amount,
                        walletBalance: obj.wallet_balance,
                        address: obj.address_line1,
                        gpsCoordinates: obj.gps_coordinates,
                        phoneNumber: obj.phone_number,
                        secondPhoneNumber: obj.second_phone_number,
                        active: obj.active === 1 ? true : false ,
                        createdDate: obj.created_at,
                        updatedDate: obj.updated_at   
                    }
                    );
                });
            });
        } catch (e) {
            console.log("Error on creation", e);
        }

    }
}

export default new CustomerRealm();
