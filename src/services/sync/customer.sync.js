import CustomerRealm from '../../database/customers/customer.operations';
import CustomerApi from '../api/customer.api';
import * as _ from 'lodash';

class CustomerSync {

    synchronizeCustomers(lastCustomerSync) {
        return new Promise(resolve => {
            CustomerApi.getCustomers(lastCustomerSync)
                .then(remoteCustomer => {
                    let initlocalCustomers = CustomerRealm.getAllCustomer();
                    let localCustomers = [...initlocalCustomers];
                    let remoteCustomers = [...remoteCustomer.customers];
                    console.log('remoteCustomer', remoteCustomer);
                    if (initlocalCustomers.length === 0) {
                        CustomerRealm.createManyCustomers(remoteCustomer.customers);
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};
                    let updateCount = 0;
                    if (initlocalCustomers.length > 0) {

                       
                        initlocalCustomers.forEach(localCustomer => {
                            let filteredObj = remoteCustomers.filter(obj => obj.customerId === localCustomer.customerId)
                           
                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteCustomers.map(function (e) { return e.customerId }).indexOf(filteredObj[0].customerId);
                                const localIndex = localCustomers.map(function (e) { return e.customerId }).indexOf(filteredObj[0].customerId);
                                
                                remoteCustomers.splice(remoteIndex, 1);
                                localCustomers.splice(localIndex, 1);

                                inLocal.push(localCustomer);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localCustomer);
                                const localIndex = localCustomers.map(function (e) { return e.customerId }).indexOf(localCustomer.customerId);
                               
                                localCustomers.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteCustomers);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            CustomerRealm.createManyCustomers(onlyRemote)
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localCustomer => {
                                console.log(
                                    'localCustomer - ',
                                    localCustomer
                                );
                                CustomerApi.createCustomer(
                                    localCustomer
                                )
                                    .then((response) => {
                                        CustomerRealm.synched(localCustomer);
                                        console.log(
                                            'Synchronization:synced to remote - ' ,
                                            response
                                        );
                                    })
                                    .catch(error => {
                                        console.log(
                                            'Synchronization:synchronizeInventory Create Inventory failed',error
                                        );
                                    });
                            })
                        }

                        
                        if (inLocal.length > 0 && inRemote.length > 0) {
                            
                            inLocal.forEach(localCustomer => {                                
                                if (localCustomer.active === true && localCustomer.syncAction === 'delete') {
                                    CustomerApi.deleteCustomer(
                                        localCustomer
                                    )
                                        .then((response) => {
                                            console.log(
                                                'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                                                response
                                            );
                                            updateCount = updateCount + 1;
                                            CustomerRealm.hardDeleteCustomer(
                                                localCustomer
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeInventory Delete Inventory failed ' +
                                                error
                                            );
                                        });
                                }

                                if (localCustomer.active === true && localCustomer.syncAction === 'update') {
                                    CustomerApi.updateCustomer(
                                        localCustomer
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

                                } else if (localCustomer.active === false && localCustomer.syncAction === 'update') {
                                    CustomerApi.createCustomer(
                                        localCustomer
                                    )
                                        .then((response) => {
                                            updateCount = updateCount + 1;
                                            CustomerRealm.synched(localCustomer);
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

                        console.log('localCustomers2', localCustomers);
                        console.log('remoteCustomers2', remoteCustomers);

                    }
                    resolve({
                        error: null,
                        updatedCustomers: onlyLocally.length + onlyRemote.length + updateCount
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getInventory - error ' + error
                    );
                    resolve({
						error: error.message,
                        updatedCustomers: 0,
					});
                });
        });
    }

}
export default new CustomerSync();