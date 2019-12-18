import realm from '../init';
const uuidv1 = require('uuid/v1');
import moment from 'moment-timezone';

class SettingRealm {
    constructor() {
        this.setting = [];
        this.settings = {
			semaUrl: 'http://142.93.115.206:3006/',
			site: '',
			user: '',
			password: '',
			uiLanguage: JSON.stringify({ name: 'English', iso_code: 'en' }),
			token: '',
			loginSync: false,
			siteId: ''
        };
        
        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('Settings')))).length == 0) {
                realm.create('Settings', this.settings);
            }
        });
    }

  
    truncate() {
        try {
            realm.write(() => {
                let settings = realm.objects('Settings');
                realm.delete(settings);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    getAllSetting() {
        return this.setting = {...Object.values(JSON.parse(JSON.stringify(realm.objects('Settings'))))[0], uiLanguage: JSON.parse(Object.values(JSON.parse(JSON.stringify(realm.objects('Settings'))))[0].uiLanguage)};
    }

    initialise() {
        return this.getAllSetting();
    }

    formatDay(date) {
        date = new Date(date);
        var day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();
        if (month.toString().length == 1) {
            month = "0" + month;
        }
        if (day.toString().length == 1) {
            day = "0" + day;
        }

        return date = year + '-' + month + '-' + day;
    }


    saveSettings(url, site, user, password, uiLanguage, token, siteId, loginSync) {
		let settings = {
			semaUrl: url,
			site,
			user,
			password,
			uiLanguage: JSON.stringify(uiLanguage),
			token,
			siteId,
			loginSync
		};
		this.settings = settings;
        try {
            realm.write(() => {
                let settingObj = realm.objects('Settings');
              
                settingObj[0].semaUrl = semaUrl;
                settingObj[0].site = site;
                settingObj[0].user = user;
                settingObj[0].password = password;
                settingObj[0].uiLanguage = uiLanguage;
                settingObj[0].token = token;
                settingObj[0].siteId = siteId;
                settingObj[0].loginSync = loginSync;
        
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

	}
  
}

export default new SettingRealm();
