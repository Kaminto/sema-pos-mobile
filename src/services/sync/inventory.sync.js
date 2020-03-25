import InventroyRealm from '../../database/inventory/inventory.operations';
import InventoryApi from '../api/inventory.api';
import * as _ from 'lodash';

class InventorySync {

    synchronizeInventory(kiosk_id) {
        return new Promise(resolve => {
            InventoryApi.getInventories(kiosk_id, InventroyRealm.getLastInventorySync())
                .then(remoteInventory => {
                    let initlocalInventories = InventroyRealm.getAllInventoryByDate(InventroyRealm.getLastInventorySync());
                    let localInventories = [...initlocalInventories];
                    let remoteInventories = [...remoteInventory.closingStock];

                    console.log('initlocalInventories', initlocalInventories);

                    if (initlocalInventories.length === 0 && remoteInventories.length > 0) {
                        InventroyRealm.createManyInventories(remoteInventories);
                        InventroyRealm.setLastInventorySync();
                    }


                  

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalInventories.length > 0) {

                        initlocalInventories.forEach(localInventory => {
                            let filteredObj = remoteInventories.filter(obj => obj.closingStockId === localInventory.closingStockId)

                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteInventories.map(function (e) { return e.closingStockId }).indexOf(filteredObj[0].closingStockId);
                                const localIndex = localInventories.map(function (e) { return e.closingStockId }).indexOf(filteredObj[0].closingStockId);

                                remoteInventories.splice(remoteIndex, 1);
                                localInventories.splice(localIndex, 1);

                                inLocal.push(localInventory);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localInventory);
                                const localIndex = localInventories.map(function (e) { return e.closingStockId }).indexOf(localInventory.closingStockId);

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
                                this.apiSyncOperations(localInventory);
                            });
                        }

                        if (inLocal.length > 0 && inRemote.length > 0) {
                            inLocal.forEach(localInventory => {
                                this.apiSyncOperations(localInventory);
                            });
                        }

                    }
                    resolve({
                        success: true,
                        wastageReport: onlyLocally.length + onlyRemote.length + inLocal.length
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getInventory - error ' + error
                    );
                    resolve({
						error: false,
                        wastageReport: 0,
					});
                });
        });
    }

    apiSyncOperations(localInventory) {
        if (localInventory.active === true && localInventory.syncAction === 'delete') {
            InventoryApi.deleteInventory(
                localInventory
            )
                .then((response) => {
                    console.log(
                        'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                        response
                    );
                    InventroyRealm.setLastInventorySync();
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
                    InventroyRealm.setLastInventorySync();
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

        }

        if (localInventory.active === false && localInventory.syncAction === 'update') {

            InventoryApi.createInventory(
                localInventory
            )
                .then((response) => {
                    InventroyRealm.synched(localInventory);
                    InventroyRealm.setLastInventorySync();
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

        if (localInventory.active === false && localInventory.syncAction === 'delete') {
            InventoryApi.createInventory(
                localInventory
            )
                .then((response) => {
                    InventroyRealm.synched(localInventory);
                    InventroyRealm.setLastInventorySync();
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
console.log('here1');
        if (localInventory.active === false && localInventory.syncAction === 'create') {
            console.log('here31');
            InventoryApi.createInventory(
                localInventory
            )
                .then((response) => {
                    InventroyRealm.synched(localInventory);
                    InventroyRealm.setLastInventorySync();
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
    }

}
export default new InventorySync();
