import React from 'react';
import { NavigationActions } from 'react-navigation';
import { Text, View, StyleSheet, ImageBackground } from 'react-native'
//import { white } from 'ansi-colors';
import Icon from 'react-native-vector-icons/Ionicons';

export default class drawerContentComponents extends React.Component {

    navigateToScreen = (route) => (
        () => {
            const navigateAction = NavigationActions.navigate({
                routeName: route
            });
            this.props.navigation.dispatch(navigateAction);
        })

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    {/* <ImageBackground source={require('../../sipro.png')} style={{ flex: 1, width: 280, justifyContent: 'center' }} >
                         */}
                    <Text style={styles.headerText}>Header Portion</Text>
                    <Text style={styles.headerText}>You can display here logo or profile image</Text>
                    {/* </ImageBackground> */}
                </View>
                <View style={styles.screenContainer}>
                    <View style={[styles.screenStyle, (this.props.activeItemKey == 'ListCustomers') ? styles.activeBackgroundColor : null]}>
                        <Icon name="md-home" size={30} />
                        <Text style={[styles.screenTextStyle, (this.props.activeItemKey == 'ListCustomers') ? styles.selectedTextStyle : null]} onPress={this.navigateToScreen('ListCustomers')}>

                            Customers List</Text>
                    </View>
                    <View style={[styles.screenStyle, (this.props.activeItemKey == 'NewCustomer') ? styles.activeBackgroundColor : null]}>
                        <Icon name="ios-person" size={30} />
                        <Text style={[styles.screenTextStyle, (this.props.activeItemKey == 'NewCustomer') ? styles.selectedTextStyle : null]} onPress={this.navigateToScreen('NewCustomer')}>New Customer</Text>
                    </View>
                    <View style={[styles.screenStyle, (this.props.activeItemKey == 'Transactions') ? styles.activeBackgroundColor : null]}>
                        <Icon name="md-contact" size={30} />
                        <Text style={[styles.screenTextStyle, (this.props.activeItemKey == 'Transactions') ? styles.selectedTextStyle : null]} onPress={this.navigateToScreen('Transactions')}>Transactions</Text>
                    </View>


                    <View style={[styles.screenStyle, (this.props.activeItemKey == 'SalesReport') ? styles.activeBackgroundColor : null]}>
                        <Icon name="ios-person" size={30} />
                        <Text style={[styles.screenTextStyle, (this.props.activeItemKey == 'SalesReport') ? styles.selectedTextStyle : null]} onPress={this.navigateToScreen('SalesReport')}>Sales Report</Text>
                    </View>
                    <View style={[styles.screenStyle, (this.props.activeItemKey == 'Inventory') ? styles.activeBackgroundColor : null]}>
                        <Icon name="md-contact" size={30} />
                        <Text style={[styles.screenTextStyle, (this.props.activeItemKey == 'Inventory') ? styles.selectedTextStyle : null]} onPress={this.navigateToScreen('Inventory')}>Inventory</Text>
                    </View>
                    <View style={[styles.screenStyle, (this.props.activeItemKey == 'Reminders') ? styles.activeBackgroundColor : null]}>
                        <Icon name="md-contact" size={30} />
                        <Text style={[styles.screenTextStyle, (this.props.activeItemKey == 'Reminders') ? styles.selectedTextStyle : null]} onPress={this.navigateToScreen('Reminders')}>Reminders</Text>
                    </View>

                </View>
            </View>
        )
    }
}

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
    container: {
        alignItems: 'center',
    },
    headerContainer: {
        height: 150,
    },
    headerText: {
        color: '#fff8f8',
    },
    screenContainer: {
        paddingTop: 20,
        width: '100%',
    },
    screenStyle: {
        height: 30,
        marginTop: 2,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%'
    },
    screenTextStyle: {
        fontSize: 20,
        marginLeft: 20,
        textAlign: 'center'
    },
    selectedTextStyle: {
        fontWeight: 'bold',
        color: '#00adff'
    },
    activeBackgroundColor: {
        backgroundColor: 'grey'
    }
});