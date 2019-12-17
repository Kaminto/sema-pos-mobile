export const ProductMRPSchema = {
    name: 'ProductMRP',
    properties: {
        id: { type: 'int', optional: true },
        currencyCode: 'string',
        priceAmount: { type: 'int' },
        cogsAmount: 'int',
        productId: { type: 'int' },
        salesChannelId: { type: 'int' },
        siteId: { type: 'int' },
        active: { type: 'bool', optional: true },
        syncAction: { type: 'string', optional: true },
        created_at: { type: 'date', optional: true },
        updated_at: { type: 'date', optional: true },
    }
};

export const ProductMRPSyncDateSchema = {
    name: 'ProductMRPSyncDate',
    properties: {
        lastProductMRPSync: 'date',
    }
};