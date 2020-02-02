import React, { Component } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableHighlight,
    StyleSheet,
    UIManager,
    Alert
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PropTypes from 'prop-types';

import { FloatingAction } from "react-native-floating-action";


import * as CustomerActions from '../actions/CustomerActions';
import * as ToolbarActions from '../actions/ToolBarActions';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ModalDropdown from 'react-native-modal-dropdown';

import CustomerRealm from '../database/customers/customer.operations';
import OrderRealm from '../database/orders/orders.operations';
import CustomerTypeRealm from '../database/customer-types/customer-types.operations';
import SalesChannelRealm from '../database/sales-channels/sales-channels.operations';
import Events from 'react-native-simple-events';
import i18n from '../app/i18n';


const anonymousId = '9999999-9999-9999-9999-9999999';

class CustomerList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            refresh: false,
            // selectedCustomer: null,
            searchString: '',
            customerTypeFilter: '',
            channelFilterString: '',
            salesChannelValue: '',
            customerTypeValue: '',
            hasScrolled: false
        };
    }
    componentDidMount() {
        this.props.navigation.setParams({ isCustomerSelected: false });
        this.props.navigation.setParams({ salesChannelValue: 'all' });
        this.props.navigation.setParams({ customerTypeValue: 'all' });
        this.props.navigation.setParams({ customerName: "" });
        this.props.navigation.setParams({ searchCustomer: this.searchCustomer });
        this.props.navigation.setParams({ checkfilter: this.checkfilter });
        this.props.navigation.setParams({ checkCustomerTypefilter: this.checkCustomerTypefilter });
        this.props.navigation.setParams({ onDelete: this.onDelete });
        this.props.navigation.setParams({ checkSelectedCustomer: this.checkSelectedCustomer });
        this.props.navigation.setParams({ editCustomer: this.editCustomer });

        this.props.customerActions.CustomerSelected({});
        this.props.customerActions.setCustomerEditStatus(false);

        console.log(
            'CustomerList:componentDidMount - filter: ' + this.props.searchString
        );
        Events.on(
            'ScrollCustomerTo',
            'customerId1',
            this.onScrollCustomerTo.bind(this)
        );
    }

    searchCustomer = (searchText) => {
        console.log(searchText)
        this.props.customerActions.SearchCustomers(searchText);
    };

    checkfilter = (searchText) => {
        console.log(searchText)
        this.props.navigation.setParams({ salesChannelValue: searchText });
        this.props.customerActions.SearchCustomersChannel(searchText);
    };

    checkCustomerTypefilter = (searchText) => {
        console.log(searchText)
        this.props.navigation.setParams({ customerTypeValue: searchText });
        this.props.customerActions.SearchCustomerTypes(searchText);
    };


    onDelete = () => {
        if (
            this.props.selectedCustomer.hasOwnProperty('name')
            // && !this._isAnonymousCustomer(this.props.selectedCustomer)
        ) {
            console.log('CustomerBar:onDelete');
            let alertMessage =
                'Delete  customer ' + this.props.selectedCustomer.name;
            if (this.props.selectedCustomer.dueAmount === 0) {
                Alert.alert(
                    alertMessage,
                    'Are you sure you want to delete this customer?',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel'
                        },
                        {
                            text: 'OK',
                            onPress: () => {
                                CustomerRealm.softDeleteCustomer(
                                    this.props.selectedCustomer
                                ); // Delete from storage
                                this.props.customerActions.CustomerSelected({}); // Clear selected customer
                                this.props.navigation.setParams({ isCustomerSelected: false });
                                this.props.navigation.setParams({ customerName: "" });
                                this.props.customerActions.setCustomers(
                                    CustomerRealm.getAllCustomer()
                                );
                            }
                        }
                    ],
                    { cancelable: false }
                );
            } else {
                Alert.alert(
                    "Customer '" +
                    this.props.selectedCustomer.name +
                    "' has an outstanding credit and cannot be deleted",
                    '',
                    [{
                        text: 'OK', onPress: () => {
                            console.log('OK Pressed');
                            this.props.customerActions.CustomerSelected({}); // Clear selected customer
                            this.props.navigation.setParams({ isCustomerSelected: false });
                            this.props.navigation.setParams({ customerName: "" });
                        }
                    }],
                    { cancelable: true }
                );
            }
        }
    };

    checkSelectedCustomer = (text) => {
        // console.log(this.props.selectedCustomer);
        // if(this.props.selectedCustomer){
        //     return true;
        // }
        return 'false';

    };

    editCustomer() {
        console.log('onScrollCustomerTo');
        console.log(this.props);
        //this.props.navigation.navigate('AddCustomerStack');
    }

    componentWillUnmount() {
        Events.rm('ScrollCustomerTo', 'customerId1');
    }

    onScrollCustomerTo(data) {
        console.log('onScrollCustomerTo');
        // Commented onto scrollToItem requires getItemLayout and getItemLayout fails with
        // searches. Expect since not all items are rendered on sea
        // this.flatListRef.scrollToItem({animated: false, item: data.customer, viewPosition:0.5});
    }
    getItemLayout = (data, index) => ({
        length: 50,
        offset: 50 * index,
        index
    });

    shouldComponentUpdate(nextProps, nextState) {
        console.log('onScrollCustomerTo');
        return true;
    }

    render() {
        //console.log(this.props);
        //OrderRealm.truncate();
        console.log('Order Order', OrderRealm.getAllOrder())
        console.log('OrderItems OrderItems', OrderRealm.getOrderItems())
        return (
            <View style={{ backgroundColor: '#fff', width: '100%', height: '100%' }}>
                <FlatList
                    ref={ref => {
                        this.flatListRef = ref;
                    }}
                    data={this.prepareData()}
                    ListHeaderComponent={this.showHeader}
                    extraData={this.state.refresh}
                    renderItem={({ item, index, separators }) => (
                        <TouchableHighlight
                            onPress={() => this.onPressItem(item)}
                            onShowUnderlay={separators.highlight}
                            onHideUnderlay={separators.unhighlight}>
                            {this.getRow(item, index, separators)}
                        </TouchableHighlight>
                    )}
                    keyExtractor={item => item.customerId}
                    initialNumToRender={50}
                />
                <FloatingAction
                    onOpen={name => {
                        console.log(this.props);
                        this.props.customerActions.CustomerSelected({});
                        this.props.customerActions.setCustomerEditStatus(false);
                        this.props.navigation.setParams({ isCustomerSelected: false });
                        this.props.navigation.setParams({ customerName: '' });
                        this.props.navigation.navigate('EditCustomer');
                    }}
                />
                <SearchWatcher parent={this}>
                    {this.props.searchString}
                </SearchWatcher>
            </View>
        );
    }

    prepareData = () => {
        this.salesChannels = SalesChannelRealm.getSalesChannelsForDisplay();
        this.customerTypes = CustomerTypeRealm.getCustomerTypes();
        console.log('this.customerTypes',this.customerTypes);
        let data = [];
        if (this.props.customers.length > 0) {
            data = this.filterItems(this.props.customers);
        }
        return data;
    };


    filterItems = data => {
        let filter = {
            salesChannel: this.props.channelFilterString.length > 0 ? this.props.channelFilterString === 'all' ? "" : this.props.channelFilterString : "",
            name: this.props.searchString.length > 0 ? this.props.searchString : "",
            customerType: this.props.customerTypeFilter.length > 0 ? this.props.customerTypeFilter === 'all' ? "" : this.props.customerTypeFilter : "",
        };
        data = data.map(item => {
            return {
                ...item,
                salesChannel: this.getCustomerSalesChannel(item).toLowerCase(),
                customerType: this.getCustomerTypes(item).toLowerCase()
            }
        });

        console.log('filter', filter)
        console.log('filteredItems', data)
        let filteredItems = data.filter(function (item) {
            for (var key in filter) {
                if (
                    item[key].toString() === undefined ||
                    item[key].toString().toLowerCase().startsWith(filter[key].toString().toLowerCase()) !=
                    filter[key].toString().toLowerCase().startsWith(filter[key].toString().toLowerCase())
                )
                    return false;
            }
            return true;
        });
        return filteredItems;
    };

    getRow = (item, index, separators) => {
        // console.log("getRow -index: " + index)
        let isSelected = false;
        if (
            this.props.selectedCustomer &&
            this.props.selectedCustomer.customerId === item.customerId
        ) {
            console.log('Selected item is ' + item.customerId);
            isSelected = true;
        }
        if (true) {
            return (
                <View
                    style={[
                        this.getRowBackground(index, isSelected),
                        {
                            flex: 1,
                            flexDirection: 'row',
                            height: 50,
                            alignItems: 'center'
                        }
                    ]}>
                    <View style={{ flex: 2 }}>
                        <Text style={[styles.baseItem, styles.leftMargin]}>
                            {item.name}
                        </Text>
                    </View>
                    <View style={{ flex: 1.5 }}>
                        <Text style={[styles.baseItem]}>
                            {item.phoneNumber}
                        </Text>
                    </View>
                    {/* <View style={{ flex: 1.5 }}>
                        <Text style={[styles.baseItem]}>
                            {item.secondPhoneNumber || ''}
                        </Text>
                    </View> */}
                    <View style={{ flex: 2 }}>
                        <Text style={[styles.baseItem]}>{item.address}</Text>
                    </View>
                    <View style={{ flex: 0.75 }}>
                        <Text style={[styles.baseItem]}>
                            {item.dueAmount.toFixed(2)}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.baseItem]}>
                            {this.getCustomerSalesChannel(item)}
                        </Text>
                    </View>
                </View>
            );
        } else {
            return <View />;
        }
    };

    getCustomerSalesChannel(item) {
        try {
            for (let i = 0; i < this.salesChannels.length; i++) {
                if (this.salesChannels[i].id === item.salesChannelId) {
                    return this.salesChannels[i].displayName;
                }
            }
        } catch (error) {
            return 'Walk-up';
        }
    }

    getCustomerTypes(item) {
        try {
            for (let i = 0; i < this.customerTypes.length; i++) {
                if (this.customerTypes[i].id === item.customerTypeId) {
                    return this.customerTypes[i].name;
                }
            }
        } catch (error) {
            return 'Walk-up';
        }
    }

    _getSalesChannelName(channelId, salesChannels) {
        for (let i = 0; i < salesChannels.length; i++) {
            if (salesChannels[i].id === channelId) {
                return salesChannels[i].name;
            }
        }
        return 'direct';
    }

    _isAnonymousCustomer(customer) {
        return CustomerTypeRealm.getCustomerTypeByName('anonymous').id ==
            customer.customerTypeId
            ? true
            : false;
    }

    onLongPressItem = (item, event) => {
        this.setState({ refresh: !this.state.refresh });
        let actions = [i18n.t('edit'), i18n.t('delete')];
        this.props.customerActions.CustomerSelected(item);
        // if (!this._isAnonymousCustomer(item)) {
        if (event && event.target) {
            UIManager.showPopupMenu(
                event.target,
                actions,
                this.onPopupError,
                this.onPopupEvent.bind(this)
            );
        }
        // }
    };
    onPopupEvent(eventName, index) {
        if (eventName !== 'itemSelected') return;
        if (index === 0) {
            this.props.toolbarActions.ShowScreen('editCustomer');
        } else if (index === 1) {
            this.deleteCustomer();
        }
    }
    deleteCustomer() {
        let alertMessage = i18n.t('delete-specific-customer', {
            customerName: this.props.selectedCustomer.name
        });
        if (this.props.selectedCustomer.dueAmount === 0) {
            Alert.alert(
                alertMessage,
                i18n.t('are-you-sure', {
                    doThat: i18n.t('delete-this-customer')
                }),
                [
                    {
                        text: i18n.t('cancel'),
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel'
                    },
                    {
                        text: i18n.t('ok'),
                        onPress: () => {
                            CustomerRealm.softDeleteCustomer(
                                this.props.selectedCustomer
                            ); // Delete from storage
                            this.props.customerActions.CustomerSelected({}); // Clear selected customer
                            this.props.customerActions.setCustomers(
                                CustomerRealm.getAllCustomer()
                            );
                        }
                    }
                ],
                { cancelable: false }
            );
        } else {
            Alert.alert(
                i18n.t('credit-customer-no-delete', {
                    customerName: this.props.selectedCustomer.name
                }),
                '',
                [
                    {
                        text: i18n.t('ok'),
                        onPress: () => console.log('OK Pressed')
                    }
                ],
                { cancelable: true }
            );
        }
    }

    onPopupError() {
        console.log('onPopupError');
    }

    onPressItem = item => {
        console.log('_onPressItem');
        this.props.customerActions.CustomerSelected(item);
        this.setState({ refresh: !this.state.refresh });
        this.props.customerActions.setCustomerEditStatus(true);
        this.props.navigation.setParams({ isCustomerSelected: true });
        this.props.navigation.setParams({ customerName: item.name });
        Events.trigger('onOrder', { customer: item });
    };

    showHeader = () => {
        console.log('Displaying header');
        return (
            <View
                style={[
                    {
                        flex: 1,
                        flexDirection: 'row',
                        height: 50,
                        alignItems: 'center'
                    },
                    styles.headerBackground
                ]}>
                <View style={[{ flex: 2 }]}>
                    <Text style={[styles.headerItem, styles.leftMargin]}>
                        {i18n.t('account-name')}
                    </Text>
                </View>
                <View style={[{ flex: 1.5 }]}>
                    <Text style={[styles.headerItem]}>
                        {i18n.t('telephone-number')}
                    </Text>
                </View>
                {/* <View style={[{ flex: 1.5 }]}>
                    <Text style={[styles.headerItem]}>
                        {i18n.t('second-phone-number')}
                    </Text>
                </View> */}
                <View style={[{ flex: 2 }]}>
                    <Text style={[styles.headerItem]}>{i18n.t('address')}</Text>
                </View>
                <View style={[{ flex: 0.75 }]}>
                    <Text style={[styles.headerItem]}>{i18n.t('balance')}</Text>
                </View>
                <View style={[{ flex: 1 }]}>
                    <Text style={[styles.headerItem]}>{i18n.t('channel')}</Text>
                </View>
            </View>
        );
    };
    getRowBackground = (index, isSelected) => {
        if (isSelected) {
            return styles.selectedBackground;
        } else {
            return index % 2 === 0
                ? styles.lightBackground
                : styles.darkBackground;
        }
    };
}

class SearchWatcher extends React.Component {
    render() {

        return this.searchEvent();
    }

    // TODO: Use states instead of setTimeout
    searchEvent() {
        console.log('SearchWatcher');

        let that = this;
        console.log(that.props.parent.props.channelFilterString);
        console.log(that.props.parent.state.channelFilterString);

        console.log(that.props.parent.props.customerTypeFilter);
        console.log(that.props.parent.state.customerTypeFilter);

        console.log(that.props.parent.props.searchString);
        console.log(that.props.parent.state.searchString);
        setTimeout(() => {
            if (
                that.props.parent.props.searchString !==
                that.props.parent.state.searchString
            ) {
                that.props.parent.state.searchString =
                    that.props.parent.props.searchString;
                that.props.parent.setState({
                    refresh: !that.props.parent.state.refresh
                });
            }
        }, 50);
        return null;
    }
}
function mapStateToProps(state, props) {
    return {
        selectedCustomer: state.customerReducer.selectedCustomer,
        customers: state.customerReducer.customers,
        searchString: state.customerReducer.searchString,
        channelFilterString: state.customerReducer.channelFilterString,
        customerTypeFilter: state.customerReducer.customerTypeFilter,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        customerActions: bindActionCreators(CustomerActions, dispatch),
        toolbarActions: bindActionCreators(ToolbarActions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomerList);



const styles = StyleSheet.create({
    baseItem: {
        fontSize: 18
    },
    leftMargin: {
        left: 10
    },
    headerItem: {
        fontWeight: 'bold',
        fontSize: 18
    },
    headerBackground: {
        backgroundColor: '#ABC1DE'
    },

    lightBackground: {
        backgroundColor: 'white'
    },
    darkBackground: {
        backgroundColor: '#F0F8FF'
    },
    selectedBackground: {
        backgroundColor: '#9AADC8'
    }
});
