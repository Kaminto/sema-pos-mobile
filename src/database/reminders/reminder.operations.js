import realm from '../init';
const uuidv1 = require('uuid/v1');

class ReminderRealm {
    constructor() {
        this.reminder = [];
    }

    truncate() {
        try {
            realm.write(() => {
                let reminders = realm.objects('Reminder');
                realm.delete(reminders);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    getReminders() {
        return Object.values(JSON.parse(JSON.stringify(realm.objects('Reminder'))));
    }

    initialise() {
        return this.getReminders();
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


    createReminder(reminder) {
        try {
            realm.write(() => {
                realm.create('Reminder', reminder);
            });
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    updateReminder(reminder) {
        try {
            realm.write(() => {
                let reminderObj = realm.objects('Reminder').filtered(`id = "${reminder.reminderId}"`);
                reminderObj[0].reminderId = reminder.reminderId;
                reminderObj[0].name = reminder.name;

				reminderObj[0].frequency = reminder.frequency;
				reminderObj[0].show_reminders = reminder.show_reminders;
				reminderObj[0].reminder_date = reminder.reminder_date;
                reminderObj[0].syncAction = reminder.syncAction;
                reminderObj[0].created_at = reminder.created_at;
                reminderObj[0].updated_at = reminder.updated_at;

            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    resetSelected() {
        try {
            realm.write(() => {
                let reminderObj = realm.objects('Reminder');
                reminderObj.forEach(element => {
                    element.isSelected = false;
                })
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    isSelected(reminder, isSelected) {
        console.log(isSelected);
        try {
            realm.write(() => {
                let reminderObj = realm.objects('Reminder').filtered(`id = "${reminder.reminderId}"`);
                reminderObj[0].isSelected = isSelected;

            })
        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    synched(reminder) {
        try {
            realm.write(() => {
                let reminderObj = realm.objects('Reminder').filtered(`id = "${reminder.reminderId}"`);
                reminderObj[0].active = true;
                reminderObj[0].syncAction = null;
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }


    // Hard delete when active property is false or when active property and syncAction is delete
    hardDeleteReminder(reminder) {
        try {
            realm.write(() => {
                let reminders = realm.objects('Reminder');
                let deleteReminder = reminders.filtered(`id = "${reminder.reminderId}"`);
                realm.delete(deleteReminder);
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    softDeleteReminder(reminder) {
        try {
            realm.write(() => {
                realm.write(() => {
                    let reminderObj = realm.objects('Reminder').filtered(`id = "${reminder.reminderId}"`);
                    reminderObj[0].syncAction = 'delete';
                })
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createManyReminder(reminders, customer_account_id) {
        console.log('reminders', reminders);
        console.log('customer_account_id', customer_account_id);
        try {
            realm.write(() => {
                if (customer_account_id) {
                    reminders.forEach(obj => {
                        realm.create('Reminder', {
                            customer_account_id: customer_account_id ? customer_account_id : null,
                            reminderId: uuidv1(),
                            due_amount: obj.amount,
                            syncAction: obj.syncAction ? obj.syncAction : 'CREATE',
                            created_at: new Date(),
                            updated_at: obj.updated_at ? obj.updated_at : null,
                        });
                    });
                }
                if (!customer_account_id) {
                    reminders.forEach(obj => {
                        realm.create('Reminder', obj);
                    });
                }
            });
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

}

export default new ReminderRealm();