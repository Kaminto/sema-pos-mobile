import { capitalizeWord } from '../services/Utilities';
import moment from 'moment-timezone';

import PosStorage from '../database/PosStorage';
let realm = PosStorage.realm;

const uuidv1 = require('uuid/v1');

const topUpKey = '@Sema:TopUpsKey';
const topUpItemKey = '@Sema:TopUpItemKey';
const lastTopUpSyncKey = '@Sema:LastTopUpSyncKey';
const pendingTopUpsKey = '@Sema:PendingTopUpsKey';

class TopUps {
    constructor() {
        // TopUps are saved in the form topUpItemKey + TopUp.id
        // For example "@Sema:TopUpItemKey_ea6c365a-7338-11e8-a3c9-ac87a31a5361"
        // Array of topUp keys
        this.topUpKeys = [];
        this.topUp = []; // De-referenced topUp
        // Last sync DateTime is the last date time that items were synchronized with the server
        let firstSyncDate = new Date('November 7, 1973');
        this.lastTopUpSync = firstSyncDate;

        // Pending topUp is the array of topUp, stored locally but not yet sent to the server
        this.pendingTopUps = [];
    }

    initialiseTable() {
        let keyArray = [
            [topUpKey, this.stringify(this.topUpKeys)],
            [
                lastTopUpSyncKey,
                this.lastTopUpSync.toISOString()
            ],
            [
                pendingTopUpsKey,
                this.stringify(this.pendingTopUps)
            ],
        ]
        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected : ' + rows);
                return true;

            })
            .catch(error => {
                console.log(error);
                return false;
            });
        return 'Local DB Initialised';
    }

    loadTableData() {
        let keyArray = [
            topUpKey,
            lastTopUpSyncKey,
            pendingTopUpsKey,
        ];

        let results = this.getMany(keyArray);
        this.topUpKeys = this.parseJson(
            results[0][1]
        );
        this.lastTopUpSync = new Date(results[1][1]); // Last topUp sync time
        this.pendingTopUps = this.parseJson(
            results[2][1]
        ); // Array of pending topUp
        return 'Data Exists';
    }

    clearDataOnly() {
        this.topUp = [];
        this.topUpKeys = [];
        this.pendingTopUps = [];
        let firstSyncDate = new Date('November 7, 1973');
        this.lastTopUpSync = firstSyncDate;
        let keyArray = [
            [topUpKey, this.stringify(this.topUpKeys)],
            [lastTopUpSyncKey, this.lastTopUpSync.toISOString()],
            [pendingTopUpsKey, this.stringify(this.pendingTopUps)],
        ]

        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected Rows: ' + rows);
            })
            .catch(error => {
                console.log('PosStorage:clearDataOnly: Error: ' + error);
            });
    }

    clearDataBeforeSynch() {
        this.topUp = [];
        this.topUpKeys = [];
        let firstSyncDate = new Date('November 7, 1973');
        this.lastTopUpSync = firstSyncDate;
        this.pendingTopUps = [];
        let keyArray = [
            [topUpKey, this.stringify(this.topUpKeys)],
            [lastTopUpSyncKey, this.lastTopUpSync.toISOString()],
            [pendingTopUpsKey, this.stringify(this.pendingTopUps)],
        ]
        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected rows ' + rows);
            })
            .catch(error => {
                console.log('PosStorage:clearDataOnly: Error: ' + error);
            });
    }


    makeTopUpKey(topUp) {
        return topUpItemKey + '_' + topUp.topUpId;
    }

    topUpIdFromKey(topUpKey) {
        const prefix = topUpItemKey + '_';
        return topUpKey.slice(prefix.length);
    }


    createTopUp(
        customer_account_id,
        topup,
        balance
    ) {
        const now = new Date();
        return this.createTopUpFull(
            customer_account_id,
            topup,
            balance,
            now,
            now,
        );
    }

    createTopUpFull(
        customer_account_id,
        topup,
        balance,
        createdDate,
        updatedDate,
    ) {
        const newTopUp = {
            topUpId: uuidv1(),
            customer_account_id,
            topup,
            balance,
            createdDate: createdDate,
            updatedDate: updatedDate,
        };

        let key = this.makeTopUpKey(newTopUp);
        this.topUp.push(newTopUp);
        newTopUp.syncAction = 'create';
        this.topUpKeys.push(key);
        this.pendingTopUps.push(key);
        let keyArray = [
            [topUpKey, this.stringify(this.topUpKeys)], // Array of topUp keys
            [key, this.stringify(newTopUp)], // The new topUp
            [pendingTopUpsKey, this.stringify(this.pendingTopUps)] // Array pending topUp
        ];

        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected rows ' + rows);
            })
            .catch(error => {
                console.log('PosStorage:createTopUp: Error: ' + error);
            });
        return newTopUp;
    }

    deleteTopUp(topUp) {
        let key = this.makeTopUpKey(topUp);
        let index = this.topUp.indexOf(topUp);
        if (index > -1) {
            let topUp = this.topUp[index];
            topUp.syncAction = 'delete';
            this.topUp.splice(index, 1);
            index = this.topUpKeys.indexOf(key);
            if (index > -1) {
                this.topUpKeys.splice(index, 1);
            }
            this.pendingTopUps.push(key);
            let keyArray = [
                [topUpKey, this.stringify(this.topUpKeys)], // Array of topUp keys
                [key, this.stringify(topUp)], // The topUp being deleted
                [pendingTopUpsKey, this.stringify(this.pendingTopUps)] // Array pending topUp
            ];

            this.multiSet(keyArray)
                .then(rows => {
                    console.log('Affected rows: ' + rows);
                })
                .catch(error => {
                    console.log('PosStorage:deleteTopUp: Error: ' + error);
                });
        }
    }

    // TODO: Only accept the new topUp object
    updateTopUp(
        topUp,
        customer_account_id,
        topup,
        balance,
    ) {
        let key = this.makeTopUpKey(topUp);
        topUp.customer_account_id = customer_account_id;
        topUp.topup = topup;
        topUp.balance = balance;
        topUp.updatedDate = new Date();
        topUp.syncAction = 'update';

        
        this.pendingTopUps.push(key);

        let keyArray = [
            [key, this.stringify(topUp)], // TopUp keys
            [pendingTopUpsKey, this.stringify(this.pendingTopUps)] // Array pending topUp
        ];

        this.multiSet(keyArray)
            .then(rows => {
                console.log('Affected rows ' + rows);
            })
            .catch(error => {
                console.log('PosStorage:updateTopUp: Error: ' + error);
            });
    }

    addRemoteTopUps(topUpArray) {
        console.log(
            'PosStorage:addTopUps: No existing topUp no need to merge....'
        );
        this.topUp = [];
        let keyValueArray = [];
        let keyArray = [];
        for (let index = 0; index < topUpArray.length; index++) {
            if (topUpArray[index].active) {
                keyValueArray.push([
                    this.makeTopUpKey(topUpArray[index]),
                    this.stringify(topUpArray[index])
                ]);
                keyArray.push(this.makeTopUpKey(topUpArray[index]));
                this.topUp.push(topUpArray[index]);
            }
        }
        this.topUpKeys = keyArray;
        keyValueArray.push([topUpKey, this.stringify(keyArray)]);

        this.multiSet(keyValueArray)
            .then(rows => {
                console.log('Affected rows: ' + rows);
            })
            .catch(error => {
                console.log('PosStorage:addTopUps: Error: ' + error);
            });
    }

    // Merge new topUp into existing ones
    mergeTopUps(remoteTopUps) {
        console.log(
            'PosStorage:mergeTopUps Number of remote topUp: ' +
            remoteTopUps.length
        );
        let newTopUpsAdded = remoteTopUps.length > 0 ? true : false;
        if (this.topUp.length == 0) {
            this.addRemoteTopUps(remoteTopUps);
            return {
                pendingTopUps: this.pendingTopUps.slice(),
                updated: newTopUpsAdded
            };
        } else {
            // Need to merge webTopUps with existing and pending topUp
            console.log(
                'PosStorage:mergeTopUps. Merging ' +
                remoteTopUps.length +
                ' web TopUps into existing and pending topUp'
            );
            let webTopUpsToUpdate = [];
            let isPendingModified = false;
            remoteTopUps.forEach(remoteTopUp => {
                const webTopUpKey = this.makeTopUpKey(remoteTopUp);
                const pendingIndex = this.pendingTopUps.indexOf(
                    webTopUpKey
                );
                if (pendingIndex != -1) {
                    let localTopUp = this.getLocalTopUp(
                        remoteTopUp.topUpId
                    );
                    if (localTopUp) {
                        console.log(
                            'PostStorage - mergeTopUps. Local Date ' +
                            new Date(localTopUp.updatedDate) +
                            ' Remote Date ' +
                            remoteTopUp.updatedDate
                        );
                    }
                    if (
                        localTopUp &&
                        remoteTopUp.updatedDate >
                        new Date(localTopUp.updatedDate)
                    ) {
                        // remoteTopUp is the latest
                        console.log(
                            'PostStorage - mergeTopUps. Remote topUp ' +
                            remoteTopUp.name +
                            ' is later:'
                        );
                        webTopUpsToUpdate.push(remoteTopUp);
                        this.pendingTopUps.splice(pendingIndex, 1);
                        isPendingModified = true;
                    } else {
                        console.log(
                            'PostStorage - mergeTopUps. Local topUp ' +
                            localTopUp.name +
                            ' is later:'
                        );
                    }
                } else {
                    webTopUpsToUpdate.push(remoteTopUp);
                }
            });
            if (isPendingModified) {
                this.setKey(
                    pendingTopUpsKey,
                    this.stringify(this.pendingTopUps)
                );
            }
            this.mergeRemoteTopUps(webTopUpsToUpdate);
            return {
                pendingTopUps: this.pendingTopUps.slice(),
                updated: newTopUpsAdded
            };
        }
    }

    mergeRemoteTopUps(remoteTopUps) {
        let isNewTopUps = false;
        remoteTopUps.forEach(
            function (topUp) {
                let topUpKey = this.makeTopUpKey(topUp);
                let keyIndex = this.topUpKeys.indexOf(topUpKey);
                if (keyIndex === -1) {
                    if (topUp.active) {
                        isNewTopUps = true;
                        this.topUpKeys.push(topUpKey);
                        this.topUp.push(topUp);
                        this.setKey(topUpKey, this.stringify(topUp));
                    }
                } else {
                    if (topUp.active) {
                        this.setKey(topUpKey, this.stringify(topUp)); // Just update the existing topUp
                        this.setLocalTopUp(topUp);
                    } else {
                        // Remove an inactivated topUp
                        let index = this.getLocalTopUpIndex(
                            topUp.topUpId
                        );
                        if (index > -1) {
                            this.topUp.splice(index, 1);
                            index = this.topUpKeys.indexOf(topUpKey);
                            if (index > -1) {
                                this.topUpKeys.splice(index, 1);
                            }
                            let keyArray = [
                                [
                                    topUpKey,
                                    this.stringify(this.topUpKeys)
                                ], // Array of topUp keys
                                [topUpKey, this.stringify(topUp)] // The topUp being deleted
                            ];

                            this.multiSet(keyArray)
                                .then(rows => {
                                    console.log('Affected rows ' + rows);
                                })
                                .catch(error => {
                                    console.log(
                                        'PosStorage:mergeRemoteTopUps: Error: ' +
                                        error
                                    );
                                });
                        }
                    }
                }
            }.bind(this)
        );
        if (isNewTopUps) {
            this.setKey(topUpKey, this.stringify(this.topUpKeys));
        }
    }



	getLocalTopUp(topUpId) {
		for (let index = 0; index < this.topUp.length; index++) {
			if (this.topUp[index].topUpId === topUpId) {
				return this.topUp[index];
			}
		}
		return null;
	}
	getLocalTopUpIndex(topUpId) {
		for (let index = 0; index < this.topUp.length; index++) {
			if (this.topUp[index].topUpId === topUpId) {
				return index;
			}
		}
		return -1;
	}

	setLocalTopUp(topUp) {
		for (let index = 0; index < this.topUp.length; index++) {
			if (this.topUp[index].topUpId === topUp.topUpId) {
				this.topUp[index] = topUp;
				return;
			}
		}
	}



    loadTopUpsFromKeys() {
        console.log(
            'loadTopUpsFromKeys. No of topUp: ' +
            this.topUpKeys.length
        );
        return new Promise((resolve, reject) => {
            try {
                let that = this;
                this.multiGet(this.topUpKeys).then(results => {
                    that.topUp = results.map(result => {
                        return that.parseJson(result[1]);
                    });
                    resolve(true);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    loadTopUpsFromKeys2() {
        console.log(
            'loadTopUpsFromKeys. No of topUp: ' +
            this.topUpKeys.length
        );

        let that = this;
        let results = this.getMany(this.topUpKeys);
        return that.topUp = results.map(result => {
            return that.parseJson(result[1]);
        });
    }

    removePendingTopUp(topUpKey) {
        console.log('PostStorage:removePendingTopUp');
        const index = this.pendingTopUps.indexOf(topUpKey);
        if (index > -1) {
            this.pendingTopUps.splice(index, 1);
            let keyArray = [
                [pendingTopUpsKey, this.stringify(this.pendingTopUps)]
            ];

            this.multiSet(keyArray)
                .then(rows => {
                    console.log('Affected rows: ' + rows);
                })
                .catch(error => {
                    console.log(
                        'PosStorage:removePendingTopUp: Error: ' + error
                    );
                });
        }
    }

    getTopUpFromKey(topUpKey) {
		return new Promise(resolve => {
			this.getKey(topUpKey)
				.then(topup => {
					resolve(this.parseJson(topup));
				})
				.catch(() => {
					resolve(null);
				});
		});
	}

	getTopUps() {
		console.log('PosStorage: TopUps. Count ' + this.topUp.length);
		return this.topUp;
	}


    setLastTopUpSync(lastSyncTime) {
        this.lastTopUpSync = lastSyncTime;
        this.setKey(lastTopUpSyncKey, this.lastTopUpSync.toISOString());
    }

    stringify(jsObject) {
        return JSON.stringify(jsObject);
    }

    parseJson(jsonString) {
        if (typeof jsonString === 'string') {
            return JSON.parse(jsonString);
        }
        return null;
    }

    async getKey(key) {
        try {
            const value = await this.getItem(key);
            return value;
        } catch (error) {
            console.log('Pos Storage Error retrieving data');
        }
    }

    async setKey(key, stringValue) {
        console.log(
            'Pos Storage:setKey() Key: ' + key + ' Value: ' + stringValue
        );
        return await this.setItem(key, stringValue);
    }



    async removeKey(key) {
        try {
            await this.removeItem(key);
        } catch (error) {
            console.log('Pos Storage Error removing data' + error);
        }
    }


    // Realm access methods start
    getItem(key) {
        let value;
        realm.write(() => {
            value = realm.objectForPrimaryKey('SemaRealm', key);
        });
        console.log(value.data);
        return value.data;
    }

    setItem(key, value) {
        return new Promise((resolve, reject) => {
            try {
                realm.write(() => {
                    let obj = realm.objectForPrimaryKey('SemaRealm', key);
                    if (obj != null) {
                        realm.create('SemaRealm', { id: key, data: value }, true);
                    }
                    else {
                        realm.create('SemaRealm', { id: key, data: value });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    removeItem(key) {
        return new Promise((resolve, reject) => {
            try {
                realm.write(() => {
                    let semaobject = realm.objectForPrimaryKey(
                        'SemaRealm',
                        key
                    );
                    realm.delete(semaobject);
                    resolve(semaobject);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    multiGet = keyArray => {
        var promise = new Promise(function (resolve, reject) {
            let result = [];
            realm.write(() => {
                for (i = 0; i < keyArray.length; i++) {
                    let value = realm.objectForPrimaryKey(
                        'SemaRealm',
                        keyArray[i]
                    );
                    let semaobject = [keyArray[i], value.data];
                    //console.log(value.data);
                    // semaobjects[i] = semaobject;
                    result.push(semaobject);
                }
            });
            resolve(result);
        });

        return promise;
    };

    getMany = keyArray => {
        let result = [];
        for (i = 0; i < keyArray.length; i++) {
            let value = realm.objectForPrimaryKey(
                'SemaRealm',
                keyArray[i]
            );
            let semaobject = [keyArray[i], value.data];
            //console.log(value.data);
            // semaobjects[i] = semaobject;
            result.push(semaobject);
        }
        return result;

    };

    multInsert(keyArray) {
        let count = 0;
        for (i = 0; i < keyArray.length; i++) {
            count++;
            let key = keyArray[i][0];
            let value = keyArray[i][1];
            // realm.create('SemaRealm', {id: key, data: value})
            let obj = realm.objectForPrimaryKey('SemaRealm', key);
            if (obj != null)
                realm.create('SemaRealm', { id: key, data: value }, true);
            else
                realm.create('SemaRealm', { id: key, data: value });
        }
        console.log(count);
        return { rows: count };

    }


    multiSet(keyArray) {
        return new Promise((resolve, reject) => {
            realm.write(() => {
                try {
                    let count = 0;
                    for (i = 0; i < keyArray.length; i++) {
                        count++;
                        let key = keyArray[i][0];
                        let value = keyArray[i][1];
                        // realm.create('SemaRealm', {id: key, data: value})
                        let obj = realm.objectForPrimaryKey('SemaRealm', key);
                        if (obj != null)
                            realm.create('SemaRealm', { id: key, data: value }, true);
                        else
                            realm.create('SemaRealm', { id: key, data: value });
                    }
                    console.log(count);
                    resolve({ rows: count });
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    // End of Realm methods


}

export default new TopUps();