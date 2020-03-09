import CreditRealm from '../../database/credit/credit.operations';
import CreditApi from '../api/credit.api';
import * as _ from 'lodash';

class CreditSync {

    synchronizeCredits(lastCreditSync) {
        return new Promise(resolve => {
            CreditApi.getTopUps()
                .then(remoteCredit => {
                    let initlocalCredits = CreditRealm.getAllCredit();
                    let localCredits = [...initlocalCredits];
                    let remoteInventories = [...remoteCredit.topup];
                    if (initlocalCredits.length === 0) {
                        CreditRealm.createManycredits(remoteCredit.topup);
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalCredits.length > 0) {
                        initlocalCredits.forEach(localCredit => {
                            let filteredObj = remoteInventories.filter(obj => obj.topUpId === localCredit.topUpId)

                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteInventories.map(function (e) { return e.topUpId }).indexOf(filteredObj[0].topUpId);
                                const localIndex = localCredits.map(function (e) { return e.topUpId }).indexOf(filteredObj[0].topUpId);

                                remoteInventories.splice(remoteIndex, 1);
                                localCredits.splice(localIndex, 1);

                                inLocal.push(localCredit);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localCredit);
                                const localIndex = localCredits.map(function (e) { return e.topUpId }).indexOf(localCredit.topUpId);

                                localCredits.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteInventories);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            CreditRealm.createManyInventories(onlyRemote)
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localCredit => {
                                CreditApi.createTopUp(
                                    localCredit
                                )
                                    .then((response) => {
                                        CreditRealm.synched(localCredit);
                                        console.log(
                                            'Synchronization:synced to remote - ' +
                                            response
                                        );
                                    })
                                    .catch(error => {
                                        console.log(
                                            'Synchronization:synchronizeCredit Create Credit failed'
                                        );
                                    });
                            })
                        }

                        if (inLocal.length > 0 && inRemote.length > 0) {
                            inLocal.forEach(localCredit => {

                                if (localCredit.active === true && localCredit.syncAction === 'delete') {
                                    CreditApi.deleteTopUp(
                                        localCredit
                                    )
                                        .then((response) => {
                                            console.log(
                                                'Synchronization:synchronizeCredit - Removing Credit from pending list - ' +
                                                response
                                            );
                                            CreditRealm.hardDeleteCredit(
                                                localCredit
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeCredit Delete Credit failed ' +
                                                error
                                            );
                                        });
                                }

                                if (localCredit.active === true && localCredit.syncAction === 'update') {
                                    CreditApi.updateCustomerCredit(
                                        localCredit
                                    )
                                        .then((response) => {
                                            console.log(
                                                'Synchronization:synchronizeCredit - Removing Credit from pending list - ' +
                                                response
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeCredit Update Credit failed ' +
                                                error
                                            );
                                        });

                                } else if (localCredit.active === false && localCredit.syncAction === 'update') {
                                    CreditApi.createTopUp(
                                        localCredit
                                    )
                                        .then((response) => {
                                            CreditRealm.synched(localCredit);
                                            console.log(
                                                'Synchronization:synced to remote - ' +
                                                response
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeCredit Create Credit failed'
                                            );
                                        });
                                }
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
                        'Synchronization.getCredit - error ' + error
                    );
                    resolve({
                        error: error,
                        localCredit: 0,
                        remoteCredit: 0
                    });
                });
        });
    }

}
export default new CreditSync();
