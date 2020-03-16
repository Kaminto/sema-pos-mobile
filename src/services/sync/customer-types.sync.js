import CustomerTypeRealm from '../../database/customer-types/customer-types.operations';
import CustomerTypeApi from '../api/customer-types.api';
import * as _ from 'lodash';

class CustomerTypeSync {

    synchronizeCustomerTypes() {
        return new Promise(resolve => {
            CustomerTypeApi.getCustomerTypes()
                .then(remoteCustomerType => {
                    let initlocalCustomerTypes = CustomerTypeRealm.getCustomerTypes();
                    let localCustomerTypes = [...initlocalCustomerTypes];
                    let remoteCustomerTypes = [...remoteCustomerType.customerTypes];
                    if (initlocalCustomerTypes.length === 0) {
                        CustomerTypeRealm.createManyCustomerTypes(remoteCustomerType.customerTypes);
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalCustomerTypes.length > 0) {
                        initlocalCustomerTypes.forEach(localCustomerType => {
                            let filteredObj = remoteCustomerTypes.filter(obj => obj.id === localCustomerType.id)
                             if (filteredObj.length > 0) {
                                const remoteIndex = remoteCustomerTypes.map(function (e) { return e.id }).indexOf(filteredObj[0].id);
                                const localIndex = localCustomerTypes.map(function (e) { return e.id }).indexOf(filteredObj[0].id);
                                remoteCustomerTypes.splice(remoteIndex, 1);
                                localCustomerTypes.splice(localIndex, 1);

                                inLocal.push(localCustomerType);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localCustomerType);
                                const localIndex = localCustomerTypes.map(function (e) { return e.id }).indexOf(localCustomerType.id);
                                 localCustomerTypes.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteCustomerTypes);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            CustomerTypeRealm.createManyCustomerTypes(onlyRemote);
                        }


                    }
                    resolve({
                        error: null,
                        customerTypes: onlyLocally.length + onlyRemote.length,
                    });

                })
                .catch(error => {

                    resolve({
                        error: error,
                        customerTypes: 0
                    });
                });
        });
    }

}
export default new CustomerTypeSync();
