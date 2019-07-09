const Realm = require('realm');
const dataSchema = {
	name: 'SemaData',
	primaryKey: 'id',
	properties: {
		id: 'string',
		data: 'string'
	}
};

let realm = Realm.open({
	path: 'semaData.realm',
	schema: [dataSchema]
});

const setItem = (key, data) => {
	try {
		realm.write(() => {
			const result = realm.create('SemaData', {
				id: key,
				data: data
			});
			console.log(result);
		});
	} catch (error) {}
};

const getItem = key => {
	return new Promise((resolve, reject)=>{
		const data = realm.objects('SemaData');
		const item = data.filtered(`id=${key}`);
		return item.data||"{}"
	});
};

const multiSet = kevValueArray => {
	for (const array of kevValueArray) {
		if (Array.isArray(array)) {
			setItem(array[0], array[1]);
		}
	}
};

const multiGet = array => {
	return new Promise(async (resolve, reject) => {
		let result = [];
		if (Array.isArray(array)) {
			for (const key of array) {
				const value = await getItem(key);
				result.push([key, value]);
			}
		}
		resolve(result);
	});
};

export const realmStorage = {
	setItem,
	getItem,
	multiGet,
	multiSet
  };