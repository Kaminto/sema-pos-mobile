import realm from '../init';
const uuidv1 = require('uuid/v1');
import moment from 'moment-timezone';
class CustomerReminderRealm {
    constructor() {
        this.customerReminder = [];
    }

    truncate() {
        try {
            realm.write(() => {
                let customerReminders = realm.objects('CustomerReminder');
                realm.delete(customerReminders);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    getCustomerReminders() {
        return Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerReminder'))));
    }

    initialise() {
        return this.getCustomerReminders();
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


    createCustomerReminder(customerReminder) {
        try {
            realm.write(() => {
                let customerReminderObj = Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerReminder').filtered(`customer_account_id = "${customerReminder.customer_account_id}"`))));

                if (customerReminderObj.length > 0) {
                    let customerReminderUpdateObj = realm.objects('CustomerReminder').filtered(`customer_account_id = "${customerReminder.customer_account_id}"`);
                    customerReminderUpdateObj[0].frequency = customerReminder.avg;
                    customerReminderUpdateObj[0].phoneNumber = customerReminder.phoneNumber,
                        customerReminderUpdateObj[0].address = customerReminder.address,
                        customerReminderUpdateObj[0].name = customerReminder.name,
                        customerReminderUpdateObj[0].reminder_date = new Date(customerReminder.reminder);
                    customerReminderUpdateObj[0].lastPurchaseDate = new Date(customerReminder.lastPurchaseDate);
                    customerReminderUpdateObj[0].syncAction = 'UPDATE';
                    customerReminderUpdateObj[0].updated_at = new Date();
                } else {
                    const ObjSave = {
                        reminderId: uuidv1(),
                        customer_account_id: customerReminder.customer_account_id,
                        frequency: customerReminder.avg,
                        phoneNumber: customerReminder.phoneNumber,
                        address: customerReminder.address,
                        name: customerReminder.name,
                        reminder_date: new Date(customerReminder.reminder),
                        active: false,
                        lastPurchaseDate: new Date(customerReminder.lastPurchaseDate),
                        syncAction: 'CREATE',
                        created_at: new Date(),
                    };
                    realm.create('CustomerReminder', ObjSave);
                }
                // realm.create('CustomerReminder', customerReminder);
            });
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    setCustomReminder(customer_account_id, customReminderDate) {
        try {
            realm.write(() => {
                let customerReminderObj = Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerReminder').filtered(`customer_account_id = "${customer_account_id}"`))));
                if (customerReminderObj.length > 0) {
                    let customerReminderUpdateObj = realm.objects('CustomerReminder').filtered(`customer_account_id = "${customer_account_id}"`);
                    customerReminderUpdateObj[0].customReminderDate = customReminderDate;
                    customerReminderUpdateObj[0].syncAction = 'UPDATE';
                    customerReminderUpdateObj[0].updated_at = new Date();
                }
            });
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    getCustomerReminderById(customer_account_id) {
        let reminder = Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerReminder').filtered(`customer_account_id = "${customer_account_id}"`))));

        if (reminder.length > 0) {
            reminder = reminder.map(element=>{
                return {
                    ...element,
                    lastPurchaseDate:moment
                    .tz(element.lastPurchaseDate, moment.tz.guess())
                    .format('dddd Do MMMM YYYY'),
                    reminder_date:moment
                    .tz(element.reminder_date, moment.tz.guess())
                    .format('dddd Do MMMM YYYY')
                }
            });
			return reminder[0];
		} else {
			return 'N/A';
		}

    }

    updateCustomerReminder(customerReminder) {
        try {
            realm.write(() => {
                let customerReminderObj = realm.objects('CustomerReminder').filtered(`id = "${customerReminder.customerReminderId}"`);
                customerReminderObj[0].customerReminderId = customerReminder.customerReminderId;
                customerReminderObj[0].name = customerReminder.name;
                customerReminderObj[0].active = customerReminder.active;
                customerReminderObj[0].description = customerReminder.description;
                customerReminderObj[0].syncAction = customerReminder.syncAction;
                customerReminderObj[0].created_at = customerReminder.created_at;
                customerReminderObj[0].updated_at = customerReminder.updated_at;

            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    resetSelected() {
        try {
            realm.write(() => {
                let customerReminderObj = realm.objects('CustomerReminder');
                customerReminderObj.forEach(element => {
                    element.isSelected = false;
                })
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    isSelected(customerReminder, isSelected) {
        try {
            realm.write(() => {
                let customerReminderObj = realm.objects('CustomerReminder').filtered(`id = "${customerReminder.customerReminderId}"`);
                customerReminderObj[0].isSelected = isSelected;

            })
        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    synched(customerReminder) {
        try {
            realm.write(() => {
                let customerReminderObj = realm.objects('CustomerReminder').filtered(`id = "${customerReminder.customerReminderId}"`);
                customerReminderObj[0].active = true;
                customerReminderObj[0].syncAction = null;
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }


    // Hard delete when active property is false or when active property and syncAction is delete
    hardDeleteCustomerReminder(customerReminder) {
        try {
            realm.write(() => {
                let customerReminders = realm.objects('CustomerReminder');
                let deleteCustomerReminder = customerReminders.filtered(`id = "${customerReminder.customerReminderId}"`);
                realm.delete(deleteCustomerReminder);
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    softDeleteCustomerReminder(customerReminder) {
        try {
            realm.write(() => {
                realm.write(() => {
                    let customerReminderObj = realm.objects('CustomerReminder').filtered(`id = "${customerReminder.customerReminderId}"`);
                    customerReminderObj[0].syncAction = 'delete';
                })
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createManyCustomerReminder(customerReminders, customer_account_id) {
        try {
            realm.write(() => {
                if (customer_account_id) {
                    customerReminders.forEach(obj => {
                        realm.create('CustomerReminder', {
                            customer_account_id: customer_account_id ? customer_account_id : null,
                            customerReminderId: uuidv1(),
                            due_amount: obj.amount,
                            syncAction: obj.syncAction ? obj.syncAction : 'CREATE',
                            created_at: new Date(),
                            updated_at: obj.updated_at ? obj.updated_at : null,
                        });
                    });
                }
                if (!customer_account_id) {
                    customerReminders.forEach(obj => {
                        realm.create('CustomerReminder', obj);
                    });
                }
            });
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

}

export default new CustomerReminderRealm();
