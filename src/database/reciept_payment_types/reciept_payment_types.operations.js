import realm from '../init';
const uuidv1 = require('uuid/v1');

class ReceiptPaymentTypeRealm {
    constructor() {
        this.receiptPaymentType = [];
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

    getReceiptPaymentTypes() {
        return Object.values(JSON.parse(JSON.stringify(realm.objects('ReceiptPaymentType'))));
    }

    initialise() {
        return this.getReceiptPaymentTypes();
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
                let receiptPaymentTypeObj = realm.objects('ReceiptPaymentType').filtered(`id = "${receiptPaymentType.id}"`);
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
        console.log(isSelected);
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
                let deleteReceiptPaymentType = receiptPaymentTypes.filtered(`id = "${receiptPaymentType.id}"`);
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
                    let receiptPaymentTypeObj = realm.objects('ReceiptPaymentType').filtered(`id = "${receiptPaymentType.id}"`);
                    receiptPaymentTypeObj[0].syncAction = 'delete';
                })
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createManyReceiptPaymentType(receiptPaymentTypes, receiptId) {
        console.log('receiptPaymentTypes', receiptPaymentTypes);
        console.log('receiptId', receiptId);
        try {
            realm.write(() => {
                if (receiptId) {
                    receiptPaymentTypes.forEach(obj => {
                        realm.create('ReceiptPaymentType', {
                            receipt_id: receiptId ? receiptId : null,
                            payment_type_id: obj.id,
                            amount: obj.amount,
                            syncAction: obj.syncAction ? obj.syncAction : 'CREATE',
                            created_at: obj.created_at ? obj.created_at : null,
                            updated_at: obj.updated_at ? obj.updated_at : null,
                        });
                    });
                }
                if (!receiptId) {
                    receiptPaymentTypes.forEach(obj => {
                        realm.create('ReceiptPaymentType', obj);
                    });
                }
            });

        } catch (e) {
            console.log("Error on creation", e);
        }

    }
}

export default new ReceiptPaymentTypeRealm();