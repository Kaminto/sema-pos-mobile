import React, { Component } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import CustomerList from '../screens/CustomerList';
import CustomerEdit from '../screens/CustomerEdit';
import CustomerDetails from '../screens/CustomerDetails';
import Login from '../screens/Login';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import Reminders from '../screens/ReminderReport';
import Inventory from '../screens/InventoryReport';
import Transactions from '../screens/SalesLog';
import SalesReport from '../screens/SalesReport';

import OrderView from '../components/orders/OrderView';

import { Card, ListItem, Button, Input, ThemeProvider } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomSidebarMenu from './CustomSidebarMenu';

class NavigationDrawerStructure extends Component {
    toggleDrawer = () => {
        this.props.navigationProps.toggleDrawer();
    };
    render() {
        return (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
                    <Image source={require('../images/drawer.png')}
                        style={{ width: 25, height: 25, marginLeft: 5 }}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

const AddCustomerStack = createStackNavigator({
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
                backgroundColor: '#FF9800',
            },
            headerTintColor: '#fff',
            headerRight: (
                <View
                    style={{
                        flexDirection: 'row',
                        flex: 1,
                        justifyContent: 'space-between',
                    }}>
                    {navigation.getParam('isCustomerSelected') && (
                        <Text>{navigation.getParam('customerName')}</Text>
                    )}

                    {navigation.getParam('isCustomerSelected') && (
                        <Button
                            icon={
                                <Icon
                                    name='md-trash'
                                    size={15}
                                    color="white"
                                />
                            }
                            onPress={() => {
                                console.log(navigation);
                                navigation.navigate('EditCustomer');
                            }}
                        />
                    )}
                    {navigation.getParam('isCustomerSelected') && (
                        <Button
                            icon={
                                <Icon
                                    name='md-more'
                                    size={15}
                                    color="white"
                                />
                            }
                            onPress={() => {

                                navigation.navigate('CustomerDetails');
                            }}
                        />
                    )}
                    {navigation.getParam('isCustomerSelected') && (
                        <Button
                            icon={
                                <Icon
                                    name='md-create'
                                    size={15}
                                    color="white"
                                />
                            }
                            onPress={() => {
                                console.log(navigation);
                                navigation.navigate('EditCustomer');
                            }}
                        />
                    )}

                    {navigation.getParam('isCustomerSelected') && (
                        <Button
                            icon={
                                <Icon
                                    name='md-business'
                                    size={15}
                                    color="white"
                                />
                            }
                            onPress={() => {
                                console.log(navigation);
                                navigation.navigate('OrderView');
                            }}
                        />
                    )}

                    {navigation.getParam('isCustomerSelected') && (
                        <Input
                            onChangeText={navigation.getParam('increaseCount')}
                            placeholder="Search"
                        />
                    )}
                </View>

            ),
        }),
    },
    EditCustomer: {
        screen: CustomerEdit,
        navigationOptions: ({ navigation }) => ({
            title: 'Edit Customer',
        })
    },
    CustomerDetails: {
        screen: CustomerDetails,
        navigationOptions: ({ navigation }) => ({
            title: 'Customer Details',
        })
    },
    OrderView: {
        screen: OrderView,
        navigationOptions: ({ navigation }) => ({
            title: 'Order View',
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
                backgroundColor: '#FF9800',
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
                backgroundColor: '#FF9800',
            },
            headerTintColor: '#fff',
        }),
    },
});

const InventoryStack = createStackNavigator({
    Inventory: {
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

const ReminderStack = createStackNavigator({
    Reminders: {
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
    NewCustomer: {
        screen: AddCustomerStack,
        navigationOptions: {
            drawerLabel: 'New Customer',
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
}, {
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
//export default createAppContainer(JibuRouter);
