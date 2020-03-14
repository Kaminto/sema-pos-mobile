import CreditRealm from '../../database/credit/credit.operations';
import CreditApi from '../api/credit.api';
import SettingRealm from '../../database/settings/settings.operations';
import * as _ from 'lodash';
let settings = SettingRealm.getAllSetting();
class CreditSync {

    synchronizeCredits() {
        return new Promise(resolve => {
            CreditApi.getTopUps(settings.siteId, CreditRealm.getLastCreditSync())
                .then(remoteCredit => {
                    let initlocalCredits = CreditRealm.getAllCreditByDate(CreditRealm.getLastCreditSync());
                    let localCredits = [...initlocalCredits];
                    let remoteInventories = [...remoteCredit.topup];
                    console.log('localCredits', localCredits);
                    console.log('remoteInventories', remoteInventories);
                    // if (initlocalCredits.length === 0) {
                    //     CreditRealm.createManycredits(remoteCredit.topup);
                    // }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalCredits.length > 0) {

                        // console.log('initlocalCredits', initlocalCredits);
                        // console.log('localCredits', localCredits);
                        // console.log('remoteInventories', remoteInventories);
                        initlocalCredits.forEach(localCredit => {
                            let filteredObj = remoteInventories.filter(obj => obj.topUpId === localCredit.topUpId)
                            console.log('filteredObj', filteredObj);
                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteInventories.map(function (e) { return e.topUpId }).indexOf(filteredObj[0].topUpId);
                                const localIndex = localCredits.map(function (e) { return e.topUpId }).indexOf(filteredObj[0].topUpId);
                                console.log('remoteIndex', remoteIndex);
                                console.log('localIndex', localIndex);
                                remoteInventories.splice(remoteIndex, 1);
                                localCredits.splice(localIndex, 1);

                                inLocal.push(localCredit);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localCredit);
                                const localIndex = localCredits.map(function (e) { return e.topUpId }).indexOf(localCredit.topUpId);
                                console.log('localIndex', localIndex);
                                localCredits.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteInventories);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            CreditRealm.createManycredits(onlyRemote);
                            CreditRealm.setLastCreditSync();
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localCredit => {
                                this.apiSyncOperations({...localCredit, kiosk_id: settings.siteId});
                            })
                        }

                        if (inLocal.length > 0 && inRemote.length > 0) {
                            inLocal.forEach(localCredit => {
                                this.apiSyncOperations({...localCredit, kiosk_id: settings.siteId});
                            })
                        }

                        // console.log('onlyRemote', onlyRemote);
                        // console.log('onlyLocally', onlyLocally);
                        // console.log('bothLocalRemote', bothLocalRemote);

                        // console.log('localCredits2', localCredits);
                        // console.log('remoteInventories2', remoteInventories);

                    }
                    resolve({
                        error: null,
                        localCredit: onlyLocally.length,
                        remoteCredit: onlyRemote.length
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getInventory - error ' + error
                    );
                    resolve({
                        error: error,
                        localCredit: 0,
                        remoteCredit: 0
                    });
                });
        });
    }

    apiSyncOperations(localCredit) {
        if (localCredit.active === true && localCredit.syncAction === 'delete') {
            CreditApi.deleteTopUp(
                localCredit
            )
                .then((response) => {
                    console.log(
                        'Synchronization:synchronizeOrder - Removing order from pending list - ' +
                        response
                    );
                    CreditRealm.setLastCreditSync();
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeOrder Delete Order failed ' +
                        error
                    );
                });
        }

        if (localCredit.active === true && localCredit.syncAction === 'update') {
            CreditApi.updateCustomerCredit(
                localCredit
            )
                .then((response) => {
                    // updateCount = updateCount + 1;
                    CreditRealm.setLastCreditSync();
                    console.log(
                        'Synchronization:synchronizeOrder - Removing Order from pending list - ' +
                        response
                    );
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeOrder Update Order failed ' +
                        error
                    );
                });

        }

        if (localCredit.active === false && localCredit.syncAction === 'update') {
            CreditApi.createTopUp(
                localCredit
            )
                .then((response) => {
                    // updateCount = updateCount + 1;
                    CreditRealm.synched(localCredit);
                    CreditRealm.setLastCreditSync();
                    console.log(
                        'Synchronization:synced to remote - ' +
                        response
                    );
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeOrder Create Order failed', error
                    );
                });
        }

        if (localCredit.active === false && localCredit.syncAction === 'delete') {
            CreditApi.createTopUp(
                localCredit
            )
                .then((response) => {
                    //  updateCount = updateCount + 1;
                    CreditRealm.synched(localCredit);
                    CreditRealm.setLastCreditSync();
                    console.log(
                        'Synchronization:synced to remote - ' +
                        response
                    );
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeOrder Create Order failed', error
                    );
                });
        }

        if (localCredit.active === false && localCredit.syncAction === 'create') {
            CreditApi.createTopUp(
                localCredit
            )
                .then((response) => {
                    //  updateCount = updateCount + 1;
                    CreditRealm.synched(localCredit);
                    CreditRealm.setLastCreditSync();
                    console.log(
                        'Synchronization:synced to remote - ',
                        response
                    );
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeOrder Create Order failed', error
                    );
                });
        }
    }


}
export default new CreditSync();
