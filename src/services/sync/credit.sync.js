import CreditRealm from '../../database/credit/credit.operations';
import CreditApi from '../api/credit.api';
import SettingRealm from '../../database/settings/settings.operations';
import * as _ from 'lodash';
import SyncUtils from './syncUtils';
let settings = SettingRealm.getAllSetting();
class CreditSync {

    synchronizeCredits() {
        return new Promise(resolve => {
            CreditApi.getTopUps(settings.siteId, CreditRealm.getLastCreditSync())
                .then(async remoteCredit => {
                    let initlocalCredits = CreditRealm.getAllCreditByDate(CreditRealm.getLastCreditSync());
                    let localCredits = [...initlocalCredits];
                    let remoteTopUps = [...remoteCredit.topup];

                    
                    let onlyInLocal = localCredits.filter(SyncUtils.compareRemoteAndLocal(remoteTopUps,'topUpId'));
                    let onlyInRemote = remoteTopUps.filter(SyncUtils.compareRemoteAndLocal(localCredits,'topUpId'));

                    let syncResponseArray = [];
                    if (onlyInRemote.length > 0) {
                        let localResponse = await CreditRealm.createManycredits(onlyInRemote);
                        syncResponseArray.push(...localResponse);
                        CreditRealm.setLastCreditSync();
                    }


                    if (onlyInLocal.length > 0) {

                        for (const property in onlyInLocal) {
                            let syncResponse = await this.apiSyncOperations({...onlyInLocal[property], kiosk_id: settings.siteId});
                            syncResponseArray.push(syncResponse);
                        }

                    }


                    resolve({
                        success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                        topups: onlyInLocal.concat(onlyInRemote).length,
                        successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                        successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success'
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getCredit - error ' + error
                    );
                    resolve({
						error: false,
                        topups: 0,
					});
                });
        });
    }

    apiSyncOperations(localCredit) {
        return new Promise(resolve => {

        if (localCredit.active === true && localCredit.syncAction === 'delete') {
            CreditApi.deleteTopUp(
                localCredit
            )
                .then((response) => {
                    console.log(
                        'Synchronization:synchronizeCredit - Removing Credit from pending list - ' +
                        response
                    );
                    CreditRealm.setLastCreditSync();
                    resolve({ status: 'success', message: response, data: localCredit });
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeCredit Delete Credit failed ' +
                        error
                    );
                    return { status: 'fail', message: error, data: localCredit }
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
                        'Synchronization:synchronizeCredit - Removing Credit from pending list - ' +
                        response
                    );
                    resolve({ status: 'success', message: 'synched to remote', data: localCredit });
                
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeCredit Update Credit failed ' +
                        error
                    );
                    resolve({ status: 'fail', message: error, data: localCredit });
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
                    resolve({ status: 'success', message: 'synched to remote', data: localCredit });
                   
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeCredit Create Credit failed', error
                    );
                    resolve({ status: 'fail', message: 'error', data: localCredit });
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
                    resolve({ status: 'success', message: 'synched to remote', data: localCredit });
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeCredit Create Credit failed', error
                    );
                    resolve({ status: 'fail', message: 'error', data: localCredit });
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
                    resolve({ status: 'success', message: 'synched to remote', data: localCredit });
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeCredit Create Credit failed', error
                    );
                    resolve({ status: 'fail', message: 'error', data: localCredit });
                });
        }

    });
    }


}
export default new CreditSync();
