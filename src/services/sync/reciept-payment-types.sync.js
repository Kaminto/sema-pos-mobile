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

                  
                    if (initlocalRecieptPaymentTypes.length === 0) {
                        ReceiptPaymentTypeRealm.createManyReceiptPaymentType(result, null);
                        ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalRecieptPaymentTypes.length > 0) {
                        initlocalRecieptPaymentTypes.forEach(localRecieptPaymentType => {
                            let filteredObj = remoteRecieptPaymentTypes.filter(obj => obj.receipt_payment_type_id === localRecieptPaymentType.receipt_payment_type_id)
                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteRecieptPaymentTypes.map(function (e) { return e.receipt_payment_type_id }).indexOf(filteredObj[0].receipt_payment_type_id);
                                const localIndex = localRecieptPaymentTypes.map(function (e) { return e.receipt_payment_type_id }).indexOf(filteredObj[0].receipt_payment_type_id);

                                remoteRecieptPaymentTypes.splice(remoteIndex, 1);
                                localRecieptPaymentTypes.splice(localIndex, 1);

                                inLocal.push(localRecieptPaymentType);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localRecieptPaymentType);
                                const localIndex = localRecieptPaymentTypes.map(function (e) { return e.receipt_payment_type_id }).indexOf(localRecieptPaymentType.receipt_payment_type_id);

                                localRecieptPaymentTypes.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteRecieptPaymentTypes);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            ReceiptPaymentTypeRealm.createManyReceiptPaymentType(onlyRemote, null)
                            ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();
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


                    }
                    resolve({
                        success: true,
                        recieptPayments: onlyLocally.length + onlyRemote.length + inLocal.length
                    });


                })
                .catch(error => {
                    console.log(
                        'Synchronization.getReceiptpaymenttypes - error ' + error
                    );
                    resolve({
						error: false,
                        recieptPayments: 0,
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
                    ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();
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
