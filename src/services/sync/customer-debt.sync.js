import CustomerDebtRealm from '../../database/customer_debt/customer_debt.operations';
import CustomerDebtApi from '../api/customer-debt.api';
import * as _ from 'lodash';
let settings = SettingRealm.getAllSetting();
class CustomerDebtsSync {

    synchronizeCustomerDebts(lastCustomerDebtsSync) {
        return new Promise(resolve => {
            CustomerDebtApi.getCustomerDebts(settings.siteId,new Date(lastCustomerDebtsSync))
                .then(result => {
                    let initlocalCustomerDebts = CustomerDebtRealm.getCustomerDebts();
                    let localCustomerDebts = [...initlocalCustomerDebts];
                    let remoteCustomerDebts = [...result];

                    if (initlocalCustomerDebts.length === 0) {
                        CustomerDebtRealm.createManyCustomerDebt(result, null);
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalCustomerDebts.length > 0) {

                        console.log('initlocalCustomerDebts', initlocalCustomerDebts);
                        console.log('localCustomerDebts', localCustomerDebts);
                        console.log('remoteCustomerDebts', remoteCustomerDebts);
                        initlocalCustomerDebts.forEach(localCustomerDebt => {
                            let filteredObj = remoteCustomerDebts.filter(obj => obj.receipt_payment_type_id === localCustomerDebt.receipt_payment_type_id)
                            console.log('filteredObj', filteredObj);
                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteCustomerDebts.map(function (e) { return e.receipt_payment_type_id }).indexOf(filteredObj[0].receipt_payment_type_id);
                                const localIndex = localCustomerDebts.map(function (e) { return e.receipt_payment_type_id }).indexOf(filteredObj[0].receipt_payment_type_id);
                                console.log('remoteIndex', remoteIndex);
                                console.log('localIndex', localIndex);
                                remoteCustomerDebts.splice(remoteIndex, 1);
                                localCustomerDebts.splice(localIndex, 1);

                                inLocal.push(localCustomerDebt);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localCustomerDebt);
                                const localIndex = localCustomerDebts.map(function (e) { return e.receipt_payment_type_id }).indexOf(localCustomerDebt.receipt_payment_type_id);
                                console.log('localIndex', localIndex);
                                localCustomerDebts.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteCustomerDebts);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            CustomerDebtRealm.createCustomerDebt(onlyRemote,null)
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localCustomerDebt => {
                                CustomerDebtApi.createCustomerDebt(
                                    {...localCustomerDebt, kiosk_id: settings.siteId }
                                )
                                    .then((response) => {
                                        CustomerDebtRealm.synched(localCustomerDebt);
                                        console.log(
                                            'Synchronization:synced to remote - ' +
                                            response
                                        );
                                    })
                                    .catch(error => {
                                        console.log(
                                            'Synchronization:synchronizeInventory Create Inventory failed'
                                        );
                                    });
                            })
                        }

                        if (inLocal.length > 0 && inRemote.length > 0) {
                            inLocal.forEach(localCustomerDebt => {

                                if (localCustomerDebt.active === true && localCustomerDebt.syncAction === 'delete') {
                                    CustomerDebtApi.deleteCustomerDebt(
                                        localCustomerDebt
                                    )
                                        .then((response) => {
                                            console.log(
                                                'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                                                response
                                            );
                                            CustomerDebtRealm.hardDeleteCustomerDebt(
                                                localCustomerDebt
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeInventory Delete Inventory failed ' +
                                                error
                                            );
                                        });
                                }

                                if (localCustomerDebt.active === true && localCustomerDebt.syncAction === 'update') {
                                    CustomerDebtApi.updateCustomerDebt(
                                        localCustomerDebt
                                    )
                                        .then((response) => {
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

                                } else if (localCustomerDebt.active === false && localCustomerDebt.syncAction === 'update') {
                                    CustomerDebtApi.createCustomerDebt(
                                        localCustomerDebt
                                    )
                                        .then((response) => {
                                            CustomerDebtRealm.synched(localCustomerDebt);
                                            console.log(
                                                'Synchronization:synced to remote - ' +
                                                response
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeInventory Create Inventory failed'
                                            );
                                        });
                                }
                            })
                        }

                        console.log('onlyRemote', onlyRemote);
                        console.log('onlyLocally', onlyLocally);
                        console.log('bothLocalRemote', bothLocalRemote);

                        console.log('localCustomerDebts2', localCustomerDebts);
                        console.log('remoteCustomerDebts2', remoteCustomerDebts);

                    }
                    resolve({
                        error: null,
                        localCustomerDebt: onlyLocally.length,
                        result: onlyRemote.length
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getInventory - error ' + error
                    );
                    resolve({
                        error: error,
                        localCustomerDebt: 0,
                        result: 0
                    });
                });
        });
    }

}
export default new CustomerDebtsSync();
