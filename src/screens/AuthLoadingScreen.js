import React from 'react';
if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React);
}
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
import * as WastageActions from "../actions/WastageActions";
import * as SettingsActions from '../actions/SettingsActions';
import * as ProductActions from '../actions/ProductActions';
import * as receiptActions from '../actions/ReceiptActions';
import * as discountActions from '../actions/DiscountActions';
import * as paymentTypesActions from '../actions/PaymentTypesActions';
import * as CustomerReminderActions from '../actions/CustomerReminderActions';

import CreditRealm from '../database/credit/credit.operations';
import CustomerRealm from '../database/customers/customer.operations'
import InventroyRealm from '../database/inventory/inventory.operations';
import SettingRealm from '../database/settings/settings.operations';
import ProductsRealm from '../database/products/product.operations';
import OrderRealm from '../database/orders/orders.operations';
import DiscountRealm from '../database/discount/discount.operations';

import CustomerReminderRealm from '../database/customer-reminder/customer-reminder.operations';

import Synchronization from '../services/Synchronization';

import CustomerDebtRealm from '../database/customer_debt/customer_debt.operations';

import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import ReceiptPaymentTypeRealm from '../database/reciept_payment_types/reciept_payment_types.operations';
import Communications from '../services/Communications';
import NetInfo from "@react-native-community/netinfo";
class AuthLoadingScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            animating: true,
            isConnected: false,
        };
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

    shouldComponentUpdate(nextProps, nextState) {
        console.log('nextProps', nextProps);
        console.log('props', this.props);
        console.log('nextState', nextState);
        //return nextProps.navigation !== this.props.navigation;
        return false;
    }

    subtractDays = (theDate, days) => {
        return new Date(theDate.getTime() - days * 24 * 60 * 60 * 1000);
    };



    loadSyncedData() {
        this.props.customerActions.setCustomers(
            CustomerRealm.getAllCustomer()
        );
        this.props.topUpActions.setTopups(
            CreditRealm.getAllCredit()
        );

        this.props.wastageActions.GetInventoryReportData(this.subtractDays(new Date(), 1), new Date(), ProductsRealm.getProducts());


        this.props.inventoryActions.setInventory(
            InventroyRealm.getAllInventory()
        );
        this.props.productActions.setProducts(
            ProductsRealm.getProducts()
        );

        this.props.receiptActions.setReceipts(
            OrderRealm.getAllOrder()
        );
        //PaymentTypeRealm.truncate();
        this.props.paymentTypesActions.setPaymentTypes(
            PaymentTypeRealm.getPaymentTypes()
        );

        this.props.paymentTypesActions.setRecieptPaymentTypes(
            ReceiptPaymentTypeRealm.getReceiptPaymentTypes()
        );

        this.props.customerReminderActions.setCustomerReminders(
            CustomerReminderRealm.getCustomerReminders()
        );

        this.props.paymentTypesActions.setCustomerPaidDebt(
            CustomerDebtRealm.getCustomerDebts()
        );

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

    componentWillUnmount() { }

    render() {
        const animating = this.state.animating;
        return (
            <View style={styles.container}>
                <ActivityIndicator animating={animating} size={120} color="#ABC1DE" />
                <StatusBar barStyle="default" />
            </View>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        network: state.networkReducer.network,
        settings: state.settingsReducer.settings,
        products: state.productReducer.products,
        discounts: state.discountReducer.discounts
    };
}

function mapDispatchToProps(dispatch) {
    return {
        networkActions: bindActionCreators(NetworkActions, dispatch),
        settingsActions: bindActionCreators(SettingsActions, dispatch),
        customerActions: bindActionCreators(CustomerActions, dispatch),
        wastageActions: bindActionCreators(WastageActions, dispatch),
        topUpActions: bindActionCreators(TopUpActions, dispatch),
        authActions: bindActionCreators(AuthActions, dispatch),
        inventoryActions: bindActionCreators(InventoryActions, dispatch),
        productActions: bindActionCreators(ProductActions, dispatch),
        receiptActions: bindActionCreators(receiptActions, dispatch),
        discountActions: bindActionCreators(discountActions, dispatch),
        paymentTypesActions: bindActionCreators(paymentTypesActions, dispatch),
        customerReminderActions: bindActionCreators(CustomerReminderActions, dispatch),
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
