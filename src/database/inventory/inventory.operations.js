import realm from '../init';
const uuidv1 = require('uuid/v1');

class InventroyRealm {
    constructor() {
        this.inventory = [];
        let firstSyncDate = new Date('November 7, 1973');
        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('InventorySyncDate')))).length == 0) {
                realm.create('InventorySyncDate', { lastInventorySync: firstSyncDate });
            }
        });
        this.lastInventorySync = firstSyncDate;
    }

    getLastInventorySync() {
        return this.lastInventorySync = JSON.parse(JSON.stringify(realm.objects('InventorySyncDate')))['0'].lastInventorySync;
    }

    truncate() {
        try {
            realm.write(() => {
                let inventories = realm.objects('Inventory');
                realm.delete(inventories);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    setLastInventorySync(lastSyncTime) {
        realm.write(() => {
            let syncDate = realm.objects('InventorySyncDate');
            syncDate[0].lastInventorySync = lastSyncTime.toISOString()
        })
    }

    getAllInventory() {
        return this.inventory = Object.values(JSON.parse(JSON.stringify(realm.objects('Inventory'))));
    }

    getAllMeterReading() {
        return Object.values(JSON.parse(JSON.stringify(realm.objects('MeterReading'))));
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

    createMeterReading(meter, date,kiosk_id) {
        console.log('meter-', meter);
        console.log('date-', date);
        //getAllMeterReading
        try {
            realm.write(() => {
                let checkExistingMeter = Object.values(JSON.parse(JSON.stringify(realm.objects('MeterReading'))));

                if (checkExistingMeter.length > 0) {
                    console.log('existing neter')
                    // let inventorUpdateObj = realm.objects('Inventory').filtered(`closingStockId = "${inventory.closingStockId}"`);
                    // inventorUpdateObj[0].product_id = inventory.product_id;
                    // inventorUpdateObj[0].notDispatched = inventory.notDispatched ? inventory.notDispatched : 0,
                    // inventorUpdateObj[0].quantity = inventory.quantity ? inventory.quantity : 0,
                    // inventorUpdateObj[0].kiosk_id = inventory.kiosk_id,
                    // inventorUpdateObj[0].created_at = new Date(inventory.created_at);
                    // inventorUpdateObj[0].inventory = inventory.inventory ? inventory.inventory : 0;
                    // inventorUpdateObj[0].wastageName = inventory.wastageName;
                    // inventorUpdateObj[0].syncAction = 'UPDATE';
                    // inventorUpdateObj[0].updated_at = new Date();
                } else {
                    console.log('new meter')
                    realm.create('MeterReading', {
                         meterReadingId: uuidv1(),
                         kiosk_id,
                         created_at: new Date(date),
                         meterValue: meterValue ? meterValue : 0,
                         syncAction: 'CREATE',
                         active: false});
                }
                // realm.create('CustomerReminder', customerReminder);
            });
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createInventory(inventory, date) {
        console.log('inventory-', inventory);
        console.log('date-', date);
        try {
            realm.write(() => {
                let checkExistingInventory = Object.values(JSON.parse(JSON.stringify(realm.objects('Inventory').filtered(`closingStockId = "${inventory.closingStockId}"`))));

                if (checkExistingInventory.length > 0) {
                    console.log('existing inv')
                    let inventorUpdateObj = realm.objects('Inventory').filtered(`closingStockId = "${inventory.closingStockId}"`);
                    inventorUpdateObj[0].product_id = inventory.product_id;
                    inventorUpdateObj[0].notDispatched = inventory.notDispatched ? inventory.notDispatched : 0,
                    inventorUpdateObj[0].quantity = inventory.quantity ? inventory.quantity : 0,
                    inventorUpdateObj[0].kiosk_id = inventory.kiosk_id,
                    inventorUpdateObj[0].created_at = new Date(inventory.created_at);
                    inventorUpdateObj[0].inventory = inventory.inventory ? inventory.inventory : 0;
                    inventorUpdateObj[0].wastageName = inventory.wastageName;
                    inventorUpdateObj[0].syncAction = 'UPDATE';
                    inventorUpdateObj[0].updated_at = new Date();
                } else {
                    console.log('new inv')
                    realm.create('Inventory', {
                        ...inventory,
                         inventory: inventory.inventory ? inventory.inventory : 0,
                         quantity: inventory.quantity ? inventory.quantity : 0,
                         notDispatched: inventory.notDispatched ? inventory.notDispatched : 0,
                         syncAction: 'CREATE',
                         active: false});
                }
                // realm.create('CustomerReminder', customerReminder);
            });
        } catch (e) {
            console.log("Error on creation", e);
        }
    }


    updateInventory(inventory) {
        try {
            realm.write(() => {
                let inventoryObj = realm.objects('Inventory').filtered(`closingStockId = "${inventory.closingStockId}"`);
                inventoryObj[0].product_id = inventory.product_id;
                inventoryObj[0].notDispatched = inventory.notDispatched ? inventory.notDispatched : 0,
                inventoryObj[0].quantity = inventory.quantity ? inventory.quantity : 0,
                inventoryObj[0].kiosk_id = inventory.kiosk_id,
                inventoryObj[0].created_at = new Date(inventory.created_at);
                inventoryObj[0].inventory = inventory.inventory ? inventory.inventory : 0;
                inventoryObj[0].wastageName = inventory.wastageName;
                inventoryObj[0].syncAction = 'UPDATE';
                inventoryObj[0].updated_at = new Date();
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
                inventoryObj[0].syncAction = null;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }


    // Hard delete when active property is false or when active property and syncAction is delete

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
