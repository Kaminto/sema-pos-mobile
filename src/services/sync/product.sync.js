import ProductRealm from '../../database/products/product.operations';
import ProductApi from '../api/product.api';
import * as _ from 'lodash';

class ProductSync {

    synchronizeProducts() {
		return new Promise(resolve => {

            ProductApi.getProducts()
            .then(remoteProduct => {
                let initlocalProducts = ProductRealm.getProducts();
                let localProducts = [...initlocalProducts];
                let remoteProducts = [...remoteProduct.products]; 

                console.log('initlocalProducts', initlocalProducts);
                console.log('localProducts', localProducts);
                console.log('remoteProducts', remoteProducts);

                if (initlocalProducts.length === 0) {
                    ProductRealm.createManyProducts(remoteProduct.products);
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
                        ProductRealm.createManyProducts(onlyRemote)
                    }

                    console.log('onlyRemote', onlyRemote);
                    console.log('onlyLocally', onlyLocally);
                    console.log('bothLocalRemote', bothLocalRemote);

                   
                }
                resolve({
                    error: null,
                    remoteProducts: onlyLocally.length + onlyRemote.length,
                });

            })
            .catch(error => {
                console.log(
                    'Synchronization.getInventory - error ' + error
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