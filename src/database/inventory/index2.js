import realm from '../init';
const uuidv1 = require('uuid/v1');

const inventoryKey = '@Sema:InventoryKey';
const inventoryItemKey = '@Sema:InventoryItemKey';
const lastInventorySyncKey = '@Sema:LastInventorySyncKey';
const pendingInventoryKey = '@Sema:PendingInventoryKey';

class InventroyRealm {
    constructor() {
        // Inventory are saved in the form inventoryItemKey + Inventory.id
        // For example "@Sema:InventoryItemKey_ea6c365a-7338-11e8-a3c9-ac87a31a5361"
        // Array of inventory keys
        this.inventoryKeys = [];
        this.inventory = []; // De-referenced inventory
        // Last sync DateTime is the last date time that items were synchronized with the server
        let firstSyncDate = new Date('November 7, 1973');
        this.lastInventorySync = firstSyncDate;

        // Pending inventory is the array of inventory, stored locally but not yet sent to the server
        this.pendingInventory = [];
        this.pendingInventoryKeys = [];
    }

    initialiseTable() {
        let keyArray = [
            [
                inventoryKey,
                this.stringify(this.inventoryKeys)],
            [
                lastInventorySyncKey,
                this.lastInventorySync.toISOString()
            ],
            [
                pendingInventoryKey,
                this.stringify(this.pendingInventoryKeys)
            ],
        ]
        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected : ' + rows);
                return true;
            })
            .catch(error => {
                console.log(error);
                return false;
            });
        return 'Table Initialised';
    }

    loadTableData() {
        let keyArray = [
            inventoryKey,
            pendingInventoryKey,
            lastInventorySyncKey,
        ];

        let results = this.getMany(keyArray);
        console.log('results-results-results', results)
        this.inventoryKeys = this.parseJson(
            results[0][1]
        );
        console.log('results[0][1]-results[0][1]-results[0][1]', results[0][1])
        this.pendingInventoryKeys = this.parseJson(
            results[1][1]
        ); // Array of pending inventory
        this.lastInventorySync = results[2] ? new Date(results[2][1]) : this.lastInventorySync.toISOString() // Last inventory sync time
        console.log(results);
        this.loadInventoryFromKeys();
        this.loadInventoryFromKeys2();
        return 'Table Data Exists';
    }

    getLastInventorySync() {
        return this.lastInventorySync;
    }

    clearDataOnly() {
        this.inventory = [];
        this.inventoryKeys = [];
        this.pendingInventory = [];
        this.pendingInventoryKeys = [];
        let firstSyncDate = new Date('November 7, 1973');
        this.lastInventorySync = firstSyncDate;
        let keyArray = [
            [inventoryKey, this.stringify(this.inventoryKeys)],
            [lastInventorySyncKey, this.lastInventorySync.toISOString()],
            [pendingInventoryKey, this.stringify(this.pendingInventoryKeys)],
        ]

        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected Rows: ' + rows);
            })
            .catch(error => {
                console.log('InventroyRealm:clearDataOnly: Error: ' + error);
            });
    }

    clearDataBeforeSynch() {
        this.inventory = [];
        this.inventoryKeys = [];
        let firstSyncDate = new Date('November 7, 1973');
        this.lastInventorySync = firstSyncDate;
        this.pendingInventory = [];
        this.pendingInventoryKeys = [];
        let keyArray = [
            [inventoryKey, this.stringify(this.inventoryKeys)],
            [lastInventorySyncKey, this.lastInventorySync.toISOString()],
            [pendingInventoryKey, this.stringify(this.pendingInventoryKeys)],
        ]
        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected rows ' + rows);
            })
            .catch(error => {
                console.log('InventroyRealm:clearDataOnly: Error: ' + error);
            });
    }


    makeInventoryKey(inventory) {
        return inventoryItemKey + '_' + inventory.closingStockId;
    }

    closingStockIdFromKey(inventoryKey) {
        const prefix = inventoryItemKey + '_';
        return inventoryKey.slice(prefix.length);
    }

    formatDay(date) {
        date = new Date(date);
        var day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();
        if (month.toString().length == 1) {
            month = "0" + month;
        }
        if (day.toString().length == 1) {
            day = "0" + day;
        }

        return date = year + '-' + month + '-' + day;
    }


    createInventory(
        kiosk_id,
        product_id,
        quantity,
        filterDate
    ) {

        console.log(this.formatDay(filterDate));
        console.log(this.formatDay(this.getInventory()[0].createdDate) === this.formatDay(filterDate));
        console.log(this.getInventory()[0].product_id);
        console.log(product_id === this.getInventory()[0].product_id);
        console.log(this.formatDay(this.getInventory()[0].createdDate) === this.formatDay(filterDate) && this.getInventory()[0].product_id === product_id)
        console.log(this.getInventory().filter(inventory => this.formatDay(inventory.createdDate) === this.formatDay(filterDate) && inventory.product_id === product_id));

        let existingInventory = this.getInventory().filter(inventory => this.formatDay(inventory.createdDate) === this.formatDay(filterDate) && inventory.product_id === product_id);

        if (existingInventory.length === 0) {
            const now = new Date();
            return this.createInventoryFull(
                kiosk_id,
                product_id,
                quantity,
                now,
                now,
            );
        }

        if (existingInventory.length > 0) {
            return this.updateInventory(
                existingInventory[0],
                existingInventory[0].kiosk_id,
                existingInventory[0].product_id,
                existingInventory[0].quantity,
            )
        }


    }

    createInventoryFull(
        kiosk_id,
        product_id,
        quantity,
        createdDate,
        updatedDate,
    ) {
        const newInventory = {
            closingStockId: uuidv1(),
            kiosk_id,
            product_id,
            quantity,
            createdDate: createdDate,
            updatedDate: updatedDate,
        };

        let key = this.makeInventoryKey(newInventory);
        this.inventory.push(newInventory);
        newInventory.syncAction = 'create';
        this.inventoryKeys.push(key);
        this.pendingInventoryKeys.push(key);
        let keyArray = [
            [inventoryKey, this.stringify(this.inventoryKeys)], // Array of inventory keys
            [key, this.stringify(newInventory)], // The new inventory
            [pendingInventoryKey, this.stringify(this.pendingInventoryKeys)] // Array pending inventory
        ];

        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected rows ' + rows);
            })
            .catch(error => {
                console.log('InventroyRealm:createInventory: Error: ' + error);
            });
        return newInventory;
    }

    // TODO: Only accept the new inventory object
    updateInventory(
        inventory,
        kiosk_id,
        product_id,
        quantity,
    ) {
        let key = this.makeInventoryKey(inventory);
        inventory.kiosk_id = kiosk_id;
        inventory.quantity = quantity;
        inventory.product_id = product_id;
        inventory.updatedDate = new Date();
        inventory.syncAction = 'update';


        this.pendingInventory.push(key);

        let keyArray = [
            [key, this.stringify(inventory)], // Inventory keys
            [pendingInventoryKey, this.stringify(this.pendingInventory)] // Array pending inventory
        ];

        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected rows ' + rows);
            })
            .catch(error => {
                console.log('InventroyRealm:updateInventory: Error: ' + error);
            });
    }

    deleteInventory(inventory) {
        let key = this.makeInventoryKey(inventory);
        let index = this.inventory.indexOf(inventory);
        if (index > -1) {
            let inventory = this.inventory[index];
            inventory.syncAction = 'delete';
            this.inventory.splice(index, 1);
            index = this.inventoryKeys.indexOf(key);
            if (index > -1) {
                this.inventoryKeys.splice(index, 1);
            }
            this.pendingInventory.push(key);
            let keyArray = [
                [inventoryKey, this.stringify(this.inventoryKeys)], // Array of inventory keys
                [key, this.stringify(inventory)], // The inventory being deleted
                [pendingInventoryKey, this.stringify(this.pendingInventory)] // Array pending inventory
            ];

            this.multiSet(keyArray)
                .then(rows => {
                    console.log('Affected rows: ' + rows);
                })
                .catch(error => {
                    console.log('InventroyRealm:deleteInventory: Error: ' + error);
                });
        }
    }

    addRemoteInventory(inventoryArray) {
        console.log(
            'InventroyRealm:addInventory: No existing inventory no need to merge....'
        );
        this.inventory = [];
        let keyValueArray = [];
        let keyArray = [];
        for (let index = 0; index < inventoryArray.length; index++) {
            if (inventoryArray[index].active) {
                keyValueArray.push([
                    this.makeInventoryKey(inventoryArray[index]),
                    this.stringify(inventoryArray[index])
                ]);
                keyArray.push(this.makeInventoryKey(inventoryArray[index]));
                this.inventory.push(inventoryArray[index]);
            }
        }
        this.inventoryKeys = keyArray;
        keyValueArray.push([inventoryKey, this.stringify(keyArray)]);

        this.multiSet(keyValueArray)
            .then(rows => {
                console.log('Affected rows: ' + rows);
            })
            .catch(error => {
                console.log('InventroyRealm:addInventory: Error: ' + error);
            });
    }

    // Merge new inventory into existing ones
    mergeInventory(remoteInventory) {
        console.log(
            'InventroyRealm:mergeInventory Number of remote inventory: ' +
            remoteInventory.length
        );

        console.log(
            'InventroyRealm:mergeInventory Number of local inventory: ',
            this.inventory
        );
        console.log(
            'InventroyRealm:mergeInventory Number of local inventory: ',
            this.pendingInventory
        );
        // this.pendingInventory = this.inventory;
        let newInventoryAdded = remoteInventory.length > 0 ? true : false;
        if (this.inventory.length == 0) {
            this.addRemoteInventory(remoteInventory);
            return {
                pendingInventory: this.pendingInventory.slice(),
                updated: newInventoryAdded
            };
        } else {
            // Need to merge webInventory with existing and pending inventory
            console.log(
                'InventroyRealm:mergeInventory. Merging ' +
                remoteInventory.length +
                ' web Inventory into existing and pending inventory'
            );
            let webInventoryToUpdate = [];
            let isPendingModified = false;
            remoteInventory.forEach(remoteInventory => {
                console.log('remoteInventory', remoteInventory);

                const pendingIndex = this.pendingInventory.map(function (e) { return e.closingStockId }).indexOf(remoteInventory.closingStockId);
                console.log('pendingIndex', pendingIndex);

                if (pendingIndex != -1) {
                    let localInventory = this.getLocalInventory(
                        remoteInventory.closingStockId
                    );
                    if (localInventory) {
                        console.log(
                            'PostStorage - mergeInventory. Local Date ' +
                            new Date(localInventory.updatedDate) +
                            ' Remote Date ' +
                            remoteInventory.updatedDate
                        );
                    }
                    if (
                        localInventory &&
                        remoteInventory.updatedDate >
                        new Date(localInventory.updatedDate)
                    ) {
                        // remoteInventory is the latest
                        console.log(
                            'PostStorage - mergeInventory. Remote inventory ' +
                            remoteInventory.name +
                            ' is later:'
                        );
                        webInventoryToUpdate.push(remoteInventory);
                        this.pendingInventory.splice(pendingIndex, 1);
                        isPendingModified = true;
                    } else {
                        console.log(
                            'PostStorage - mergeInventory. Local inventory ' +
                            localInventory.name +
                            ' is later:'
                        );
                    }
                } else {
                    webInventoryToUpdate.push(remoteInventory);
                }
            });

            if (isPendingModified) {
                this.setKey(
                    pendingInventoryKey,
                    this.stringify(this.pendingInventory)
                );
            }

            console.log('webInventoryToUpdate', webInventoryToUpdate);
            this.mergeRemoteInventory(webInventoryToUpdate);
            return {
                pendingInventory: this.pendingInventory.slice(),
                updated: newInventoryAdded
            };
        }
    }

    mergeRemoteInventory(remoteInventory) {
        let isNewInventory = false;
        remoteInventory.forEach(
            function (inventory) {
                let inventoryKey = this.makeInventoryKey(inventory);
                let keyIndex = this.inventoryKeys.indexOf(inventoryKey);
                if (keyIndex === -1) {
                    if (inventory.active) {
                        isNewInventory = true;
                        this.inventoryKeys.push(inventoryKey);
                        this.inventory.push(inventory);
                        this.setKey(inventoryKey, this.stringify(inventory));
                    }
                } else {
                    if (inventory.active) {
                        this.setKey(inventoryKey, this.stringify(inventory)); // Just update the existing inventory
                        this.setLocalInventory(inventory);
                    } else {
                        // Remove an inactivated inventory
                        let index = this.getLocalInventoryIndex(
                            inventory.closingStockId
                        );
                        if (index > -1) {
                            this.inventory.splice(index, 1);
                            index = this.inventoryKeys.indexOf(inventoryKey);
                            if (index > -1) {
                                this.inventoryKeys.splice(index, 1);
                            }
                            let keyArray = [
                                [
                                    inventoryKey,
                                    this.stringify(this.inventoryKeys)
                                ], // Array of inventory keys
                                [inventoryKey, this.stringify(inventory)] // The inventory being deleted
                            ];

                            this.multiSet(keyArray)
                                .then(rows => {
                                    console.log('Affected rows ' + rows);
                                })
                                .catch(error => {
                                    console.log(
                                        'InventroyRealm:mergeRemoteInventory: Error: ' +
                                        error
                                    );
                                });
                        }
                    }
                }
            }.bind(this)
        );
        if (isNewInventory) {
            this.setKey(inventoryKey, this.stringify(this.inventoryKeys));
        }
    }



    getLocalInventory(closingStockId) {
        for (let index = 0; index < this.inventory.length; index++) {
            if (this.inventory[index].closingStockId === closingStockId) {
                return this.inventory[index];
            }
        }
        return null;
    }
    getLocalInventoryIndex(closingStockId) {
        for (let index = 0; index < this.inventory.length; index++) {
            if (this.inventory[index].closingStockId === closingStockId) {
                return index;
            }
        }
        return -1;
    }

    setLocalInventory(inventory) {
        for (let index = 0; index < this.inventory.length; index++) {
            if (this.inventory[index].closingStockId === inventory.closingStockId) {
                this.inventory[index] = inventory;
                return;
            }
        }
    }



    loadInventoryFromKeys() {
        console.log(
            'loadInventoryFromKeys. No of inventory: ' +
            this.inventoryKeys.length
        );

        let that = this;
        let results = this.getMany(this.inventoryKeys);

        if (results.length == 0) {
            return that.inventory = [];
        }

        return that.inventory = results.map(result => {
            return that.parseJson(result[1]);
        });

    }

    loadInventoryFromKeys2() {
        console.log(
            'pendingInventoryFromKeys. No of pendinginventory: ' +
            this.pendingInventoryKeys.length
        );

        console.log(
            'pendingInventoryFromKeys ',
            this.pendingInventoryKeys
        );

        let that = this;
        let results = this.getMany(this.pendingInventoryKeys);
        console.log('results', results);
        if (results.length == 0) {
            return that.inventory = [];
        }

        return that.pendingInventory = results.map(result => {
            return that.parseJson(result[1]);
        });


        // return new Promise((resolve, reject) => {
        //     try {
        //         let that = this;
        //         this.multiGet(this.pendingInventoryKey).then(results => {
        //             that.pendingInventory = results.map(result => {
        //                 return that.parseJson(result[1]);
        //             });
        //             console.log('that.pendingInventory', that.pendingInventory)
        //             resolve(true);
        //         });
        //     } catch (error) {
        //         console.log('that.error', error)
        //         reject(error);
        //     }
        // });




    }

    removePendingInventory(inventoryKey) {
        //console.log('PostStorage:removePendingInventory');
        const index = this.pendingInventory.indexOf(inventoryKey);
        if (index > -1) {
            this.pendingInventory.splice(index, 1);
            let keyArray = [
                [pendingInventoryKey, this.stringify(this.pendingInventory)]
            ];

            this.multiSet(keyArray)
                .then(rows => {
                    // console.log('Affected rows: ' + rows);
                })
                .catch(error => {
                    console.log(
                        'InventroyRealm:removePendingInventory: Error: ' + error
                    );
                });
        }
    }

    getInventoryFromKey(inventoryKey) {
        return new Promise(resolve => {
            this.getKey(inventoryKey)
                .then(inventory => {
                    resolve(this.parseJson(inventory));
                })
                .catch(() => {
                    resolve(null);
                });
        });
    }

    getInventory() {
        //console.log('InventroyRealm: Inventory. Count ' + this.inventory.length);
        return this.inventory;
    }

    getPendingInventory() {
        console.log('InventroyRealm: PendingInventory. Count ' + this.pendingInventory.length);
        return this.pendingInventory;
    }

    setLastInventorySync(lastSyncTime) {
        this.lastInventorySync = lastSyncTime;
        this.setKey(lastInventorySyncKey, this.lastInventorySync.toISOString());
    }

    stringify(jsObject) {
        return JSON.stringify(jsObject);
    }

    parseJson(jsonString) {
        if (typeof jsonString === 'string') {
            return JSON.parse(jsonString);
        }
        return null;
    }

    async getKey(key) {
        try {
            const value = await this.getItem(key);
            return value;
        } catch (error) {
            // console.log('Pos Storage Error retrieving data');
        }
    }

    async setKey(key, stringValue) {
        console.log(
            'Pos Storage:setKey() Key: ' + key + ' Value: ' + stringValue
        );
        return await this.setItem(key, stringValue);
    }



    async removeKey(key) {
        try {
            await this.removeItem(key);
        } catch (error) {
            console.log('Pos Storage Error removing data' + error);
        }
    }


    // Realm access methods start
    getItem(key) {
        let value;
        realm.write(() => {
            value = realm.objectForPrimaryKey('SemaRealm', key);
        });

        if (value) {
            console.log(value.data);
            return value.data;
        }
        return [];

    }

    setItem(key, value) {
        return new Promise((resolve, reject) => {
            try {
                realm.write(() => {
                    let obj = realm.objectForPrimaryKey('SemaRealm', key);
                    if (obj != null) {
                        realm.create('SemaRealm', { id: key, data: value }, true);
                    }
                    else {
                        realm.create('SemaRealm', { id: key, data: value });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    removeItem(key) {
        return new Promise((resolve, reject) => {
            try {
                realm.write(() => {
                    let semaobject = realm.objectForPrimaryKey(
                        'SemaRealm',
                        key
                    );
                    realm.delete(semaobject);
                    resolve(semaobject);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    multiGet = keyArray => {
        var promise = new Promise(function (resolve, reject) {
            let result = [];
            realm.write(() => {
                for (i = 0; i < keyArray.length; i++) {
                    let value = realm.objectForPrimaryKey(
                        'SemaRealm',
                        keyArray[i]
                    );

                    result.push(semaobject);
                    if (value) {
                        let semaobject = [keyArray[i], value.data];
                        result.push(semaobject);
                    }


                }
            });
            resolve(result);
        });

        return promise;
    };

    getMany = keyArray => {
        let result = [];
        console.log('keyArray', keyArray);
        for (i = 0; i < keyArray.length; i++) {
            let value = realm.objectForPrimaryKey(
                'SemaRealm',
                keyArray[i]
            );

            if (value) {
                let semaobject = [keyArray[i], value.data];
                result.push(semaobject);
            }

        }
        return result;

    };

    multInsert(keyArray) {
        let count = 0;
        for (i = 0; i < keyArray.length; i++) {
            count++;
            let key = keyArray[i][0];
            let value = keyArray[i][1];
            // realm.create('SemaRealm', {id: key, data: value})
            let obj = realm.objectForPrimaryKey('SemaRealm', key);
            if (obj != null)
                realm.create('SemaRealm', { id: key, data: value }, true);
            else
                realm.create('SemaRealm', { id: key, data: value });
        }
        console.log(count);
        return { rows: count };

    }


    multiSet(keyArray) {
        return new Promise((resolve, reject) => {
            realm.write(() => {
                try {
                    let count = 0;
                    for (i = 0; i < keyArray.length; i++) {
                        count++;
                        let key = keyArray[i][0];
                        let value = keyArray[i][1];
                        // realm.create('SemaRealm', {id: key, data: value})
                        let obj = realm.objectForPrimaryKey('SemaRealm', key);
                        if (obj != null)
                            realm.create('SemaRealm', { id: key, data: value }, true);
                        else
                            realm.create('SemaRealm', { id: key, data: value });
                    }
                    //console.log(count);
                    resolve({ rows: count });
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    // End of Realm methods


}

export default new InventroyRealm();
