import InventroyRealm from '../../database/inventory/inventory.operations';
import InventoryApi from '../api/inventory.api';
import * as _ from 'lodash';

class InventorySync {

    synchronizeInventory(lastInventorySync) {
        return new Promise(resolve => {
            InventoryApi.getInventories(new Date(lastInventorySync))
                .then(remoteInventory => {
                    let initlocalInventories = InventroyRealm.getAllInventory();
                    let localInventories = [...initlocalInventories];
                    let remoteInventories = [...remoteInventory.closingStock];

                    if (initlocalInventories.length === 0) {
                        InventroyRealm.createManyInventories(remoteInventory.closingStock);
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalInventories.length > 0) {

                        console.log('initlocalInventories', initlocalInventories);
                        console.log('localInventories', localInventories);
                        console.log('remoteInventories', remoteInventories);
                        initlocalInventories.forEach(localInventory => {
                            let filteredObj = remoteInventories.filter(obj => obj.closingStockId === localInventory.closingStockId)
                            console.log('filteredObj', filteredObj);
                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteInventories.map(function (e) { return e.closingStockId }).indexOf(filteredObj[0].closingStockId);
                                const localIndex = localInventories.map(function (e) { return e.closingStockId }).indexOf(filteredObj[0].closingStockId);
                                console.log('remoteIndex', remoteIndex);
                                console.log('localIndex', localIndex);
                                remoteInventories.splice(remoteIndex, 1);
                                localInventories.splice(localIndex, 1);

                                inLocal.push(localInventory);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localInventory);
                                const localIndex = localInventories.map(function (e) { return e.closingStockId }).indexOf(localInventory.closingStockId);
                                console.log('localIndex', localIndex);
                                localInventories.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteInventories);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            InventroyRealm.createManyInventories(onlyRemote)
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localInventory => {
                                InventoryApi.createInventory(
                                    localInventory
                                )
                                    .then((response) => {
                                        InventroyRealm.synched(localInventory);
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
                            inLocal.forEach(localInventory => {

                                if (localInventory.active === true && localInventory.syncAction === 'delete') {
                                    InventoryApi.deleteInventory(
                                        localInventory
                                    )
                                        .then((response) => {
                                            console.log(
                                                'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                                                response
                                            );
                                            InventroyRealm.hardDeleteInventory(
                                                localInventory
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeInventory Delete Inventory failed ' +
                                                error
                                            );
                                        });
                                }

                                if (localInventory.active === true && localInventory.syncAction === 'update') {
                                    InventoryApi.updateInventory(
                                        localInventory
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

                                } else if (localInventory.active === false && localInventory.syncAction === 'update') {
                                    InventoryApi.createInventory(
                                        localInventory
                                    )
                                        .then((response) => {
                                            InventroyRealm.synched(localInventory);
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

                        console.log('localInventories2', localInventories);
                        console.log('remoteInventories2', remoteInventories);

                    }
                    resolve({
                        error: null,
                        localInventory: onlyLocally.length,
                        remoteInventory: onlyRemote.length
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getInventory - error ' + error
                    );
                    resolve({
                        error: error,
                        localInventory: 0,
                        remoteInventory: 0
                    });
                });
        });
    }

}
export default new InventorySync();