import CustomerDebtRealm from '../../database/customer_debt/customer_debt.operations';
import CustomerDebtApi from '../api/customer-debt.api';
import SettingRealm from '../../database/settings/settings.operations';
import * as _ from 'lodash';
let settings = SettingRealm.getAllSetting();
class CustomerDebtsSync {

    synchronizeCustomerDebts() {
        return new Promise(resolve => {
            CustomerDebtApi.getCustomerDebts(settings.siteId, CustomerDebtRealm.getLastCustomerDebtSync())
                .then(result => {
                    let initlocalCustomerDebts = CustomerDebtRealm.getCustomerDebtsByDate(CustomerDebtRealm.getLastCustomerDebtSync());
                    let localCustomerDebts = [...initlocalCustomerDebts];
                    let remoteCustomerDebts = [...result];
                    if (initlocalCustomerDebts.length === 0) {
                        CustomerDebtRealm.createManyCustomerDebt(result, null);
                        CustomerDebtRealm.setLastCustomerDebtSync();
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalCustomerDebts.length > 0) {
                        initlocalCustomerDebts.forEach(localCustomerDebt => {
                            let filteredObj = remoteCustomerDebts.filter(obj => obj.receipt_payment_type_id === localCustomerDebt.receipt_payment_type_id)

                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteCustomerDebts.map(function (e) { return e.receipt_payment_type_id }).indexOf(filteredObj[0].receipt_payment_type_id);
                                const localIndex = localCustomerDebts.map(function (e) { return e.receipt_payment_type_id }).indexOf(filteredObj[0].receipt_payment_type_id);

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
                            CustomerDebtRealm.createManyCustomerDebt(onlyRemote, null);
                            CustomerDebtRealm.setLastCustomerDebtSync();
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localCustomerDebt => {
                                this.apiSyncOperations({ ...localCustomerDebt, kiosk_id: settings.siteId });
                            })
                        }

                        if (inLocal.length > 0 && inRemote.length > 0) {
                            inLocal.forEach(localCustomerDebt => {

                                this.apiSyncOperations({ ...localCustomerDebt, kiosk_id: settings.siteId });

                            })
                        }

                    }
                    resolve({
                        success: true,
                        debt: onlyLocally.length + onlyRemote.length + inLocal.length,
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getDebt - error ' + error
                    );
                    resolve({
                        error: true,
                        debt: 0
                    });
                });
        });
    }


    apiSyncOperations(localCustomerDebt) {
        if (localCustomerDebt.active === true && localCustomerDebt.syncAction === 'delete') {
            CustomerDebtApi.deleteCustomerDebt(
                localCustomerDebt
            )
                .then((response) => {
                    console.log(
                        'Synchronization:synchronizeOrder - Removing order from pending list - ' +
                        response
                    );
                    CustomerDebtRealm.setLastCustomerDebtSync();
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeOrder Delete Order failed ' +
                        error
                    );
                });
        }

        if (localCustomerDebt.active === true && localCustomerDebt.syncAction === 'update') {
            CustomerDebtApi.updateCustomerDebt(
                localCustomerDebt
            )
                .then((response) => {
                    // updateCount = updateCount + 1;
                    CustomerDebtRealm.setLastCustomerDebtSync();
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

        }

        if (localCustomerDebt.active === false && localCustomerDebt.syncAction === 'update') {
            CustomerDebtApi.createCustomerDebt(
                localCustomerDebt
            )
                .then((response) => {
                    // updateCount = updateCount + 1;
                    CustomerDebtRealm.synched(localCustomerDebt);
                    CustomerDebtRealm.setLastCustomerDebtSync();
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

        if (localCustomerDebt.active === false && localCustomerDebt.syncAction === 'delete') {
            CustomerDebtApi.createCustomerDebt(
                localCustomerDebt
            )
                .then((response) => {
                    //  updateCount = updateCount + 1;
                    CustomerDebtRealm.synched(localCustomerDebt);
                    CustomerDebtRealm.setLastCustomerDebtSync();
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

        if (localCustomerDebt.active === false && localCustomerDebt.syncAction === 'create') {
            CustomerDebtApi.createCustomerDebt(
                localCustomerDebt
            )
                .then((response) => {
                    //  updateCount = updateCount + 1;
                    CustomerDebtRealm.synched(localCustomerDebt);
                    CustomerDebtRealm.setLastCustomerDebtSync();
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
export default new CustomerDebtsSync();
