import React, { Component } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator, createMaterialTopTabNavigator } from 'react-navigation-tabs';

import CustomerList from '../screens/CustomerList';
import CustomerEdit from '../screens/CustomerEdit';
import CustomerDetails from '../screens/CustomerDetails';
import CreditHistory from '../screens/CreditHistory';
import DebitHistory from '../screens/DebitHistory';
import SelectedCustomer from '../screens/CustomerDetailSubHeader';


import Login from '../screens/Login';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import Transactions from '../screens/Transactions';

import OrderView from '../components/orders/OrderView';

import InventoryReport from '../components/reports/InventoryReport';
import RemindersReport from '../components/reports/ReminderReport';

import SalesReport from '../components/reports/SalesReport';

import { Card, ListItem, Button, Input, ThemeProvider } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomSidebarMenu from './CustomSidebarMenu';

import i18n from '../app/i18n';

class NavigationDrawerStructure extends Component {
    toggleDrawer = () => {
        this.props.navigationProps.toggleDrawer();
    };
    render() {
        return (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
                    <Icon
                        name='md-menu'
                        size={25}
                        color="white"
                        style={{
                            width: 25, height: 25, marginLeft: 5
                        }}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

const DebitHistoryStack = createStackNavigator({
    DebitHistory: {
        screen: DebitHistory
    },
},
    {
        headerMode: 'none',
        initialRouteName: 'DebitHistory',
    });


const CreditHistoryStack = createStackNavigator({
    CreditHistory: {
        screen: CreditHistory
    },
},
    {
        headerMode: 'none',
        initialRouteName: 'CreditHistory',
    });

const CustomerTransactionStack = createStackNavigator({
    Transaction: {
        screen: CustomerDetails
    },
},
    {
        headerMode: 'none',
		initialRouteName: 'Transaction',
		// navigationOptions: { headerTitle: 'Header title' },
    });

const TabNavigator = createBottomTabNavigator({
// const TabNavigator = createMaterialTopTabNavigator({
    Transaction: CustomerTransactionStack,
    Credit: CreditHistoryStack
    // ,Debit: DebitHistoryStack
},
    {
        initialRouteName: 'Transaction',
		headerMode: 'screen',
		swipeEnabled: true,
		animationEnabled: true,
        tabBarOptions: {
            activeTintColor: 'white',
            inactiveTintColor: 'black',
            style: {
				backgroundColor: '#00549C',
				fontSize: 24
			},
			labelStyle: {
				fontSize: 18,
				textTransform: 'uppercase'
			  },
		},
		// navigationOptions: { headerTitle: 'Header title' },
    });


const OrderStack = createStackNavigator({
    CustomerEdit: {
        screen: CustomerEdit,
        navigationOptions: ({ navigation }) => ({
            title: 'Add Customers',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#FF9800',
            },
            headerTintColor: '#fff'
        }),
    },
});

const ListCustomerStack = createStackNavigator({
    CustomerList: {
        screen: CustomerList,
        navigationOptions: ({ navigation }) => ({
            title: 'Customers',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#00549C',
            },
            headerTintColor: '#fff',
            headerRight: (
                <View
                    style={{
                        flexDirection: 'row',
                    }}>
                    <View
                        style={{
                            marginTop: 12,
                            flex: 1
                        }}>
                        {navigation.getParam('isCustomerSelected') && (
                            <Text style={{
                                marginRight: 20,
                                fontWeight: 'bold',
                                fontSize: 18,
                                color: 'white'
                            }} >{navigation.getParam('customerName')}</Text>
                        )}
                    </View>

                    <View
                        style={{
                            marginTop: 12,
                            flex: 1
                        }}>
                        {navigation.getParam('isCustomerSelected') && (
                            <Icon
                                name='md-trash'
                                size={25}
                                color="white"
                                style={{
                                    marginRight: 20,
                                }}
                                onPress={navigation.getParam('onDelete')}
                            />
                        )}
                    </View>

                    <View
                        style={{
                            marginTop: 12,
                            flex: 1
                        }}>
                        {navigation.getParam('isCustomerSelected') && (

                            <Icon
                                name='md-information-circle-outline'
                                size={25}
                                color="white"
                                style={{
                                    marginRight: 20,
                                }}
                                onPress={() => {
                                    navigation.setParams({ isCustomerSelected: false });
                                    navigation.setParams({ customerName: '' });
                                    navigation.navigate('CustomerDetails');
                                }}

                            />
                        )}
                    </View>

                    <View
                        style={{
                            marginTop: 12,
                            flex: 1
                        }}>
                        {navigation.getParam('isCustomerSelected') && (
                            <Icon
                                name='md-create'
                                size={25}
                                color="white"
                                style={{
                                    marginRight: 20,
                                }}
                                onPress={() => {
                                    console.log(navigation);
                                    navigation.setParams({ isCustomerSelected: false });
                                    navigation.setParams({ customerName: '' });
                                    navigation.navigate('EditCustomer');
                                }}
                            />
                        )}
                    </View>

                    <View
                        style={{
                            marginTop: 12,
                            flex: 1
                        }}>
                        {navigation.getParam('isCustomerSelected') && (
                            <Icon
                                name='md-water'
                                size={25}
                                color="white"
                                style={{
                                    marginRight: 20,
                                }}
                                onPress={() => {
                                    console.log(navigation);
                                    navigation.setParams({ isCustomerSelected: false });
                                    navigation.setParams({ customerName: '' });
                                    navigation.navigate('OrderView');
                                }}
                            />

                        )}
                    </View>

                    <View>
                        <Input
                            onChangeText={navigation.getParam('searchCustomer')}
                            placeholder={i18n.t('search-placeholder')}
                            placeholderTextColor='white'
                            style={{ flex: 1 }}

                        />
                    </View>
                </View>

            ),
        }),
    },
    EditCustomer: {
        screen: CustomerEdit,
        navigationOptions: ({ navigation }) => ({
            headerStyle: {
                backgroundColor: '#00549C',
            },
            headerTintColor: '#fff',
            headerLeft: (
                <View
                    style={{
                        flexDirection: 'row',
                        flex: 1,
                        justifyContent: 'space-between',
                    }}>

                    <View style={{
                        flex: 1,
                    }}>
                        <Icon name='md-arrow-back' style={{
                            marginRight: 25,
                            marginLeft: 15,
                            fontWeight: 'bold',
                        }} size={20} onPress={() => { navigation.goBack() }} />
                    </View>

                    <View style={{
                        flex: 1,
                    }}>
                        {!navigation.getParam('isEdit') && (
                            <Text style={{
                                fontWeight: 'bold',
                                fontSize: 18,
                                color: 'white'
                            }}>New Customer</Text>
                        )}

                        {navigation.getParam('isEdit') && (
                            <Text style={{
                                fontWeight: 'bold',
                                fontSize: 18,
                                color: 'white'
                            }}>Edit Customer</Text>
                        )}
                    </View>
                </View >),
        })
    },
    CustomerDetails: {
        screen: TabNavigator,
        navigationOptions: ({ navigation }) => ({
            title: 'Customer Details',
            headerStyle: {
				backgroundColor: '#00549C',
				fontSize: 24
            },
            headerTintColor: '#fff',
        })
    },
    OrderView: {
        screen: OrderView,
        navigationOptions: ({ navigation }) => ({
            title: 'Order View',
            headerStyle: {
                backgroundColor: '#00549C',
            },
            headerTintColor: '#fff',
        })
    },
},

    {
        initialRouteName: 'CustomerList',
        headerMode: 'screen',
    }
);

const TransactionStack = createStackNavigator({
    Transactions: {
        screen: Transactions,
        navigationOptions: ({ navigation }) => ({
            title: 'Transactions',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#00549C',
            },
            headerTintColor: '#fff',
        }),
    },
});

const SalesReportStack = createStackNavigator({
    SalesReport: {
        screen: SalesReport,
        navigationOptions: ({ navigation }) => ({
            title: 'Sales Report',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#00549C',
            },
            headerTintColor: '#fff',
        }),
    },
});

const InventoryStack = createStackNavigator({
    Inventory: {
        screen: InventoryReport,
        navigationOptions: ({ navigation }) => ({
            title: 'Inventory',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#00549C',
            },
            headerTintColor: '#fff',
        }),
    },
});

const ReminderStack = createStackNavigator({
    Reminders: {
        screen: RemindersReport,
        navigationOptions: ({ navigation }) => ({
            title: 'Reminders',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#00549C',
            },
            headerTintColor: '#fff',
        }),
    },
});


const LoginStack = createStackNavigator({
    Login: {
        screen: Login
    },
},
    {
        initialRouteName: 'Login',
        headerMode: 'none',
    });


const JibuDrawerNavigation = createDrawerNavigator({
    ListCustomers: {
        screen: ListCustomerStack,
        navigationOptions: {
            drawerLabel: 'Customers',
        },
    },
    Transactions: {
        screen: TransactionStack,
        navigationOptions: {
            drawerLabel: 'Transactions',
        },
    },
    SalesReport: {
        screen: SalesReportStack,
        navigationOptions: {
            drawerLabel: 'Sales Reports',
        },
    },

    Inventory: {
        screen: InventoryStack,
        navigationOptions: {
            drawerLabel: 'Inventory',
        },
    },
    Reminders: {
        screen: ReminderStack,
        navigationOptions: {
            drawerLabel: 'Reminders',
        },
    },
},
    {
        contentOptions: {
            activeTintColor: '#e91e63',
        },
        initialRouteName: 'ListCustomers',
        contentComponent: CustomSidebarMenu,
        drawerBackgroundColor: {
            light: '#eee',
            dark: 'rgba(40,40,40,1)',
        },
        drawerType: 'slide'
    });

const JibuRouter = createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        App: JibuDrawerNavigation,
        Login: LoginStack,
    },
    {
        initialRouteName: 'AuthLoading',
    }
);

export default JibuRouter;
