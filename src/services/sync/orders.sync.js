import OrderRealm from '../../database/orders/orders.operations';
import OrderApi from '../api/order.api';
import * as _ from 'lodash';

class OrderSync {

    synchronizeSales(siteId) {
        return new Promise(resolve => {
            OrderApi.getReceipts(siteId, OrderRealm.getLastOrderSync())
                .then(remoteOrder => {
                    let initlocalOrders = OrderRealm.getOrdersByDate2(OrderRealm.getLastOrderSync());
                    let localOrders = initlocalOrders.length > 0 ? [...initlocalOrders] : [];
                    let remoteOrders = remoteOrder.length > 0 ? [...remoteOrder] : [];

                    if (initlocalOrders.length === 0 && remoteOrders.length > 0) {
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
                            OrderRealm.createManyOrders(onlyRemote)
                            OrderRealm.setLastOrderSync();
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localOrder => {
                                let products = [];
                                for (let i in localOrder.receipt_line_items) {
                                     products.push({
                                        active: 1,
                                        cogsTotal: localOrder.receipt_line_items[i].cogs_total,
                                        description: localOrder.receipt_line_items[i].description,
                                        litersPerSku: localOrder.receipt_line_items[i].litersPerSku,
                                        priceTotal: localOrder.receipt_line_items[i].totalAmount,
                                        totalAmount: localOrder.receipt_line_items[i].totalAmount,
                                        productId: localOrder.receipt_line_items[i].product_id,
                                        quantity: localOrder.receipt_line_items[i].quantity,
                                        sku: localOrder.receipt_line_items[i].sku,
                                        notes: localOrder.receipt_line_items[i].notes,
                                        emptiesReturned: localOrder.receipt_line_items[i].emptiesReturned,
                                        damagedBottles: localOrder.receipt_line_items[i].emptiesDamaged,
                                        pendingBottles: localOrder.receipt_line_items[i].refillPending
                                    })
								}

								localOrder.products = products;
								console.log('Gaffes ' + JSON.stringify(localOrder.products));
                                delete localOrder.receipt_line_items;
                                delete localOrder.customer_account;
                                delete localOrder.customerAccountId;
                                this.apiSyncOperations(localOrder,siteId);
                            })
                        }


                        if (inLocal.length > 0 && inRemote.length > 0) {
                            inLocal.forEach(localOrder => {
                                let products = [];
                                for (let i in localOrder.receipt_line_items) {
                                  products.push({
                                        active: 1,
                                        cogsTotal: localOrder.receipt_line_items[i].cogs_total,
                                        description: localOrder.receipt_line_items[i].description,
                                        litersPerSku: localOrder.receipt_line_items[i].litersPerSku,
                                        priceTotal: localOrder.receipt_line_items[i].totalAmount,
                                        totalAmount: localOrder.receipt_line_items[i].totalAmount,
                                        productId: localOrder.receipt_line_items[i].product_id,
                                        quantity: localOrder.receipt_line_items[i].quantity,
                                        sku: localOrder.receipt_line_items[i].sku,
                                        notes: localOrder.receipt_line_items[i].notes,
                                        emptiesReturned: localOrder.receipt_line_items[i].emptiesReturned,
                                        damagedBottles: localOrder.receipt_line_items[i].emptiesDamaged,
                                        pendingBottles: localOrder.receipt_line_items[i].refillPending
                                    })
                                }
								localOrder.products = products;
                                delete localOrder.receipt_line_items;
                                delete localOrder.customer_account;
                                delete localOrder.customerAccountId;
                              this.apiSyncOperations(localOrder,siteId);
                            })
                        }
                    }
                    resolve({
                        success: true,
                        orders: onlyLocally.length + onlyRemote.length + inLocal.length,
                    });

                })
                .catch(error => {
                    resolve({
                        error: true,
                        orders: 0,
                    });
                });
        });
    }


    apiSyncOperations(localOrder, siteId) {
        console.log('localOrder', localOrder);
        if (localOrder.active === true && localOrder.syncAction === 'delete') {
            OrderApi.deleteOrder(
                localOrder, siteId
            )
                .then((response) => {
                    OrderRealm.setLastOrderSync();
                })
                .catch(error => {
                });
        }

        if (localOrder.active === true && localOrder.syncAction === 'update') {
            OrderApi.updateOrder(
                localOrder
            )
                .then((response) => {
                  // updateCount = updateCount + 1;
                  OrderRealm.setLastOrderSync();
                    // console.log(
                    //     'Synchronization:synchronizeOrder - Removing Order from pending list - ' +
                    //     response
                    // );
                })
                .catch(error => {
                    // console.log(
                    //     'Synchronization:synchronizeOrder Update Order failed ' +
                    //     error
                    // );
                });

        }

        if (localOrder.active === false && localOrder.syncAction === 'update') {
            OrderApi.createOrder(
                localOrder
            )
                .then((response) => {
                   // updateCount = updateCount + 1;
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

        if (localOrder.active === false && localOrder.syncAction === 'delete') {
            OrderApi.createOrder(
                localOrder
            )
                .then((response) => {
                  //  updateCount = updateCount + 1;
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

        if (localOrder.active === false && localOrder.syncAction === 'create') {
            OrderApi.createOrder(
                localOrder
            )
                .then((response) => {
                  //  updateCount = updateCount + 1;
                    OrderRealm.synched(localOrder);
                    OrderRealm.setLastOrderSync();
                    console.log(
                        'Synchronization:synced to remote - ',
                        response
                    );
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeOrder Create Order failed', error
                    );
                });
        }
    }

}
export default new OrderSync();
