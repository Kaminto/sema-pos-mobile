import React from 'react';
if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React);
  }
import {
    View,
    Text,
    FlatList,
    TouchableHighlight,
    StyleSheet,
	Alert
} from 'react-native';
import { FloatingAction } from "react-native-floating-action";
import * as CustomerActions from '../actions/CustomerActions';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal from 'react-native-modalbox';

import CustomerRealm from '../database/customers/customer.operations';
import CustomerTypeRealm from '../database/customer-types/customer-types.operations';
import Events from 'react-native-simple-events';
import i18n from '../app/i18n';

import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import * as PaymentTypesActions from "../actions/PaymentTypesActions";
import slowlog from 'react-native-slowlog';

import PaymentModal from './paymentModal';

class CustomerList extends React.PureComponent {
    constructor(props) {
		super(props);
		slowlog(this, /.*/);

        this.state = {
            refresh: false,
            searchString: '',
            customerTypeFilter: '',
            customerTypeValue: '',
            hasScrolled: false
		};

	}

    componentDidMount() {
		this.props.navigation.setParams({ isCustomerSelected: false ,
										  customerTypeValue: 'all' ,
										  customerName: "" ,
										  searchCustomer: this.searchCustomer ,
										  checkCustomerTypefilter: this.checkCustomerTypefilter ,
										  onDelete: this.onDelete ,
										  clearLoan: this.clearLoan ,
										  checkSelectedCustomer: this.checkSelectedCustomer,
										  editCustomer: this.editCustomer });

        this.props.customerActions.CustomerSelected({});
        this.props.customerActions.setCustomerEditStatus(false);

        // Events.on(
        //     'ScrollCustomerTo',
        //     'customerId1',
        //     this.onScrollCustomerTo.bind(this)
        // );
	}
	static whyDidYouRender = true;

    searchCustomer = (searchText) => {
        this.props.customerActions.SearchCustomers(searchText);
    };

	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.navigation !== this.props.navigation;
	}


    checkCustomerTypefilter = (searchText) => {
        this.props.navigation.setParams({ customerTypeValue: searchText });
        this.props.customerActions.SearchCustomerTypes(searchText);
    };

    modalOnClose() {
        PaymentTypeRealm.resetSelected();
        this.props.paymentTypesActions.resetSelectedDebt();
        this.props.paymentTypesActions.setPaymentTypes(
            PaymentTypeRealm.getPaymentTypes());
    }

    closePaymentModal = () => {
        this.refs.modal6.close();
    };

    clearLoan = () => {
        this.refs.modal6.open();
    }

    onDelete = () => {
        if (
            this.props.selectedCustomer.hasOwnProperty('name')
            // && !this._isAnonymousCustomer(this.props.selectedCustomer)
        ) {
            let alertMessage =
                'Delete  customer ' + this.props.selectedCustomer.name;
            if (this.props.selectedCustomer.dueAmount === 0) {
                Alert.alert(
                    alertMessage,
                    'Are you sure you want to delete this customer?',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => { },
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
                                this.props.navigation.setParams({ isDueAmount: 0 });
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
                            this.props.customerActions.CustomerSelected({}); // Clear selected customer
                            this.props.navigation.setParams({ isCustomerSelected: false });
                            this.props.navigation.setParams({ isDueAmount: 0 });
                            this.props.navigation.setParams({ customerName: "" });
                        }
                    }],
                    { cancelable: true }
                );
            }
        }
    };

    checkSelectedCustomer = (text) => {
        return 'false';
    };

    // componentWillUnmount() {
    //     Events.rm('ScrollCustomerTo', 'customerId1');
    // }

    // onScrollCustomerTo(data) {
	// }

	handleOnPress  = item => {
		this.setState({ refresh: !this.state.refresh });
		this.props.customerActions.CustomerSelected(item);
		this.props.navigation.setParams({ isDueAmount: item.dueAmount });
		this.props.navigation.setParams({ isCustomerSelected: false });
		this.props.navigation.setParams({ customerName: '' });
		Events.trigger('onOrder', { customer: item });
		this.props.navigation.navigate('OrderView');
	};
	OnLongPressItem  = item => {
		this.props.customerActions.CustomerSelected(item);
		this.setState({ refresh: !this.state.refresh });
		this.props.navigation.setParams({ isCustomerSelected: true });
		this.props.navigation.setParams({ isDueAmount: item.dueAmount });
		this.props.navigation.setParams({ customerName: item.name });
		this.props.navigation.setParams({ 'title': item.name });
		Events.trigger('onOrder', { customer: item });
  };

	onPressItem = item => {
		    this.setState({ refresh: !this.state.refresh });
			this.props.customerActions.CustomerSelected(item);
			this.props.navigation.setParams({ isDueAmount: item.dueAmount });
			this.props.navigation.setParams({ isCustomerSelected: false });
			this.props.navigation.setParams({ customerName: '' });
			Events.trigger('onOrder', { customer: item });
			this.props.navigation.navigate('OrderView');
    };


    render() {
        return (
            <View style={{ backgroundColor: '#fff', flex: 1 }}>
                <FlatList
                    ref={ref => {
                        this.flatListRef = ref;
                    }}
					data={this.prepareData()}
                    ListHeaderComponent={this.showHeader}
                    extraData={this.state.refresh}
                    renderItem={({ item, index, separators }) => (
                        <TouchableHighlight
							onLongPress={() => this.OnLongPressItem(item)}
							onPress={() => this.handleOnPress(item)}
                            onShowUnderlay={separators.highlight}
                            onHideUnderlay={separators.unhighlight}>
                            {this.getRow(item, index, separators)}
						</TouchableHighlight>

                    )}
					keyExtractor={item => item.customerId}
					windowSize={20}
					removeClippedSubviews={true}
                    maxToRenderPerBatch={20}
                />
                <FloatingAction
                    onOpen={name => {
                        this.props.customerActions.CustomerSelected({});
                        this.props.customerActions.setCustomerEditStatus(false);
                        this.props.navigation.setParams({ isCustomerSelected: false });
                        this.props.navigation.setParams({ customerName: '' });
                        this.props.navigation.navigate('EditCustomer');
                    }}
                />

                <View style={styles.modalPayment}>
                    <Modal
                        style={[styles.modal, styles.modal3]}
                        coverScreen={true}
                        position={"center"} ref={"modal6"}
                        onClosed={() => this.modalOnClose()}
                        isDisabled={this.state.isDisabled}>
                        <PaymentModal
                            modalOnClose={this.modalOnClose}
                            closePaymentModal={this.closePaymentModal} />
                    </Modal>
                </View>
                <SearchWatcher parent={this}>
                    {this.props.searchString}
                </SearchWatcher>
            </View>
        );
    }

    prepareData = () => {
        this.customerTypes = CustomerTypeRealm.getCustomerTypes();
        let data = [];
        if (this.props.customers.length > 0) {
            data = this.filterItems(this.props.customers);
        }
        return data;
    };

    filterItems = data => {
        let filter = {
            searchString: this.props.searchString.length > 0 ? this.props.searchString : "",
            customerType: this.props.customerTypeFilter.length > 0 ? this.props.customerTypeFilter === 'all' ? "" : this.props.customerTypeFilter : "",
        };
        data = data.map(item => {
            return {
                ...item,
                walletBalance: item.walletBalance ? item.walletBalance : 0 ,
                searchString: item.name + ' ' + item.phoneNumber + ' ' + item.address,
				customerType: item != undefined ? this.getCustomerTypes(item).toLowerCase() : "",
            }
		});

        let filteredItems = data.filter(function (item) {
            for (var key in filter) {
                if (
                    item[key].toString() === undefined ||
                    item[key].toString().toLowerCase().includes(filter[key].toString().toLowerCase()) !=
                    filter[key].toString().toLowerCase().includes(filter[key].toString().toLowerCase())
                )
                    return false;
            }
            return true;
        });
        return filteredItems;
    };

    getRow = (item, index, separators) => {
        let isSelected = false;
        if (
            this.props.selectedCustomer &&
            this.props.selectedCustomer.customerId === item.customerId
        ) {
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
							paddingTop: 15,
							paddingBottom: 15,
                            alignItems: 'center'
                        }
                    ]}>
                    <View style={{ flex: 1.5 }}>
                        <Text style={[styles.baseItem, styles.leftMargin]}>
                            {item.name}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.baseItem]}>
                            {item.phoneNumber}
                        </Text>
                    </View>

                    <View style={{ flex: 1.5 }}>
                        <Text style={[styles.baseItem]}>{item.address}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.baseItem]}>
                            {this.getCustomerTypes(item)}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.baseItem]}>
                            {item.dueAmount.toFixed(2)}
                        </Text>
                    </View>
					<View style={{ flex: 1 }}>
                        <Text style={[styles.baseItem]}>
                            {item.walletBalance.toFixed(2)}
                        </Text>
                    </View>


                </View>
            );
        } else {
            return <View />;
        }
    };

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

    _isAnonymousCustomer(customer) {
        return CustomerTypeRealm.getCustomerTypeByName('anonymous').id ==
            customer.customerTypeId
            ? true
            : false;
    }

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
                        onPress: () => { },
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
                        onPress: () => { }
                    }
                ],
                { cancelable: true }
            );
        }
    }


    showHeader = () => {
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
                <View style={[{ flex: 1.5 }]}>
                    <Text style={[styles.headerItem, styles.leftMargin]}>
                        {i18n.t('account-name')}
                    </Text>
                </View>
                <View style={[{ flex: 1 }]}>
                    <Text style={[styles.headerItem]}>
                        {i18n.t('telephone-number')}
                    </Text>
                </View>
                <View style={[{ flex: 1.5 }]}>
                    <Text style={[styles.headerItem]}>{i18n.t('address')}</Text>
                </View>
                <View style={[{ flex: 1 }]}>
                    <Text style={[styles.headerItem]}>{i18n.t('customer-type')}</Text>
                </View>
                <View style={[{ flex: 1 }]}>
                    <Text style={[styles.headerItem]}>{i18n.t('balance')}</Text>
                </View>
				<View style={[{ flex: 1 }]}>
                    <Text style={[styles.headerItem]}>Wallet</Text>
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

class SearchWatcher extends React.PureComponent {
    render() {
        return this.searchEvent();
    }

    // TODO: Use states instead of setTimeout
    searchEvent() {

        let that = this;

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
		customerTypeFilter: state.customerReducer.customerTypeFilter,
		paymentTypes: state.paymentTypesReducer.paymentTypes,
    };
}

function mapDispatchToProps(dispatch) {
    return {
		customerActions: bindActionCreators(CustomerActions, dispatch),
		paymentTypesActions: bindActionCreators(PaymentTypesActions, dispatch),
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
    modalPayment: {
        backgroundColor: 'white',
    },
    modal3: {
        width: '70%',
        height: 400,
    },
    modal: {
        justifyContent: 'center',
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
