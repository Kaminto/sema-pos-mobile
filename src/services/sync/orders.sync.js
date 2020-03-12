import OrderRealm from '../../database/orders/orders.operations';
import OrderApi from '../api/order.api';
import * as _ from 'lodash';

class OrderSync {

    synchronizeSales(siteId) {
        return new Promise(resolve => {
            OrderApi.getReceipts(siteId, OrderRealm.getLastOrderSync())
                .then(remoteOrder => {

                    console.log('remoteOrder', remoteOrder);
                    let initlocalOrders = OrderRealm.getOrdersByDate2(OrderRealm.getLastOrderSync());
                    let localOrders = initlocalOrders.length > 0 ? [...initlocalOrders] : [];
                    let remoteOrders = remoteOrder.length > 0 ? [...remoteOrder] : [];
                    console.log('localOrders', localOrders);
                    console.log('initlocalOrders', initlocalOrders);
                    if (initlocalOrders.length === 0 && remoteOrders.length > 0) {
                        console.log('createManyOrders', initlocalOrders);
                        OrderRealm.createManyOrders(remoteOrder);
                        OrderRealm.setLastOrderSync();
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
                            OrderRealm.createManyOrders(onlyRemote);
                            OrderRealm.setLastOrderSync();
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localOrder => {

								let products = [];

								let someorders = JSON.parse(localOrder.receipt_line_items);

                                for (let i in someorders) {
                                    products.push({
                                        active: 1,
                                        cogsTotal: someorders[i].cogs_total,
                                        description: someorders[i].description,
                                        litersPerSku: someorders[i].litersPerSku,
                                        priceTotal: someorders[i].totalAmount,
                                        totalAmount: someorders[i].totalAmount,
                                        productId: someorders[i].product_id,
                                        quantity: someorders[i].quantity,
                                        sku: someorders[i].sku,
                                        notes: someorders[i].notes,
                                        emptiesReturned: someorders[i].emptiesReturned,
                                        damagedBottles: someorders[i].damagedBottles,
                                        pendingBottles: someorders[i].refillPending
                                    });

								}

								localOrder.products = products;


                                OrderApi.createReceipt(
                                    {
                                        active: 1,
                                        amountCash: localOrder.amount_cash,
                                        is_delete: localOrder.is_delete,
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
                                        OrderRealm.setLastOrderSync();
                                        console.log(
                                            'Synchronization:synced to remote - ',
                                            response
                                        );
                                    })
                                    .catch(error => {
                                        console.log(
                                            'Synchronization: Create Order failed', error
                                        );
                                    });
                            })
                        }


                        if (inLocal.length > 0 && inRemote.length > 0) {

                            inLocal.forEach(localOrder => {
                                if (localOrder.active === true && localOrder.syncAction === 'delete') {
                                    OrderApi.deleteOrder(
                                        localOrder, siteId
                                    )
                                        .then((response) => {
                                            console.log(
                                                'Synchronization:synchronizeOrder - Removing order from pending list - ' +
                                                response
                                            );
                                            updateCount = updateCount + 1;
                                            OrderRealm.softDeleteOrder(
                                                localOrder
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeOrder Delete Order failed ' +
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
                                                'Synchronization:synchronizeOrder - Removing Order from pending list - ' +
                                                response
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeOrder Update Order failed ' +
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
                                            OrderRealm.setLastOrderSync();
                                            console.log(
                                                'Synchronization:synced to remote - ' +
                                                response
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeOrder Create Order failed', error
                                            );
                                        });
                                }
                            })
                        }
                    }
                    resolve({
                        error: null,
                        updatedOrders: onlyLocally.length + onlyRemote.length + updateCount
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getOrder - error ' + error
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
