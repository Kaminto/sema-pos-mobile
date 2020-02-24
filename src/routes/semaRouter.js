import React from 'react';
import { View, TouchableOpacity, Text, Picker } from 'react-native';
import { createSwitchNavigator } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import CustomerList from '../screens/CustomerList';
import CustomerEdit from '../screens/CustomerEdit';
import CustomerDetails from '../screens/CustomerDetails';
import CreditHistory from '../screens/CreditHistory';

import Login from '../screens/Login';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import Transactions from '../screens/Transactions';

import OrderView from '../components/orders/OrderView';

import InventoryReport from '../components/reports/InventoryReport';
import RemindersReport from '../components/reports/ReminderReport';

import SalesReport from '../components/reports/SalesReport';

import { Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomSidebarMenu from './CustomSidebarMenu';
import Icons from 'react-native-vector-icons/FontAwesome';

import i18n from '../app/i18n';

class NavigationDrawerStructure extends React.PureComponent {
    toggleDrawer = () => {
        this.props.navigationProps.toggleDrawer();
    };

    render() {
        return (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
                    <Icon
                        name='md-menu'
                        size={30}
                        color="white"
                        style={{
                            width: 30, height: 30, marginLeft: 10
                        }}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}


const CreditHistoryStack = createStackNavigator({
    CreditHistory: {
        screen: CreditHistory,
        navigationOptions: {
            title: 'Customer Wallet',
        }
    }
},
    {
        headerMode: 'none',
        initialRouteName: 'CreditHistory'

    });

const CustomerTransactionStack = createStackNavigator({
    Transaction: {
        screen: CustomerDetails
    },
},
    {
        headerMode: 'none',
        initialRouteName: 'Transaction'
    });

const TabNavigator = createBottomTabNavigator({
    Transaction: CustomerTransactionStack,
    CustomerWallet: CreditHistoryStack,

},
    {
        initialRouteName: 'Transaction',
        headerMode: 'screen',
        swipeEnabled: true,
        animationEnabled: true,
        tabBarOptions: {
            activeTintColor: 'white',
            inactiveTintColor: '#CCC',
            style: {
                backgroundColor: '#00549C',
                fontSize: 24,
                padding: 10
            },
            labelStyle: {
                fontSize: 18,
                textTransform: 'uppercase'
            },
        }
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
            title: navigation.getParam('isCustomerSelected') ? navigation.getParam('title', 'Customers') : 'Customers',
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
                        {/* && navigation.getParam('isDueAmount') > 0 */}
                        {navigation.getParam('isCustomerSelected') && (
                            <Icons
                                name='balance-scale'
                                size={25}
                                color="white"
                                style={{
                                    marginRight: 20,
                                }}
                                onPress={navigation.getParam('clearLoan')}
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
                                name='md-cart'
                                size={25}
                                color="white"
                                style={{
                                    marginRight: 20,
                                }}
                                onPress={() => {
                                    navigation.setParams({ isCustomerSelected: false });
                                    navigation.setParams({ customerName: '' });
                                    navigation.navigate('OrderView');
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
                                name='md-more'
                                size={25}
                                color="white"
                                style={{
                                    marginRight: 20,
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
                                name='md-create'
                                size={25}
                                color="white"
                                style={{
                                    marginRight: 20,
                                }}
                                onPress={() => {
                                    navigation.setParams({ isCustomerSelected: false });
                                    navigation.setParams({ customerName: '' });
                                    navigation.navigate('EditCustomer');
                                }}
                            />
                        )}
                    </View>

                    <View>
                        <Input
                            onChangeText={navigation.getParam('searchCustomer')}
                            placeholder={i18n.t('search-placeholder')}
                            placeholderTextColor='white'
                            inputStyle={{ flex: .8, color: 'white' }}
                        />
                    </View>

                    <View
                        style={{
                            marginTop: 12,
                            flex: 1
                        }}>
                        <Picker
                            mode="dropdown"
                            selectedValue={navigation.getParam('customerTypeValue')}
                            style={{ height: 50, width: 200, color: 'white' }}
                            onValueChange={navigation.getParam('checkCustomerTypefilter')}>

                            <Picker.Item label="All Customer Types" value="all" />
                            <Picker.Item label="Business" value="Business" />
                            <Picker.Item label="Household" value="Household" />
                            <Picker.Item label="Retailer" value="Retailer" />
                            <Picker.Item label="Outlet Franchise" value="Outlet Franchise" />
                            <Picker.Item label="Anonymous" value="Anonymous" />
                        </Picker>

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
                            marginRight: 15,
                            marginLeft: 15,
                            color: 'white',
                            fontWeight: 'bold',
                        }} size={30} onPress={() => { navigation.goBack() }} />
                    </View>

                    <View style={{
                        flex: 1,
                    }}>
                        {!navigation.getParam('isEdit') && (
                            <Text style={{
                                fontWeight: 'bold',
                                fontSize: 20,
                                color: 'white'
                            }}>New Customer</Text>
                        )}

                        {navigation.getParam('isEdit') && (
                            <Text style={{
                                fontWeight: 'bold',
                                fontSize: 20,
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
            title: 'Order',
            // title: `${navigation.getParam('customerName')} Order`,
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
                        <Picker
                            mode="dropdown"
                            selectedValue={navigation.getParam('paymentTypeValue')}
                            style={{ height: 50, width: 190, color: 'white', alignContent: 'flex-end' }}
                            onValueChange={navigation.getParam('checkPaymentTypefilter')}>
                            <Picker.Item label="All Payment Types" value="all" />
                            <Picker.Item label="Cash" value="cash" />
                            <Picker.Item label="Mobile" value="mobile" />
                            <Picker.Item label="Loan" value="loan" />
                            <Picker.Item label="Cheque" value="cheque" />
                            <Picker.Item label="Bank" value="bank" />
                            <Picker.Item label="Wallet" value="credit" />
                        </Picker>
                    </View>
                </View>
            ),
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
            title: 'Wastage Report',
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
            drawerLabel: 'Wastage Report',
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
