import realm from '../init';
const uuidv1 = require('uuid/v1');

class InventroyRealm {
    constructor() {
        this.inventoryKeys = [];
        this.inventory = [];
        let firstSyncDate = new Date('November 7, 1973');
        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('InventoryInventorySynDate')))).length == 0) {
                realm.create('InventoryInventorySynDate', { lastInventorySync: firstSyncDate });
            }
        });
        this.lastInventorySync = firstSyncDate;
    }

    getLastInventorySync() {
        return this.lastInventorySync = JSON.parse(JSON.stringify(realm.objects('InventoryInventorySynDate')))['0'].lastInventorySync;
    }

    truncate() {
        let inventories = realm.objects('Inventory');
        realm.delete(inventories);
    }

    setLastInventorySync(lastSyncTime) {
        let syncDate = realm.objects('InventoryInventorySynDate');
        syncDate[0].quantity = lastSyncTime.toISOString()
    }

    getAllInventory() {
        return this.inventory = Object.values(JSON.parse(JSON.stringify(realm.objects('Inventory'))));
    }

    initialise() {
        return this.getAllInventory();
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


    createInventory(kiosk_id, product_id, quantity, filterDate) {
        let existingInventory = this.getAllInventory().filter(inventory => this.formatDay(inventory.created_at) === this.formatDay(filterDate) && inventory.product_id === product_id);
        console.log('existingInventory', existingInventory)
        const now = new Date();
        if (existingInventory.length === 0) {
            const newInventory = {
                closingStockId: uuidv1(),
                kiosk_id,
                product_id,
                quantity,
                created_at: now,
                updated_at: now,
                syncAction: 'create',
                active: false
            };
            try {
                realm.write(() => {
                    realm.create('Inventory', newInventory);
                });
            } catch (e) {
                console.log("Error on creation", e);
            }
        }

        if (existingInventory.length > 0) {
            return this.updateInventory(
                { ...existingInventory[0], quantity: quantity, updated_at: now, syncAction: 'update' }
            )
        }
    }

    updateInventory(inventory) {
        try {
            realm.write(() => {
                let inventoryObj = realm.objects('Inventory').filtered(`closingStockId = "${inventory.closingStockId}"`);
                inventoryObj[0].quantity = inventory.quantity;
                inventoryObj[0].updated_at = inventory.updated_at;
                inventoryObj[0].syncAction = inventory.syncAction;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    synched(inventory) {
        try {
            realm.write(() => {
                let inventoryObj = realm.objects('Inventory').filtered(`closingStockId = "${inventory.closingStockId}"`);
                inventoryObj[0].active = true;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    hardDeleteInventory(inventory) {
        try {
            realm.write(() => {
                console.log("inventory", inventory);
                let inventories = realm.objects('Inventory');
                let deleteInventory = inventories.filtered(`closingStockId = "${inventory.closingStockId}"`);
                realm.delete(deleteInventory);
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    softDeleteInventory(inventory) {
        try {
            realm.write(() => {
                realm.write(() => {
                    let inventoryObj = realm.objects('Inventory').filtered(`closingStockId = "${inventory.closingStockId}"`);
                    inventoryObj[0].syncAction = 'delete';
                })
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createManyInventories(inventories) {
        console.log('inventories', inventories)
        try {
            realm.write(() => {
                inventories.forEach(obj => {
                    realm.create('Inventory', obj);
                });
            });

        } catch (e) {
            console.log("Error on creation", e);
        }

    }
}

export default new InventroyRealm();
