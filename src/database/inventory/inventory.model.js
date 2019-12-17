export const InventorySchema = {
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

export const InventorySyncDateSchema = {
    name: 'InventorySyncDate',
    properties: {
        lastInventorySync: 'date',
    }
};