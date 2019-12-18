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
import SettingRealm from '../database/settings/settings.operations';
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
        let settings = SettingRealm.getAllSetting();
        console.log('settings', settings);
        if (settings.site === "" && settings.siteId === 0) {
            this.props.settingsActions.setSettings({ ...settings, loginSync: true });
            this.props.navigation.navigate('Login');
        }


        if (settings.site != "" && settings.siteId > 0) {

            if (settings.token.length > 1) {
                Communications.initialize(
                    settings.semaUrl,
                    settings.site,
                    settings.user,
                    settings.password,
                    settings.token,
                    settings.siteId
                );

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
                console.log('getRemoteReceipts', this.posStorage.getRemoteReceipts());
                console.log('SalesChannelRealm', CustomerTypeRealm.getCustomerTypes())
                console.log('SalesChannelRealm', CustomerTypeRealm.getCustomerTypeByName('anonymous'));
                Synchronization.initialize(
                    CustomerRealm.getLastCustomerSync(),
                    ProductsRealm.getLastProductsync(),
                    PosStorage.getLastSalesSync(),
                    CreditRealm.getLastCreditSync(),
                    InventroyRealm.getLastInventorySync(),
                );

                //ProductsRealm.truncate();

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