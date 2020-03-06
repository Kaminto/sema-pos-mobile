import realm from '../init';
import { format, parseISO } from 'date-fns';
class OrderRealm {
    constructor() {
        this.order = [];
        let firstSyncDate = new Date('November 7, 1973');
        this.lastOrderSync = firstSyncDate;
    }

    truncate() {
        try {
            realm.write(() => {
                let orders = realm.objects('Order');
                realm.delete(orders);
            })
        } catch (e) {
            console.log("Error on truncate orders", e);
        }
    }

    getAllOrder() {
        let formattedArray = [...Object.values(JSON.parse(JSON.stringify(realm.objects('Order'))))];
        for (let i in formattedArray) {
            formattedArray[i].customer_account = JSON.parse(formattedArray[i].customer_account);
            formattedArray[i].receipt_line_items = JSON.parse(formattedArray[i].receipt_line_items);
        }

        return this.order = formattedArray;
    }

    
    getActiveOrders() {
        let formattedArray = [...Object.values(JSON.parse(JSON.stringify(realm.objects('Order').filtered(`is_delete = "${1}"`))))];
        for (let i in formattedArray) {
            formattedArray[i].customer_account = JSON.parse(formattedArray[i].customer_account);
            formattedArray[i].receipt_line_items = JSON.parse(formattedArray[i].receipt_line_items);
        }

        return this.order = formattedArray;
    }

    getOrdersByDate(date) {
        return new Promise(resolve => {


            try {
                let orderObj = Object.values(JSON.parse(JSON.stringify(realm.objects('Order'))));
                let orderObj2 = orderObj.map(
                    item => {
                        return {
                            ...item, created_at: format(parseISO(item.created_at), 'yyyy-MM-dd')
                        }
                    });

                resolve(orderObj2.filter(r => r.created_at === format(parseISO(date), 'yyyy-MM-dd')));
            } catch (e) {
                console.log("Error on get orders", e);
                resolve(e);
            }

        });
    }

    getOrderItems() {
        return this.order = Object.values(JSON.parse(JSON.stringify(realm.objects('OrderItems'))));
    }

    initialise() {
        return this.getAllOrder();
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


    createOrder(receipt) {
        const now = new Date();

        const newOrder = {
            active: false,
            status: 'pending',
            amount_cash: receipt.amount_cash,
            amount_loan: receipt.amount_loan,
            amount_mobile: receipt.amount_mobile,
            amount_bank: receipt.amount_bank,
            amount_cheque: receipt.amount_cheque,
            amountjibuCredit: receipt.amountjibuCredit,
            isWalkIn: receipt.isWalkIn,
            delivery: receipt.delivery,
            cogs: receipt.cogs,
            customer_account: JSON.stringify(receipt.customer_account),
            created_at: receipt.createdDate.toISOString(),
            updated_at: receipt.createdDate.toISOString(),
            currency_code: receipt.currency_code,
            customer_account_id: receipt.customer_account_id,
            customer_type_id: receipt.customer_type_id,
            id: receipt.id,
            payment_type: receipt.payment_type,
            receipt_line_items: receipt.products,
            receiptId: receipt.id,
            sales_channel_id: receipt.sales_channel_id,
            kiosk_id: receipt.siteId,
            total: receipt.total,
            syncAction: 'create',
        };
        newOrder.uuid = newOrder.receiptId;
        let receipt_line_items = [];
        for (let i in receipt.products) {
            receipt_line_items.push({
                currency_code: newOrder.currency_code,
                price_total: receipt.products[i].price_total,
                sku: receipt.products[i].sku,
                litersPerSku: receipt.products[i].litersPerSku,
                quantity: receipt.products[i].quantity,
                receipt_id: newOrder.receiptId,
                is_delete: receipt.products[i].is_delete,
                product_id: receipt.products[i].product_id,
                product: receipt.products[i].product,
                description: receipt.products[i].description,
                cogs_total: receipt.products[i].cogs_total,
                notes: receipt.products[i].notes,
                refillPending: receipt.products[i].refillPending,
                emptiesDamaged: receipt.products[i].emptiesDamaged,
                emptiesReturned: receipt.products[i].emptiesReturned,
                totalAmount: receipt.products[i].totalAmount,
                active: false,
                created_at: newOrder.created_at,
                updated_at: newOrder.updated_at,
            })


        }
        newOrder.receipt_line_items = JSON.stringify(receipt_line_items);
        try {
            realm.write(() => {
                realm.create('Order', newOrder);
            });
        } catch (e) {
            console.log("Error on creation orders", e);
        }



    }

    updateOrder(
        order,
        phone,
        name,
        address,
        salesChannelId,
        orderTypeId,
        frequency,
        secondPhoneNumber
    ) {
        try {
            realm.write(() => {
                let orderObj = realm.objects('Order').filtered(`orderId = "${order.orderId}"`);

                orderObj[0].name = name;
                orderObj[0].phoneNumber = phone;
                orderObj[0].address = address;
                orderObj[0].salesChannelId = salesChannelId;
                orderObj[0].orderTypeId = orderTypeId;
                orderObj[0].updatedDate = new Date();
                orderObj[0].syncAction = 'update';
                orderObj[0].frequency = frequency;
                orderObj[0].secondPhoneNumber = secondPhoneNumber

                if (order.reminder_date) {
                    orderObj[0].reminder_date = format(parseISO(order.reminder_date), 'yyyy-MM-dd');
                }



            })

        } catch (e) {
            console.log("Error on update orders", e);
        }

    }

    synched(order) {
        try {
            realm.write(() => {
                let orderObj = realm.objects('Order').filtered(`receiptId = "${order.receiptId}"`);
                orderObj[0].active = true;
                orderObj[0].syncAction = null;
            })

        } catch (e) {
            console.log("Error on synch orders", e);
        }

    }


    // Hard delete when active property is false or when active property and syncAction is delete

    hardDeleteOrder(order) {
        try {
            realm.write(() => {
                let orders = realm.objects('Order');
                let deleteOrder = orders.filtered(`orderId = "${order.orderId}"`);
                realm.delete(deleteOrder);
            })

        } catch (e) {
            console.log("Error on hard delete orders", e);
        }
    }

    softDeleteOrder(order) {
        try {
            realm.write(() => {
                let orderObj = realm.objects('Order').filtered(`id = "${order.receiptId}"`);
                orderObj[0].syncAction = 'delete';
                orderObj[0].is_delete = 0;
            })

        } catch (e) {
            console.log("Error on soft delete orders", e);
        }
    }

    createManyOrders(orders) {
        try {
            realm.write(() => {
                orders.forEach(obj => {
                    obj.amount_cash = Number(obj.amount_cash);
                    obj.amount_loan = Number(obj.amount_loan);
                    obj.amount_mobile = Number(obj.amount_mobile);
                    obj.cogs = Number(obj.cogs);
                    obj.total = Number(obj.total);
                    obj.customer_account = JSON.stringify(obj.customer_account);
                    obj.receipt_line_items = JSON.stringify(obj.receipt_line_items);
                    console.log('obj-obj', obj)
                    realm.create('Order', obj);
                });
            });

        } catch (e) {
            console.log("Error on creation many orders", e);
        }

    }
}

export default new OrderRealm();
