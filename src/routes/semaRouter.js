import React from 'react';
import { View, TouchableOpacity, Text, Picker } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

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

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

class NavigationDrawerStructure extends React.Component {
    toggleDrawer = () => {
        this.props.navigationProps.toggleDrawer();
    };

    shouldComponentUpdate(nextProps, nextState) {
        console.log('nextProps', nextProps);
        console.log('props', this.props.navigation);
        console.log('nextState', nextState);
        //return nextProps.navigation !== this.props.navigation;
        return false;
    }

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




class CreditHistoryStack extends React.Component {
    render() {
        return (
            <Stack.Navigator initialRouteName="CustomerWallet">
                <Stack.Screen name="CustomerWallet" component={CreditHistory} />
            </Stack.Navigator>
        );
    }
}

class CustomerTransactionStack extends React.Component {
    render() {
        return (
            <Stack.Navigator initialRouteName="Transaction">
                <Stack.Screen name="Transaction" component={CustomerDetails} />
            </Stack.Navigator>
        );
    }
}

class TabNavigator extends React.Component {
    render() {
        return (
            <Tab.Navigator>
                <Tab.Screen name="Transaction" component={CustomerTransactionStack} />
                <Tab.Screen name="CustomerWallet" component={CreditHistoryStack} />
            </Tab.Navigator>
        );
    }
}


class ListCustomerStack extends React.Component {
    render() {
        return (
            <Stack.Navigator initialRouteName="CustomerList">
                <Stack.Screen name="CustomerList" component={CustomerList} />
                <Stack.Screen name="EditCustomer" component={CustomerEdit} />
                <Stack.Screen name="CustomerDetails" component={TabNavigator} />
                <Stack.Screen name="OrderView" component={OrderView} />
            </Stack.Navigator>
        );
    }
}

class TransactionStack extends React.Component {
    render() {
        return (
            <Stack.Navigator initialRouteName="Transactions">
                <Stack.Screen name="Transactions" component={Transactions} />
            </Stack.Navigator>
        );
    }
}

class SalesReportStack extends React.Component {
    render() {
        return (
            <Stack.Navigator initialRouteName="SalesReport">
                <Stack.Screen name="SalesReport" component={SalesReport} />
            </Stack.Navigator>
        );
    }
}

class InventoryStack extends React.Component {
    render() {
        return (
            <Stack.Navigator initialRouteName="Inventory">
                <Stack.Screen name="Inventory" component={InventoryReport} />
            </Stack.Navigator>
        );
    }
}

class ReminderStack extends React.Component {
    render() {
        return (
            <Stack.Navigator initialRouteName="Reminders">
                <Stack.Screen name="Reminders" component={RemindersReport} />
            </Stack.Navigator>
        );
    }
}


class LoginStack extends React.Component {
    render() {
        return (
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={Login} />
            </Stack.Navigator>
        );
    }
}

class JibuDrawerNavigation extends React.Component {
    render() {
        return (
            <Drawer.Navigator initialRouteName="ListCustomers">
            <Drawer.Screen name="ListCustomers" component={ListCustomerStack} />
            <Drawer.Screen name="Transactions" component={TransactionStack} />
            <Drawer.Screen name="SalesReport" component={SalesReportStack} />
            <Drawer.Screen name="Inventory" component={InventoryStack} />
            <Drawer.Screen name="Reminders" component={ReminderStack} />
          </Drawer.Navigator>
        );
    }
}


// const JibuRouter = createSwitchNavigator(
//     {
//         AuthLoading: AuthLoadingScreen,
//         App: JibuDrawerNavigation,
//         Login: LoginStack,
//     },
//     {
//         initialRouteName: 'AuthLoading',
//     }
// );



export default JibuDrawerNavigation;
