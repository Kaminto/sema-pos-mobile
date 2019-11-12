import React, { Component } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableHighlight,
    TextInput,
    StyleSheet,
    Dimensions,
    Image,
    Alert,

    ActivityIndicator,
    Button,
    StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createAppContainer } from 'react-navigation';
import JibuRouter from '../routes/semaRouter';

import { isEmptyObj } from '../services/Utilities';
import RNLanguages from 'react-native-languages';
import i18n from '../app/i18n';


import * as CustomerActions from '../actions/CustomerActions';
import * as NetworkActions from '../actions/NetworkActions';
import * as SettingsActions from '../actions/SettingsActions';
import * as ProductActions from '../actions/ProductActions';
import * as ToolbarActions from '../actions/ToolBarActions';
import * as receiptActions from '../actions/ReceiptActions';

import PosStorage from '../database/PosStorage';
import Synchronization from '../services/Synchronization';
import SiteReport from '../components/reports/SiteReport';
import Communications from '../services/Communications';
import Events from 'react-native-simple-events';


class AuthLoadingScreen extends React.Component {
    // constructor() {
    //   super();
    //   this._bootstrapAsync();
    // }

    // // Fetch the token from storage then navigate to our appropriate place
    // _bootstrapAsync = async () => {
    //   const userToken = await AsyncStorage.getItem('userToken');

    //   // This will switch to the App screen or Auth screen and this loading
    //   // screen will be unmounted and thrown away.
    //   this.props.navigation.navigate(userToken ? 'App' : 'Auth');
    // };

    constructor(props) {
        super(props);

        this.state = {
            synchronization: { productsLoaded: false },
            isConnected: false,
            isLoading: true
        };
        this.posStorage = PosStorage;

    }

    async componentWillMount() {

        console.log('PosApp - componentDidMount enter');

        // this.props.settingsActions.setSettings(settings);

        let isInitialized = this.posStorage.initialize(false);
        console.log(isInitialized);

        if (isInitialized) {
            let settings = this.posStorage.loadSettings();
            console.log(settings);
            this.props.settingsActions.setSettings(settings);
            console.log('settings--');
            Communications.initialize(
                settings.semaUrl,
                settings.site,
                settings.user,
                settings.password
            );
            Communications.setToken(settings.token);
            Communications.setSiteId(settings.siteId);

            this.props.customerActions.setCustomers(
                this.posStorage.getCustomers() ? this.posStorage.getCustomers() : []
            );
            this.props.productActions.setProducts(
                this.posStorage.getProducts() ? this.posStorage.getProducts() : [] 
            );
            this.props.receiptActions.setRemoteReceipts(
                this.posStorage.getRemoteReceipts() ? this.posStorage.getRemoteReceipts() : []
            );

            // Synchronization.initialize(
            //     PosStorage.getLastCustomerSync(),
            //     PosStorage.getLastProductSync(),
            //     PosStorage.getLastSalesSync()
            // );
            // Synchronization.setConnected(this.props.network.isNWConnected);

            if (this.isLoginComplete()) {
                console.log('PosApp - Auto login - All settings exist');
                this.props.toolbarActions.SetLoggedIn(true);
                this.setState({ isLoading: false });
                this.props.navigation.navigate('App');
                //this.props.toolbarActions.ShowScreen('main');
                console.log('PosApp - starting synchronization');
                Synchronization.scheduleSync();
            }
            //Making setting page as Main Page
            else if (this.isSettingsComplete()) {
                console.log("PosApp - login required - No Token");
                this.props.navigation.navigate('Login');
                this.props.toolbarActions.SetLoggedIn(false);
                this.setState({ isLoading: false });
                //this.props.toolbarActions.ShowScreen('Login');
            }
            else {
                console.log('PosApp - Settings not complete');
                this.setState({ isLoading: false });
                // this.props.toolbarActions.SetLoggedIn(false); // So that the login screen doesn't show
              //  this.props.toolbarActions.ShowScreen('settings');
            }

        }



        this.posStorage.initialize(false).then(isInitialized => {
            console.log('PosApp - componentDidMount - Storage initialized');

            // let settings = this.posStorage.loadSettings();
            // console.log('settings');
            // console.log(settings);
            // this.props.settingsActions.setSettings(settings);
            // // this.props.settingsActions.setConfiguration(configuration);

            // Communications.initialize(
            //     settings.semaUrl,
            //     settings.site,
            //     settings.user,
            //     settings.password
            // );
            // Communications.setToken(settings.token);
            // Communications.setSiteId(settings.siteId);

            // let timeout = 200;
            // if (isInitialized) {
            //     // Data already configured
            //     this.props.customerActions.setCustomers(
            //         this.posStorage.getCustomers()
            //     );
            //     this.props.productActions.setProducts(
            //         this.posStorage.getProducts()
            //     );
            //     this.props.receiptActions.setRemoteReceipts(
            //         this.posStorage.getRemoteReceipts()
            //     );
            // }
            // if (isInitialized && this.posStorage.getCustomers().length > 0) {
            // 	// Data already configured
            // 	timeout = 20000;	// First sync after a bit
            // }

            // Synchronization.initialize(
            //     PosStorage.getLastCustomerSync(),
            //     PosStorage.getLastProductSync(),
            //     PosStorage.getLastSalesSync()
            // );
            // Synchronization.setConnected(this.props.network.isNWConnected);

            // Determine the startup screen as follows:
            // If the settings contain url, site, username, password, token and customerTypes, proceed to main screen
            // If the settings contain url, site, username, password, customerTypes but NOT token, proceed to login screen, (No token => user has logged out)
            // Otherwise proceed to the settings screen.
            // Note: Without customerTypes. Customers can't be created since Customer creation requires both salesChannelIds AND customerTypes
            // if (this.isLoginComplete()) {
            //     console.log('PosApp - Auto login - All settings exist');
            //     this.props.toolbarActions.SetLoggedIn(true);
            //     this.setState({ isLoading: false });
            //     this.props.toolbarActions.ShowScreen('main');
            //     console.log('PosApp - starting synchronization');
            //     Synchronization.scheduleSync();
            // }
            // //Making setting page as Main Page
            // else if (this.isSettingsComplete()) {
            //     console.log("PosApp - login required - No Token");
            //     // this.props.toolbarActions.SetLoggedIn(false);
            //     this.setState({ isLoading: false });
            //     this.props.toolbarActions.ShowScreen('settings');
            // }
            // else {
            //     console.log('PosApp - Settings not complete');
            //     this.setState({ isLoading: false });
            //     // this.props.toolbarActions.SetLoggedIn(false); // So that the login screen doesn't show
            //     this.props.toolbarActions.ShowScreen('settings');
            // }
        });

        NetInfo.isConnected.fetch().then(isConnected => {
            console.log('Network is ' + (isConnected ? 'online' : 'offline'));
            this.props.networkActions.NetworkConnection(isConnected);
            Synchronization.setConnected(isConnected);
        });
        NetInfo.isConnected.addEventListener(
            'connectionChange',
            this.handleConnectivityChange
        );

        Events.on(
            'CustomersUpdated',
            'customerUpdate1',
            this.onCustomersUpdated.bind(this)
        );
        Events.on(
            'ProductsUpdated',
            'productsUpdate1',
            this.onProductsUpdated.bind(this)
        );
        Events.on(
            'SalesChannelsUpdated',
            'SalesChannelsUpdated1',
            this.onSalesChannelUpdated.bind(this)
        );
        Events.on(
            'UILanguageUpdated',
            'UILanguageUpdated1',
            this.onLanguageUpdated.bind(this)
        );
        Events.on(
            'ReceiptsFetched',
            'ReceiptsFetched1',
            this.onReceiptsFetched.bind(this)
        );
        Events.on(
            'NewSaleAdded',
            'NewSaleAdded1',
            this.onNewSaleAdded.bind(this)
        );
        Events.on(
            'RemoveLocalReceipt',
            'RemoveLocalReceipt1',
            this.onRemoveLocalReceipt.bind(this)
        );
        Events.on(
            'ClearLoggedSales',
            'ClearLoggedSales1',
            this.onClearLoggedSales.bind(this)
        );
        console.log('PosApp = Mounted-Done');


        RNLanguages.addEventListener('change', this._onLanguagesChange);
        console.log(savedSettings);
        const uiLanguage =
            !isEmptyObj(savedSettings) && !isEmptyObj(savedSettings.uiLanguage)
                ? savedSettings.uiLanguage
                : {
                    name: 'English',
                    iso_code: 'en'
                };
        console.log(`Setting UI Language: ${JSON.stringify(uiLanguage)}`);
        i18n.locale = uiLanguage.iso_code;
    }

    // componentWillUnmount() {
    //     Events.rm('CustomersUpdated', 'customerUpdate1');
    //     Events.rm('ProductsUpdated', 'productsUpdate1');
    //     Events.rm('SalesChannelsUpdated', 'SalesChannelsUpdated1');
    //     Events.rm('UILanguageUpdated', 'UILanguageUpdated1');
    //     Events.rm('ReceiptsFetched', 'ReceiptsFetched1');
    //     Events.rm('NewSaleAdded', 'NewSaleAdded1');
    //     Events.rm('RemoveLocalReceipt', 'RemoveLocalReceipt1');
    //     Events.rm('ClearLoggedSales', 'ClearLoggedSales1');
    //     Events.rm('OnEdit', 'OnEdit1');
    //     NetInfo.isConnected.removeEventListener(
    //         'connectionChange',
    //         this.handleConnectivityChange
    //     );
    //     RNLanguages.removeEventListener('change', this._onLanguagesChange);
    // }

    onEditCustomer(customer) {
        this.posStorage.setReminderDate(customer, customer.frequency);
    }

    onRemoveLocalReceipt(saleId) {
        this.props.receiptActions.removeLocalReceipt(saleId);
    }

    onClearLoggedSales() {
        this.props.receiptActions.clearLoggedReceipts();
    }

    onNewSaleAdded(receiptData) {
        const newReceipt = {
            active: 1,
            id: receiptData.sale.id,
            key: receiptData.key,
            created_at: receiptData.sale.createdDate,
            customer_account: this.getCustomer(receiptData.sale.customerId),
            receipt_line_items: this.getProducts(receiptData.sale.products),
            isLocal: true,
            amount_loan: receiptData.sale.amountLoan
        };
        this.posStorage.setReminderDate(
            this.props.selectedCustomer,
            this.props.selectedCustomer.frequency
        );

        this.props.receiptActions.addRemoteReceipt(newReceipt);
        PosStorage.logReceipt(newReceipt);
    }

    getProducts(products) {
        return products.map(product => {
            let newProduct = {};

            newProduct.id = product.productId;
            newProduct.price_total = product.priceTotal;
            newProduct.quantity = product.quantity;
            newProduct.product = this.getProduct(product.productId);
            newProduct.active = 1;
            return newProduct;
        });
    }

    getProduct(productId) {
        return this.props.products.reduce((final, product) => {
            if (product.productId === productId) return product;
            return final;
        }, {});
    }

    getCustomer(customerId) {
        return this.props.customers.reduce((final, customer) => {
            if (customer.customerId === customerId) return customer;
            return final;
        }, {});
    }

    onCustomersUpdated = () => {
        this.props.customerActions.setCustomers(this.posStorage.getCustomers());
    };

    onReceiptsFetched(receipts) {
        this.props.receiptActions.setRemoteReceipts(receipts);
    }

    onProductsUpdated = () => {
        this.props.productActions.setProducts(this.posStorage.getProducts());
    };

    onSalesChannelUpdated() {
        console.log('Update sales channels bar');
        CustomerViews.buildNavigator().then(() => {
            this.forceUpdate();
        });
    }

    onLanguageUpdated() {
        console.log('New UI language set - Update sales channels bar');
        CustomerViews.buildNavigator().then(() => {
            this.forceUpdate();
        });
    }

    handleConnectivityChange = isConnected => {
        console.log('handleConnectivityChange: ' + isConnected);
        this.props.networkActions.NetworkConnection(isConnected);
        Synchronization.setConnected(isConnected);
    };

    _onLanguagesChange = ({ language }) => {
        i18n.locale = language;
    };



    // Render any loading content that you like here
    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator />
                <StatusBar barStyle="default" />
            </View>
        );
    }


    isLoginComplete() {
        console.log('isLoginComplete ');
        let settings = this.posStorage.getSettings();
        console.log('isLoginComplete ' + JSON.stringify(settings));
        if (this.posStorage.getCustomerTypes()) {
            if (
                settings.semaUrl.length > 0 &&
                settings.site.length > 0 &&
                settings.user.length > 0 &&
                settings.password.length > 0 &&
                settings.token.length > 0 &&
                this.posStorage.getCustomerTypes().length > 0
            ) {
                console.log('All settings valid - Proceed to main screen');
                return true;
            }
        }
        return false;
    }

    isSettingsComplete() {
        let settings = this.posStorage.getSettings();
        if (this.posStorage.getCustomerTypes()) {
            if (
                settings.semaUrl.length > 0 &&
                settings.site.length > 0 &&
                settings.user.length > 0 &&
                settings.password.length > 0 &&
                settings.token.length == 0 &&
                this.posStorage.getCustomerTypes().length > 0
            ) {
                return true;
            }
        }

        return false;
    }

}



function mapStateToProps(state, props) {
    return {
        selectedCustomer: state.customerReducer.selectedCustomer,
        customers: state.customerReducer.customers,
        network: state.networkReducer.network,
        showView: state.customerBarReducer.showView,
        showScreen: state.toolBarReducer.showScreen,
        settings: state.settingsReducer.settings,
        receipts: state.receiptReducer.receipts,
        remoteReceipts: state.receiptReducer.remoteReceipts,
        products: state.productReducer.products
    };
}

function mapDispatchToProps(dispatch) {
    return {
        customerActions: bindActionCreators(CustomerActions, dispatch),
        productActions: bindActionCreators(ProductActions, dispatch),
        networkActions: bindActionCreators(NetworkActions, dispatch),
        toolbarActions: bindActionCreators(ToolbarActions, dispatch),
        settingsActions: bindActionCreators(SettingsActions, dispatch),
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