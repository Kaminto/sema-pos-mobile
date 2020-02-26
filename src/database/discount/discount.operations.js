import realm from '../init';
const uuidv1 = require('uuid/v1');

class DiscountRealm {
    constructor() {
        this.discount = [];
    }

    truncate() {
        try {
            realm.write(() => {
                let discounts = realm.objects('Discount');
                realm.delete(discounts);
            })
        } catch (e) {
            console.log("Error on truncate discounts", e);
        }
    }

    getDiscounts() {
        return Object.values(JSON.parse(JSON.stringify(realm.objects('Discount'))));
    }

    initialise() {
        return this.getDiscounts();
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


    createDiscount(discount) {

        try {
            realm.write(() => {
                realm.create('Discount', discount);
            });
        } catch (e) {
            console.log("Error on creation discounts", e);
        }



    }

    updateDiscount(discount) {
        try {
            realm.write(() => {
                let discountObj = realm.objects('Discount').filtered(`id = "${discount.id}"`);
                discountObj[0].applies_to = discount.applies_to;
                discountObj[0].start_date = discount.start_date;
                discountObj[0].end_date = discount.end_date;
                discountObj[0].base64encoded_image = discount.base64encoded_image;
                discountObj[0].region_id = discount.region_id;
                discountObj[0].amount = discount.amount;
                discountObj[0].kiosk_id = discount.kiosk_id;
                discountObj[0].sku = discount.sku;
                discountObj[0].type = discount.type;
                discountObj[0].quantity = discount.quantity;
                discountObj[0].active = discount.active;
                discountObj[0].created_at = discount.created_at;
                discountObj[0].updated_at = discount.updated_at;

            })

        } catch (e) {
            console.log("Error on update discounts", e);
        }

    }

    resetSelected(){
        try {
            realm.write(() => {
                let discountObj = realm.objects('Discount');

                discountObj.forEach(element=>{
                   // console.log('element',element);
                    element.isSelected = false;
                })


            })

        } catch (e) {
            console.log("Error on reset discounts", e);
        }

    }

    isSelected(discount,isSelected) {
        try {
            realm.write(() => {
                let discountObj = realm.objects('Discount').filtered(`id = "${discount.id}"`);
                discountObj[0].isSelected = isSelected;

            })

        } catch (e) {
            console.log("Error on select discounts", e);
        }

    }

    synched(discount) {
        try {
            realm.write(() => {
                let discountObj = realm.objects('Discount').filtered(`id = "${discount.id}"`);
                discountObj[0].active = true;
                discountObj[0].syncAction = null;
            })

        } catch (e) {
            console.log("Error on synch discounts", e);
        }

    }


    // Hard delete when active property is false or when active property and syncAction is delete

    hardDeleteDiscount(discount) {
        try {
            realm.write(() => {
                let discounts = realm.objects('Discount');
                let deleteDiscount = discounts.filtered(`id = "${discount.id}"`);
                realm.delete(deleteDiscount);
            })

        } catch (e) {
            console.log("Error on hard delete discounts", e);
        }
    }

    softDeleteDiscount(discount) {
        try {
            realm.write(() => {
                realm.write(() => {
                    let discountObj = realm.objects('Discount').filtered(`id = "${discount.id}"`);
                    discountObj[0].syncAction = 'delete';
                })
            })

        } catch (e) {
            console.log("Error on soft delete discounts", e);
        }
    }

    createManyDiscount(discounts) {
        try {
            realm.write(() => {
                discounts.forEach(obj => {
                    realm.create('Discount', { ...obj, amount: Number(obj.amount) });
                });
            });

        } catch (e) {
            console.log("Error on creation many discounts", e);
        }

    }
}

export default new DiscountRealm();
