import React from 'react';
import { View, StyleSheet, Image, Text, Alert, ActivityIndicator, ScrollView, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CreditRealm from '../database/credit/credit.operations';
import OrderRealm from '../database/orders/orders.operations';
import ProductsRealm from '../database/products/product.operations';
import DiscountRealm from '../database/discount/discount.operations';
import CustomerReminderRealm from '../database/customer-reminder/customer-reminder.operations';
import Synchronization from '../services/Synchronization';
import CustomerDebtRealm from '../database/customer_debt/customer_debt.operations';
import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import ReceiptPaymentTypeRealm from '../database/reciept_payment_types/reciept_payment_types.operations';
import CustomerRealm from '../database/customers/customer.operations';
import SettingRealm from '../database/settings/settings.operations';
import Communications from '../services/Communications';
import * as CustomerActions from '../actions/CustomerActions';
import * as NetworkActions from '../actions/NetworkActions';
import * as SettingsActions from '../actions/SettingsActions';
import * as ProductActions from '../actions/ProductActions';
import * as receiptActions from '../actions/ReceiptActions';
import * as TopUpActions from '../actions/TopUpActions';
import * as InventoryActions from '../actions/InventoryActions';
import * as AuthActions from '../actions/AuthActions';
import * as WastageActions from "../actions/WastageActions";
import * as discountActions from '../actions/DiscountActions';
import * as paymentTypesActions from '../actions/PaymentTypesActions';
import * as CustomerReminderActions from '../actions/CustomerReminderActions';
import i18n from '../app/i18n';

class CustomSidebarMenu extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      animating: false,
      language: '',
      user: "",
      password: "",
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
        navOptionName: 'Wastage Report',
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

  handleOnPress(item, key) {
    requestAnimationFrame(() => {
      global.currentScreenIndex = key;

      if (item.screenToNavigate === 'LogOut') {
        this.onLogout();
      }

      if (item.screenToNavigate != 'LogOut' || item.screenToNavigate != 'Sync') {
        this.props.navigation.navigate(item.screenToNavigate);
      }
      if (item.screenToNavigate === 'Sync') {
        this.onSynchronize();
      }
    });
  }


  render() {
    return (
      <View style={styles.sideMenuContainer}>
		<ScrollView style={{ flex: 1 }}>
        <Image source={require('../images/jibulogo.png')} resizeMode='stretch' style={styles.imageStyle} />
        {/*Divider between Top Image and Sidebar Option*/}
        <View
          style={styles.viewCont}
        />
        {/*Setting up Navigation Options from option array using loop*/}
        <View style={{ flex: 1 }}>
          {this.items.map((item, key) => (
            <View style={{ flex: 1 }}  key={key}>
				  <TouchableOpacity
				 	style={[styles.drawerItemStyle, {backgroundColor: global.currentScreenIndex === key ? '#e0dbdb' : '#ffffff'}]}

					onPress={() => this.handleOnPress(item, key)}>
					<View style={{ marginRight: 10, marginLeft: 20 }}>
						<Icon name={item.navOptionThumb} size={25} color="#808080" />
					</View>
					<Text
						style={{
						fontSize: 15,
						color: global.currentScreenIndex === key ? 'red' : 'black',
						}}
						>
						{item.navOptionName}
					</Text>
					</TouchableOpacity>
            </View>
          ))}
        </View>
        {
          this.state.isLoading && (
            <ActivityIndicator size={60} color="#ABC1DE" />
          )
        }
    	</ScrollView>
      </View>
    );
  }

  onLogout = () => {
    let settings = SettingRealm.getAllSetting();

    // // Save with empty token - This will force username/password validation
    SettingRealm.saveSettings(
      settings.semaUrl,
      settings.site,
      settings.user,
      settings.password,
      settings.uiLanguage,
      '',
      settings.siteId,
	  false,
	  settings.currency
    );
    this.props.settingsActions.setSettings(SettingRealm.getAllSetting());
    //As we are not going to the Login, the reason no reason to disable the token
    Communications.setToken('');
    this.props.navigation.navigate('Login');
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


  };

  onSynchronize() {
    try {
      this.setState({ isLoading: true });
      console.log("Started synching ...");
      Synchronization.synchronize().then(syncResult => {
        console.log('syncResult', syncResult);
        this.setState({ isLoading: false });
        console.log("Stopped synching. ")

        this.props.customerActions.setCustomers(
          CustomerRealm.getAllCustomer()
        );

        this.props.receiptActions.setReceipts(
          OrderRealm.getAllOrder()
        );

        Alert.alert(
          i18n.t('sync-results'),
          this._getSyncResults(syncResult),
          [{ text: i18n.t('ok'), style: 'cancel' }],
          { cancelable: true }
        );
      });
    } catch (error) { }
  };

  _getSyncResults(syncResult) {
    console.log('syncResult2', syncResult);
    try {
     
        if (
          syncResult.customers == 0 &&
          syncResult.products == 0 &&
          syncResult.orders == 0 &&
          syncResult.meterReading == 0 &&
          syncResult.wastageReport == 0 &&
          syncResult.recieptPayments == 0 &&
          syncResult.topups == 0
        ) {
          return i18n.t('data-is-up-to-date');
        } else {
          return `${syncResult.customers} ${i18n.t('customers-updated')}
      			\n${syncResult.products} ${i18n.t('products-updated')}
        \n${syncResult.orders} ${i18n.t('sales-receipts-updated')}
        \n${syncResult.debt} ${i18n.t('debt-updated')}
        
        ${syncResult.meterReading} ${i18n.t('meterReading-updated')}
      			\n${syncResult.wastageReport} ${i18n.t('wastageReport-updated')}
        \n${syncResult.recieptPayments} ${i18n.t('recieptPayments-updated')}
        \n${syncResult.topups} ${i18n.t('topups-updated')}
        
        `
        // \n${syncResult.productMrps} ${i18n.t('product-sales-channel-prices-updated')}
        ;
        }
      
    } catch (error) { }
  }

}
// ${syncResult.topups.localTopup} ${i18n.t('topups-updated')}

function mapStateToProps(state, props) {
  return {
    selectedCustomer: state.customerReducer.selectedCustomer,
    customers: state.customerReducer.customers,
    network: state.networkReducer.network,
    settings: state.settingsReducer.settings,
    receipts: state.receiptReducer.receipts,
    remoteReceipts: state.receiptReducer.remoteReceipts,
    products: state.productReducer.products,
    auth: state.authReducer
  };
}

function mapDispatchToProps(dispatch) {
  return {
    customerActions: bindActionCreators(CustomerActions, dispatch),
    productActions: bindActionCreators(ProductActions, dispatch),
    networkActions: bindActionCreators(NetworkActions, dispatch),
    settingsActions: bindActionCreators(SettingsActions, dispatch),
    receiptActions: bindActionCreators(receiptActions, dispatch),
    authActions: bindActionCreators(AuthActions, dispatch),
    wastageActions: bindActionCreators(WastageActions, dispatch),
    topUpActions: bindActionCreators(TopUpActions, dispatch),
    inventoryActions: bindActionCreators(InventoryActions, dispatch),
    discountActions: bindActionCreators(discountActions, dispatch),
    paymentTypesActions: bindActionCreators(paymentTypesActions, dispatch),
    customerReminderActions: bindActionCreators(CustomerReminderActions, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomSidebarMenu);


const styles = StyleSheet.create({
	imageStyle: {
		width: 100,
		height: 100,
		alignSelf: 'center'
	},
  sideMenuContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },

  viewCont: {
	flex: 1,
	height: 1,
	backgroundColor: '#e2e2e2',
	marginTop: 15,
  },
  drawerItemStyle: {
	flex: 1,
	flexDirection: 'row',
	alignItems: 'center',
	paddingTop: 10,
	paddingBottom: 10,
  },
  sideMenuProfileIcon: {
    resizeMode: 'center',
    width: 150,
    height: 150,
    marginTop: 20,
    borderRadius: 150 / 2,
  },
});
