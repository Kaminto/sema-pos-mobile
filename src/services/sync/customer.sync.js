import CustomerRealm from '../../database/customers/customer.operations';
import CustomerApi from '../api/customer.api';
import * as _ from 'lodash';
import SyncUtils from '../../services/sync/syncUtils';
class CustomerSync {

    synchronizeCustomers(siteId) {
        return new Promise(resolve => {
            CustomerApi.getCustomers(CustomerRealm.getLastCustomerSync())
                .then(async remoteCustomer => {
                    let initlocalCustomers = CustomerRealm.getCustomerBycreated_at(CustomerRealm.getLastCustomerSync());
                   
                    let localCustomers = initlocalCustomers.length > 0 ? [...initlocalCustomers] : [];
                    let remoteCustomers = remoteCustomer.customers.length > 0 ? [...remoteCustomer.customers] : [];


                    let onlyInLocal = localCustomers.filter(SyncUtils.compareRemoteAndLocal(remoteCustomers, 'customerId'));
                    let onlyInRemote = remoteCustomers.filter(SyncUtils.compareRemoteAndLocal(localCustomers, 'customerId'));

                    let syncResponseArray = [];

                    if (onlyInRemote.length > 0) {
                        let localResponse = await CustomerRealm.createManyCustomers(onlyInRemote);
                        syncResponseArray.push(...localResponse);
                        CustomerRealm.setLastCustomerSync();
                    }


                    if (onlyInLocal.length > 0) {

                        for (const property in onlyInLocal) {
                            let syncResponse = await this.apiSyncOperations({ ...onlyInLocal[property], kiosk_id: siteId });
                            syncResponseArray.push(syncResponse);
                        }

                    }

                    resolve({
                        success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                        customers: onlyInLocal.concat(onlyInRemote).length,
                        successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                        successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success'
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getCustomers - error ' + error
                    );
                    resolve({
                        error: false,
                        customers: 0,
                    });
                });
        });
    }

    apiSyncOperations(localCustomer) {

        return new Promise(resolve => {
            if (localCustomer.active === true && localCustomer.syncAction === 'delete') {
                CustomerApi.deleteCustomer(
                    localCustomer
                )
                    .then((response) => {
                        console.log(
                            'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                            response
                        );
                        CustomerRealm.synched(localCustomer);
                        CustomerRealm.setLastCustomerSync();
                        // updateCount = updateCount + 1;
                        resolve({ status: 'success', message: 'synched', data: localCustomer });

                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeInventory Delete Inventory failed ' +
                            error
                        );
                        resolve({ status: 'fail', message: 'error', data: localCustomer });
                    });
            }

            if (localCustomer.active === true && localCustomer.syncAction === 'update') {
                CustomerApi.updateCustomer(
                    localCustomer
                )
                    .then((response) => {
                        // updateCount = updateCount + 1;
                        console.log(
                            'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                            response
                        );
                        CustomerRealm.synched(localCustomer);
                        CustomerRealm.setLastCustomerSync();
                        resolve({ status: 'success', message: 'synched', data: localCustomer });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeInventory Update Inventory failed ' +
                            error
                        );
                        resolve({ status: 'fail', message: 'synched', data: localCustomer });
                    });

            }

            if (localCustomer.active === false && localCustomer.syncAction === 'update') {
                CustomerApi.createCustomer(
                    localCustomer
                )
                    .then((response) => {
                        // updateCount = updateCount + 1;
                        CustomerRealm.synched(localCustomer);
                        CustomerRealm.setLastCustomerSync();
                        console.log(
                            'Synchronization:synced to remote - ' +
                            response
                        );
                        resolve({ status: 'success', message: 'synched', data: localCustomer });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeInventory Create Inventory failed', error
                        );
                        resolve({ status: 'fail', message: 'error', data: localCustomer });
                    });
            }

            if (localCustomer.active === false && localCustomer.syncAction === 'delete') {
                CustomerApi.createCustomer(
                    localCustomer
                )
                    .then((response) => {
                        // updateCount = updateCount + 1;
                        CustomerRealm.synched(localCustomer);
                        CustomerRealm.setLastCustomerSync();
                        console.log(
                            'Synchronization:synced to remote - ' +
                            response
                        );
                        resolve({ status: 'success', message: 'synched', data: localCustomer });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeInventory Create Inventory failed', error
                        );
                        resolve({ status: 'fail', message: 'error', data: localCustomer });
                    });
            }

            if (localCustomer.active === false && localCustomer.syncAction === 'create') {
                CustomerApi.createCustomer(
                    localCustomer
                )
                    .then((response) => {
                        // updateCount = updateCount + 1;
                        CustomerRealm.synched(localCustomer);
                        CustomerRealm.setLastCustomerSync();
                        console.log(
                            'Synchronization:synced to remote - ' +
                            response
                        );
                        resolve({ status: 'success', message: 'synched', data: localCustomer });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeInventory Create Inventory failed', error
                        );
                        resolve({ status: 'fail', message: 'error', data: localCustomer });
                    });
            }


        });
    }


}
export default new CustomerSync();
