
import React, { Component } from 'react';
import { View, StyleSheet, Image, Text, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as CustomerActions from '../actions/CustomerActions';
import * as NetworkActions from '../actions/NetworkActions';
import * as SettingsActions from '../actions/SettingsActions';
import * as ProductActions from '../actions/ProductActions';
import * as ToolbarActions from '../actions/ToolBarActions';
import * as receiptActions from '../actions/ReceiptActions';
import * as AuthActions from '../actions/AuthActions';
import CustomerRealm from '../database/customers/customer.operations'
import PosStorage from '../database/PosStorage';
import Synchronization from '../services/Synchronization';
import Communications from '../services/Communications';
import i18n from '../app/i18n';
class CustomSidebarMenu extends Component {
  constructor() {
    super();


		this.state = {
			animating: false,
			language: '',
			user: "administrator",
			password: "Let'sGrow",
			selectedLanguage: {},
			isLoading: false
		};

    this.items = [
      {
        navOptionThumb: 'md-contact',
        navOptionName: 'Customers',
        screenToNavigate: 'ListCustomers',
      },
      {
        navOptionThumb: 'md-pricetag',
        navOptionName: 'Transactions',
        screenToNavigate: 'Transactions',
      },
      {
        navOptionThumb: 'ios-stats',
        navOptionName: 'Sales Report',
        screenToNavigate: 'SalesReport',
      },
      {
        navOptionThumb: 'md-list-box',
        navOptionName: 'Inventory',
        screenToNavigate: 'Inventory',
      },
      {
        navOptionThumb: 'md-alarm',
        navOptionName: 'Reminders',
        screenToNavigate: 'Reminders',
      },
      {
        navOptionThumb: 'md-sync',
        navOptionName: 'Sync',
        screenToNavigate: 'Sync',
      },
      {
        navOptionThumb: 'md-log-out',
        navOptionName: 'LogOut',
        screenToNavigate: 'LogOut',
      }
    ];
  }
  render() {

    return (
      <View style={styles.sideMenuContainer}>
        {/* <Icon name="ios-person" size={100} style={styles.sideMenuProfileIcon} /> */}
        <Image source={require('../images/swe-logo.png')} resizeMode='stretch' style={{
                        width: 100,
                        height: 100,
                    }} />
        {/*Divider between Top Image and Sidebar Option*/}
        <View
          style={{
            width: '100%',
            height: 1,
            backgroundColor: '#e2e2e2',
            marginTop: 15,
          }}
        />
        {/*Setting up Navigation Options from option array using loop*/}
        <View style={{ width: '100%' }}>
          {this.items.map((item, key) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 10,
                paddingBottom: 10,
                backgroundColor: global.currentScreenIndex === key ? '#e0dbdb' : '#ffffff',
              }}
              key={key}>
              <View style={{ marginRight: 10, marginLeft: 20 }}>
                <Icon name={item.navOptionThumb} size={25} color="#808080" />
              </View>
              <Text
                style={{
                  fontSize: 15,
                  color: global.currentScreenIndex === key ? 'red' : 'black',
                }}
                onPress={() => {
                  global.currentScreenIndex = key;

                  if (item.screenToNavigate === 'LogOut') {
                    console.log(item.screenToNavigate);
                   this.onLogout();
                  }

                  if (item.screenToNavigate != 'LogOut' || item.screenToNavigate != 'Sync') {
                    this.props.navigation.navigate(item.screenToNavigate);
                  }
                  if (item.screenToNavigate === 'Sync') {
                    console.log(item.screenToNavigate);
                   this.onSynchronize();
                  }

                }}>
                {item.navOptionName}
              </Text>
            </View>
          ))}
        </View>
        {/* {
						this.state.isLoading && (
							<ActivityIndicator size={120} color="#0000ff" />
						)
					} */}
      </View>
    );
  }

  onLogout = () => {
    this.props.toolbarActions.SetLoggedIn(false);
    let settings = PosStorage.loadSettings();
    console.log(settings);
    this.props.authActions.isAuth(false);

    // // Save with empty token - This will force username/password validation
    PosStorage.saveSettings(
      settings.semaUrl,
      settings.site,
      settings.user,
      settings.password,
      settings.uiLanguage,
      '',
      settings.siteId,
      false
    );
    this.props.settingsActions.setSettings(PosStorage.loadSettings());
    //As we are not going to the Login, the reason no reason to disable the token
    Communications.setToken('');
   // this.props.toolbarActions.ShowScreen('settings');
    this.props.navigation.navigate('Login');
  };

  onSynchronize() {
		try {
			this.setState({ isLoading: true });
			Synchronization.synchronize().then(syncResult => {
				this.setState({ isLoading: false });
				// console.log(
				// 	'Synchronization-result: ' + JSON.stringify(syncResult)
				// );
        // let foo = this._getSyncResults(syncResult);
        this.props.customerActions.setCustomers(
          CustomerRealm.getAllCustomer()
      );
				Alert.alert(
					i18n.t('sync-results'),
					this._getSyncResults(syncResult),
					[{ text: i18n.t('ok'), style: 'cancel' }],
					{ cancelable: true }
				);
			});
			//Added by Jean Pierre
			Synchronization.getLatestSales();
		} catch (error) { }
  };

  _getSyncResults(syncResult) {
		try {
			if (syncResult.status != 'success')
				return i18n.t('sync-error', { error: syncResult.error });
			if (
				syncResult.hasOwnProperty('customers') &&
				syncResult.customers.error != null
			)
				return i18n.t('sync-error', {
					error: syncResult.customers.error
				});
			if (
				syncResult.hasOwnProperty('products') &&
				syncResult.products.error != null
			)
				return i18n.t('sync-error', {
					error: syncResult.products.error
				});
			if (
				syncResult.hasOwnProperty('sales') &&
				syncResult.sales.error != null
			)
				return i18n.t('sync-error', { error: syncResult.sales.error });
			if (
				syncResult.hasOwnProperty('productMrps') &&
				syncResult.productMrps.error != null
			)
				return i18n.t('sync-error', {
					error: syncResult.productMrps.error
				});
			else {
				if (
					syncResult.customers.localCustomers == 0 &&
					syncResult.customers.remoteCustomers == 0 &&
					syncResult.products.remoteProducts == 0 &&
					syncResult.sales.localReceipts == 0 &&
					syncResult.productMrps.remoteProductMrps == 0
				) {
					return i18n.t('data-is-up-to-date');
				} else {
          // console.log('syncResult', syncResult);
					return `${syncResult.customers.localCustomers +
						syncResult.customers.remoteCustomers} ${i18n.t(
							'customers-updated'
						)}
        ${syncResult.products.remoteProducts} ${i18n.t('products-updated')}
        ${syncResult.topups.localTopup} ${i18n.t(
            'topups-updated'
          )}
				${syncResult.sales.localReceipts} ${i18n.t('sales-receipts-updated')}
				${syncResult.productMrps.remoteProductMrps} ${i18n.t(
							'product-sales-channel-prices-updated'
						)}`;
				}
			}
		} catch (error) { }
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
      products: state.productReducer.products,
      auth:state.authReducer
  };
}

function mapDispatchToProps(dispatch) {
  return {
      customerActions: bindActionCreators(CustomerActions, dispatch),
      productActions: bindActionCreators(ProductActions, dispatch),
      networkActions: bindActionCreators(NetworkActions, dispatch),
      toolbarActions: bindActionCreators(ToolbarActions, dispatch),
      settingsActions: bindActionCreators(SettingsActions, dispatch),
      receiptActions: bindActionCreators(receiptActions, dispatch),
      authActions: bindActionCreators(AuthActions, dispatch)
  };
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomSidebarMenu);


const styles = StyleSheet.create({
  sideMenuContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 20,
  },
  sideMenuProfileIcon: {
    resizeMode: 'center',
    width: 150,
    height: 150,
    marginTop: 20,
    borderRadius: 150 / 2,
  },
});
