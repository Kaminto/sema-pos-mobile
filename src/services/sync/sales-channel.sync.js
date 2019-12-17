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
                    console.log('initlocalSalesChannels', initlocalSalesChannels);
                    console.log('localSalesChannels', localSalesChannels);
                    console.log('remoteSalesChannels', remoteSalesChannels);
                    if (initlocalSalesChannels.length === 0) {
                        SalesChannelRealm.createManySalesChannel(remoteSalesChannel.salesChannels);
                    }

                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalSalesChannels.length > 0) {

                        console.log('initlocalSalesChannels', initlocalSalesChannels);
                        console.log('localSalesChannels', localSalesChannels);
                        console.log('remoteSalesChannels', remoteSalesChannels);
                        initlocalSalesChannels.forEach(localSalesChannel => {
                            let filteredObj = remoteSalesChannels.filter(obj => obj.id === localSalesChannel.id)
                            console.log('filteredObj', filteredObj);
                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteSalesChannels.map(function (e) { return e.id }).indexOf(filteredObj[0].id);
                                const localIndex = localSalesChannels.map(function (e) { return e.id }).indexOf(filteredObj[0].id);
                                console.log('remoteIndex', remoteIndex);
                                console.log('localIndex', localIndex);
                                remoteSalesChannels.splice(remoteIndex, 1);
                                localSalesChannels.splice(localIndex, 1);

                                inLocal.push(localSalesChannel);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localSalesChannel);
                                const localIndex = localSalesChannels.map(function (e) { return e.id }).indexOf(localSalesChannel.id);
                                console.log('localIndex', localIndex);
                                localSalesChannels.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteSalesChannels);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            SalesChannelRealm.createManySalesChannel(onlyRemote)
                        }

                        console.log('onlyRemote', onlyRemote);
                        console.log('onlyLocally', onlyLocally);
                        console.log('bothLocalRemote', bothLocalRemote);
 
                       
                    }
                    resolve({
                        error: null,
                        salesChannels: onlyLocally.length + onlyRemote.length,
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getInventory - error ' , error
                    );
                    resolve({
                        error: error.message,
                        salesChannels: 0
                    });
                });
        });
    }
 

}
export default new SalesChannelSync();