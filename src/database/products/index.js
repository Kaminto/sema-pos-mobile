/*
This class contains the persistence implementation of the tablet business objects such as customers, sales, products
*/
import { capitalizeWord } from '../../services/Utilities';
import Events from 'react-native-simple-events';
import moment from 'moment-timezone';
var Realm = require('realm');
let realm;

const uuidv1 = require('uuid/v1');


const productsKey = '@Sema:ProductsKey';
const productItemKey = '@Sema:ProductItemKey';
const productMrpsKey = '@Sema:ProductMrpsKey';

const lastProductsSyncKey = '@Sema:LastProductsSyncKey';


class PosStorage {
    constructor() {

        // Products are saved in the form productItemKey + Product.sku
        // For example "@Sema:productItemKey_sku-100"
        this.productsKeys = []; // Array of product keys
        this.products = []; // De-referenced products


        // Last sync DateTime is the last date time that items were synchronized with the server
        let firstSyncDate = new Date('November 7, 1973');
        this.lastProductsSync = firstSyncDate;
        this.tokenExpiration = firstSyncDate;

        this.settings = {
            semaUrl: 'http://142.93.115.206:3006/',
            site: '',
            user: '',
            password: '',
            uiLanguage: { name: 'English', iso_code: 'en' },
            token: '',
            loginSync: false,
            siteId: ''
        };
        this.productMrpDict = {};

        this.syncInterval = {
            interval: 10 * 60 * 1000
        };
        // Realm schema creation
        const SEMA_SCHEMA = {
            name: 'SemaRealm',
            primaryKey: 'id',
            properties: {
                id: 'string',
                data: 'string'
            }
        };
        realm = new Realm({ schema: [SEMA_SCHEMA] });
    }

  
    // Realm access methods start
    getItem(key) {
        let value;
        realm.write(() => {
            value = realm.objectForPrimaryKey('SemaRealm', key);
        });
        console.log(value.data);
        return value.data;
    }

    setItem(key, value) {
        return new Promise((resolve, reject) => {
            try {
                realm.write(() => {
                    let obj = realm.objectForPrimaryKey('SemaRealm', key);
                    if (obj != null) {
                        realm.create('SemaRealm', { id: key, data: value }, true);
                    }
                    else {
                        realm.create('SemaRealm', { id: key, data: value });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    removeItem(key) {
        return new Promise((resolve, reject) => {
            try {
                realm.write(() => {
                    let semaobject = realm.objectForPrimaryKey(
                        'SemaRealm',
                        key
                    );
                    realm.delete(semaobject);
                    resolve(semaobject);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    multiGet = keyArray => {
        var promise = new Promise(function (resolve, reject) {
            let result = [];
            realm.write(() => {
                for (i = 0; i < keyArray.length; i++) {
                    let value = realm.objectForPrimaryKey(
                        'SemaRealm',
                        keyArray[i]
                    );
                    let semaobject = [keyArray[i], value.data];
                    //console.log(value.data);
                    // semaobjects[i] = semaobject;
                    result.push(semaobject);
                }
            });
            resolve(result);
        });

        return promise;
    };

    getMany = keyArray => {
        let result = [];

        for (i = 0; i < keyArray.length; i++) {
            let value = realm.objectForPrimaryKey(
                'SemaRealm',
                keyArray[i]
            );
            let semaobject = [keyArray[i], value.data];
            //console.log(value.data);
            // semaobjects[i] = semaobject;
            result.push(semaobject);
        }

        return result;

    };

    multInsert(keyArray) {
        let count = 0;
        for (i = 0; i < keyArray.length; i++) {
            count++;
            let key = keyArray[i][0];
            let value = keyArray[i][1];
            // realm.create('SemaRealm', {id: key, data: value})
            let obj = realm.objectForPrimaryKey('SemaRealm', key);
            if (obj != null)
                realm.create('SemaRealm', { id: key, data: value }, true);
            else
                realm.create('SemaRealm', { id: key, data: value });
        }
        console.log(count);
        return { rows: count };

    }


    multiSet(keyArray) {
        return new Promise((resolve, reject) => {
            realm.write(() => {
                try {
                    let count = 0;
                    for (i = 0; i < keyArray.length; i++) {
                        count++;
                        let key = keyArray[i][0];
                        let value = keyArray[i][1];
                        // realm.create('SemaRealm', {id: key, data: value})
                        let obj = realm.objectForPrimaryKey('SemaRealm', key);
                        if (obj != null)
                            realm.create('SemaRealm', { id: key, data: value }, true);
                        else
                            realm.create('SemaRealm', { id: key, data: value });
                    }
                    console.log(count);
                    resolve({ rows: count });
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    // End of Realm methods

     
    getLastProductSync() {
        return this.lastProductsSync;
    }
      

    loadProductsFromKeys2() {
        console.log(
            'loadProductsFromKeys. No of products: ' + this.productsKeys.length
        );

        let that = this;
        let results = this.getMany(this.productsKeys);
        return that.products = results.map(result => {
            return that.parseJson(result[1]);
        });

    }
   

 
     

    getProducts() {
        console.log('PosStorage: getProducts. Count ' + this.products.length);
        return this.products;
    }

    loadProductsFromKeys() {
        console.log(
            'loadProductsFromKeys. No of products: ' + this.productsKeys.length
        );
        return new Promise((resolve, reject) => {
            try {
                let that = this;
                this.multiGet(this.productsKeys).then(results => {
                    that.products = results.map(result => {
                        return that.parseJson(result[1]);
                    });
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    makeProductKey(product) {
        return productItemKey + '_' + product.productId;
    }

    mergeProducts(remoteProducts) {
        let hasNewProducts = false;

        remoteProducts.forEach(
            function (product) {
                let productKey = this.makeProductKey(product);
                let keyIndex = this.productsKeys.indexOf(productKey);

                if (keyIndex === -1 && product.active) {
                    hasNewProducts = true;
                    this.productsKeys.push(productKey);
                    this.products.push(product);
                    this.setKey(productKey, this.stringify(product));
                } else if (keyIndex !== -1) {
                    if (product.active) {
                        this.setKey(productKey, this.stringify(product)); // Just update the existing product
                        this.setLocalProduct(product);
                    } else {
                        // Product has been deactivated - remove it
                        this.productsKeys.splice(keyIndex, 1);
                        hasNewProducts = true;
                        this.removeKey(productKey);
                        let productIndex = this.getLocalProductIndex(product);
                        if (productIndex != -1) {
                            this.products.splice(productIndex, 1);
                        }
                    }
                }
            }.bind(this)
        );

        if (hasNewProducts) {
            this.setKey(productsKey, this.stringify(this.productsKeys));
            return true;
        }

        return false;
    }

    setLocalProduct(product) {
        for (let index = 0; index < this.products.length; index++) {
            if (this.products[index].productId === product.productId) {
                this.products[index] = product;
                return;
            }
        }
    }

    getLocalProductIndex(product) {
        for (let index = 0; index < this.products.length; index++) {
            if (this.products[index].productId === product.productId) {
                return index;
            }
        }
        return -1;
    }

    

    setLastProductSync(lastSyncTime) {
        this.lastProductsSync = lastSyncTime;
        this.setKey(lastProductsSyncKey, this.lastProductsSync.toISOString());
    }
 

    loadProductMrps() {
        console.log('PosStorage:loadProductMrps');
        return new Promise((resolve, reject) => {
            this.getKey(productMrpsKey)
                .then(productMrps => {
                    if (!productMrps) {
                        return resolve([]);
                    }
                    resolve(this.parseJson(productMrps));
                })
                .catch(err => reject(err));
        });
    }
  
    saveProductMrps(productMrpsArray) {
        this.productMrpDict = {}; // Note - This assumes that all productMrps are being saved
        productMrpsArray.forEach(productMrp => {
            const key = this.getProductMrpKey(productMrp);
            this.productMrpDict[key] = productMrp;
        });
        this.setKey(productMrpsKey, this.stringify(this.productMrpDict));
    }

    getProductMrps() {
        return this.productMrpDict;
    }

    getProductMrpKey(productMrp) {
        return '' + productMrp.productId + '-' + productMrp.salesChannelId; // ProductId and salesChannelId are unique key
    }

    getProductMrpKeyFromIds(productId, salesChannelId) {
        return '' + productId + '-' + salesChannelId;
    }

 
    stringify(jsObject) {
        return JSON.stringify(jsObject);
    }
    parseJson(jsonString) {
        if (typeof jsonString === 'string') {
            return JSON.parse(jsonString);
        }
        return null;
    }

    async getKey(key) {
        try {
            const value = await this.getItem(key);
            return value;
        } catch (error) {
            console.log('Pos Storage Error retrieving data');
        }
    }

    async setKey(key, stringValue) {
        console.log(
            'Pos Storage:setKey() Key: ' + key + ' Value: ' + stringValue
        );
        return await this.setItem(key, stringValue);
    }

    async removeKey(key) {
        try {
            await this.removeItem(key);
        } catch (error) {
            console.log('Pos Storage Error removing data' + error);
        }
    }
}
// Storage is a singleton

export default new PosStorage();
