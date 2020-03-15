import realm from '../init';
const uuidv1 = require('uuid/v1');
import { format, parseISO, add, isValid } from 'date-fns';
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
            console.log("Error on truncate customer reminder", e);
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
                        customerReminderUpdateObj[0].reminder_date = isValid(new Date(customerReminder.reminder))  ? new Date(customerReminder.reminder) : add(new Date(), { days: 10 });
                    customerReminderUpdateObj[0].lastPurchaseDate = new Date(customerReminder.lastPurchaseDate);
                    customerReminderUpdateObj[0].syncAction = 'update';
                    customerReminderUpdateObj[0].updated_at = new Date();
                } else {
                    const ObjSave = {
                        reminderId: uuidv1(),
                        customer_account_id: customerReminder.customer_account_id,
                        frequency: customerReminder.avg,
                        phoneNumber: customerReminder.phoneNumber,
                        address: customerReminder.address,
                        name: customerReminder.name,
                        reminder_date: isValid(new Date(customerReminder.reminder))  ? new Date(customerReminder.reminder) : add(new Date(), { days: 10 }), 
                        active: false,
                        lastPurchaseDate: new Date(customerReminder.lastPurchaseDate),
                        syncAction: 'create',
                        created_at: new Date(),
                    };
                    realm.create('CustomerReminder', ObjSave);
                }
                // realm.create('CustomerReminder', customerReminder);
            });
        } catch (e) {
            console.log("Error on creation customer reminderr", e);
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
            console.log("Error on set customer reminder", e);
        }
    }

    getCustomerReminderById(customer_account_id) {
        let reminder = Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerReminder').filtered(`customer_account_id = "${customer_account_id}"`))));

        if (reminder.length > 0) {
            reminder = reminder.map(element => {
                return {
                    ...element,
                    lastPurchaseDate: format(parseISO(element.lastPurchaseDate), 'iiii d MMM yyyy'),
                    reminder_date: format(parseISO(element.reminder_date), 'iiii d MMM yyyy')
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
            console.log("Error on update customer reminder", e);
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
            console.log("Error on reset customer reminder", e);
        }
    }

    isSelected(customerReminder, isSelected) {
        try {
            realm.write(() => {
                let customerReminderObj = realm.objects('CustomerReminder').filtered(`id = "${customerReminder.customerReminderId}"`);
                customerReminderObj[0].isSelected = isSelected;

            })
        } catch (e) {
            console.log("Error on select customer reminder", e);
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
            console.log("Error on synch customer reminder", e);
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
            console.log("Error on hard delete customer reminder", e);
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
            console.log("Error on soft delete customer reminder", e);
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
                            created_at: format(new Date(), 'yyyy-MM-dd'),
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
            console.log("Error on creation many customer reminder", e);
        }
    }

}

export default new CustomerReminderRealm();
