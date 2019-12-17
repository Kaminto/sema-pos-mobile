import realm from '../init';
import { capitalizeWord } from '../../services/Utilities';
class SalesChannelRealm {
    constructor() {
        this.salesChannels = [];
    }
 
    truncate() {
        try {
            realm.write(() => { 
                realm.delete(realm.objects('SalesChannel'));
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }
 
 
    getSalesChannels() {
        return this.salesChannels =Object.values(JSON.parse(JSON.stringify(realm.objects('SalesChannel'))));
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

    initialise() {
        return this.getSalesChannels();
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

 
    createManySalesChannel(salesChannels) {
        console.log('salesChannels', salesChannels)
        try {
            realm.write(() => {
                salesChannels.forEach(obj => {
                    realm.create('SalesChannel', obj);
                });
            });

        } catch (e) {
            console.log("Error on creation", e);
        }

    }
}

export default new SalesChannelRealm();
