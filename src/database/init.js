var Realm = require('realm');

// Realm schema creation
const SEMA_SCHEMA = {
    name: 'SemaRealm',
    primaryKey: 'id',
    properties: {
        id: 'string',
        data: 'string'
    }
};

const InventorySchema = {
    name: 'Inventory',
    properties: {
        id: { type: 'int', optional: true },
        closingStockId: 'string',
        kiosk_id: { type: 'int' },
        product_id: 'string',
        quantity: 'int',
        active: { type: 'bool', optional: true },
        syncAction: { type: 'string', optional: true },
        created_at: 'date',
        updated_at: 'date'
    }
};

const InventorySynDateSchema = {
    name: 'InventorySynDate',
    properties: {
        lastInventorySync: 'date',
    }
};

const CreditSchema = {
    name: 'Credit',
    properties: {
        id: { type: 'int', optional: true },
        topUpId: 'string',
        customer_account_id: { type: 'int' },
        topup: 'int',
        balance: 'int',
        active: { type: 'bool', optional: true },
        syncAction: { type: 'string', optional: true },
        created_at: 'date',
        updated_at: 'date'
    }
};

const CreditSyncDateSchema = {
    name: 'CreditSyncDate',
    properties: {
        lastCreditSync: 'date',
    }
};

export default realm = new Realm({
    schema: [SEMA_SCHEMA, InventorySchema, InventorySynDateSchema, CreditSchema, CreditSyncDateSchema],
    schemaVersion: 41,
    migration: (oldRealm, newRealm) => {
        // only apply this change if upgrading to schemaVersion 1
        console.log('newRealm', newRealm)
        console.log('oldRealm', oldRealm)
        if (oldRealm.schemaVersion < 1) {
            const oldObjects = oldRealm.objects('InventoryInventorySynDate');
            const newObjects = newRealm.objects('InventoryInventorySynDate');

            // // loop through all objects and set the name property in the new schema
            // for (let i = 0; i < oldObjects.length; i++) {
            //   newObjects[i].name = oldObjects[i].firstName + ' ' + oldObjects[i].lastName;
            // }
        }
    }
});