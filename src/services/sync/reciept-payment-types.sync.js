import ReceiptPaymentTypeRealm from '../../database/reciept_payment_types/reciept_payment_types.operations';
import RecieptPaymentTypesApi from '../api/reciept-payment-types.api';
import * as _ from 'lodash';

class RecieptPaymentTypesSync {

    synchronizeRecieptPaymentTypes(kiosk_id) {
        return new Promise(resolve => {
            RecieptPaymentTypesApi.getReceiptPaymentTypes(kiosk_id, ReceiptPaymentTypeRealm.getLastReceiptPaymentTypeSync())
                .then(result => {
                    let initlocalRecieptPaymentTypes = ReceiptPaymentTypeRealm.getReceiptPaymentTypesByDate(ReceiptPaymentTypeRealm.getLastReceiptPaymentTypeSync());
                    let localRecieptPaymentTypes = [...initlocalRecieptPaymentTypes];
                    let remoteRecieptPaymentTypes = [...result];

                    console.log('localRecieptPaymentTypes', localRecieptPaymentTypes);
                    console.log('remoteRecieptPaymentTypes', remoteRecieptPaymentTypes);

                    // if (initlocalRecieptPaymentTypes.length === 0) {
                    //     ReceiptPaymentTypeRealm.createManyReceiptPaymentType(result, null);
                    //     ReceiptPaymentTypeRealm.setReceiptPaymentTypeSync();
                    // }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalRecieptPaymentTypes.length > 0) {

                        console.log('initlocalRecieptPaymentTypes', initlocalRecieptPaymentTypes);
                        console.log('localRecieptPaymentTypes', localRecieptPaymentTypes);
                        console.log('remoteRecieptPaymentTypes', remoteRecieptPaymentTypes);
                        initlocalRecieptPaymentTypes.forEach(localRecieptPaymentType => {
                            let filteredObj = remoteRecieptPaymentTypes.filter(obj => obj.receipt_payment_type_id === localRecieptPaymentType.receipt_payment_type_id)
                            console.log('filteredObj', filteredObj);
                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteRecieptPaymentTypes.map(function (e) { return e.receipt_payment_type_id }).indexOf(filteredObj[0].receipt_payment_type_id);
                                const localIndex = localRecieptPaymentTypes.map(function (e) { return e.receipt_payment_type_id }).indexOf(filteredObj[0].receipt_payment_type_id);
                                console.log('remoteIndex', remoteIndex);
                                console.log('localIndex', localIndex);
                                remoteRecieptPaymentTypes.splice(remoteIndex, 1);
                                localRecieptPaymentTypes.splice(localIndex, 1);

                                inLocal.push(localRecieptPaymentType);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localRecieptPaymentType);
                                const localIndex = localRecieptPaymentTypes.map(function (e) { return e.receipt_payment_type_id }).indexOf(localRecieptPaymentType.receipt_payment_type_id);
                                console.log('localIndex', localIndex);
                                localRecieptPaymentTypes.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteRecieptPaymentTypes);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            ReceiptPaymentTypeRealm.createManyReceiptPaymentType(onlyRemote,null)
                            ReceiptPaymentTypeRealm.setReceiptPaymentTypeSync();
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localRecieptPaymentType => {
                              
                                    this.apiSyncOperations({
                                        ...localRecieptPaymentType,
                                        kiosk_id
                                    });
                            })
                        }

                        if (inLocal.length > 0 && inRemote.length > 0) {
                            inLocal.forEach(localRecieptPaymentType => {
                                this.apiSyncOperations({
                                    ...localRecieptPaymentType,
                                    kiosk_id
                                });
                              
                            })
                        }

                        console.log('onlyRemote', onlyRemote);
                        console.log('onlyLocally', onlyLocally);
                        console.log('bothLocalRemote', bothLocalRemote);

                        console.log('localRecieptPaymentTypes2', localRecieptPaymentTypes);
                        console.log('remoteRecieptPaymentTypes2', remoteRecieptPaymentTypes);

                    }
                    resolve({
                        error: null,
                        localRecieptPaymentType: onlyLocally.length,
                        result: onlyRemote.length
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getInventory - error ' + error
                    );
                    resolve({
                        error: error,
                        localRecieptPaymentType: 0,
                        result: 0
                    });
                });
        });
    }

    apiSyncOperations(localRecieptPaymentType) {
        if (localRecieptPaymentType.active === true && localRecieptPaymentType.syncAction === 'delete') {
            RecieptPaymentTypesApi.deleteReceiptPaymentType(
                localRecieptPaymentType
            )
                .then((response) => {
                    console.log(
                        'Synchronization:synchronizeOrder - Removing order from pending list - ' +
                        response
                    ); 
                    ReceiptPaymentTypeRealm.setReceiptPaymentTypeSync();                 
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeOrder Delete Order failed ' +
                        error
                    );
                });
        }

        if (localRecieptPaymentType.active === true && localRecieptPaymentType.syncAction === 'update') {
            RecieptPaymentTypesApi.updateReceiptPaymentType(
                localRecieptPaymentType
            )
                .then((response) => {
                  // updateCount = updateCount + 1;
                  ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();
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

        if (localRecieptPaymentType.active === false && localRecieptPaymentType.syncAction === 'update') {
            RecieptPaymentTypesApi.createReceiptPaymentType(
                localRecieptPaymentType
            )
                .then((response) => {
                   // updateCount = updateCount + 1;
                   ReceiptPaymentTypeRealm.synched(localRecieptPaymentType);
                   ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();
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

        if (localRecieptPaymentType.active === false && localRecieptPaymentType.syncAction === 'delete') {
            RecieptPaymentTypesApi.createReceiptPaymentType(
                localRecieptPaymentType
            )
                .then((response) => {
                  //  updateCount = updateCount + 1;
                  ReceiptPaymentTypeRealm.synched(localRecieptPaymentType);
                  ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();
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

        if (localRecieptPaymentType.active === false && localRecieptPaymentType.syncAction === 'create') {
            RecieptPaymentTypesApi.createReceiptPaymentType(
                localRecieptPaymentType
            )
                .then((response) => {
                  //  updateCount = updateCount + 1;
                  ReceiptPaymentTypeRealm.synched(localRecieptPaymentType);
                    ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();
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
export default new RecieptPaymentTypesSync();