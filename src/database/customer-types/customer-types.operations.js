import realm from '../init';
import { capitalizeWord } from '../../services/Utilities';
class CustomerTypeRealm {
    constructor() {
        this.customerTypes = Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerType'))));
    }

    truncate() {
        try {
            realm.write(() => {
                realm.delete(realm.objects('CustomerType'));
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }


    getCustomerTypes() {
        return this.customerTypes = Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerType'))));
    }

    getCustomerTypesForDisplay(salesChannelId = 0) {
        let customerTypesForDisplay = [];
        if (salesChannelId != 0) {
            this.customerTypes.forEach(customerType => {
                if (customerType.name !== 'anonymous' && customerType.salesChannelId == salesChannelId) {
                    customerTypesForDisplay.push({
                        id: customerType.id,
                        name: customerType.name,
                        displayName: capitalizeWord(customerType.name),
                        salesChannelId: customerType.salesChannelId
                    });
                }
            });
        }
        else {
            this.customerTypes.forEach(customerType => {
                if (customerType.name !== 'anonymous' && salesChannelId == 0) {
                    customerTypesForDisplay.push({
                        id: customerType.id,
                        name: customerType.name,
                        displayName: capitalizeWord(customerType.name),
                        salesChannelId: customerType.salesChannelId
                    });
                }
            });

        }
        return customerTypesForDisplay;
    }

    getCustomerTypeByName(name) {
        for (let i = 0; i < this.customerTypes.length; i++) {
            if (this.customerTypes[i].name === name) {
                return this.getCustomerTypes()[i];
            }
        }
        return null;
    }


    initialise() {
        return this.getCustomerTypes();
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


    createManyCustomerTypes(customerTypes) {
        try {
            realm.write(() => {
                customerTypes.forEach(obj => {
                    realm.create('CustomerType', obj);
                });
            });

        } catch (e) {
            console.log("Error on creation", e);
        }

    }
}

export default new CustomerTypeRealm();
