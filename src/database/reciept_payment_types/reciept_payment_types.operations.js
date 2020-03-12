import realm from '../init';
const uuidv1 = require('uuid/v1');
import { format, parseISO, sub, compareAsc } from 'date-fns';

class ReceiptPaymentTypeRealm {
    constructor() {
        this.receiptPaymentType = [];
        let firstSyncDate = format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd');
        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('ReceiptPaymentTypeSyncDate')))).length == 0) {
                realm.create('ReceiptPaymentTypeSyncDate', { lastReceiptPaymentTypeSync: firstSyncDate });
            }
        });
        this.lastReceiptPaymentTypeSync = firstSyncDate;
    }

    truncate() {
        try {
            realm.write(() => {
                let receiptPaymentTypes = realm.objects('ReceiptPaymentType');
                realm.delete(receiptPaymentTypes);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    getLastReceiptPaymentTypeSync() {
        return this.lastReceiptPaymentTypeSync = JSON.parse(JSON.stringify(realm.objects('ReceiptPaymentTypeSyncDate')))['0'].lastReceiptPaymentTypeSync;
    }

    setReceiptPaymentTypeSync() {
        realm.write(() => {
            let syncDate = realm.objects('ReceiptPaymentTypeSyncDate');
            syncDate[0].lastReceiptPaymentTypeSync = new Date();
        })
    }

    getReceiptPaymentTypes() {
        return Object.values(JSON.parse(JSON.stringify(realm.objects('ReceiptPaymentType'))));
    }


    getReceiptPaymentTypesByDate(date) {
        try {
            let orderObj = Object.values(JSON.parse(JSON.stringify(realm.objects('ReceiptPaymentType'))));
            let orderObj2 = orderObj.map(
                item => {
                    return {
                        ...item,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                    }
                });

            return orderObj2.filter(r => {
				return compareAsc(parseISO(r.created_at), parseISO(date)) === 1 || compareAsc(parseISO(r.updated_at), parseISO(date)) === 1
                ///return r.created_at === format(parseISO(date), 'yyyy-MM-dd') || r.updated_at === format(parseISO(date), 'yyyy-MM-dd')
            }
            );
        } catch (e) {
            console.log("Error on get receipt payment types", e);
            return e;
        }
    }

    initialise() {
        return this.getReceiptPaymentTypes();
    }


    createReceiptPaymentType(receiptPaymentType) {
        try {
            realm.write(() => {
                realm.create('ReceiptPaymentType', receiptPaymentType);
            });
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    updateReceiptPaymentType(receiptPaymentType) {
        try {
            realm.write(() => {
                let receiptPaymentTypeObj = realm.objects('ReceiptPaymentType').filtered(`receipt_payment_type_id = "${receiptPaymentType.receipt_payment_type_id}"`);
                receiptPaymentTypeObj[0].id = receiptPaymentType.id;
                receiptPaymentTypeObj[0].name = receiptPaymentType.name;
                receiptPaymentTypeObj[0].active = receiptPaymentType.active;
                receiptPaymentTypeObj[0].description = receiptPaymentType.description;
                receiptPaymentTypeObj[0].syncAction = receiptPaymentType.syncAction;
                receiptPaymentTypeObj[0].created_at = receiptPaymentType.created_at;
                receiptPaymentTypeObj[0].updated_at = receiptPaymentType.updated_at;

            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    resetSelected() {
        try {
            realm.write(() => {
                let receiptPaymentTypeObj = realm.objects('ReceiptPaymentType');

                receiptPaymentTypeObj.forEach(element => {
                    // console.log('element',element);
                    element.isSelected = false;
                })


            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    isSelected(receiptPaymentType, isSelected) {
        try {
            realm.write(() => {
                let receiptPaymentTypeObj = realm.objects('ReceiptPaymentType').filtered(`id = "${receiptPaymentType.id}"`);
                receiptPaymentTypeObj[0].isSelected = isSelected;

            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    synched(receiptPaymentType) {
        try {
            realm.write(() => {
                let receiptPaymentTypeObj = realm.objects('ReceiptPaymentType').filtered(`id = "${receiptPaymentType.id}"`);
                receiptPaymentTypeObj[0].active = true;
                receiptPaymentTypeObj[0].syncAction = null;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }


    // Hard delete when active property is false or when active property and syncAction is delete

    hardDeleteReceiptPaymentType(receiptPaymentType) {
        try {
            realm.write(() => {
                let receiptPaymentTypes = realm.objects('ReceiptPaymentType');
                let deleteReceiptPaymentType = receiptPaymentTypes.filtered(`receipt_payment_type_id = "${receiptPaymentType.receipt_payment_type_id}"`);
                realm.delete(deleteReceiptPaymentType);
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    softDeleteReceiptPaymentType(receiptPaymentType) {
        try {
            realm.write(() => {
                realm.write(() => {
                    let receiptPaymentTypeObj = realm.objects('ReceiptPaymentType').filtered(`receipt_payment_type_id = "${receiptPaymentType.receipt_payment_type_id}"`);
                    receiptPaymentTypeObj[0].syncAction = 'delete';
                })
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createManyReceiptPaymentType(receiptPaymentTypes, receiptId) {
        // console.log('testing sync');
        try {
            // console.log('testing sync2');
            realm.write(() => {
                if (receiptId) {
                    console.log('no sync');
                    receiptPaymentTypes.forEach(obj => {
                        realm.create('ReceiptPaymentType', {
                            receipt_id: receiptId ? receiptId : null,
                            payment_type_id: obj.id,
                            receipt_payment_type_id: uuidv1(),
                            amount: Number(obj.amount),
                            syncAction: obj.syncAction ? obj.syncAction : 'CREATE',
                            created_at: obj.created_at ? obj.created_at : null,
                            updated_at: obj.updated_at ? obj.updated_at : null,
                        });
                    });
                }
                if (!receiptId) {
                    console.log('sync');
                    receiptPaymentTypes.forEach(obj => {
                        let syncObj = {
                            active: true,
                            amount: Number(obj.amount),
                            created_at: obj.created_at,
                            id: obj.id,
                            payment_type_id: obj.payment_type_id,
                            receipt_id: obj.receipt_id,
                            receipt_payment_type_id: obj.receipt_payment_type_id,
                            updated_at: obj.updated_at,
                        }
                        realm.create('ReceiptPaymentType', syncObj);
                    });
                }
            });

        } catch (e) {
            console.log("Error on Reciept payment creation", e);
        }
    }
}

export default new ReceiptPaymentTypeRealm();
