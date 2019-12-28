import React from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


import * as CustomerActions from '../actions/CustomerActions';
import * as TopUpActions from '../actions/TopUpActions';
import * as InventoryActions from '../actions/InventoryActions';
import * as NetworkActions from '../actions/NetworkActions';
import * as AuthActions from '../actions/AuthActions';
import * as SettingsActions from '../actions/SettingsActions';
import * as ProductActions from '../actions/ProductActions';
import * as receiptActions from '../actions/ReceiptActions';
import * as discountActions from '../actions/DiscountActions';

import PosStorage from '../database/PosStorage';
import CreditRealm from '../database/credit/credit.operations';
import CustomerRealm from '../database/customers/customer.operations'
import InventroyRealm from '../database/inventory/inventory.operations';
import SettingRealm from '../database/settings/settings.operations';
import ProductsRealm from '../database/products/product.operations';
import OrderRealm from '../database/orders/orders.operations';
import DiscountRealm from '../database/discount/discount.operations';

import Synchronization from '../services/Synchronization';
import Communications from '../services/Communications';
import NetInfo from "@react-native-community/netinfo";

class AuthLoadingScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            animating: true,
            isConnected: false,
        };
        this.posStorage = PosStorage;
    }

    componentDidMount() {
        let settings = SettingRealm.getAllSetting();
        Communications.initialize(
            settings.semaUrl,
            settings.site,
            settings.user,
            settings.password,
            settings.token,
            settings.siteId
        );

        if (settings.site === "" && settings.siteId === 0) {
            this.posStorage.initialLocalDb();
            this.props.settingsActions.setSettings({ ...settings, loginSync: true });
            this.props.navigation.navigate('Login');
        }

        if (settings.site != "" && settings.siteId > 0) {
            this.loadSyncedData();
            if (settings.token.length > 1) {
                this.props.settingsActions.setSettings({ ...settings, loginSync: false });
                this.props.navigation.navigate('App');
            }

            if (settings.token.length === 0) {
                this.props.settingsActions.setSettings(settings);
                this.props.navigation.navigate('Login');
            }
        }

        NetInfo.isConnected.fetch().then(isConnected => {
            console.log('Network is ' + (isConnected ? 'online' : 'offline'));
            this.props.networkActions.NetworkConnection(isConnected);
            Synchronization.setConnected(isConnected);
        });
    }

    loadSyncedData() {
        this.posStorage.loadLocalData();
       // this.posStorage.initialLocalDb();
        this.props.customerActions.setCustomers(
            CustomerRealm.getAllCustomer()
        );
        this.props.topUpActions.setTopups(
            CreditRealm.getAllCredit()
        );
        this.props.inventoryActions.setInventory(
            InventroyRealm.getAllInventory()
        );
        this.props.productActions.setProducts(
            ProductsRealm.getProducts()
        );
        this.props.receiptActions.setRemoteReceipts(
            this.posStorage.getRemoteReceipts()
        );
        //OrderRealm.truncate();
        this.props.receiptActions.setReceipts(
            OrderRealm.getAllOrder()
        );

        console.log('getDiscounts', DiscountRealm.getDiscounts());
        this.props.discountActions.setDiscounts(
            DiscountRealm.getDiscounts()
        );

        

        Synchronization.initialize(
            CustomerRealm.getLastCustomerSync(),
            ProductsRealm.getLastProductsync(),
            '',
            CreditRealm.getLastCreditSync(),
            InventroyRealm.getLastInventorySync(),
        );
        Synchronization.setConnected(this.props.network.isNWConnected);
    };

    componentWillUnmount() {}

    render() {
        const animating = this.state.animating;
        return (
            <View style={styles.container}>
                <ActivityIndicator animating={animating} size={120} color="#0000ff" />
                <StatusBar barStyle="default" />
            </View>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        network: state.networkReducer.network,
        settings: state.settingsReducer.settings,
        discounts: state.discountReducer.discounts
    };
}

function mapDispatchToProps(dispatch) {
    return {
        networkActions: bindActionCreators(NetworkActions, dispatch),
        settingsActions: bindActionCreators(SettingsActions, dispatch),
        customerActions: bindActionCreators(CustomerActions, dispatch),
        topUpActions: bindActionCreators(TopUpActions, dispatch),
        authActions: bindActionCreators(AuthActions, dispatch),
        inventoryActions: bindActionCreators(InventoryActions, dispatch),
        productActions: bindActionCreators(ProductActions, dispatch),
        receiptActions: bindActionCreators(receiptActions, dispatch),
        discountActions: bindActionCreators(discountActions, dispatch),        
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
    }
});
