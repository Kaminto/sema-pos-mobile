import React from 'react';

import {
    View,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CustomerRealm from '../database/customers/customer.operations'
import SettingRealm from '../database/settings/settings.operations';
import ProductsRealm from '../database/products/product.operations';

import Synchronization from '../services/Synchronization';
import Communications from '../services/Communications';
import NetInfo from "@react-native-community/netinfo";

import * as CustomerActions from '../actions/CustomerActions';
import * as SettingsActions from '../actions/SettingsActions';
import * as ProductActions from '../actions/ProductActions';
import * as NetworkActions from '../actions/NetworkActions';

import { withNavigation } from 'react-navigation';

class AuthLoadingScreen extends React.Component {

    constructor() {
        super();
        this.state = {
            animating: true,
            isConnected: false,
        };
        this.activityIndicator = 120;
        this.activityColor = "#ABC1DE";
        this.barStyle = "default";
    }

    //  shouldComponentUpdate(nextProps, nextState) {
    //  return false;
    // }

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

       // console.log('customers', CustomerRealm.getAllCustomer())

        if (settings.site === "" && settings.siteId === 0) {
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
            this.props.networkActions.NetworkConnection(isConnected);
            Synchronization.setConnected(isConnected);
        });
    }

    subtractDays = (theDate, days) => {
        return new Date(theDate.getTime() - days * 24 * 60 * 60 * 1000);
    };

    loadSyncedData() {

        this.props.customerActions.setCustomers(
            CustomerRealm.getAllCustomer()
        );
        this.props.productActions.setProducts(
            ProductsRealm.getProducts()
        );



        // this.props.topUpActions.setTopups(
        //     CreditRealm.getAllCredit()
        // );

        // this.props.wastageActions.GetInventoryReportData(this.subtractDays(new Date(), 1), new Date(), ProductsRealm.getProducts());


        // this.props.inventoryActions.setInventory(
        //     InventroyRealm.getAllInventory()
        // );
       

        // this.props.receiptActions.setReceipts(
        //     OrderRealm.getAllOrder()
        // );

        // this.props.paymentTypesActions.setPaymentTypes(
        //     PaymentTypeRealm.getPaymentTypes()
        // );

        // this.props.paymentTypesActions.setRecieptPaymentTypes(
        //     ReceiptPaymentTypeRealm.getReceiptPaymentTypes()
        // );

        // this.props.customerReminderActions.setCustomerReminders(
        //     CustomerReminderRealm.getCustomerReminders()
        // );

        // this.props.paymentTypesActions.setCustomerPaidDebt(
        //     CustomerDebtRealm.getCustomerDebts()
        // );

        // this.props.discountActions.setDiscounts(
        //     DiscountRealm.getDiscounts()
        // );

      
        Synchronization.setConnected(this.props.network.isNWConnected);
    };

    componentWillUnmount() { }

    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator animating={this.state.animating} size={this.activityIndicator} color={this.activityColor} />
                <StatusBar barStyle={this.barStyle} />
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
        productActions: bindActionCreators(ProductActions, dispatch),
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
