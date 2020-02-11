import realm from '../init';
const uuidv1 = require('uuid/v1');

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
        console.log('customerReminder-', customerReminder);
        try {
            realm.write(() => {
                let customerReminderObj = Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerReminder').filtered(`customer_account_id = "${customerReminder.customer_account_id}"`))));
                console.log('customerReminderObj', customerReminderObj);
                if (customerReminderObj.length > 0) {
                    let customerReminderUpdateObj = realm.objects('CustomerReminder').filtered(`customer_account_id = "${customerReminder.customer_account_id}"`);
               
                    console.log('treminder existsp');
                    customerReminderUpdateObj[0].frequency = customerReminder.avg;
                    customerReminderUpdateObj[0].phoneNumber = customerReminder.phoneNumber,
                    customerReminderUpdateObj[0].address = customerReminder.address,
                    customerReminderUpdateObj[0].name = customerReminder.name,
                    customerReminderUpdateObj[0].reminder_date = new Date(customerReminder.reminder);
                    customerReminderUpdateObj[0].lastPurchaseDate = new Date(customerReminder.lastPurchaseDate);
                    customerReminderUpdateObj[0].syncAction = 'UPDATE';
                    customerReminderUpdateObj[0].updated_at = new Date();
                } else {
                    console.log('reminder doesnt exists0');
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
                    console.log('ObjSave', ObjSave);
                    realm.create('CustomerReminder', ObjSave);
                }
                // realm.create('CustomerReminder', customerReminder);
            });
        } catch (e) {
            console.log("Error on creation", e);
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
        console.log(isSelected);
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
        console.log('customerReminders', customerReminders);
        console.log('customer_account_id', customer_account_id);
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
