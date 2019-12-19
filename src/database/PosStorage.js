/*
This class contains the persistence implementation of the tablet business objects such as customers, sales, products
*/
import { capitalizeWord } from '../services/Utilities';
import Events from 'react-native-simple-events';
import moment from 'moment-timezone';
import TopUps from './credit/credit.operations';
import InventroyRealm from './inventory/inventory.operations';
import CreditRealm from './credit/credit.operations';
import realm from './init';

 

const uuidv1 = require('uuid/v1');

const versionKey = '@Sema:VersionKey';
const settingsKey = '@Sema:SettingsKey';

const customersKey = '@Sema:CustomersKey';
const customerItemKey = '@Sema:CustomerItemKey';
const lastCustomerSyncKey = '@Sema:LastCustomerSyncKey';
const pendingCustomersKey = '@Sema:PendingCustomersKey';

const customerTypesKey = '@Sema:CustomerTypesKey';


const productsKey = '@Sema:ProductsKey';
const productItemKey = '@Sema:ProductItemKey';
const lastProductsSyncKey = '@Sema:LastProductsSyncKey';
const productMrpsKey = '@Sema:ProductMrpsKey';

const salesKey = '@Sema:SalesKey';
const saleItemKey = '@Sema:SaleItemKey';
const lastSalesSyncKey = '@Sema:LastSalesSyncKey';
const pendingSalesKey = '@Sema:PendingSalesKey';

const remoteReceiptsKey = '@Sema:remoteReceiptsKey';

const salesChannelsKey = '@Sema:SalesChannelsKey';


const inventoriesKey = '@Sema:inventoriesKey';
const inventoryItemKey = '@Sema:InventoryItemKey';

const reminderDataKey = '@Sema:remindersDataKey';

const tokenExpirationKey = '@Sema:TokenExpirationKey';
const syncIntervalKey = '@Sema:SyncIntervalKey';


class PosStorage {
	constructor() {
		// Version, major versions require the storage to be re-written
		this.version = null;

		// Customers are saved in the form customerItemKey + Customer.id
		// For example "@Sema:CustomerItemKey_ea6c365a-7338-11e8-a3c9-ac87a31a5361"
		this.customersKeys = []; // Array of customer keys
		this.customers = []; // De-referenced customers
		// Reminder Module
		this.reminders = [];
		this.reminderDataKeys = [];

		// Sales are saved in the form {dateTime, salesItemKey} where dateTime is an ISO datetime string
		// and salestItemKey is a key to the sales item
		// For example '{"2018-05-01 00:00:00":"@Sema:SaleItemKey_2018-05-01 00:00:00"}'
		// Sales are stored most recent to oldest.
		this.salesKeys = [];

		// Products are saved in the form productItemKey + Product.sku
		// For example "@Sema:productItemKey_sku-100"
		this.productsKeys = []; // Array of product keys
		this.products = []; // De-referenced products

		// Pending customers is the array of customers, stored locally but not yet sent to the server
		this.pendingCustomers = [];

		// Pending sales is the array of sales, stored locally but not yet sent to the server
		this.pendingSales = [];

		// Last sync DateTime is the last date time that items were synchronized with the server
		let firstSyncDate = new Date('November 7, 1973');
		this.lastCustomerSync = firstSyncDate;
		this.lastSalesSync = firstSyncDate;
		this.lastProductsSync = firstSyncDate;
		this.tokenExpiration = firstSyncDate;

		this.settings = {
			semaUrl: 'http://142.93.115.206:3006/',
			site: '',
			user: '',
			password: '',
			uiLanguage: { name: 'English', iso_code: 'en' },
			token: '',
			loginSync: false,
			siteId: ''
		};
		this.salesChannels = [];
		this.customerTypes = [];
		this.reminderData = [];
		this.reminderDataKeys = []; //will be @Sema:remindersKey_+CustomerName+Product_name
		this.receipts = [];
		this.productMrpDict = {};

		this.syncInterval = {
			interval: 10 * 60 * 1000
		};
		this.inventoriesKeys = []; // 30 days of inventories
		this.inventory = [];
		// Realm schema creation
		// const SEMA_SCHEMA = {
		// 	name: 'SemaRealm',
		// 	primaryKey: 'id',
		// 	properties: {
		// 		id: 'string',
		// 		data: 'string'
		// 	}
		// };
		// realm = new Realm({ schema: [SEMA_SCHEMA] });
	}

	checkLocalDb() {
		const version = realm.objectForPrimaryKey('SemaRealm', versionKey);
		if (!version) {
			return 'SetUp Required';
		}

		if (version) {
			return 'SetUp Not Required';
		}
	}


	initialLocalDb() {

		this.version = '1';
		let keyArray = [
			[versionKey, this.version],
			[customersKey, this.stringify(this.customersKeys)],
			[salesKey, this.stringify(this.salesKeys)],
			[productsKey, this.stringify(this.productsKeys)],
			[
				lastCustomerSyncKey,
				this.lastCustomerSync.toISOString()
			],
			[
				lastSalesSyncKey,
				this.lastSalesSync.toISOString()
			],
			[
				lastProductsSyncKey,
				this.lastProductsSync.toISOString()
			],
			[
				pendingCustomersKey,
				this.stringify(this.pendingCustomers)
			],
			[
				pendingSalesKey,
				this.stringify(this.pendingSales)
			],
			[settingsKey, this.stringify(this.settings)],
			[
				tokenExpirationKey,
				this.stringify(this.tokenExpiration)
			],
			[
				salesChannelsKey,
				this.stringify(this.salesChannels)
			],
			[
				customerTypesKey,
				this.stringify(this.customerTypes)
			],
			[
				productMrpsKey,
				this.stringify(this.productMrpDict)
			],
			[
				syncIntervalKey,
				this.stringify(this.syncInterval)
			],
			[
				inventoriesKey,
				this.stringify(this.inventoriesKeys)
			],
			[remoteReceiptsKey, this.stringify(this.receipts)],
			[
				reminderDataKey,
				this.stringify(this.reminderData)
			]
		];
		
		InventroyRealm.initialise();
		CreditRealm.initialise();
		console.log(keyArray);
		this.multiSet(keyArray)
			.then(rows => {
				console.log('Affected : ' + rows);
				return true;

			})
			.catch(error => {
				console.log(error);
				return false;
			});
		// let insertedRows = this.multInsert(keyArray);
		// console.log('Affected : ' + insertedRows);
		return 'Local DB Initialised';

	}

	loadLocalData() {
		const version = realm.objectForPrimaryKey('SemaRealm', versionKey);

		// Pos Storage: Version = ', version.data
		this.version = version;
		let keyArray = [
			customersKey,
			salesKey,
			productsKey,
			lastCustomerSyncKey,
			lastSalesSyncKey,
			lastProductsSyncKey,
			pendingCustomersKey,
			pendingSalesKey,
			settingsKey,
			tokenExpirationKey,
			salesChannelsKey,
			customerTypesKey,
			productMrpsKey,
			syncIntervalKey,
			inventoriesKey,
			remoteReceiptsKey,
			reminderDataKey
		];


		let results = this.getMany(keyArray);


		this.customersKeys = this.parseJson(
			results[0][1]
		); // Array of customer keys
		this.salesKeys = this.parseJson(results[1][1]); // Array of sales keys
		this.productsKeys = this.parseJson(
			results[2][1]
		); // Array of products keys
		this.lastCustomerSync = new Date(results[3][1]); // Last customer sync time
		this.lastSalesSync = new Date(results[4][1]); // Last sales sync time
		this.lastProductsSync = new Date(results[5][1]); // Last products sync time
		this.pendingCustomers = this.parseJson(
			results[6][1]
		); // Array of pending customers
		this.pendingSales = this.parseJson(
			results[7][1]
		); // Array of pending sales
		this.settings = this.parseJson(results[8][1]); // Settings
		this.tokenExpiration = new Date(results[9][1]); // Expiration date/time of the token
		this.salesChannels = this.parseJson(
			results[10][1]
		); // array of sales channels
		this.customerTypes = this.parseJson(
			results[11][1]
		); // array of customer types
		this.productMrpDict = this.parseJson(
			results[12][1]
		); // products MRP dictionary
		this.syncInterval = this.parseJson(
			results[13][1]
		); // SyncInterval
		this.inventoriesKeys = this.parseJson(
			results[14][1]
		); // inventoriesKey
		this.receipts = this.parseJson(results[15][1]); // remoteReceiptsKey
		this.reminderDataKeys = this.parseJson(
			results[16][1]
		); //reminderData;
		InventroyRealm.initialise();
		CreditRealm.initialise();

		if (this.loadProductsFromKeys2() && this.loadCustomersFromKeys2()) {
			this.loadInventoryFromKeys();
			return 'Data Exists';
		}
		return 'Data Exists';
	}


	// Realm access methods start
	getItem(key) {
		let value;
		realm.write(() => {
			value = realm.objectForPrimaryKey('SemaRealm', key);
		});
		if(value.data){
		return value.data;
		}
		return [];
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
					if(value.data){
						let semaobject = [keyArray[i], value.data];
						result.push(semaobject);
					}
					
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
			if(value.data){
			let semaobject = [keyArray[i], value.data];
			result.push(semaobject);
			}
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

	getLastCustomerSync() {
		return this.lastCustomerSync;
	}
	getLastProductSync() {
		return this.lastProductsSync;
	}
	getLastSalesSync() {
		return this.lastSalesSync;
	}

	clearDataOnly() {
		// Clear all data - leave config alone. Note that customerTypesKey, salesChannelsKey and productMrpsKey
		// are NOT cleared
		this.customers = [];
		this.customersKeys = [];
		this.pendingCustomers = [];
		this.salesKeys = [];
		this.pendingSales = [];

		this.products = [];
		this.productsKeys = [];
		this.receipts = [];

		this.reminderData = [];
		this.reminderDataKeys = [];

		let firstSyncDate = new Date('November 7, 1973');
		this.lastCustomerSync = firstSyncDate;
		this.lastSalesSync = firstSyncDate;
		this.lastProductsSync = firstSyncDate;
		this.inventoriesKeys = [];
		this.productMrpDict = {};
		let keyArray = [
			[customersKey, this.stringify(this.customersKeys)],
			[productsKey, this.stringify(this.productsKeys)],
			[pendingCustomersKey, this.stringify(this.pendingCustomers)],
			[salesKey, this.stringify(this.salesKeys)],
			[pendingSalesKey, this.stringify(this.pendingSales)],
			[lastCustomerSyncKey, this.lastCustomerSync.toISOString()],
			[lastSalesSyncKey, this.lastSalesSync.toISOString()],
			[lastProductsSyncKey, this.lastProductsSync.toISOString()],
			[customerTypesKey, this.stringify(this.customerTypes)],
			[salesChannelsKey, this.stringify(this.salesChannels)],
			[productMrpsKey, this.stringify(this.productMrpDict)],
			[inventoriesKey, this.stringify(this.inventoriesKeys)],
			[remoteReceiptsKey, this.stringify(this.receipts)],
			[reminderDataKey, this.stringify(this.reminderDataKeys)]
		];

		this.multiSet(keyArray)
			.then(rows => {
				console.log('Affected Rows: ' + rows);
			})
			.catch(error => {
				console.log('PosStorage:clearDataOnly: Error: ' + error);
			});
	}

	clearDataBeforeSynch() {
		//This function will prevent clearing sales data on logging.
		this.customers = [];
		this.customersKeys = [];
		this.pendingCustomers = [];
		//this.salesKeys = [];
		//this.pendingSales = [];

		this.products = [];
		this.productsKeys = [];
		//this.receipts = [];

		let firstSyncDate = new Date('November 7, 1973');
		this.lastCustomerSync = firstSyncDate;
		//this.lastSalesSync = firstSyncDate;
		this.lastProductsSync = firstSyncDate;
		this.inventoriesKeys = [];
		this.productMrpDict = {};

		let keyArray = [
			[customersKey, this.stringify(this.customersKeys)],
			[productsKey, this.stringify(this.productsKeys)],
			[pendingCustomersKey, this.stringify(this.pendingCustomers)],
			//[salesKey, this.stringify(this.salesKeys)],
			//[pendingSalesKey, this.stringify(this.pendingSales)],
			[lastCustomerSyncKey, this.lastCustomerSync.toISOString()],
			//[lastSalesSyncKey, this.lastSalesSync.toISOString()],
			[lastProductsSyncKey, this.lastProductsSync.toISOString()],
			[customerTypesKey, this.stringify(this.customerTypes)],
			[salesChannelsKey, this.stringify(this.salesChannels)],
			[productMrpsKey, this.stringify(this.productMrpDict)],
			[inventoriesKey, this.stringify(this.inventoriesKeys)]
			//[remoteReceiptsKey, this.stringify(this.receipts)]
		];

		this.multiSet(keyArray)
			.then(rows => {
				console.log('Affected rows ' + rows);
			})
			.catch(error => {
				console.log('PosStorage:clearDataOnly: Error: ' + error);
			});
	}

	makeCustomerKey(customer) {
		return customerItemKey + '_' + customer.customerId;
	}

	customerIdFromKey(customerKey) {
		const prefix = customerItemKey + '_';
		return customerKey.slice(prefix.length);
	}

	// createCustomer(phone, name, address, siteId, salesChannelId, customerTypeId) {
	// 	const now = new Date();
	// 	return this.createCustomerFull(phone, name, address, siteId, salesChannelId,
	// 		customerTypeId, now, now)
	// }

	createCustomer(
		phone,
		name,
		address,
		siteId,
		salesChannelId,
		customerTypeId,
		frequency,
		secondPhoneNumber
	) {
		const now = new Date();
		return this.createCustomerFull(
			phone,
			name,
			address,
			siteId,
			salesChannelId,
			customerTypeId,
			now,
			now,
			frequency,
			secondPhoneNumber
		);
	}

	createCustomerFull(
		phone,
		name,
		address,
		siteId,
		salesChannelId,
		customerTypeId,
		createdDate,
		updatedDate,
		frequency,
		secondPhoneNumber
	) {
		const newCustomer = {
			customerId: uuidv1(),
			name: name,
			phoneNumber: phone,
			address: address,
			siteId: siteId,
			dueAmount: 0,
			salesChannelId: salesChannelId,
			customerTypeId: customerTypeId,
			createdDate: createdDate,
			updatedDate: updatedDate,
			frequency: frequency,
			secondPhoneNumber: secondPhoneNumber
		};

		let key = this.makeCustomerKey(newCustomer);
		this.customers.push(newCustomer);
		newCustomer.syncAction = 'create';
		this.customersKeys.push(key);
		this.pendingCustomers.push(key);
		let keyArray = [
			[customersKey, this.stringify(this.customersKeys)], // Array of customer keys
			[key, this.stringify(newCustomer)], // The new customer
			[pendingCustomersKey, this.stringify(this.pendingCustomers)] // Array pending customer
		];

		this.multiSet(keyArray)
			.then(rows => {
				console.log('Affected rows ' + rows);
			})
			.catch(error => {
				console.log('PosStorage:createCustomer: Error: ' + error);
			});
		return newCustomer;
	}

	//Reminder Module

	// addReminder(reminder) {
	// 	let reminderKey = reminderDataKey + '_' + reminder.id;
	// 	console.log("This is the reminderKey=>" + reminderKey);
	// 	this.reminderDataKeys.push(reminderKey);
	// 	this.reminders.push(reminder);
	// 	console.log(this.reminders);
	// 	console.table(this.reminders);
	// 	let keyArray = [
	// 		[reminderKey, this.stringify(reminder)],
	// 		[reminderDataKey, this.stringify(this.reminderDataKeys)]
	// 	];
	// 	console.log("ADDING A REMINDER TO POSSTORAGE" + reminder);
	// 	this.multiSet(keyArray).then(error => {
	// 		console.log("BIGANYE,ADDING REMINDER" + console.log(error));
	// 	});

	// 	//   this.setKey(reminderDataKey,this.stringify(this.reminders));
	// }

	// getRemindersPos() {
	// 	//	    let filtered_receipts = this.getRemindersByDate()
	// 	//console.log("Communications getReminders->"+reminderArray);
	// 	let rem = [];
	// 	this.reminders = this.loadReminders();//.then(reminda =>{ return reminda;});
	// 	//console.log("BLOODY HELL"+this.reminders);
	// 	//.then(reminders =>{return rem = reminders;});
	// 	rem.push(this.reminders);
	// 	//console.log("CURRENT REMINDERS=>"+ this.reminders);
	// 	//let rem = this.reminders.filter(reminder => reminder.reminder_date == moment(date).add('days',1).format("YYYY-MM-DD"));
	// 	//console.log("ZI REMINDER ==>"+ this.reminders);
	// 	return this.reminders;
	// }

	// loadReminders() {
	// 	console.log("loadRemindersFromKeys. No of reminders: " + this.reminders.length);
	// 	return new Promise((resolve, reject) => {
	// 		try {
	// 			let that = this;
	// 			this.multiGet(this.reminderDataKeys)
	// 				.then(results => {
	// 					that.reminders = results.map(resarray => {
	// 						return that.parseJson(resarray[1]);
	// 					});
	// 					resolve(that.reminders);

	// 				});
	// 		} catch (error) {
	// 			reject(error);
	// 		}
	// 	});




	// }

	// setReminderDate(customer, customerFrequency, receiptDate) {
	// 	let reminder_date = moment(receiptDate).add(customerFrequency, 'day').format("YYYY-MM-DD");
	// 	console.log('Setting reminderDate ===>' + reminder_date);
	// 	customer.reminder_date = reminder_date;
	// 	let key = this.makeCustomerKey(customer);
	// 	customer.syncAction = "update";
	// 	//customer.reminder_date = reminder_date;
	// 	console.log(customer);
	// 	this.pendingCustomers.push(key);

	// 	let keyArray = [
	// 		[key, this.stringify(customer)], // Customer keys
	// 		[pendingCustomersKey, this.stringify(this.pendingCustomers)] // Array pending customer
	// 	];
	// 	this.multiSet(keyArray).then(error => {
	// 		if (error) {
	// 			console.log("PosStorage:updateCustomer: Error: " + error);
	// 		}
	// 	});

	// }

	// New reminder module.

	addReminder(reminder){
	    let reminderKey = reminderDataKey +'_' + reminder.id;
	    console.log("This is the reminderKey=>"+reminderKey);
	    this.reminderDataKeys.push(reminderKey);
	    this.reminders.push(reminder);
	    console.log(this.reminders);
	    console.table(this.reminders);
	    let keyArray = [
		[reminderKey, this.stringify(reminder)],
		[reminderDataKey, this.stringify(this.reminderDataKeys)]
	    ];
	    console.log("ADDING A REMINDER TO POSSTORAGE"+ reminder);
	    this.multiSet(keyArray).then(error =>{
		console.log("BIGANYE,ADDING REMINDER"+ console.log(error));
	    });

  	//   this.setKey(reminderDataKey,this.stringify(this.reminders));
    	  }

    	getRemindersPos(){
//	    let filtered_receipts = this.getRemindersByDate()
	    //console.log("Communications getReminders->"+reminderArray);
	    let rem = [];
	    this.reminders = this.loadReminders();//.then(reminda =>{ return reminda;});
	    //console.log("BLOODY HELL"+this.reminders);
	    //.then(reminders =>{return rem = reminders;});
	    rem.push(this.reminders);
	    //console.log("CURRENT REMINDERS=>"+ this.reminders);
	    //let rem = this.reminders.filter(reminder => reminder.reminder_date == moment(date).add('days',1).format("YYYY-MM-DD"));
	    //console.log("ZI REMINDER ==>"+ this.reminders);
	    return this.reminders;
    	}

    	loadReminders(){
	    console.log("loadRemindersFromKeys. No of reminders: " + this.reminders.length);
	    return new Promise((resolve, reject)=>{
		try{
		let that = this;
		this.multiGet(this.reminderDataKeys)
		    .then(results =>{
			that.reminders = results.map(resarray =>{
			    return that.parseJson(resarray[1]);
			});
			resolve(that.reminders);

		    });
		}catch(error){
		    reject(error);
		}
	    });

		}

        setReminderDate(customer, customerFrequency, receiptDate){
       	   let  reminder_date = moment(receiptDate).add(customerFrequency,'day').format("YYYY-MM-DD");
	   console.log('Setting reminderDate ===>'+ reminder_date);
	   customer.reminder_date = reminder_date;
	   let key = this.makeCustomerKey(customer);
	   customer.syncAction = "update";
	   //customer.reminder_date = reminder_date;
	   console.log(customer);
	   this.pendingCustomers.push(key);

		let keyArray = [
			[key, this.stringify(customer)], // Customer keys
			[pendingCustomersKey, this.stringify(this.pendingCustomers)] // Array pending customer
		];
		this.multiSet(keyArray).then(error => {
			if (error) {
				console.log("PosStorage:updateCustomer: Error: " + error);
			}
		});



		}


    	mergeReminders(remoteReminders){


		}

//// Tests

	deleteCustomer(customer) {
		let key = this.makeCustomerKey(customer);
		let index = this.customers.indexOf(customer);
		if (index > -1) {
			let customer = this.customers[index];
			customer.syncAction = 'delete';
			this.customers.splice(index, 1);
			index = this.customersKeys.indexOf(key);
			if (index > -1) {
				this.customersKeys.splice(index, 1);
			}
			this.pendingCustomers.push(key);
			let keyArray = [
				[customersKey, this.stringify(this.customersKeys)], // Array of customer keys
				[key, this.stringify(customer)], // The customer being deleted
				[pendingCustomersKey, this.stringify(this.pendingCustomers)] // Array pending customer
			];

			this.multiSet(keyArray)
				.then(rows => {
					console.log('Affected rows: ' + rows);
				})
				.catch(error => {
					console.log('PosStorage:deleteCustomer: Error: ' + error);
				});
		}
	}

	// TODO: Only accept the new customer object
	updateCustomer(
		customer,
		phone,
		name,
		address,
		salesChannelId,
		customerTypeId,
		frequency,
		secondPhoneNumber
	) {
		let key = this.makeCustomerKey(customer);
		customer.name = name;
		customer.phoneNumber = phone;
		customer.address = address;
		customer.salesChannelId = salesChannelId;
		customer.customerTypeId = customerTypeId;
		customer.updatedDate = new Date();
		customer.syncAction = 'update';
		customer.frequency = frequency;
		customer.secondPhoneNumber = secondPhoneNumber

		if (customer.reminder_date) {
			customer.reminder_date = moment(customer.reminder_date).format(
				'YYYY-MM-DD'
			);
		}

		console.log('THE CUSTOMER REMINDER DATE===>' + customer.reminder_date);
		this.pendingCustomers.push(key);

		let keyArray = [
			[key, this.stringify(customer)], // Customer keys
			[pendingCustomersKey, this.stringify(this.pendingCustomers)] // Array pending customer
		];

		this.multiSet(keyArray)
			.then(rows => {
				console.log('Affected rows ' + rows);
			})
			.catch(error => {
				console.log('PosStorage:updateCustomer: Error: ' + error);
			});
	}

	addRemoteCustomers(customerArray) {
		console.log(
			'PosStorage:addCustomers: No existing customers no need to merge....'
		);
		this.customers = [];
		let keyValueArray = [];
		let keyArray = [];
		for (let index = 0; index < customerArray.length; index++) {
			if (customerArray[index].active) {
				keyValueArray.push([
					this.makeCustomerKey(customerArray[index]),
					this.stringify(customerArray[index])
				]);
				keyArray.push(this.makeCustomerKey(customerArray[index]));
				this.customers.push(customerArray[index]);
			}
		}
		this.customersKeys = keyArray;
		keyValueArray.push([customersKey, this.stringify(keyArray)]);

		this.multiSet(keyValueArray)
			.then(rows => {
				console.log('Affected rows: ' + rows);
			})
			.catch(error => {
				console.log('PosStorage:addCustomers: Error: ' + error);
			});
	}

	// Merge new customers into existing ones
	mergeCustomers(remoteCustomers) {
		console.log(
			'PosStorage:mergeCustomers Number of remote customers: ' +
			remoteCustomers.length
		);
		let newCustomersAdded = remoteCustomers.length > 0 ? true : false;
		if (this.customers.length == 0) {
			this.addRemoteCustomers(remoteCustomers);
			return {
				pendingCustomers: this.pendingCustomers.slice(),
				updated: newCustomersAdded
			};
		} else {
			// Need to merge webCustomers with existing and pending customers
			console.log(
				'PosStorage:mergeCustomers. Merging ' +
				remoteCustomers.length +
				' web Customers into existing and pending customers'
			);
			let webCustomersToUpdate = [];
			let isPendingModified = false;
			remoteCustomers.forEach(remoteCustomer => {
				const webCustomerKey = this.makeCustomerKey(remoteCustomer);
				const pendingIndex = this.pendingCustomers.indexOf(
					webCustomerKey
				);
				if (pendingIndex != -1) {
					let localCustomer = this.getLocalCustomer(
						remoteCustomer.customerId
					);
					if (localCustomer) {
						console.log(
							'PostStorage - mergeCustomers. Local Date ' +
							new Date(localCustomer.updatedDate) +
							' Remote Date ' +
							remoteCustomer.updatedDate
						);
					}
					if (
						localCustomer &&
						remoteCustomer.updatedDate >
						new Date(localCustomer.updatedDate)
					) {
						// remoteCustomer is the latest
						console.log(
							'PostStorage - mergeCustomers. Remote customer ' +
							remoteCustomer.name +
							' is later:'
						);
						webCustomersToUpdate.push(remoteCustomer);
						this.pendingCustomers.splice(pendingIndex, 1);
						isPendingModified = true;
					} else {
						console.log(
							'PostStorage - mergeCustomers. Local customer ' +
							localCustomer.name +
							' is later:'
						);
					}
				} else {
					webCustomersToUpdate.push(remoteCustomer);
				}
			});
			if (isPendingModified) {
				this.setKey(
					pendingCustomersKey,
					this.stringify(this.pendingCustomers)
				);
			}
			this.mergeRemoteCustomers(webCustomersToUpdate);
			return {
				pendingCustomers: this.pendingCustomers.slice(),
				updated: newCustomersAdded
			};
		}
	}

	mergeRemoteCustomers(remoteCustomers) {
		let isNewCustomers = false;
		remoteCustomers.forEach(
			function (customer) {
				let customerKey = this.makeCustomerKey(customer);
				let keyIndex = this.customersKeys.indexOf(customerKey);
				if (keyIndex === -1) {
					if (customer.active) {
						isNewCustomers = true;
						this.customersKeys.push(customerKey);
						this.customers.push(customer);
						this.setKey(customerKey, this.stringify(customer));
					}
				} else {
					if (customer.active) {
						this.setKey(customerKey, this.stringify(customer)); // Just update the existing customer
						this.setLocalCustomer(customer);
					} else {
						// Remove an inactivated customer
						let index = this.getLocalCustomerIndex(
							customer.customerId
						);
						if (index > -1) {
							this.customers.splice(index, 1);
							index = this.customersKeys.indexOf(customerKey);
							if (index > -1) {
								this.customersKeys.splice(index, 1);
							}
							let keyArray = [
								[
									customersKey,
									this.stringify(this.customersKeys)
								], // Array of customer keys
								[customerKey, this.stringify(customer)] // The customer being deleted
							];

							this.multiSet(keyArray)
								.then(rows => {
									console.log('Affected rows ' + rows);
								})
								.catch(error => {
									console.log(
										'PosStorage:mergeRemoteCustomers: Error: ' +
										error
									);
								});
						}
					}
				}
			}.bind(this)
		);
		if (isNewCustomers) {
			this.setKey(customersKey, this.stringify(this.customersKeys));
		}
	}
	getLocalCustomer(customerId) {
		for (let index = 0; index < this.customers.length; index++) {
			if (this.customers[index].customerId === customerId) {
				return this.customers[index];
			}
		}
		return null;
	}
	getLocalCustomerIndex(customerId) {
		for (let index = 0; index < this.customers.length; index++) {
			if (this.customers[index].customerId === customerId) {
				return index;
			}
		}
		return -1;
	}

	setLocalCustomer(customer) {
		for (let index = 0; index < this.customers.length; index++) {
			if (this.customers[index].customerId === customer.customerId) {
				this.customers[index] = customer;
				return;
			}
		}
	}

	loadCustomersFromKeys() {
		console.log(
			'loadCustomersFromKeys. No of customers: ' +
			this.customersKeys.length
		);
		return new Promise((resolve, reject) => {
			try {
				let that = this;
				this.multiGet(this.customersKeys).then(results => {
					that.customers = results.map(result => {
						return that.parseJson(result[1]);
					});
					resolve(true);
				});
			} catch (error) {
				reject(error);
			}
		});
	}



	loadCustomersFromKeys2() {
		console.log(
			'loadCustomersFromKeys. No of customers: ' ,
			this.customersKeys.length
		);

		let that = this;
		let results = this.getMany(this.customersKeys);
		return that.customers = results.map(result => {
			return that.parseJson(result[1]);
		});
	}

	loadProductsFromKeys2() {
		console.log(
			'loadProductsFromKeys. No of products: ' , this.productsKeys.lenght
		);

		let that = this;
		let results = this.getMany(this.productsKeys);
		return that.products = results.map(result => {
			return that.parseJson(result[1]);
		});

	}


	removePendingCustomer(customerKey) {
		console.log('PostStorage:removePendingCustomer');
		const index = this.pendingCustomers.indexOf(customerKey);
		if (index > -1) {
			this.pendingCustomers.splice(index, 1);
			let keyArray = [
				[pendingCustomersKey, this.stringify(this.pendingCustomers)]
			];

			this.multiSet(keyArray)
				.then(rows => {
					console.log('Affected rows: ' + rows);
				})
				.catch(error => {
					console.log(
						'PosStorage:removePendingCustomer: Error: ' + error
					);
				});
		}
	}

	getCustomerFromKey(customerKey) {
		return new Promise(resolve => {
			this.getKey(customerKey)
				.then(customer => {
					resolve(this.parseJson(customer));
				})
				.catch(() => {
					resolve(null);
				});
		});
	}

	getCustomers() {
		console.log('PosStorage: getCustomers. Count ' + this.customers.length);
		return this.customers;
	}

	getReceipts() {
		console.log('PosStorage: getReceipts. Count ' + this.receipts.length);
		return this.receipts;
	}

	getPendingCustomers() {
		console.log(
			'PosStorage: getPendingCustomers. Count ' +
			this.pendingCustomers.length
		);
		return this.pendingCustomers;
	}

	getSales() {
		console.log('PosStorage: getSales. Count ' + this.salesKeys.length);
		return this.salesKeys;
	}

	getFilteredSales(beginDate, endDate) {
		console.log(
			'PosStorage: getFilteredSales. between ' +
			beginDate.toString() +
			' and ' +
			endDate.toString()
		);
		return this.salesKeys.filter(receipt => {
			return moment
				.tz(new Date(receipt.saleDateTime), moment.tz.guess())
				.isBetween(beginDate, endDate);
		});
	}

	addSale(receipt) {
		return new Promise((resolve, reject) => {
			receipt.receiptId = uuidv1();
			let saleDateKey = receipt.createdDate.toISOString();
			this.salesKeys.push({
				saleDateTime: saleDateKey,
				saleKey: saleItemKey + saleDateKey
			});
			if (this.salesKeys.length > 1) {
				// When adding a sale, purge the top one if it is older than 30 days
				let oldest = this.salesKeys[0];
				let firstDate = new Date(oldest.saleDateTime);
				firstDate = new Date(
					firstDate.getTime() + 7 * 24 * 60 * 60 * 1000
				);
				// firstDate = new Date(
				// 	firstDate.getTime() + 30 * 24 * 60 * 60 * 1000
				// );
				const now = new Date();
				if (firstDate < now) {
					// Older than 30 days remove it
					this.salesKeys.shift();

					this.removeItem(oldest.saleKey)
						.then(resp => {
							Events.trigger('RemoveLocalReceipt', saleDateKey);
							console.log(resp);
							console.log('Removed ' + oldest.saleKey);
						})
						.catch(error => {
							console.log(error);
							console.log('error removing ' + oldest.saleKey);
						});
				}
			}

			this.pendingSales.push(saleItemKey + saleDateKey);
			let keyArray = [
				[saleItemKey + saleDateKey, this.stringify(receipt)], // The sale
				[salesKey, this.stringify(this.salesKeys)], // Array of date/time sales keys
				[pendingSalesKey, this.stringify(this.pendingSales)]
			]; // Pending sales keys

			this.multiSet(keyArray)
				.then(rows => {
					console.log('Entries' + rows);
					resolve(saleItemKey + saleDateKey);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	loadSale(saleKey) {
		console.log('PosStorage:loadSale');
		return new Promise((resolve, reject) => {
			this.getKey(saleKey.saleKey)
				.then(sale => {
					resolve(this.parseJson(sale));
				})
				.catch(err => reject(err));
		});
	}

	localOrders() {
		console.log('PosStorage:loadSalesReceipts');
		return new Promise((resolve, reject) => {
			let results = [];
			let sales = this.pendingSales;
			let resolvedCount = 0;
			if (sales.length === 0) {
				resolve(results);
			} else {
				for (let index = 0; index < sales.length; index++) {
					this._loadPendingSale(sales[index]).then(sale => {
						results.push(sale);
						resolvedCount++;
						if (resolvedCount === sales.length) {
							resolve(results);
						}
					});
				}
			}
		});
	}


	loadSalesReceipts(lastSalesSyncDate) {
		console.log('PosStorage:loadSalesReceipts');
		return new Promise((resolve, reject) => {
			let results = [];
			let sales = this.pendingSales;
			let resolvedCount = 0;
			if (sales.length === 0) {
				resolve(results);
			} else {
				for (let index = 0; index < sales.length; index++) {
					this._loadPendingSale(sales[index]).then(sale => {
						results.push({
							key: sales[resolvedCount],
							sale: sale
						});
						resolvedCount++;
						if (resolvedCount === sales.length) {
							resolve(results);
						}
					});
				}
			}
		});
	}

	removePendingSale(saleKey, saleId) {
		console.log('PostStorage:removePendingSale');
		const index = this.pendingSales.indexOf(saleKey);
		if (index > -1) {
			this.pendingSales.splice(index, 1);
			let keyArray = [
				[pendingSalesKey, this.stringify(this.pendingSales)]
			];

			this.multiSet(keyArray)
				.then(rows => {
					console.log('Affected rows ' + rows);

					Events.trigger('RemoveLocalReceipt', saleId);
				})
				.catch(error => {
					return console.log(
						'PosStorage:removePendingSale: Error: ' + error
					);
				});
		}
	}

	// Update a pending sale
	updatePendingSale(saleKey) {
		console.log('PostStorage:updatePendingSale');

		if (!saleKey.startsWith(saleItemKey)) {
			saleKey = `${saleItemKey}${saleKey}`;
		}

		this.getKey(saleKey)
			.then(receiptJSON => this.parseJson(receiptJSON))
			.then(receipt => {
				if (!receipt) return;

				receipt.active = 0;
				receipt.products = receipt.products.map(rli => {
					rli.active = 0;
					return rli;
				});
				this.setKey(saleKey, this.stringify(receipt));
			});
	}

	_loadPendingSale(saleKey) {
		return new Promise((resolve, reject) => {
			this.getKey(saleKey)
				.then(sale => {
					resolve(this.parseJson(sale));
				})
				.catch(err => reject(err));
		});
	}

	getProducts() {
		console.log('PosStorage: getProducts. Count ' + this.products.length);
		return this.products;
	}

	loadProductsFromKeys() {
		console.log(
			'loadProductsFromKeys. No of products: ' + this.productsKeys.length
		);
		return new Promise((resolve, reject) => {
			try {
				let that = this;
				this.multiGet(this.productsKeys).then(results => {
					that.products = results.map(result => {
						return that.parseJson(result[1]);
					});
					resolve();
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	makeProductKey(product) {
		return productItemKey + '_' + product.productId;
	}

	mergeProducts(remoteProducts) {
		let hasNewProducts = false;

		remoteProducts.forEach(
			function (product) {
				let productKey = this.makeProductKey(product);
				let keyIndex = this.productsKeys.indexOf(productKey);

				if (keyIndex === -1 && product.active) {
					hasNewProducts = true;
					this.productsKeys.push(productKey);
					this.products.push(product);
					this.setKey(productKey, this.stringify(product));
				} else if (keyIndex !== -1) {
					if (product.active) {
						this.setKey(productKey, this.stringify(product)); // Just update the existing product
						this.setLocalProduct(product);
					} else {
						// Product has been deactivated - remove it
						this.productsKeys.splice(keyIndex, 1);
						hasNewProducts = true;
						this.removeKey(productKey);
						let productIndex = this.getLocalProductIndex(product);
						if (productIndex != -1) {
							this.products.splice(productIndex, 1);
						}
					}
				}
			}.bind(this)
		);

		if (hasNewProducts) {
			this.setKey(productsKey, this.stringify(this.productsKeys));
			return true;
		}

		return false;
	}

	setLocalProduct(product) {
		for (let index = 0; index < this.products.length; index++) {
			if (this.products[index].productId === product.productId) {
				this.products[index] = product;
				return;
			}
		}
	}

	getLocalProductIndex(product) {
		for (let index = 0; index < this.products.length; index++) {
			if (this.products[index].productId === product.productId) {
				return index;
			}
		}
		return -1;
	}

	getSettings() {
		console.log('PosStorage: getSettings.');
		return this.settings;
	}

	loadSettings() {
		console.log('PosStorage:loadSettings');
		let settings = realm.objectForPrimaryKey('SemaRealm', settingsKey);
		if (settings) {
			console.log(this.parseJson(settings.data));
			return this.parseJson(settings.data);
		}

		if (!settings) {
			console.log(this.settings);
			return this.settings;
		}

	}

	saveSettings(url, site, user, password, uiLanguage, token, siteId, loginSync) {
		let settings = {
			semaUrl: url,
			site,
			user,
			password,
			uiLanguage,
			token,
			siteId,
			loginSync
		};
		this.settings = settings;
		this.setKey(settingsKey, this.stringify(settings));
	}

	setTokenExpiration() {
		// Currently the token is good for one day (24 hours)
		let expirationDate = new Date();
		expirationDate.setTime(expirationDate.getTime() + 22 * 60 * 60 * 1000);
		console.log('Token will expire at: ' + expirationDate.toString());
		this.setKey(tokenExpirationKey, expirationDate.toISOString());
		this.tokenExpiration = expirationDate;
	}
	getTokenExpiration() {
		return this.tokenExpiration;
	}

	setLastCustomerSync(lastSyncTime) {
		this.lastCustomerSync = lastSyncTime;
		this.setKey(lastCustomerSyncKey, this.lastCustomerSync.toISOString());
	}

	setLastProductSync(lastSyncTime) {
		this.lastProductsSync = lastSyncTime;
		this.setKey(lastProductsSyncKey, this.lastProductsSync.toISOString());
	}

	setLastSalesSync(lastSyncTime) {
		this.lastSalesSync = lastSyncTime;
		this.setKey(lastSalesSyncKey, this.lastSalesSync.toISOString());
	}

	getSalesChannels() {
		return this.salesChannels;
	}

	saveSalesChannels(salesChannelArray) {
		this.salesChannels = salesChannelArray;
		this.setKey(salesChannelsKey, this.stringify(salesChannelArray));
	}

	loadSalesChannels() {
		console.log('PosStorage:loadSalesChannels');
		return new Promise((resolve, reject) => {
			this.getKey(salesChannelsKey)
				.then(salesChannels => {
					if (!salesChannels) {
						return resolve([]);
					}
					resolve(this.parseJson(salesChannels));
				})
				.catch(err => reject(err));
		});
	}

	loadProductMrps() {
		console.log('PosStorage:loadProductMrps');
		return new Promise((resolve, reject) => {
			this.getKey(productMrpsKey)
				.then(productMrps => {
					if (!productMrps) {
						return resolve([]);
					}
					resolve(this.parseJson(productMrps));
				})
				.catch(err => reject(err));
		});
	}

	getSalesChannelsForDisplay() {
		return this.salesChannels.map(salesChannel => {
			return {
				id: salesChannel.id,
				name: salesChannel.name,
				displayName: capitalizeWord(salesChannel.name),
				active: salesChannel.active
			};
		});
	}

	getSalesChannelFromName(name) {
		for (let i = 0; i < this.salesChannels.length; i++) {
			if (this.salesChannels[i].name === name) {
				return this.salesChannels[i];
			}
		}
		return null;
	}

	getSalesChannelFromId(id) {
		for (let i = 0; i < this.salesChannels.length; i++) {
			if (this.salesChannels[i].id === id) {
				return this.salesChannels[i];
			}
		}
		return null;
	}

	getCustomerTypesForDisplay(salesChannelId = 0) {
		let customerTypesForDisplay = [];
		if (salesChannelId != 0) {
			this.customerTypes.forEach(customerType => {
				if (customerType.name !== 'anonymous' && customerType.salesChannelId == salesChannelId) {
					customerTypesForDisplay.push({
						id: customerType.id,
						name: customerType.name,
						displayName: capitalizeWord(customerType.name),
						salesChannelId: customerType.salesChannelId
					});
				}
			});
		}
		else {
			this.customerTypes.forEach(customerType => {
				if (customerType.name !== 'anonymous' && salesChannelId == 0) {
					customerTypesForDisplay.push({
						id: customerType.id,
						name: customerType.name,
						displayName: capitalizeWord(customerType.name),
						salesChannelId: customerType.salesChannelId
					});
				}
			});

		}
		return customerTypesForDisplay;
	}

	getCustomerTypes() {
		return this.customerTypes;
	}

	getCustomerTypeByName(name) {
		for (let i = 0; i < this.customerTypes.length; i++) {
			if (this.customerTypes[i].name === name) {
				return this.customerTypes[i];
			}
		}
		return null;
	}
	saveCustomerTypes(customerTypesArray) {
		this.customerTypes = customerTypesArray;
		this.setKey(customerTypesKey, this.stringify(customerTypesArray));
	}

	saveProductMrps(productMrpsArray) {
		this.productMrpDict = {}; // Note - This assumes that all productMrps are being saved
		productMrpsArray.forEach(productMrp => {
			const key = this.getProductMrpKey(productMrp);
			this.productMrpDict[key] = productMrp;
		});
		this.setKey(productMrpsKey, this.stringify(this.productMrpDict));
	}

	getProductMrps() {
		return this.productMrpDict;
	}

	getProductMrpKey(productMrp) {
		return '' + productMrp.productId + '-' + productMrp.salesChannelId; // ProductId and salesChannelId are unique key
	}

	getProductMrpKeyFromIds(productId, salesChannelId) {
		return '' + productId + '-' + salesChannelId;
	}

	getGetSyncInterval() {
		if (this.syncInterval == null) {
			this.syncInterval = {
				interval: 10 * 60 * 1000
			}; // Default to 10 minutes
		}
		return this.syncInterval.interval;
	}

	setGetSyncInterval(intervalInMinutes) {
		this.setKey(
			syncIntervalKey,
			JSON.stringify({
				interval: intervalInMinutes * 60 * 1000
			})
		);
	}

	getInventoryKeys() {
		return this.inventoriesKeys;
	}

	addOrUpdateInventoryItem(inventory, inventoryDate) {
		console.log('inventory', inventory);
		console.log('PosStorage: getInventoryItem');
		if (typeof inventoryDate == 'string') {
			inventoryDate = new Date(inventoryDate);
		}

		return new Promise((resolve, reject) => {
			let inventoryKey = this._makeInventoryKey(inventoryDate);
			console.log('inventoryKey', inventoryKey);
			let existing = this._getInventoryItemKey(inventoryDate);
			console.log('existing', existing);
			if (existing != null) {
				this.setKey(inventoryKey, this.stringify(inventory)).then(
					error => {
						if (error) {
							reject(error);
						} else {
							resolve(true);
						}
					}
				);
			} else {
				console.log('existing', existing);
				console.log('inventoryDate', inventoryDate);
				console.log('inventoryKey', inventoryKey);
				this.inventoriesKeys.push({
					inventoryDate: inventoryDate,
					inventoryKey: inventoryKey
				});

				if (this.inventoriesKeys.length > 1) {
					// When adding an item, purge the top one if it is older than 32 days
					let oldest = this.inventoriesKeys[0];
					let firstDate = new Date(oldest.inventoryDate);
					firstDate = new Date(
						firstDate.getTime() + 32 * 24 * 60 * 60 * 1000
					);
					const now = new Date();
					if (firstDate < now) {
						// Older than 32 days remove it
						this.inventoriesKeys.shift();

						this.removeItem(oldest.inventoryKey)
							.then(data => {
								console.log(data);
								console.log('Removed ' + oldest.inventoryKey);
							})
							.catch(error => {
								console.log(error);
								console.log(
									'error removing ' + oldest.inventoryKey
								);
							});
					}
				}
				let keyArray = [
					[inventoryKey, this.stringify(inventory)],
					[inventoriesKey, this.stringify(this.inventoriesKeys)]
				]; // Array of date/time inventory keys

				this.multiSet(keyArray)
					.then(rows => {
						console.log(rows);
						resolve(true);
					})
					.catch(error => {
						reject(error);
					});
			}
		});
	}

	getInventoryItem(inventoryDate) {
		return new Promise(resolve => {
			let key = this._getInventoryItemKey(inventoryDate);
			if (key != null) {
				this.getKey(key)
					.then(item => {
						resolve(this.parseJson(item));
					})
					.catch(err => resolve(null));
			} else {
				resolve(null);
			}
		});
	}

	saveRemoteReceipts(receipts = []) {
		this.receipts = receipts;
		this.setKey(remoteReceiptsKey, this.stringify(receipts));
	}

	addRemoteReceipts(receipts) {
		this.receipts = this.getReceipts();
		console.log(this.receipts);
		let temp = [...this.receipts, ...receipts];
		let toBeSaved = this.removeDuplicates(temp, 'id');
		return this.setKey(remoteReceiptsKey, this.stringify(toBeSaved)).then(
			() => {
				return toBeSaved;
			}
		);
	}

	removeDuplicates(arr, comp) {
		const unique = arr
			.map(e => e[comp])
			.map((e, i, final) => final.indexOf(e) === i && i)
			.filter(e => arr[e])
			.map(e => arr[e]);

		return unique;
	}

	getRemoteReceipts() {
		// 'PosStorage: getRemoteReceipts. Count ' + this.receipts.length,
		return this.receipts;
	}

	loadRemoteReceipts() {
		return this.getKey(remoteReceiptsKey).then(receipts => {
			this.receipts = JSON.parse(receipts);
			console.log('receipts', this.receipts);
			return this.receipts;
		});
	}

	updateLoggedReceipt(receiptId, updatedFields) {
		this.getKey(remoteReceiptsKey)
			.then(receiptsJSON => this.parseJson(receiptsJSON))
			.then(receipts => {
				if (!receipts) return;

				receipts = receipts.map(receipt => {
					console.log(receiptId, receipt.id);
					if (receipt.id === receiptId) {
						receipt = {
							...receipt,
							...updatedFields
						};
						receipt.receipt_line_items = receipt.receipt_line_items.map(
							rli => {
								rli.active = updatedFields.active;
								return rli;
							}
						);
					}
					return receipt;
				});

				this.receipts = receipts;
				this.setKey(remoteReceiptsKey, this.stringify(this.receipts));
			});
	}

	logReceipt(receipt) {
		this.getKey(remoteReceiptsKey)
			.then(receiptsJSON => this.parseJson(receiptsJSON))
			.then(receipts => {
				if (!receipts) return;

				receipts.push(receipt);
				this.receipts = receipts;
				this.setKey(remoteReceiptsKey, this.stringify(this.receipts));
			});
	}

	// Return existing inventory item key or null
	_getInventoryItemKey(inventoryDate) {
		console.log('PosStorage:getInventoryItem');
		let inventoryKey = this._makeInventoryKey(inventoryDate);
		for (let index = 0; index < this.inventoriesKeys.length; index++) {
			if (this.inventoriesKeys[index].inventoryKey == inventoryKey) {
				return inventoryKey;
			}
		}
		return null;
	}

	    loadInventoryFromKeys() {
        console.log('loadInventoryFromKeys. No of inventory: ' ,this.inventoriesKeys);

		console.log(this.inventoriesKeys.map(key => key.inventoryKey));
        let that = this;
		let results = this.getMany(this.inventoriesKeys.map(key => key.inventoryKey));
		console.log('loadInventoryFromKeys. No of inventory results: ' , results.map(key => JSON.parse(key[1])));

        return that.inventory = results.map(result => {
            return that.parseJson(result[1]);
        });

	}

	getInventory() {
        console.log('InventroyRealm: Inventory. Count ' + this.inventory.length);
        return this.inventory;
    }



	_makeInventoryKey(date) {
		console.log('PosStorage._makeInventoryKey' + date);
		return (
			inventoryItemKey +
			date.getFullYear() +
			'-' +
			date.getMonth() +
			'-' +
			date.getDate()
		);
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
		// console.log(
		// 	'Pos Storage:setKey() Key: ' + key + ' Value: ' + stringValue
		// );
		return await this.setItem(key, stringValue);
	}

	async removeKey(key) {
		try {
			await this.removeItem(key);
		} catch (error) {
			console.log('Pos Storage Error removing data' + error);
		}
	}
}
// Storage is a singleton

export default new PosStorage();
