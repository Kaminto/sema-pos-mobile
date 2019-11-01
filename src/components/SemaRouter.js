import React, { Component } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import {createAppContainer} from 'react-navigation';
import {createDrawerNavigator} from 'react-navigation-drawer';
import {createStackNavigator} from 'react-navigation-stack';
import CustomerViews from './customers/CustomerViews';
import CustomerBar from './customers/CustomerBar';
import CustomerList from './customers/CustomerList';
import OrderView from './orders/OrderView';
import CustomerEdit from './customers/CustomerEdit';
import Settings from './Settings';
import SiteReport from './reports/SiteReport';
import Reminders from './reports/ReminderReport';
import Inventory from './reports/InventoryReport';
import Transactions from './reports/SalesLog';
import SalesReport from './reports/SalesReport';

class NavigationDrawerStructure extends Component {
	toggleDrawer = () => {
	  this.props.navigationProps.toggleDrawer();
	};
	render() {
	  return (
		<View style={{ flexDirection: 'row' }}>
		  <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
			<Image source={require('../images/drawer.png')}
			style={{  width: 25, height: 25, marginLeft: 5 }}
			/>
		  </TouchableOpacity>
		</View>
	  );
	}
  }

  const FirstActivity_StackNavigator = createStackNavigator({
	First: {
	  screen: CustomerEdit,
	  navigationOptions: ({ navigation }) => ({
		title: 'Add Customers',
		headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
		headerStyle: {
		  backgroundColor: '#FF9800',
		},
		headerTintColor: '#fff',
	  }),
	},
  });

  const Screen2_StackNavigator = createStackNavigator({
	First: {
	  screen: CustomerList,
	  navigationOptions: ({ navigation }) => ({
		title: 'Customers',
		headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
		headerStyle: {
		  backgroundColor: '#FF9800',
		},
		headerTintColor: '#fff',
	  }),
	},
  });

  const Screen3_StackNavigator = createStackNavigator({
	First: {
	  screen: Transactions,
	  navigationOptions: ({ navigation }) => ({
		title: 'Transactions',
		headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
		headerStyle: {
		  backgroundColor: '#FF9800',
		},
		headerTintColor: '#fff',
	  }),
	},
  });

  const Screen4_StackNavigator = createStackNavigator({
	First: {
	  screen: SalesReport,
	  navigationOptions: ({ navigation }) => ({
		title: 'Sales Report',
		headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
		headerStyle: {
		  backgroundColor: '#FF9800',
		},
		headerTintColor: '#fff',
	  }),
	},
  });

  const Screen5_StackNavigator = createStackNavigator({
	First: {
	  screen: Inventory,
	  navigationOptions: ({ navigation }) => ({
		title: 'Inventory',
		headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
		headerStyle: {
		  backgroundColor: '#FF9800',
		},
		headerTintColor: '#fff',
	  }),
	},
  });

  const Screen6_StackNavigator = createStackNavigator({
	First: {
	  screen: Reminders,
	  navigationOptions: ({ navigation }) => ({
		title: 'Reminders',
		headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
		headerStyle: {
		  backgroundColor: '#FF9800',
		},
		headerTintColor: '#fff',
	  }),
	},
  });

  const Screen7_StackNavigator = createStackNavigator({
	First: {
	  screen: Settings,
	  navigationOptions: ({ navigation }) => ({
		title: 'Settings',
		headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
		headerStyle: {
		  backgroundColor: '#FF9800',
		},
		headerTintColor: '#fff',
	  }),
	},
  });

  const JibuDrawerNavigation = createDrawerNavigator({
	Screen1: {
	  screen: FirstActivity_StackNavigator,
	  navigationOptions: {
		drawerLabel: 'New Customer',
	  },
	},
	Screen2: {
		screen: Screen2_StackNavigator,
		navigationOptions: {
		  drawerLabel: 'Customers',
		},
	  },
	Screen3: {
		screen: Screen3_StackNavigator,
		navigationOptions: {
		  drawerLabel: 'Transactions',
		},
	  },
	  Screen4: {
		screen: Screen4_StackNavigator,
		navigationOptions: {
		  drawerLabel: 'Sales Reports',
		},
	  },
	Screen5: {
	  screen: Screen5_StackNavigator,
	  navigationOptions: {
		drawerLabel: 'Inventory',
	  },
	},
	Screen6: {
		screen: Screen6_StackNavigator,
		navigationOptions: {
			drawerLabel: 'Reminders',
		},
		},
		Screen7: {
			screen: Screen7_StackNavigator,
			navigationOptions: {
				drawerLabel: 'Settings',
			},
			},
  });

  export default createAppContainer(JibuDrawerNavigation);
