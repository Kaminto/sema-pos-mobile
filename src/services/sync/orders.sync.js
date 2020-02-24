import OrderRealm from '../../database/orders/orders.operations';
import OrderApi from '../api/order.api';
import * as _ from 'lodash';

class OrderSync {

    synchronizeSales(siteId) {
        return new Promise(resolve => {
            OrderApi.getReceipts(siteId)
                .then(remoteOrder => {

                    console.log('remoteOrder', remoteOrder);

                    let initlocalOrders = OrderRealm.getAllOrder();
                    let localOrders = [...initlocalOrders];
                    let remoteOrders = [...remoteOrder];
                    console.log('remoteOrder', remoteOrder);
                    if (initlocalOrders.length === 0) {
                        OrderRealm.createManyOrders(remoteOrder);
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};
                    let updateCount = 0;
                    if (initlocalOrders.length > 0) {
                        initlocalOrders.forEach(localOrder => {
                            let filteredObj = remoteOrders.filter(obj => obj.uuid === localOrder.uuid);

                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteOrders.map(function (e) { return e.uuid }).indexOf(filteredObj[0].uuid);
                                const localIndex = localOrders.map(function (e) { return e.uuid }).indexOf(filteredObj[0].uuid);

                                remoteOrders.splice(remoteIndex, 1);
                                localOrders.splice(localIndex, 1);

                                inLocal.push(localOrder);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localOrder);
                                const localIndex = localOrders.map(function (e) { return e.uuid }).indexOf(localOrder.uuid);

                                localOrders.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteOrders);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            OrderRealm.createManyOrders(onlyRemote)
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localOrder => {

                                let products = [];
                                for (let i in localOrder.receipt_line_items) {
                                    console.log(localOrder.receipt_line_items[i]);
                                    products.push({
                                        active: 1,
                                        cogsTotal: localOrder.receipt_line_items[i].cogs_total,
                                        description:  localOrder.receipt_line_items[i].description,
                                        litersPerSku:  localOrder.receipt_line_items[i].litersPerSku,
                                        priceTotal:  localOrder.receipt_line_items[i].totalAmount,
                                        totalAmount: localOrder.receipt_line_items[i].totalAmount,
                                        productId:  localOrder.receipt_line_items[i].product_id,
                                        quantity: localOrder.receipt_line_items[i].quantity,
                                        sku:  localOrder.receipt_line_items[i].sku,
										notes:  localOrder.receipt_line_items[i].notes,
										emptiesReturned: localOrder.receipt_line_items[i].emptiesReturned,
										damagedBottles: localOrder.receipt_line_items[i].damagedBottles,
										pendingBottles: localOrder.receipt_line_items[i].refillPending
                                    })


                                }
                                localOrder.products = products;

                                OrderApi.createReceipt(
                                    {
                                        active: 1,
                                        amountCash: localOrder.amount_cash,
                                        isDelete: localOrder.isDelete,
                                        amountLoan: localOrder.amount_loan,
                                        amountMobile: localOrder.amount_mobile,
                                        isWalkIn: localOrder.isWalkIn,
                                        delivery: localOrder.delivery,
                                        amount_bank: localOrder.amount_bank,
                                        amount_cheque: localOrder.amount_cheque,
                                        amountjibuCredit: localOrder.amountjibuCredit,
                                        cogs: localOrder.cogs,
                                        createdDate: localOrder.created_at,
                                        currencyCode: localOrder.currency_code,
                                        customerId: localOrder.customer_account_id,
                                        customerTypeId: localOrder.customer_type_id,
                                        id: localOrder.id,
                                        paymentType: localOrder.payment_type,
                                        products: localOrder.products,
                                        receiptId: localOrder.receiptId,
                                        salesChannelId: localOrder.sales_channel_id,
                                        siteId: localOrder.kiosk_id,
										total: localOrder.total != null ? localOrder.total : 0
                                    }
                                )
                                    .then((response) => {
                                        OrderRealm.synched(localOrder);
                                        console.log(
                                            'Synchronization:synced to remote - ' ,
                                            response
                                        );
                                    })
                                    .catch(error => {
                                        console.log(
                                            'Synchronization: Create Order failed',error
                                        );
                                    });
                            })
                        }


                        if (inLocal.length > 0 && inRemote.length > 0) {

                            inLocal.forEach(localOrder => {
                                if (localOrder.active === true && localOrder.syncAction === 'delete') {
                                    OrderApi.deleteOrder(
                                        localOrder
                                    )
                                        .then((response) => {
                                            console.log(
                                                'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                                                response
                                            );
                                            updateCount = updateCount + 1;
                                            OrderRealm.hardDeleteOrder(
                                                localOrder
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeInventory Delete Inventory failed ' +
                                                error
                                            );
                                        });
                                }

                                if (localOrder.active === true && localOrder.syncAction === 'update') {
                                    OrderApi.updateOrder(
                                        localOrder
                                    )
                                        .then((response) => {
                                            updateCount = updateCount + 1;
                                            console.log(
                                                'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                                                response
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeInventory Update Inventory failed ' +
                                                error
                                            );
                                        });

                                } else if (localOrder.active === false && localOrder.syncAction === 'update') {
                                    OrderApi.createOrder(
                                        localOrder
                                    )
                                        .then((response) => {
                                            updateCount = updateCount + 1;
                                            OrderRealm.synched(localOrder);
                                            console.log(
                                                'Synchronization:synced to remote - ' +
                                                response
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeInventory Create Inventory failed',error
                                            );
                                        });
                                }
                            })
                        }

                        console.log('onlyRemote', onlyRemote);
                        console.log('onlyLocally', onlyLocally);
                        console.log('bothLocalRemote', bothLocalRemote);

                        console.log('localOrders2', localOrders);
                        console.log('remoteOrders2', remoteOrders);

                    }
                    resolve({
                        error: null,
                        updatedOrders: onlyLocally.length + onlyRemote.length + updateCount
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getInventory - error ' + error
                    );
                    resolve({
                        error: error,
                        updatedOrders: 0,
                    });
                });
        });
    }

}
export default new OrderSync();
