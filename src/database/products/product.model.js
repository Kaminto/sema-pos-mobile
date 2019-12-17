export const ProductSchema = {
    name: 'Product',
    properties: {
        base64encodedImage: { type: 'string', optional: true },
        categoryId: { type: 'int', optional: true },
        cogsAmount: { type: 'int', optional: true },
        maximumQuantity: { type: 'int', optional: true },
        minimumQuantity: { type: 'int', optional: true },
        description: { type: 'string', optional: true },
        priceAmount: { type: 'int', optional: true },
        priceCurrency: { type: 'string', optional: true },
        productId: { type: 'int', optional: true },
        sku: { type: 'string', optional: true },
        unitMeasure: { type: 'string', optional: true },
        unitPerProduct: { type: 'int', optional: true },
        active: { type: 'bool', optional: true },
        wastageName: { type: 'string', optional: true },
        syncAction: { type: 'string', optional: true },
        updatedDate: { type: 'date', optional: true },
    }
};
 
 

export const ProductSyncDateSchema = {
    name: 'ProductSyncDate',
    properties: {
        lastProductSync: 'date',
    }
};