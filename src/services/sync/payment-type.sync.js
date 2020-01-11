import PaymentTypeRealm from '../../database/payment_types/payment_types.operations';
import PaymentTypeApi from '../api/payment-types.api';
import * as _ from 'lodash';

class PaymentTypeSync {

    synchronizePaymentTypes() {
		return new Promise(resolve => {

            PaymentTypeApi.getPaymentTypes()
            .then(remotePaymentType => {
                let initlocalPaymentTypes = PaymentTypeRealm.getPaymentTypes();
                let localPaymentTypes = [...initlocalPaymentTypes];
                let remotePaymentTypes = [...remotePaymentType]; 

                console.log('initlocalPaymentTypes', initlocalPaymentTypes);
                console.log('localPaymentTypes', localPaymentTypes);
                console.log('remotePaymentTypes', remotePaymentTypes);

                if (initlocalPaymentTypes.length === 0) {
                    PaymentTypeRealm.createManyPaymentTypes(remotePaymentType);
                }

                let onlyLocally = [];
                let onlyRemote = [];
                let inLocal = [];
                let inRemote = [];
                let bothLocalRemote = {};

                if (initlocalPaymentTypes.length > 0) {
                  
                    initlocalPaymentTypes.forEach(localPaymentType => {
                        let filteredObj = remotePaymentTypes.filter(obj => obj.id === localPaymentType.id)
                         
                        if (filteredObj.length > 0) {
                            const remoteIndex = remotePaymentTypes.map(function (e) { return e.id }).indexOf(filteredObj[0].id);
                            const localIndex = localPaymentTypes.map(function (e) { return e.id }).indexOf(filteredObj[0].id);
                           
                            remotePaymentTypes.splice(remoteIndex, 1);
                            localPaymentTypes.splice(localIndex, 1);

                            inLocal.push(localPaymentType);
                            inRemote.push(filteredObj[0]);
                        }

                        if (filteredObj.length === 0) {
                            onlyLocally.push(localPaymentType);
                            const localIndex = localPaymentTypes.map(function (e) { return e.id }).indexOf(localPaymentType.id);
                            
                            localPaymentTypes.splice(localIndex, 1);
                        }
                    });

                    onlyRemote.push(...remotePaymentTypes);
                    bothLocalRemote.inLocal = inLocal;
                    bothLocalRemote.inRemote = inRemote;


                    if (onlyRemote.length > 0) {
                        PaymentTypeRealm.createManyPaymentTypes(onlyRemote)
                    }

                    console.log('onlyRemote', onlyRemote);
                    console.log('onlyLocally', onlyLocally);
                    console.log('bothLocalRemote', bothLocalRemote);

                   
                }
                resolve({
                    error: null,
                    remotePaymentTypes: onlyLocally.length + onlyRemote.length,
                });

            })
            .catch(error => {
                console.log(
                    'Synchronization.Payment Types - error ' + error
                );
                resolve({
                    error: error,
                    remotePaymentTypes: 0
                });
            });


		 
		});
    }
    
  
}
export default new PaymentTypeSync();