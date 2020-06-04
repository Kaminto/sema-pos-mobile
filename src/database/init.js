var Realm = require('realm');
import { CustomerSchema, CustomerSyncDateSchema } from './customers/customer.model';
import { ProductMRPSchema, ProductMRPSyncDateSchema } from './productmrp/productmrp.model';
import { ProductSchema, ProductSyncDateSchema } from './products/product.model';
import { SalesChannelSchema, SalesChannelSyncDateSchema } from './sales-channels/sales-channels.model';
import { CustomerTypesSchema, CustomerTypesSyncDateSchema } from './customer-types/customer-types.model';
import { SettingsSchema, TokenExpirySchema } from './settings/settings.model';
 

// Realm schema creation 
export default realm = new Realm({
    schema: [
        CustomerSchema,
        CustomerSyncDateSchema,
        ProductSchema,
        ProductSyncDateSchema,
        CustomerTypesSchema,
        CustomerTypesSyncDateSchema,
        SalesChannelSchema,
        SalesChannelSyncDateSchema,
        SettingsSchema,
        ProductMRPSchema,
        ProductMRPSyncDateSchema, 
        TokenExpirySchema
    ],
    schemaVersion: 104,
    migration: (oldRealm, newRealm) => {
        // only apply this change if upgrading to schemaVersion 1
        if (oldRealm.schemaVersion < 1) {
            const oldObjects = oldRealm.objects('InventoryInventorySynDate');
            const newObjects = newRealm.objects('InventoryInventorySynDate');
        }
    }
});
