import realm from '../init';
const uuidv1 = require('uuid/v1');

class ProductMRPRealm {
    constructor() {
        this.productMRP = [];
        let firstSyncDate = new Date('November 7, 1973');
        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('ProductMRPSyncDate')))).length == 0) {
                realm.create('ProductMRPSyncDate', { lastProductMRPSync: firstSyncDate });
            }
        });
        this.lastProductMRPSync = firstSyncDate;
    }

    getLastProductMRPSync() {
        return this.lastProductMRPSync = JSON.parse(JSON.stringify(realm.objects('ProductMRPSyncDate')))['0'].lastProductMRPSync;
    }

    truncate() {
        try {
            realm.write(() => {
                let productMRPs = realm.objects('ProductMRP');
                realm.delete(productMRPs);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    setLastProductMRPSync(lastSyncTime) {
        realm.write(() => {
        let syncDate = realm.objects('ProductMRPSyncDate');
        syncDate[0].lastProductMRPSync = lastSyncTime.toISOString()
        })
    }

    getFilteredProductMRP() {
        let productMrpDict = {}; // Note - This assumes that all productMrps are being saved        
        let productMrpsArray = Object.values(JSON.parse(JSON.stringify(realm.objects('ProductMRP'))));
        productMrpsArray.forEach(productMrp => {
            const key = this.getProductMrpKey(productMrp);
			productMrpDict[key] = productMrp;
		});

        return this.productMRP = productMrpDict;
    }

    getProductMrpKey(productMrp) {
		return '' + productMrp.productId + '-' + productMrp.salesChannelId; // ProductId and salesChannelId are unique key
    }
    
    getProductMrpKeyFromIds(productId, salesChannelId) {
		return '' + productId + '-' + salesChannelId;
	}

    getProductMRPS() {
        return Object.values(JSON.parse(JSON.stringify(realm.objects('ProductMRP'))));
    }

    initialise() {
        return this.getProductMRPS();
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


    createProductMRP(kiosk_id, product_id, quantity, filterDate) {
        let existingProductMRP = this.getProductMRPS().filter(productMRP => this.formatDay(productMRP.created_at) === this.formatDay(filterDate) && productMRP.product_id === product_id);
        const now = new Date();
        if (existingProductMRP.length === 0) {
            const newProductMRP = {
                id: uuidv1(),
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
                    realm.create('ProductMRP', newProductMRP);
                });
            } catch (e) {
                console.log("Error on creation", e);
            }
        }

        if (existingProductMRP.length > 0) {
            return this.updateProductMRP(
                { ...existingProductMRP[0], quantity: quantity, updated_at: now, syncAction: 'update' }
            )
        }
    }

    updateProductMRP(productMRP) {
        try {
            realm.write(() => {
                let productMRPObj = realm.objects('ProductMRP').filtered(`id = "${productMRP.id}"`);
                productMRPObj[0].quantity = productMRP.quantity;
                productMRPObj[0].updated_at = productMRP.updated_at;
                productMRPObj[0].syncAction = productMRP.syncAction;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    synched(productMRP) {
        try {
            realm.write(() => {
                let productMRPObj = realm.objects('ProductMRP').filtered(`id = "${productMRP.id}"`);
                productMRPObj[0].active = true;
                productMRPObj[0].syncAction = null;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }


  // Hard delete when active property is false or when active property and syncAction is delete

    hardDeleteProductMRP(productMRP) {
        try {
            realm.write(() => {
                let productMRPs = realm.objects('ProductMRP');
                let deleteProductMRP = productMRPs.filtered(`id = "${productMRP.id}"`);
                realm.delete(deleteProductMRP);
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    softDeleteProductMRP(productMRP) {
        try {
            realm.write(() => {
                realm.write(() => {
                    let productMRPObj = realm.objects('ProductMRP').filtered(`id = "${productMRP.id}"`);
                    productMRPObj[0].syncAction = 'delete';
                })
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createManyProductMRP(productMRPs) {
        try {
            realm.write(() => {
                productMRPs.forEach(obj => {
                    realm.create('ProductMRP', obj);
                });
            });

        } catch (e) {
            console.log("Error on creation", e);
        }

    }
}

export default new ProductMRPRealm();
