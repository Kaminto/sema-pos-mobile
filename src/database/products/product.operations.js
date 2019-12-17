import realm from '../init';
const uuidv1 = require('uuid/v1');

class ProductsRealm {
    constructor() {
        this.product = [];
        let firstSyncDate = new Date('November 7, 1973');
        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('ProductSyncDate')))).length == 0) {
                realm.create('ProductSyncDate', { lastProductSync: firstSyncDate });
            }
        });
        this.lastProductSync = firstSyncDate;
    }

    getLastProductsync() {
        return this.lastProductSync = JSON.parse(JSON.stringify(realm.objects('ProductSyncDate')))['0'].lastProductSync;
    }

    truncate() {
        try {
            realm.write(() => {
                let products = realm.objects('Product');
                realm.delete(products);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    setLastProductsync(lastSyncTime) {
        realm.write(() => {
        let syncDate = realm.objects('ProductSyncDate');
        syncDate[0].lastProductSync = lastSyncTime.toISOString()
        })
    }

   

    getProducts() {
        return Object.values(JSON.parse(JSON.stringify(realm.objects('Product'))));
    }

    initialise() {
        return this.getProducts();
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


    createProducts(kiosk_id, product_id, quantity, filterDate) {
        let existingProducts = this.getProducts().filter(product => this.formatDay(product.created_at) === this.formatDay(filterDate) && product.product_id === product_id);
        console.log('existingProducts', existingProducts)
        const now = new Date();
        if (existingProducts.length === 0) {
            const newProducts = {
                productId: uuidv1(),
                kiosk_id,
                product_id,
                quantity,
                created_at: now,
                updated_at: now,
                syncAction: 'create',
                active: false
            };
            try {
                realm.write(() => {
                    realm.create('Product', newProducts);
                });
            } catch (e) {
                console.log("Error on creation", e);
            }
        }

        if (existingProducts.length > 0) {
            return this.updateProducts(
                { ...existingProducts[0], quantity: quantity, updated_at: now, syncAction: 'update' }
            )
        }
    }

    updateProducts(product) {
        try {
            realm.write(() => {
                let productObj = realm.objects('Product').filtered(`productId = "${product.productId}"`);
                productObj[0].quantity = product.quantity;
                productObj[0].updated_at = product.updated_at;
                productObj[0].syncAction = product.syncAction;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    synched(product) {
        try {
            realm.write(() => {
                let productObj = realm.objects('Product').filtered(`productId = "${product.productId}"`);
                productObj[0].active = true;
                productObj[0].syncAction = null;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }


  // Hard delete when active property is false or when active property and syncAction is delete

    hardDeleteProducts(product) {
        try {
            realm.write(() => {
                console.log("product", product);
                let products = realm.objects('Product');
                let deleteProducts = products.filtered(`productId = "${product.productId}"`);
                realm.delete(deleteProducts);
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    softDeleteProducts(product) {
        try {
            realm.write(() => {
                realm.write(() => {
                    let productObj = realm.objects('Product').filtered(`productId = "${product.productId}"`);
                    productObj[0].syncAction = 'delete';
                })
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createManyProducts(products) {
        console.log('products', products)
        try {
            realm.write(() => {
                products.forEach(obj => {
                    realm.create('Product', obj);
                });
            });

        } catch (e) {
            console.log("Error on creation", e);
        }

    }
}

export default new ProductsRealm();
