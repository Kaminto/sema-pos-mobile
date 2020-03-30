import InventroyRealm from '../../database/inventory/inventory.operations';
import MeterReadingApi from '../api/meter-reading.api';
import SyncUtils from './syncUtils';
import * as _ from 'lodash';
import { parseISO, isSameDay, format, sub, set, add, getSeconds, getMinutes, getHours, compareAsc } from 'date-fns';
class MeterReadingSync {

    synchronizeMeterReading(kiosk_id) {
        return new Promise(resolve => {
            MeterReadingApi.getMeterReading(kiosk_id, InventroyRealm.getLastMeterReadingSync())
                .then(async remoteMeterReading => {
                    let initlocalMeterReadings = InventroyRealm.getAllMeterReadingByDate(InventroyRealm.getLastMeterReadingSync());
                    
                    console.log('initlocalMeterReadings', initlocalMeterReadings);
                    console.log('remoteMeterReading', remoteMeterReading);
                    let onlyInLocal = initlocalMeterReadings.filter(SyncUtils.compareRemoteAndLocal(remoteMeterReading));
                    let onlyInRemote = remoteMeterReading.filter(SyncUtils.compareRemoteAndLocal(initlocalMeterReadings));

                    let syncResponseArray = [];
                    console.log('onlyInLocal', onlyInLocal);
                    console.log('onlyInRemote', onlyInRemote);
                    if (onlyInLocal.length > 0) {

                        for (const property in onlyInLocal) {
                            let syncResponse = await this.apiSyncOperations({
                                ...onlyInLocal[property],
                                kiosk_id
                            });
                            syncResponseArray.push(syncResponse);
                        }

                    }

                    if (onlyInRemote.length > 0) {
                        let localResponse = await InventroyRealm.createManyMeterReading(onlyInRemote);
                        
                        //syncResponseArray.concat(localResponse)
                        syncResponseArray.push(...localResponse);
                        InventroyRealm.setLastMeterReadingSync();
                    }

                    console.log('syncResponseArray', syncResponseArray);

                    for (const i in syncResponseArray) {
                        if (syncResponseArray[i].status === "fail" && syncResponseArray[i].message === "Meter Reading has already been sent") {
                            InventroyRealm.deleteByMeterId(syncResponseArray[i].data.meter_reading_id);
                        }
                    }

                    resolve({
                        success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                        meterReading: onlyInLocal.concat(onlyInRemote).length,
                        successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                        successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success'
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getMeterReading - error ' + error
                    );
                    resolve({
                        error: true,
                        message: error,
                        meterReading: 0,
                    });
                });


        });
    }


    apiSyncOperations(localMeterReading) {
        return new Promise(resolve => {

            if (localMeterReading.active === true && localMeterReading.syncAction === 'delete') {
                return MeterReadingApi.deleteMeterReading(
                    localMeterReading
                )
                    .then((response) => {
                        console.log(
                            'Synchronization:synchronizeMeterReading - Removing MeterReading from pending list - ' +
                            response
                        );
                        InventroyRealm.setLastMeterReadingSync();
                        resolve({ status: 'success', message: response, data: localMeterReading });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeMeterReading Delete MeterReading failed ' +
                            error
                        );
                        return { status: 'fail', message: error, data: localMeterReading }
                    });
            }

            if (localMeterReading.active === true && localMeterReading.syncAction === 'update') {

                return MeterReadingApi.updateMeterReading(
                    localMeterReading
                )
                    .then((response) => {
                        InventroyRealm.setLastMeterReadingSync();
                        console.log(
                            'Synchronization:synchronizeMeterReading - Removing MeterReading from pending list - ' +
                            response
                        );
                        resolve({ status: 'success', message: 'synched to remote', data: localMeterReading });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeMeterReading Update MeterReading failed ' +
                            error
                        );
                        resolve({ status: 'fail', message: error, data: localMeterReading });
                    });

            }

            if (localMeterReading.active === false && localMeterReading.syncAction === 'update') {

                return MeterReadingApi.createMeterReading(
                    localMeterReading
                )
                    .then((response) => {
                        InventroyRealm.synchedMeterReading(localMeterReading);
                        InventroyRealm.setLastMeterReadingSync();
                        console.log(
                            'Synchronization:synced to remote - ' +
                            response
                        );
                        resolve({ status: 'success', message: 'synched to remote', data: localMeterReading });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeMeterReading Create MeterReading', error
                        );
                        resolve({ status: 'fail', message: error, data: localMeterReading });
                    });

            }

            if (localMeterReading.active === false && localMeterReading.syncAction === 'delete') {
                return MeterReadingApi.createMeterReading(
                    localMeterReading
                )
                    .then((response) => {
                        InventroyRealm.synchedMeterReading(localMeterReading);
                        InventroyRealm.setLastMeterReadingSync();
                        console.log(
                            'Synchronization:synced to remote - ' +
                            response
                        );
                        resolve({ status: 'success', message: response, data: localMeterReading });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeMeterReading Create MeterReading', error
                        );
                        return { status: 'fail', message: error, data: localMeterReading }
                    });

            }
            
            if (localMeterReading.active === false && localMeterReading.syncAction === 'create') {

                return MeterReadingApi.createMeterReading(
                    localMeterReading
                )
                    .then((response) => {
                        InventroyRealm.synchedMeterReading(localMeterReading);
                        InventroyRealm.setLastMeterReadingSync();
                        console.log(
                            'Synchronization:synced to remote - ' +
                            response
                        );
                        resolve({ status: 'success', message: 'synched to remote', data: localMeterReading });
                    })
                    .catch(error => {
                        console.log(
                            'Synchronization:synchronizeMeterReading Create MeterReading,', error
                        );
                        resolve({ status: 'fail', message: error, data: localMeterReading })
                    });

            }

        });

    }


}
export default new MeterReadingSync();
