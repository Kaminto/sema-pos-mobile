import React from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import RNLanguages from 'react-native-languages';
import i18n from '../app/i18n';


import * as CustomerActions from '../actions/CustomerActions';
import * as TopUpActions from '../actions/TopUpActions';
import * as InventoryActions from '../actions/InventoryActions';
import * as NetworkActions from '../actions/NetworkActions';
import * as SettingsActions from '../actions/SettingsActions';
import * as ProductActions from '../actions/ProductActions';
import * as receiptActions from '../actions/ReceiptActions';

import PosStorage from '../database/PosStorage';
import CreditRealm from '../database/credit/credit.operations';
import CustomerRealm from '../database/customers/customer.operations'
import InventroyRealm from '../database/inventory/inventory.operations';
import ProductMRPRealm from '../database/productmrp/productmrp.operations';

import CustomerTypeRealm from '../database/customer-types/customer-types.operations';
import SalesChannelRealm from '../database/sales-channels/sales-channels.operations';

import ProductsRealm from '../database/products/product.operations';
import Synchronization from '../services/Synchronization';
import Communications from '../services/Communications';
import CreditApi from '../services/api/credit.api';
import InventoryApi from '../services/api/inventory.api';
import CustomerApi from '../services/api/customer.api';
import ProductApi from '../services/api/product.api';
import SalesChannelApi from '../services/api/sales-channel.api';
import CustomerTypeApi from '../services/api/customer-types.api';
import NetInfo from "@react-native-community/netinfo";

class AuthLoadingScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isConnected: false,
        };
        this.posStorage = PosStorage;

    }

    async componentDidMount() {

        console.log('PosApp - componentDidMount enter');

        let isInitialized = this.posStorage.checkLocalDb();
        let settings = this.posStorage.loadSettings();

        if (isInitialized === 'SetUp Required') {
            this.posStorage.initialLocalDb();
            this.posStorage.saveSettings(
                settings.semaUrl,
                settings.site,
                settings.user,
                settings.password,
                settings.uiLanguage,
                settings.token,
                settings.siteId,
                true,
            );
            this.props.settingsActions.setSettings({ ...settings, loginSync: true });
            this.props.navigation.navigate('Login');
        }

        if (isInitialized === 'SetUp Not Required') {
            if (settings.token.length > 1) {

                Communications.initialize(
                    settings.semaUrl,
                    settings.site,
                    settings.user,
                    settings.password
                );
                Communications.setToken(settings.token);
                Communications.setSiteId(settings.siteId);

                CreditApi.initialize(
                    settings.semaUrl,
                    settings.site,
                    settings.user,
                    settings.password
                );
                CreditApi.setToken(settings.token);
                CreditApi.setSiteId(settings.siteId);


                InventoryApi.initialize(
                    settings.semaUrl,
                    settings.site,
                    settings.user,
                    settings.password
                );
                InventoryApi.setToken(settings.token);
                InventoryApi.setSiteId(settings.siteId);


                CustomerApi.initialize(
                    settings.semaUrl,
                    settings.site,
                    settings.user,
                    settings.password
                );
                CustomerApi.setToken(settings.token);
                CustomerApi.setSiteId(settings.siteId);

                ProductApi.initialize(
                    settings.semaUrl,
                    settings.site,
                    settings.user,
                    settings.password
                );
                ProductApi.setToken(settings.token);
                ProductApi.setSiteId(settings.siteId);

                CustomerTypeApi.initialize(
                    settings.semaUrl,
                    settings.site,
                    settings.user,
                    settings.password
                );
                CustomerTypeApi.setToken(settings.token);
                CustomerTypeApi.setSiteId(settings.siteId);

                SalesChannelApi.initialize(
                    settings.semaUrl,
                    settings.site,
                    settings.user,
                    settings.password
                );
                SalesChannelApi.setToken(settings.token);
                SalesChannelApi.setSiteId(settings.siteId);


                this.posStorage.loadLocalData();

                this.props.customerActions.setCustomers(
                    CustomerRealm.getAllCustomer()
                );
                this.props.topUpActions.setTopups(
                    CreditRealm.getAllCredit()
                );
                // InventroyRealm.truncate();
                this.props.inventoryActions.setInventory(
                    InventroyRealm.getAllInventory()
                );

                this.props.productActions.setProducts(
                    ProductsRealm.getProducts()
                );
                this.props.receiptActions.setRemoteReceipts(
                    this.posStorage.getRemoteReceipts()
                );

                Synchronization.initialize(
                    CustomerRealm.getLastCustomerSync(),
                    ProductsRealm.getLastProductsync(),
                    PosStorage.getLastSalesSync(),
                    CreditRealm.getLastCreditSync(),
                    InventroyRealm.getLastInventorySync(),
                );


                //ProductsRealm.truncate();



                console.log('SalesChannelRealm', SalesChannelRealm.getSalesChannels());
                console.log('CustomerTypeRealm', CustomerTypeRealm.getCustomerTypes());
                console.log(ProductsRealm.getProducts());

                console.log('CreditRealm.getLastCreditSync(),', CreditRealm.getLastCreditSync())
                console.log('CustomerRealm.getLastCustomerSync()(),', CustomerRealm.getLastCustomerSync())

                Synchronization.setConnected(this.props.network.isNWConnected);

                this.props.settingsActions.setSettings({ ...settings, loginSync: false });
                this.props.navigation.navigate('App');
            }

            if (settings.token.length === 0) {
                this.props.settingsActions.setSettings({ ...settings, loginSync: true });
                this.props.navigation.navigate('Login');
            }

        }


        NetInfo.isConnected.fetch().then(isConnected => {
            console.log('Network is ' + (isConnected ? 'online' : 'offline'));
            this.props.networkActions.NetworkConnection(isConnected);
            Synchronization.setConnected(isConnected);
        });


        console.log('PosApp = Mounted-Done');
    }


    componentWillUnmount() {

    }

    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator size={120} color="#0000ff" />
                <StatusBar barStyle="light-content" />
            </View>
        );
    }



}



function mapStateToProps(state, props) {
    return {
        network: state.networkReducer.network,
        settings: state.settingsReducer.settings,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        networkActions: bindActionCreators(NetworkActions, dispatch),
        settingsActions: bindActionCreators(SettingsActions, dispatch),
        customerActions: bindActionCreators(CustomerActions, dispatch),
        topUpActions: bindActionCreators(TopUpActions, dispatch),
        inventoryActions: bindActionCreators(InventoryActions, dispatch),
        productActions: bindActionCreators(ProductActions, dispatch),
        receiptActions: bindActionCreators(receiptActions, dispatch)
    };
}


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AuthLoadingScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});