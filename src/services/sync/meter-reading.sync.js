import InventroyRealm from '../../database/inventory/inventory.operations';
import MeterReadingApi from '../api/meter-reading.api';
import * as _ from 'lodash';

class MeterReadingSync {

    synchronizeMeterReading(lastMeterReadingSync) {
        return new Promise(resolve => {
            MeterReadingApi.getMeterReading(new Date(lastMeterReadingSync))
                .then(remoteMeterReading => {
                    let initlocalMeterReadings = InventroyRealm.getAllMeterReading();
                    let localMeterReadings = [...initlocalMeterReadings];
                    let remoteMeterReadings = [...remoteMeterReading.data];
                    console.log('remoteMeterReading', remoteMeterReading);
                    console.log('initlocalMeterReadings', initlocalMeterReadings);
                    if (initlocalMeterReadings.length === 0) {
                        InventroyRealm.createManyMeterReadings(remoteMeterReading.data);
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalMeterReadings.length > 0) {

                        initlocalMeterReadings.forEach(localMeterReading => {
                            let filteredObj = remoteMeterReadings.filter(obj => obj.meter_reading_id === localMeterReading.meter_reading_id)

                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteMeterReadings.map(function (e) { return e.meter_reading_id }).indexOf(filteredObj[0].meter_reading_id);
                                const localIndex = localMeterReadings.map(function (e) { return e.meter_reading_id }).indexOf(filteredObj[0].meter_reading_id);

                                remoteMeterReadings.splice(remoteIndex, 1);
                                localMeterReadings.splice(localIndex, 1);

                                inLocal.push(localMeterReading);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localMeterReading);
                                const localIndex = localMeterReadings.map(function (e) { return e.meter_reading_id }).indexOf(localMeterReading.meter_reading_id);

                                localMeterReadings.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteMeterReadings);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            InventroyRealm.createManyMeterReadings(onlyRemote)
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localMeterReading => {
                                MeterReadingApi.createMeterReading(
                                    localMeterReading
                                )
                                    .then((response) => {
                                        InventroyRealm.synched(localMeterReading);
                                        console.log(
                                            'Synchronization:synced to remote - ' +
                                            response
                                        );
                                    })
                                    .catch(error => {
                                        console.log(
                                            'Synchronization:synchronizeMeterReading Create MeterReading failed'
                                        );
                                    });
                            })
                        }

                        if (inLocal.length > 0 && inRemote.length > 0) {
                            inLocal.forEach(localMeterReading => {

                                if (localMeterReading.active === true && localMeterReading.syncAction === 'delete') {
                                    MeterReadingApi.deleteMeterReading(
                                        localMeterReading
                                    )
                                        .then((response) => {
                                            console.log(
                                                'Synchronization:synchronizeMeterReading - Removing MeterReading from pending list - ' +
                                                response
                                            );
                                            InventroyRealm.hardDeleteMeterReading(
                                                localMeterReading
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeMeterReading Delete MeterReading failed ' +
                                                error
                                            );
                                        });
                                }

                                if (localMeterReading.active === true && localMeterReading.syncAction === 'update') {
                                    MeterReadingApi.updateMeterReading(
                                        localMeterReading
                                    )
                                        .then((response) => {
                                            console.log(
                                                'Synchronization:synchronizeMeterReading - Removing MeterReading from pending list - ' +
                                                response
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeMeterReading Update MeterReading failed ' +
                                                error
                                            );
                                        });

                                } else if (localMeterReading.active === false && localMeterReading.syncAction === 'update') {
                                    MeterReadingApi.createMeterReading(
                                        localMeterReading
                                    )
                                        .then((response) => {
                                            InventroyRealm.synched(localMeterReading);
                                            console.log(
                                                'Synchronization:synced to remote - ' +
                                                response
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeMeterReading Create MeterReading failed'
                                            );
                                        });
                                }
                            })
                        }

                    }
                    resolve({
                        error: null,
                        localMeterReading: onlyLocally.length,
                        remoteMeterReading: onlyRemote.length
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getMeterReading - error ' + error
                    );
                    resolve({
                        error: error,
                        localMeterReading: 0,
                        remoteMeterReading: 0
                    });
                });
        });
    }

}
export default new MeterReadingSync();