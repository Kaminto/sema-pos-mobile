import realm from '../init';
const uuidv1 = require('uuid/v1');
import SyncUtils from '../../services/sync/syncUtils';
import { parseISO, isSameDay, format, sub, set, add, getSeconds, getMinutes, getHours, compareAsc } from 'date-fns';

class CustomerRealm {
    constructor() {
        this.customer = [];
       // let firstSyncDate = format(sub(new Date(), { days: 180 }), 'yyyy-MM-dd');
        let firstSyncDate = format(new Date('2015-01-01'), 'yyyy-MM-dd');
        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerSyncDate')))).length == 0) {
                realm.create('CustomerSyncDate', { lastCustomerSync: firstSyncDate });
            }
            // let syncDate = realm.objects('CustomerSyncDate');
            // syncDate[0].lastCustomerSync = firstSyncDate;
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
                realm.delete(realm.objects('CustomerSyncDate'));
                realm.delete(customers);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    setLastCustomerSync() {
        realm.write(() => {
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


    getCustomerById(customerId) {
        let customers = Object.values(JSON.parse(JSON.stringify(realm.objects('Customer').filtered(`customerId = "${customerId}"`))));
        return customers[0]
    }


    getCustomerBycreated_at(date) {
        try {
            let orderObj = Object.values(JSON.parse(JSON.stringify(realm.objects('Customer'))));
            return orderObj.filter(r => {
                return compareAsc(parseISO(r.created_at), parseISO(date)) === 1 || compareAsc(parseISO(r.updated_at), parseISO(date)) === 1;
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
            created_at: now,
            updated_at: now,
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
                customerObj[0].updated_at = new Date();
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
                customerObj[0].updated_at = new Date();
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
                customerObj[0].updated_at = new Date();
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
                customerObj[0].updated_at = new Date();
            })

        } catch (e) {
            console.log("Error on soft delete customer ", e);
        }
    }


    createManyCustomers(customers) {
        return new Promise((resolve, reject) => {
            try {
                let result = [];
                realm.write(() => {
                    for (i = 0; i < customers.length; i++) {
                        let ischeckCustomer = this.checkCustomer(customers[i].created_at, customers[i].customerId).length;
                        if (ischeckCustomer === 0) {
                            let value = realm.create('Customer', {
                                ...customers[i],
                                customerId: customers[i].id,
                                name: customers[i].name,
                                customerTypeId: customers[i].customer_type_id,
                                salesChannelId: customers[i].sales_channel_id,
                                siteId: customers[i].kiosk_id,
                                is_delete: customers[i].is_delete === null ? 1 : customers[i].is_delete,
                                reminder_date: customers[i].reminder_date,
                                frequency: customers[i].frequency,
                                dueAmount: customers[i].due_amount === null ? 0 : Number(customers[i].due_amount),
                                walletBalance: customers[i].wallet_balance === null ? 0 : Number(customers[i].wallet_balance),
                                address: customers[i].address_line1,
                                gpsCoordinates: customers[i].gps_coordinates,
                                phoneNumber: customers[i].phone_number,
                                secondPhoneNumber: customers[i].second_phone_number,
                                active: true,
                                created_at: customers[i].created_at,
                                updated_at: customers[i].updated_at
                            });
                            result.push({ status: 'success', data: value, message: 'Customer has been set' });
                        } else if (ischeckCustomer > 0) {
                            let customerObj = realm.objects('Customer').filtered(`customerId = "${customers[i].id}"`);


                            customerObj[0].customerId = customers[i].id;
                            customerObj[0].name = customers[i].name;
                            customerObj[0].customerTypeId = customers[i].customer_type_id;
                            customerObj[0].salesChannelId = customers[i].sales_channel_id;
                            customerObj[0].siteId = customers[i].kiosk_id;
                            customerObj[0].is_delete = customers[i].is_delete === null ? 1 : customers[i].is_delete;
                            customerObj[0].reminder_date = customers[i].reminder_date;
                            customerObj[0].frequency = customers[i].frequency;
                            customerObj[0].dueAmount = customers[i].due_amount === null ? 0 : Number(customers[i].due_amount);
                            customerObj[0].walletBalance = customers[i].wallet_balance === null ? 0 : Number(customers[i].wallet_balance);
                            customerObj[0].address = customers[i].address_line1;
                            customerObj[0].gpsCoordinates = customers[i].gps_coordinates;
                            customerObj[0].phoneNumber = customers[i].phone_number;
                            customerObj[0].secondPhoneNumber = customers[i].second_phone_number;
                            customerObj[0].active = true;
                            customerObj[0].created_at = customers[i].created_at;
                            customerObj[0].updated_at = customers[i].updated_at;

                            result.push({ status: 'success', data: customers[i], message: 'Local Customer has been updated' });


                        }
                    }

                });
                resolve(result);
            } catch (e) {
                console.log("Error on creation", e);
            }
        });
    }


    checkCustomer(date, customerId) {
        return this.getAllCustomer().filter(e => SyncUtils.isSimilarDay(e.created_at, date) && e.customerId === customerId)
    }




}

export default new CustomerRealm();
