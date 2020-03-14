import realm from '../init';
const uuidv1 = require('uuid/v1');
import { format, parseISO, sub, compareAsc } from 'date-fns';

class CreditRealm {
    constructor() {
        this.credit = [];
        let firstSyncDate = format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd');
        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('Credit')))).length == 0) {
                realm.create('CreditSyncDate', { lastCreditSync: firstSyncDate });
            }
        });
        this.lastCreditSync = firstSyncDate;
    }

    getLastCreditSync() {
        return this.lastCreditSync = JSON.parse(JSON.stringify(realm.objects('CreditSyncDate')))['0'].lastCreditSync;
    }

    truncate() {
        try {
            realm.write(() => {
                let credits = realm.objects('Credit');
                realm.delete(credits);
            })
        } catch (e) {
            console.log("Error on truncate", e);
        }
    }

    setLastCreditSync() {
        realm.write(() => {
            let syncDate = realm.objects('CreditSyncDate');
            syncDate[0].lastCreditSync = new Date();
        })
    }

    getAllCredit() {
        return this.credit = Object.values(JSON.parse(JSON.stringify(realm.objects('Credit'))));
    }

    getAllCreditByDate(date) {
        let credit = Object.values(JSON.parse(JSON.stringify(realm.objects('Credit'))));
        return credit.filter(r => {
            return compareAsc(parseISO(r.created_at), parseISO(date)) === 1 || compareAsc(parseISO(r.updated_at), parseISO(date)) === 1;
        }
        );
    }

    initialise() {
        return this.getAllCredit();
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


    createCredit(customer_account_id, topupval, balanceval) {
        const nowDate = new Date();
        let topup = Number(topupval);
        let balance = Number(balanceval);

        const newCredit = {
            topUpId: uuidv1(),
            customer_account_id,
            topup,
            balance,
            created_at: nowDate,
            updated_at: nowDate,
            syncAction: 'create',
            active: false
        };

        try {
            realm.write(() => {
                realm.create('Credit', newCredit);
            });
        } catch (e) {
            console.log("Error on creation credit", e + now);
        }
    }

    updateCredit(credit) {
        try {
            realm.write(() => {
                let creditObj = realm.objects('Credit').filtered(`topUpId = "${credit.topUpId}"`);
                creditObj[0].customer_account_id = credit.customer_account_id;
                creditObj[0].topup = credit.topup;
                creditObj[0].balance = credit.balance;
                creditObj[0].updated_at = credit.updated_at;
                creditObj[0].syncAction = 'update';
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    synched(credit) {
        try {
            realm.write(() => {
                let creditObj = realm.objects('Credit').filtered(`topUpId = "${credit.topUpId}"`);
                creditObj[0].active = true;
                creditObj[0].syncAction = null;
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    hardDeleteCredit(credit) {
        try {
            realm.write(() => {
                let credits = realm.objects('Credit');
                let deleteCredit = credits.filtered(`topUpId = "${credit.topUpId}"`);
                realm.delete(deleteCredit);
            })
        } catch (e) {
            console.log("Error on hard delete", e);
        }
    }

    softDeleteCredit(credit) {
        try {
            realm.write(() => {
                let creditObj = realm.objects('Credit').filtered(`topUpId = "${credit.topUpId}"`);
                creditObj[0].syncAction = 'delete';
            })
        } catch (e) {
            console.log("Error on soft delete", e);
        }
    }

    createManycredits(credits) {
        try {
            realm.write(() => {
                credits.forEach(obj => {
					console.log(obj);
                    realm.create('Credit', { ...obj, topup: Number(obj.topup), balance: Number(obj.balance) });
                });
            });
        } catch (e) {
            console.log("Error on many creation", e);
        }
    }
}

export default new CreditRealm();
