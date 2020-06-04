import React from 'react';
import { View, Dimensions, Picker } from 'react-native';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import Login from '../screens/Login';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import CustomerList from '../screens/CustomerList';
import CustomerEdit from '../screens/CustomerEdit';
import CustomerListHeader from './CustomerListHeader';
import CustomerTitle from './CustomerTitle';
import NavigationDrawerStructure from './NavigationDrawerStructure';
import CustomSidebarMenu from './CustomSidebarMenu';
import { enableScreens } from 'react-native-screens';
enableScreens();

const ListCustomerStack = createStackNavigator({
    CustomerList: {
        screen: CustomerList,
        navigationOptions: ({ navigation }) => ({
            headerTitle: () => <CustomerTitle title={`Customers`} />,
            headerLeft: () => <NavigationDrawerStructure />,
            headerStyle: {
                backgroundColor: '#00549C'
            },
            headerTintColor: '#fff',
            headerRight: () => <CustomerListHeader />
        }),
    },
    EditCustomer: {
        screen: CustomerEdit,
        navigationOptions: ({ navigation }) => ({
            title: navigation.getParam('isEdit') ? 'Edit Customer' : 'New Customer',
            headerStyle: {
                backgroundColor: '#00549C',
            },
            headerTintColor: '#fff',
        })
    },
},
    {
        initialRouteName: 'CustomerList',
        headerMode: 'float'
    }
);

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
},
    {
        contentOptions: {
            activeTintColor: '#ABC1DE',
        },
        initialRouteName: 'ListCustomers',
        contentComponent: CustomSidebarMenu,
        drawerBackgroundColor: {
            light: '#eee',
            dark: 'rgba(40,40,40,1)',
        },
        drawerType: 'slide',
        drawerWidth: Dimensions.get('window').width * .3,
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

export default createAppContainer(JibuRouter);
// export default JibuRouter;
