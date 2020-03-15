import realm from '../init';
const uuidv1 = require('uuid/v1');
import { format, parseISO, sub, compareAsc } from 'date-fns';

class CustomerDebtRealm {

    constructor() {
        this.customerDebt = [];
        let firstSyncDate = format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd');
        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerDebtSyncDate')))).length == 0) {
                realm.create('CustomerDebtSyncDate', { lastCustomerDebtSync: firstSyncDate });
            }
            // let syncDate = realm.objects('CustomerDebtSyncDate');
            // syncDate[0].lastCustomerDebtSync = firstSyncDate;
        });
        this.lastCustomerDebtSync = firstSyncDate;
    }

    getLastCustomerDebtSync() {
        return JSON.parse(JSON.stringify(realm.objects('CustomerDebtSyncDate')))['0'].lastCustomerDebtSync;
    }

    setLastCustomerDebtSync() {
        realm.write(() => {
            console.log('update sync date');
            let syncDate = realm.objects('CustomerDebtSyncDate');
            syncDate[0].lastCustomerDebtSync = new Date();
        })
    }

    truncate() {
        try {
            realm.write(() => {
                let customerDebts = realm.objects('CustomerDebt');
                realm.delete(customerDebts);
            })
        } catch (e) {
            console.log("Error on truncate customer debt", e);
        }
    }

    getCustomerDebts() {
        return Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerDebt'))));
    }


    getCustomerDebtsByDate(date) {
        let customerDebt = Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerDebt')))); 
        return customerDebt.filter(r => {
            return compareAsc(parseISO(r.created_at), parseISO(date)) === 1 || compareAsc(parseISO(r.updated_at), parseISO(date)) === 1;
        }
        );
    }

    initialise() {
        return this.getCustomerDebts();
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


    updateCustomerDebt(customerDebt) {
        try {
            realm.write(() => {
                let customerDebtObj = realm.objects('CustomerDebt').filtered(`id = "${customerDebt.customer_debt_id}"`);
                customerDebtObj[0].customer_debt_id = customerDebt.customer_debt_id;
                customerDebtObj[0].name = customerDebt.name;
                customerDebtObj[0].active = customerDebt.active;
                customerDebtObj[0].description = customerDebt.description;
                customerDebtObj[0].syncAction = customerDebt.syncAction;
                customerDebtObj[0].created_at = customerDebt.created_at;
                customerDebtObj[0].updated_at = new Date();

            })
        } catch (e) {
            console.log("Error on update customer debt", e);
        }
    }

    resetSelected() {
        try {
            realm.write(() => {
                let customerDebtObj = realm.objects('CustomerDebt');
                customerDebtObj.forEach(element => {
                    element.isSelected = false;
                })
            })
        } catch (e) {
            console.log("Error on reset customer debt", e);
        }
    }

    isSelected(customerDebt, isSelected) {
        try {
            realm.write(() => {
                let customerDebtObj = realm.objects('CustomerDebt').filtered(`id = "${customerDebt.customer_debt_id}"`);
                customerDebtObj[0].isSelected = isSelected;

            })
        } catch (e) {
            console.log("Error on isSelected customer debt", e);
        }

    }

    synched(customerDebt) {
        console.log('localCustomerDebt', localCustomerDebt)
        try {
            realm.write(() => {
                let customerDebtObj = realm.objects('CustomerDebt').filtered(`id = "${customerDebt.customer_debt_id}"`);
                customerDebtObj[0].active = true;
                customerDebtObj[0].syncAction = null;
            })
        } catch (e) {
            console.log("Error on synched customer debt", e);
        }
    }


    // Hard delete when active property is false or when active property and syncAction is delete
    hardDeleteCustomerDebt(customerDebt) {
        try {
            realm.write(() => {
                let customerDebts = realm.objects('CustomerDebt');
                let deleteCustomerDebt = customerDebts.filtered(`id = "${customerDebt.customer_debt_id}"`);
                realm.delete(deleteCustomerDebt);
            })

        } catch (e) {
            console.log("Error on hard delete customer debt", e);
        }
    }

    softDeleteCustomerDebt(customerDebt) {
        try {
            realm.write(() => {
                realm.write(() => {
                    let customerDebtObj = realm.objects('CustomerDebt').filtered(`id = "${customerDebt.customer_debt_id}"`);
                    customerDebtObj[0].syncAction = 'delete';
                })
            })
        } catch (e) {
            console.log("Error on soft delete customer debt", e);
        }
    }

    createManyCustomerDebt(customerDebts, customer_account_id) {
        try {
            realm.write(() => {
                if (customer_account_id) {
                    customerDebts.forEach(obj => {
                        realm.create('CustomerDebt', {
                            customer_account_id: customer_account_id ? customer_account_id : null,
                            customer_debt_id: uuidv1(),
                            due_amount: obj.due_amount ? Number(obj.due_amount) : Number(obj.amount),
                            active: false,
                            syncAction: obj.syncAction ? obj.syncAction : 'create',
                            created_at: new Date(),
                        });
                    });
                }
                if (!customer_account_id) {
                    customerDebts.forEach(obj => {
                        realm.create('CustomerDebt', {...obj, due_amount: obj.due_amount ? Number(obj.due_amount) : Number(obj.amount), });
                    });
                }
            });
        } catch (e) {
            console.log("Error on create many customer debts", e);
        }
    }

    createCustomerDebt(due_amount, customer_account_id) {
        try {
            realm.write(() => {
                realm.create('CustomerDebt', {
                    customer_account_id,
                    customer_debt_id: uuidv1(),
                    due_amount: Number(due_amount),
                    active: false,
                    syncAction: 'create',
                    created_at: new Date(),
                });
            });
        } catch (e) {
            console.log("Error on create customer debts", e);
        }
    }

}

export default new CustomerDebtRealm();
