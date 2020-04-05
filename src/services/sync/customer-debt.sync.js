import CustomerDebtRealm from '../../database/customer_debt/customer_debt.operations';
import CustomerDebtApi from '../api/customer-debt.api';
import SettingRealm from '../../database/settings/settings.operations';
import SyncUtils from './syncUtils';
import * as _ from 'lodash';
let settings = SettingRealm.getAllSetting();
class CustomerDebtsSync {

    synchronizeCustomerDebts() {
        return new Promise(resolve => {
            CustomerDebtApi.getCustomerDebts(settings.siteId, CustomerDebtRealm.getLastCustomerDebtSync())
                .then(async result => {
                    let initlocalCustomerDebts = CustomerDebtRealm.getCustomerDebtsByDate(CustomerDebtRealm.getLastCustomerDebtSync());
                    
                    let localCustomerDebts = initlocalCustomerDebts.length > 0 ? [...initlocalCustomerDebts] : [];
                    let remoteCustomerDebts = result.length > 0 ? [...result] : [];


                    let onlyInLocal = localCustomerDebts.filter(SyncUtils.compareRemoteAndLocal(remoteCustomerDebts, 'customer_debt_id'));
                    let onlyInRemote = remoteCustomerDebts.filter(SyncUtils.compareRemoteAndLocal(localCustomerDebts, 'customer_debt_id'));

                    let syncResponseArray = [];

                    if (onlyInRemote.length > 0) {
                        let localResponse = await CustomerDebtRealm.syncManyCustomerDebt(onlyInRemote);
                        syncResponseArray.push(...localResponse);
                        CustomerDebtRealm.setLastCustomerDebtSync();
                    }


                    if (onlyInLocal.length > 0) {

                        for (const property in onlyInLocal) {
                            let syncResponse = await this.apiSyncOperations({ ...onlyInLocal[property], kiosk_id: settings.siteId });
                            syncResponseArray.push(syncResponse);
                        }

                    }

                    resolve({
                        success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                        debt: onlyInLocal.concat(onlyInRemote).length,
                        successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                        successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success'
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

        return new Promise(resolve => {
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
                        resolve({ status: 'success', message: 'synched', data: localCustomerDebt });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeOrder Delete Order failed ' +
                            error
                        );
                        resolve({ status: 'fail', message: 'error', data: localCustomerDebt });
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
                        resolve({ status: 'success', message: 'synched', data: localCustomerDebt });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeOrder Update Order failed ' +
                            error
                        );
                        resolve({ status: 'fail', message: 'error', data: localCustomerDebt });
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
                        resolve({ status: 'success', message: 'synched', data: localCustomerDebt });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeOrder Create Order failed', error
                        );
                        resolve({ status: 'fail', message: 'error', data: localCustomerDebt });
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
                        resolve({ status: 'success', message: 'synched', data: localCustomerDebt });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeOrder Create Order failed', error
                        );
                        resolve({ status: 'fail', message: 'error', data: localCustomerDebt });
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
                        resolve({ status: 'success', message: 'synched', data: localCustomerDebt });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeOrder Create Order failed', error
                        );
                        resolve({ status: 'error', message: 'error', data: localCustomerDebt });
                    });
            }

        })

    }

}
export default new CustomerDebtsSync();
