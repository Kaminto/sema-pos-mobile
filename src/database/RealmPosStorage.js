var Realm = require('realm');
let realm ;

class RealmPosStorage {
    
	constructor() {
        const SEMA_SCHEMA = {
            name: 'SemaRealm',
            primaryKey: 'id',
            properties: {
                id: 'string',
                data: 'string'
            }
        };
		realm = new Realm({schema: [SEMA_SCHEMA]});
	}

	getItem(key) {
		let value;
		realm.write(() => {
			value = realm.objectForPrimaryKey('SemaRealm', key);
        });
        console.log(value);
		return value.data;

	}

	setItem(key, value){
		realm.write(() => {
            let obj = realm.objectForPrimaryKey('SemaRealm', key);
            if(obj != null)
               realm.create('SemaRealm', {id: key, data: value}, true);
            else
		       realm.create('SemaRealm', {id: key, data: value});
     	});

	}

	removeItem(key) {
		realm.write(() => {
			let semaobject = realm.objectForPrimaryKey('SemaRealm', key);
			realm.delete(semaobject);
		});
    }
    
    
    multiGet = keyArray => {
        var promise = new Promise(function(resolve, reject) {
            let result = [];
            realm.write(() => {
                for(i=0;i<keyArray.length;i++){			
                        let value = realm.objectForPrimaryKey('SemaRealm', keyArray[i]);
                        let semaobject = [keyArray[i], value.data];
                        console.log(value.data);
                        // semaobjects[i] = semaobject;
                        result.push(semaobject);
                }
             });
          resolve(result);
        });
      
        return promise;
      };


	multiSet(keyArray){
        realm.write(() => {
            for(i=0;i<keyArray.length;i++){
                    let key = keyArray[i][0];
                    let value = keyArray[i][1];
                    // realm.create('SemaRealm', {id: key, data: value})
                    let obj = realm.objectForPrimaryKey('SemaRealm', key);
                    if(obj != null)
                    realm.create('SemaRealm', {id: key, data: value}, true);
                    else
                    realm.create('SemaRealm', {id: key, data: value});
            }
         });

	}



}

export default new RealmPosStorage();