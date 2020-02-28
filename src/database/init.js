var Realm = require('realm');
import { CustomerSchema, CustomerSyncDateSchema } from './customers/customer.model';
import { CreditSchema, CreditSyncDateSchema } from './credit/credit.model';
import { InventorySchema, InventorySyncDateSchema } from './inventory/inventory.model';
import { ProductMRPSchema, ProductMRPSyncDateSchema } from './productmrp/productmrp.model';
import { ProductSchema, ProductSyncDateSchema } from './products/product.model';
import { SalesChannelSchema } from './sales-channels/sales-channels.model';
import { CustomerTypesSchema } from './customer-types/customer-types.model';
import { SettingsSchema, TokenExpirySchema } from './settings/settings.model';
import { CustomerObjSchema, ProductObjSchema, OrderItemsSchema, OrderSchema } from './orders/orders.model';
import { DiscountSchema } from './discount/discount.model';
import { CustomerDebtSchema } from './customer_debt/customer_debt.model';
import { MeterReadingSchema } from './inventory/meter-reading.modal';
import { CustomerReminderSchema } from './customer-reminder/customer-reminder.model';

import { PaymentTypeSchema } from './payment_types/payment_type.model';
import { ReceiptPaymentTypeSchema } from './reciept_payment_types/reciept_payment_types.model';

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
        SalesChannelSchema,
        SettingsSchema,
        TokenExpirySchema,
        CustomerObjSchema,
        ProductObjSchema,
        OrderItemsSchema,
        OrderSchema,
        DiscountSchema,
        PaymentTypeSchema,
        ReceiptPaymentTypeSchema,
        CustomerDebtSchema,
        CustomerReminderSchema,
        MeterReadingSchema
    ],
    schemaVersion: 80,
    migration: (oldRealm, newRealm) => {
        // only apply this change if upgrading to schemaVersion 1
        if (oldRealm.schemaVersion < 1) {
            const oldObjects = oldRealm.objects('InventoryInventorySynDate');
            const newObjects = newRealm.objects('InventoryInventorySynDate');
        }
    }
});






// const Realm = require('realm');

// // Define your models and their properties
// const CarSchema = {
//   name: 'Car',
//   properties: {
//     make:  'string',
//     model: 'string',
//     miles: {type: 'int', default: 0},
//   }
// };
// const PersonSchema = {
//   name: 'Person',
//   properties: {
//     name:     'string',
//     birthday: 'date',
//     cars:     'Car[]', // a list of Cars
//     picture:  'data?'  // optional property
//   }
// };

// Realm.open({schema: [CarSchema, PersonSchema]})
//   .then(realm => {
//     // Create Realm objects and write to local storage
//     realm.write(() => {
//       const myCar = realm.create('Car', {
//         make: 'Honda',
//         model: 'Civic',
//         miles: 1000,
//       });
//       myCar.miles += 20; // Update a property value
//     });

//     // Query Realm for all cars with a high mileage
//     const cars = realm.objects('Car').filtered('miles > 1000');

//     // Will return a Results object with our 1 car
//     cars.length // => 1

//     // Add another car
//     realm.write(() => {
//       const myCar = realm.create('Car', {
//         make: 'Ford',
//         model: 'Focus',
//         miles: 2000,
//       });
//     });

//     // Query results are updated in realtime
//     cars.length // => 2

//     // Remember to close the realm when finished.
//     realm.close();
//   })
//   .catch(error => {
//     console.log(error);
//   });