import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import SalesChannelApi from '../api/sales-channel.api';
import * as _ from 'lodash';

class SalesChannelSync {

    synchronizeSalesChannels() {
        return new Promise(resolve => {
            SalesChannelApi.getSalesChannels()
                .then(remoteSalesChannel => {
                    let initlocalSalesChannels = SalesChannelRealm.getSalesChannels();
                    let localSalesChannels = [...initlocalSalesChannels];
                    let remoteSalesChannels = [...remoteSalesChannel.salesChannels]; 
                    if (initlocalSalesChannels.length === 0) {
                        SalesChannelRealm.createManySalesChannel(remoteSalesChannel.salesChannels);
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalSalesChannels.length > 0) {
 
                        initlocalSalesChannels.forEach(localSalesChannel => {
                            let filteredObj = remoteSalesChannels.filter(obj => obj.id === localSalesChannel.id)
                            
                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteSalesChannels.map(function (e) { return e.id }).indexOf(filteredObj[0].id);
                                const localIndex = localSalesChannels.map(function (e) { return e.id }).indexOf(filteredObj[0].id);
                                 remoteSalesChannels.splice(remoteIndex, 1);
                                localSalesChannels.splice(localIndex, 1);

                                inLocal.push(localSalesChannel);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localSalesChannel);
                                const localIndex = localSalesChannels.map(function (e) { return e.id }).indexOf(localSalesChannel.id);
                                 localSalesChannels.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteSalesChannels);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            SalesChannelRealm.createManySalesChannel(onlyRemote)
                        } 
 
                       
                    }
                    resolve({
                        error: null,
                        salesChannels: onlyLocally.length + onlyRemote.length,
                    });

                })
                .catch(error => {
                    
                    resolve({
                        error: error,
                        salesChannels: 0
                    });
                });
        });
    }
 

}
export default new SalesChannelSync();