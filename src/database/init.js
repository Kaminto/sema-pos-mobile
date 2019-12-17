var Realm = require('realm');
import { CustomerSchema, CustomerSyncDateSchema } from './customers/customer.model';
import { CreditSchema, CreditSyncDateSchema } from './credit/credit.model';
import { InventorySchema, InventorySyncDateSchema } from './inventory/inventory.model';
import { ProductMRPSchema, ProductMRPSyncDateSchema } from './productmrp/productmrp.model';
import { ProductSchema, ProductSyncDateSchema } from './products/product.model';
import { SalesChannelSchema } from './sales-channels/sales-channels.model';
import { CustomerTypesSchema } from './customer-types/customer-types.model';


// Realm schema creation
const SEMA_SCHEMA = {
    name: 'SemaRealm',
    primaryKey: 'id',
    properties: {
        id: 'string',
        data: 'string'
    }
};

export default realm = new Realm({
    schema: [
        SEMA_SCHEMA,
        InventorySchema,
        InventorySyncDateSchema,
        CreditSchema,
        CreditSyncDateSchema,
        CustomerSchema,
        CustomerSyncDateSchema,
        ProductMRPSchema,
        ProductMRPSyncDateSchema,
        ProductSchema,
        ProductSyncDateSchema,
        CustomerTypesSchema,
        SalesChannelSchema
    ],
    schemaVersion: 46,
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