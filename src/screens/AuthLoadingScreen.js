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
import * as NetworkActions from '../actions/NetworkActions';
import * as SettingsActions from '../actions/SettingsActions';
import * as ProductActions from '../actions/ProductActions';
import * as receiptActions from '../actions/ReceiptActions';

import PosStorage from '../database/PosStorage';
import Synchronization from '../services/Synchronization';
import Communications from '../services/Communications';
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
        console.log(isInitialized);
        let settings = this.posStorage.loadSettings();
        console.log(settings);

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

                this.posStorage.loadLocalData();

                this.props.customerActions.setCustomers(
                    this.posStorage.getCustomers()
                );
                this.props.productActions.setProducts(
                    this.posStorage.getProducts()
                );
                this.props.receiptActions.setRemoteReceipts(
                    this.posStorage.getRemoteReceipts()
                );

                Synchronization.initialize(
                    PosStorage.getLastCustomerSync(),
                    PosStorage.getLastProductSync(),
                    PosStorage.getLastSalesSync()
                );
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