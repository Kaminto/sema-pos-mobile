import realm from '../init';
const uuidv1 = require('uuid/v1');
import { parseISO, isSameDay } from 'date-fns';
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
                let meterReading = realm.objects('MeterReading');
                realm.delete(inventories);
                realm.delete(meterReading);
            })
        } catch (e) {
            console.log("Error on truncate inventory", e);
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
    addDays = (theDate, days) => {
        return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
    };

    getWastageReportByDate(date) {
        return new Promise(resolve => {
            let checkExistingMeter = Object.values(JSON.parse(JSON.stringify(realm.objects('MeterReading'))));
            const filteredReading = checkExistingMeter.filter(element =>
                isSameDay(parseISO(element.created_at), date)
            );

            let checkExistingWastage = Object.values(JSON.parse(JSON.stringify(realm.objects('Inventory'))));
            const filteredWastage = checkExistingWastage.filter(element =>
                isSameDay(parseISO(element.created_at), date)
            );

            if (filteredReading.length > 0 || filteredWastage.length > 0) {
                resolve({
                    currentMeter: filteredReading.length > 0 ? filteredReading[0].meter_value : 0,
                    currentProductSkus: filteredWastage.length > 0 ? filteredWastage : []
                })
            } else {
                resolve({
                    currentMeter: 0,
                    currentProductSkus: []
                });
            }
        })
    }

    createMeterReading(meter_value, date, kiosk_id) {
        console.log('date', date + " " + meter_value + " - " + kiosk_id);
        date = this.addDays(date, 1);
        console.log('date-', date);
        try {
            realm.write(() => {
                let checkExistingMeter = Object.values(JSON.parse(JSON.stringify(realm.objects('MeterReading'))));
                const filteredReading = checkExistingMeter.filter(element =>
                    isSameDay(parseISO(element.created_at), date)
                );
                if (filteredReading.length > 0) {
                    let meterUpdateObj = realm.objects('MeterReading').filtered(`meter_reading_id = "${filteredReading[0].meter_reading_id}"`);
                    meterUpdateObj[0].meter_value = meter_value;
                    meterUpdateObj[0].syncAction = 'UPDATE';
                    meterUpdateObj[0].updated_at = new Date();
                } else {
                    realm.create('MeterReading', {
                        meter_reading_id: uuidv1(),
                        kiosk_id,
                        created_at: new Date(date),
                        meter_value: meter_value ? meter_value : 0,
                        syncAction: 'CREATE',
                        active: false
                    });
                }
                // realm.create('CustomerReminder', customerReminder);
            });
        } catch (e) {
            console.log("Error on creation inventory meter reading", e);
        }
    }

    createInventory(inventory, date) {
        console.log('inventory-', inventory);
        console.log('date', date);
        date = this.addDays(date, 1);
        console.log('date-', date);
        try {
            realm.write(() => {
                let checkExistingInventory = Object.values(JSON.parse(JSON.stringify(realm.objects('Inventory').filtered(`closingStockId = "${inventory.closingStockId}"`))));

                if (checkExistingInventory.length > 0) {
                    let inventorUpdateObj = realm.objects('Inventory').filtered(`closingStockId = "${inventory.closingStockId}"`);
                    inventorUpdateObj[0].product_id = inventory.product_id;
                    if (inventory.type === 'closing') {
                        inventorUpdateObj[0].quantity = inventory.quantity ? inventory.quantity : 0;
                        inventorUpdateObj[0].inventory = inventory.inventory ? inventory.inventory : 0;
                    } else if (inventory.type === 'notdispatched') {
                        inventorUpdateObj[0].notDispatched = inventory.notDispatched ? inventory.notDispatched : 0;

                    } inventorUpdateObj[0].kiosk_id = inventory.kiosk_id;
                    inventorUpdateObj[0].wastageName = inventory.wastageName;
                    inventorUpdateObj[0].syncAction = 'UPDATE';
                    inventorUpdateObj[0].updated_at = new Date();
                } else { let saveObj = {};
                    if (inventory.type === 'closing') {
                        saveObj = {
                            ...inventory,
                            closingStockId: uuidv1(),
                            created_at: date,
                            inventory: inventory.inventory ? inventory.inventory : 0,
                            quantity: inventory.quantity ? inventory.quantity : 0,
                            syncAction: 'CREATE',
                            active: false
                        }
                    } else if (inventory.type === 'notdispatched') {
                        saveObj = {
                            ...inventory,
                            closingStockId: uuidv1(),
                            created_at: date,
                            notDispatched: inventory.notDispatched ? inventory.notDispatched : 0,
                            syncAction: 'CREATE',
                            active: false
                        }
                    }


                    realm.create('Inventory', saveObj);
                }
            });
        } catch (e) {
            console.log("Error on creation inventory", e);
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
            console.log("Error on update inventory", e);
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
            console.log("Error on synch inventory", e);
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
            console.log("Error on hard delete inventory", e);
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
            console.log("Error on soft delete inventory", e);
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
            console.log("Error on creation many inventory", e);
        }

    }
}

export default new InventroyRealm();
