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
                        ReceiptPaymentTypeRealm.setReceiptPaymentTypeSync();
                    }

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
                                RecieptPaymentTypesApi.createReceiptPaymentType(
                                    {
                                        ...localRecieptPaymentType,
                                        kiosk_id
                                    }
                                )
                                    .then((response) => {
                                        ReceiptPaymentTypeRealm.synched(localRecieptPaymentType);
                                        ReceiptPaymentTypeRealm.setReceiptPaymentTypeSync();
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
                            inLocal.forEach(localRecieptPaymentType => {

                                if (localRecieptPaymentType.active === true && localRecieptPaymentType.syncAction === 'delete') {
                                    RecieptPaymentTypesApi.deleteReceiptPaymentType(
                                        localRecieptPaymentType
                                    )
                                        .then((response) => {
                                            console.log(
                                                'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                                                response
                                            );
                                            ReceiptPaymentTypeRealm.hardDeleteCredit(
                                                localRecieptPaymentType
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeInventory Delete Inventory failed ' +
                                                error
                                            );
                                        });
                                }

                                if (localRecieptPaymentType.active === true && localRecieptPaymentType.syncAction === 'update') {
                                    RecieptPaymentTypesApi.updateReceiptPaymentType(
                                        localRecieptPaymentType
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

                                } else if (localRecieptPaymentType.active === false && localRecieptPaymentType.syncAction === 'update') {
                                    RecieptPaymentTypesApi.createReceiptPaymentType(
                                        localRecieptPaymentType
                                    )
                                        .then((response) => {
                                            ReceiptPaymentTypeRealm.synched(localRecieptPaymentType);
                                            ReceiptPaymentTypeRealm.setReceiptPaymentTypeSync();
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

}
export default new RecieptPaymentTypesSync();