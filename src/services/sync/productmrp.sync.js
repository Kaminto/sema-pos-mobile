import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import ProductApi from '../api/product.api';
import * as _ from 'lodash';

class ProductMRPSync {

    synchronizeProductMrps() {
        return new Promise(resolve => {
            ProductApi.getProductMrps(null, false)
                .then(remoteProductMRP => {
                    let initlocalProductMRPs = ProductMRPRealm.getProductMRPS();
                    let localProductMRPs = [...initlocalProductMRPs];
                    let remoteProductMRPs = [...remoteProductMRP.productMRPs];
                    console.log('initlocalProductMRPs', initlocalProductMRPs);
                    console.log('localProductMRPs', localProductMRPs);
                    console.log('remoteProductMRPs', remoteProductMRPs);
                    if (initlocalProductMRPs.length === 0) {
                        ProductMRPRealm.createManyProductMRP(remoteProductMRP.productMRPs);
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalProductMRPs.length > 0) {

                        console.log('initlocalProductMRPs', initlocalProductMRPs);
                        console.log('localProductMRPs', localProductMRPs);
                        console.log('remoteProductMRPs', remoteProductMRPs);
                        initlocalProductMRPs.forEach(localProductMRP => {
                            let filteredObj = remoteProductMRPs.filter(obj => obj.id === localProductMRP.id)
                            console.log('filteredObj', filteredObj);
                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteProductMRPs.map(function (e) { return e.id }).indexOf(filteredObj[0].id);
                                const localIndex = localProductMRPs.map(function (e) { return e.id }).indexOf(filteredObj[0].id);
                                console.log('remoteIndex', remoteIndex);
                                console.log('localIndex', localIndex);
                                remoteProductMRPs.splice(remoteIndex, 1);
                                localProductMRPs.splice(localIndex, 1);

                                inLocal.push(localProductMRP);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localProductMRP);
                                const localIndex = localProductMRPs.map(function (e) { return e.id }).indexOf(localProductMRP.id);
                                console.log('localIndex', localIndex);
                                localProductMRPs.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteProductMRPs);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            ProductMRPRealm.createManyProductMRP(onlyRemote)
                        }

                        console.log('onlyRemote', onlyRemote);
                        console.log('onlyLocally', onlyLocally);
                        console.log('bothLocalRemote', bothLocalRemote);
 
                       
                    }
                    resolve({
                        error: null,
                        remoteProductMrps: onlyLocally.length + onlyRemote.length,
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getInventory - error ' + error
                    );
                    resolve({
                        error: error.message,
                        remoteProductMrps: 0
                    });
                });
        });
    }

    synchronizeProductMrpsBySiteid(siteId) {
		return new Promise(async resolve => {
			console.log('Synchronization:synchronizeProductMrps - Begin');
			Communications.getProductMrpsBySiteId(siteId)
				.then(productMrps => {
					if (productMrps.hasOwnProperty('productMRPs')) {
						console.log(
							'Synchronization:synchronizeProductMrps. No of remote product MRPs: ' +
							productMrps.productMRPs.length
						);
						if (
							!_.isEqual(
								savedProductMrps,
								productMrps.productMRPs
							)
						) {
							PosStorage.saveProductMrps(productMrps.productMRPs);
							Events.trigger('ProductMrpsUpdated', {});
						}
						resolve({
							error: null,
							remoteProductMrps: productMrps.productMRPs.length
						});
					}
				})
				.catch(error => {
					resolve({ error: error.message, remoteProducts: null });
					console.log(
						'Synchronization.ProductsMrpsUpdated - error ' + error
					);
				});
		});
	}

}
export default new ProductMRPSync();