import DiscountRealm from '../../database/discount/discount.operations';
import DiscountApi from '../api/discounts.api';
import * as _ from 'lodash';

class DiscountSync {

    synchronizeDiscount(siteId) {
        return new Promise(resolve => {
            DiscountApi.getDiscounts(siteId)
                .then(remoteDiscount => {
                    let initlocalDiscounts = DiscountRealm.getDiscounts();
                    let localDiscounts = [...initlocalDiscounts];
                    let remoteDiscounts = [...remoteDiscount.promotion];
                    if (initlocalDiscounts.length === 0) {
                        DiscountRealm.createManyDiscount(remoteDiscount.promotion);
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalDiscounts.length > 0) {

                        initlocalDiscounts.forEach(localDiscount => {
                            let filteredObj = remoteDiscounts.filter(obj => obj.id === localDiscount.id)

                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteDiscounts.map(function (e) { return e.id }).indexOf(filteredObj[0].id);
                                const localIndex = localDiscounts.map(function (e) { return e.id }).indexOf(filteredObj[0].id);

                                remoteDiscounts.splice(remoteIndex, 1);
                                localDiscounts.splice(localIndex, 1);

                                inLocal.push(localDiscount);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localDiscount);
                                const localIndex = localDiscounts.map(function (e) { return e.id }).indexOf(localDiscount.id);

                                localDiscounts.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteDiscounts);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            DiscountRealm.createManyDiscount(onlyRemote)
                        }



                    }
                    resolve({
                        error: null,
                        remoteDiscounts: onlyLocally.length + onlyRemote.length,
                    });

                })
                .catch(error => {
                    console.log(
                        'Get Remtote Discounts - error ' + error
                    );
                    resolve({
                        error: error,
                        remoteDiscounts: 0
                    });
                });
        });
    }



}
export default new DiscountSync();
