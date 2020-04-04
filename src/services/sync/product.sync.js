import ProductRealm from '../../database/products/product.operations';
import ProductApi from '../api/product.api';
import SyncUtils from './syncUtils';
import * as _ from 'lodash';

class ProductSync {

    synchronizeProducts() {
		return new Promise(resolve => {

            ProductApi.getProducts(ProductRealm.getLastProductsync())
            .then(async remoteProduct => {
                let initlocalProducts = ProductRealm.getProductsByDate(ProductRealm.getLastProductsync());
                let localProducts = initlocalProducts.length > 0 ?  [...initlocalProducts] : [];
                let remoteProducts = remoteProduct.products.length > 0 ?  [...remoteProduct.products] : [];


                let onlyInLocal = localProducts.filter(SyncUtils.compareRemoteAndLocal(remoteProducts, 'id'));
                let onlyInRemote = remoteProducts.filter(SyncUtils.compareRemoteAndLocal(localProducts, 'id'));



                let syncResponseArray = [];
                if (onlyInLocal.length > 0) {
                    for (const property in onlyInLocal) {

                    }
                }

                if (onlyInRemote.length > 0) {
                    let localResponse = await ProductRealm.createManyProducts(onlyInRemote);
                    syncResponseArray.push(...localResponse);
                    ProductRealm.setLastProductsync();
                }


                resolve({
                    success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                    products: onlyInLocal.concat(onlyInRemote).length,
                    successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                    successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success'
                });

            })
            .catch(error => {
                console.log(
                    'Synchronization.getProducts - error ' + error
                );
                resolve({
                    error: true,
                    products: 0
                });
            });



		});
    }


}
export default new ProductSync();
