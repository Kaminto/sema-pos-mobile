//This is an example code for Navigation Drawer with Custom Side bar//
import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
// import { Icon } from 'react-native-elements';
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

import PosStorage from '../database/PosStorage';
import Synchronization from '../services/Synchronization';
import Communications from '../services/Communications';

class CustomSidebarMenu extends Component {
  constructor() {
    super();
    //Setting up the Main Top Large Image of the Custom Sidebar
    this.proileImage =
      'https://aboutreact.com/wp-content/uploads/2018/07/sample_img.png';
    //Array of the sidebar navigation option with icon and screen to navigate
    //This screens can be any screen defined in Drawer Navigator in App.js
    //You can find the Icons from here https://material.io/tools/icons/
    this.items = [
      {
        navOptionThumb: 'md-contact',
        navOptionName: 'Customers',
        screenToNavigate: 'ListCustomers',
      },
      {
        navOptionThumb: 'ios-person',
        navOptionName: 'New Customer',
        screenToNavigate: 'NewCustomer',
      },
      {
        navOptionThumb: 'md-home',
        navOptionName: 'Transactions',
        screenToNavigate: 'Transactions',
      },
      {
        navOptionThumb: 'ios-person',
        navOptionName: 'Sales Report',
        screenToNavigate: 'SalesReport',
      },
      {
        navOptionThumb: 'md-home',
        navOptionName: 'Inventory',
        screenToNavigate: 'Inventory',
      },
      {
        navOptionThumb: 'md-home',
        navOptionName: 'Reminders',
        screenToNavigate: 'Reminders',
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
        {/*Top Large Image */}
        {/* <Image
          source={{ uri: this.proileImage }}
          style={styles.sideMenuProfileIcon}
        /> */}
        <Icon name="ios-person" size={100} style={styles.sideMenuProfileIcon} />
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

                  if (item.screenToNavigate != 'LogOut') {
                    this.props.navigation.navigate(item.screenToNavigate);
                  }

                }}>
                {item.navOptionName}
              </Text>
            </View>
          ))}
        </View>
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
      settings.siteId
    );
    this.props.settingsActions.setSettings(PosStorage.loadSettings());
    //As we are not going to the Login, the reason no reason to disable the token
    Communications.setToken('');
   // this.props.toolbarActions.ShowScreen('settings');
    this.props.navigation.navigate('Login');
  };

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