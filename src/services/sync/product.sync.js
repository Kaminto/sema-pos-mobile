import ProductRealm from '../../database/products/product.operations';
import ProductApi from '../api/product.api';
import * as _ from 'lodash';

class ProductSync {

    synchronizeProducts() {
		return new Promise(resolve => {

            ProductApi.getProducts(ProductRealm.getLastProductsync())
            .then(remoteProduct => {
				console.log("Remote Products " + JSON.stringify(remoteProduct));
                let initlocalProducts = ProductRealm.getProductsByDate(ProductRealm.getLastProductsync());
                let localProducts = [...initlocalProducts];
                let remoteProducts = [...remoteProduct.products];

                if (initlocalProducts.length === 0) {
                    ProductRealm.createManyProducts(remoteProduct.products);
                    ProductRealm.setLastProductsync();

                }

                let onlyLocally = [];
                let onlyRemote = [];
                let inLocal = [];
                let inRemote = [];
                let bothLocalRemote = {};

                if (initlocalProducts.length > 0) {

                    initlocalProducts.forEach(localProduct => {
                        let filteredObj = remoteProducts.filter(obj => obj.productId === localProduct.productId)

                        if (filteredObj.length > 0) {
                            const remoteIndex = remoteProducts.map(function (e) { return e.productId }).indexOf(filteredObj[0].productId);
                            const localIndex = localProducts.map(function (e) { return e.productId }).indexOf(filteredObj[0].productId);

                            remoteProducts.splice(remoteIndex, 1);
                            localProducts.splice(localIndex, 1);

                            inLocal.push(localProduct);
                            inRemote.push(filteredObj[0]);
                        }

                        if (filteredObj.length === 0) {
                            onlyLocally.push(localProduct);
                            const localIndex = localProducts.map(function (e) { return e.productId }).indexOf(localProduct.productId);

                            localProducts.splice(localIndex, 1);
                        }
                    });

                    onlyRemote.push(...remoteProducts);
                    bothLocalRemote.inLocal = inLocal;
                    bothLocalRemote.inRemote = inRemote;


                    if (onlyRemote.length > 0) {
                        ProductRealm.createManyProducts(onlyRemote);
                        ProductRealm.setLastProductsync();
                    }

                }
                resolve({
                    error: null,
                    remoteProducts: onlyLocally.length + onlyRemote.length,
                });

            })
            .catch(error => {
                console.log(
                    'Synchronization.getProducts - error ' + error
                );
                resolve({
                    error: error,
                    remoteProducts: 0
                });
            });



		});
    }


}
export default new ProductSync();
