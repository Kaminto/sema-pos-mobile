import realm from '../init';
const uuidv1 = require('uuid/v1');

class PaymentTypeRealm {
    constructor() {
        this.paymentType = [];
    }

    truncate() {
        try {
            realm.write(() => {
                let paymentTypes = realm.objects('PaymentType');
                realm.delete(paymentTypes);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    getPaymentTypes() {
        return Object.values(JSON.parse(JSON.stringify(realm.objects('PaymentType'))));
    }

    initialise() {
        return this.getPaymentTypes();
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


    createPaymentType(paymentType) {
        try {
            realm.write(() => {
                realm.create('PaymentType', paymentType);
            });
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    updatePaymentType(paymentType) {
        try {
            realm.write(() => {
                let paymentTypeObj = realm.objects('PaymentType').filtered(`id = "${paymentType.id}"`);
                paymentTypeObj[0].id = paymentType.id;
                paymentTypeObj[0].name = paymentType.name;
                paymentTypeObj[0].active = paymentType.active;
                paymentTypeObj[0].description = paymentType.description;
                paymentTypeObj[0].syncAction = paymentType.syncAction;
                paymentTypeObj[0].created_at = paymentType.created_at;
                paymentTypeObj[0].updated_at = paymentType.updated_at;
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    resetSelected(){
        try {
            realm.write(() => {
                let paymentTypeObj = realm.objects('PaymentType');
                paymentTypeObj.forEach(element=>{
                   // console.log('element',element);
                    element.isSelected = false;
                })             
            })
        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    isSelected(paymentType,isSelected) {
        console.log(isSelected);
        console.log(paymentType);
        try {
            realm.write(() => {
                let paymentTypeObj = realm.objects('PaymentType').filtered(`id = "${paymentType.id}"`);
                paymentTypeObj[0].isSelected = isSelected;

            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    synched(paymentType) {
        try {
            realm.write(() => {
                let paymentTypeObj = realm.objects('PaymentType').filtered(`id = "${paymentType.id}"`);
                paymentTypeObj[0].active = true;
                paymentTypeObj[0].syncAction = null;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }


    // Hard delete when active property is false or when active property and syncAction is delete

    hardDeletePaymentType(paymentType) {
        try {
            realm.write(() => {
                let paymentTypes = realm.objects('PaymentType');
                let deletePaymentType = paymentTypes.filtered(`id = "${paymentType.id}"`);
                realm.delete(deletePaymentType);
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    softDeletePaymentType(paymentType) {
        try {
            realm.write(() => {
                realm.write(() => {
                    let paymentTypeObj = realm.objects('PaymentType').filtered(`id = "${paymentType.id}"`);
                    paymentTypeObj[0].syncAction = 'delete';
                })
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createManyPaymentTypes(paymentTypes) {
        try {
            realm.write(() => {
                paymentTypes.forEach(obj => {
                    realm.create('PaymentType', { ...obj, amount: Number(obj.amount) });
                });
            });
        } catch (e) {
            console.log("Error on creation", e);
        }

    }
}

export default new PaymentTypeRealm();
