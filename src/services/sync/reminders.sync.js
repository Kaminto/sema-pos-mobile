import ReminderRealm from '../../database/reminders/reminder.operations';
import CustomerDebtApi from '../api/customer-debt.api';
import SettingRealm from '../../database/settings/settings.operations';
import * as _ from 'lodash';
let settings = SettingRealm.getAllSetting();
class ReminderSync {

    synchronizeReminder(lastReminderSync) {
        return new Promise(resolve => {
            CustomerDebtApi.getReminder(settings.siteId, new Date(lastReminderSync))
                .then(result => {
                    let initlocalReminder = ReminderRealm.getReminder();
                    
                    let localReminder = initlocalReminder.length > 0 ? [...initlocalReminder] : [];
                    let remoteReminder = result.length > 0 ? [...result] : [];

                    if (initlocalReminder.length === 0) {
                        ReminderRealm.createManyCustomerDebt(result, null);
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalReminder.length > 0) {

                        initlocalReminder.forEach(localCustomerDebt => {
                            let filteredObj = remoteReminder.filter(obj => obj.receipt_payment_type_id === localCustomerDebt.receipt_payment_type_id)
                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteReminder.map(function (e) { return e.receipt_payment_type_id }).indexOf(filteredObj[0].receipt_payment_type_id);
                                const localIndex = localReminder.map(function (e) { return e.receipt_payment_type_id }).indexOf(filteredObj[0].receipt_payment_type_id);
                                remoteReminder.splice(remoteIndex, 1);
                                localReminder.splice(localIndex, 1);

                                inLocal.push(localCustomerDebt);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localCustomerDebt);
                                const localIndex = localReminder.map(function (e) { return e.receipt_payment_type_id }).indexOf(localCustomerDebt.receipt_payment_type_id);
                                localReminder.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteReminder);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            ReminderRealm.createCustomerDebt(onlyRemote, null)
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localCustomerDebt => {
                                CustomerDebtApi.createCustomerDebt(
                                    { ...localCustomerDebt, kiosk_id: settings.siteId }
                                )
                                    .then((response) => {
                                        ReminderRealm.synched(localCustomerDebt);
                                        console.log(
                                            'Synchronization:synced to remote - ' +
                                            response
                                        );
                                    })
                                    .catch(error => {
                                        console.log(
                                            'Synchronization:synchronizeReminders Create Reminders failed'
                                        );
                                    });
                            })
                        }

                        if (inLocal.length > 0 && inRemote.length > 0) {
                            inLocal.forEach(localCustomerDebt => {

                                if (localCustomerDebt.active === true && localCustomerDebt.syncAction === 'delete') {
                                    CustomerDebtApi.deleteCustomerDebt(
                                        localCustomerDebt
                                    )
                                        .then((response) => {
                                            console.log(
                                                'Synchronization:synchronizeReminders - Removing Reminders from pending list - ' +
                                                response
                                            );
                                            ReminderRealm.hardDeleteCustomerDebt(
                                                localCustomerDebt
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeReminders Delete Reminders failed ' +
                                                error
                                            );
                                        });
                                }

                                if (localCustomerDebt.active === true && localCustomerDebt.syncAction === 'update') {
                                    CustomerDebtApi.updateCustomerDebt(
                                        localCustomerDebt
                                    )
                                        .then((response) => {
                                            console.log(
                                                'Synchronization:synchronizeReminders - Removing Reminders from pending list - ' +
                                                response
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeReminders Update Reminders failed ' +
                                                error
                                            );
                                        });

                                } else if (localCustomerDebt.active === false && localCustomerDebt.syncAction === 'update') {
                                    CustomerDebtApi.createCustomerDebt(
                                        localCustomerDebt
                                    )
                                        .then((response) => {
                                            ReminderRealm.synched(localCustomerDebt);
                                            console.log(
                                                'Synchronization:synced to remote - ' +
                                                response
                                            );
                                        })
                                        .catch(error => {
                                            console.log(
                                                'Synchronization:synchronizeReminders Create Reminders failed'
                                            );
                                        });
                                }
                            })
                        }



                    }
                    resolve({
                        error: null,
                        localCustomerDebt: onlyLocally.length,
                        result: onlyRemote.length
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getReminders - error ' + error
                    );
                    resolve({
                        error: error,
                        localCustomerDebt: 0,
                        result: 0
                    });
                });
        });
    }

}
export default new ReminderSync();
