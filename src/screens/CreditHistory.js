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
import * as TopUpActions from '../actions/TopUpActions';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment-timezone';
import ModalDropdown from 'react-native-modal-dropdown';
import { Card, ListItem, Button, Input, ThemeProvider } from 'react-native-elements';
import CustomerRealm from '../database/customers/customer.operations';
import CreditRealm from '../database/credit/credit.operations';
import SettingRealm from '../database/settings/settings.operations';
import OrderRealm from '../database/orders/orders.operations';
import CustomerTypeRealm from '../database/customer-types/customer-types.operations';
import SalesChannelRealm from '../database/sales-channels/sales-channels.operations';
import Events from 'react-native-simple-events';
import i18n from '../app/i18n';
import Modal from 'react-native-modalbox';
import SelectedCustomerDetails from './CustomerDetailSubHeader';
class CreditHistory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            refresh: false,
            topup: "",
            searchString: '',
            hasScrolled: false
        };
    }
    componentDidMount() {
        console.log(this.prepareTopUpData());
        this.props.topUpActions.setTopUpTotal(
            this.prepareTopUpData().reduce((total, item) => { return (total + item.topup) }, 0)
        );
    }

    componentWillUnmount() {
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
	}

    render() {
        console.log(this.props.receiptsPaymentTypes);
        console.log(this.props.paymentTypes);
        console.log(this.comparePaymentTypes());
        console.log(this.comparePaymentTypeReceipts());
        console.log(this.getCustomerRecieptData());
        return (
            <View style={{ backgroundColor: '#fff', width: '100%', height: '100%' }}>
                <View style={{
                    flexDirection: 'row',
                    height: 100,
                    backgroundColor: '#00549C',
                    alignItems: 'center'
                }}>
                    <View style={[styles.leftToolbar]}>
                        <SelectedCustomerDetails
                            creditSales={this.comparePaymentTypes()}
                            navigation={this.props.navigation}
                            topupTotal={this.props.topupTotal}
                            selectedCustomer={this.props.selectedCustomer} />
                    </View>
                </View>

                <View style={{ marginBottom: 10 }}>
                    <Input
                        placeholder={i18n.t(
                            'topup-placeholder'
                        )}
                        label={i18n.t('topup-placeholder')}
                        value={this.state.topup}
                        onChangeText={this.onChangeTopup}
                    />
                    <Button
                        onPress={() => this.addCredit()}
                        buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 10 }}
                        title={i18n.t('topup')} />
                </View>
                <FlatList
                    ref={ref => {
                        this.flatListRef = ref;
                    }}
                    data={this.prepareTopUpData()}
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
                        this.refs.modal6.open();
                    }}
                />
            </View>
        );
    }

    onChangeTopup = topup => {
        console.log(topup);
        this.setState({ topup });
        //this.props.parent.forceUpdate();
    };

    getCancelButton() {
        return (
            <TouchableHighlight onPress={() => this.closePaymentModal()}>
                <Icon
                    size={50}
                    name="md-close"
                    color="black"
                />
            </TouchableHighlight>
        );
    }

    closePaymentModal = () => {
        this.refs.modal6.close();
    };

    addCredit = () => {

        console.log(this.state.topup);
        console.log(this.props.selectedCustomer);


        CreditRealm.createCredit(
            this.props.selectedCustomer.customerId,
            Number(this.state.topup),
            Number(this.state.topup)
        );
        this.setState({ topup: "" });
        console.log(this.state.topup);
        console.log(CreditRealm.getAllCredit());
        this.props.topUpActions.setTopups(CreditRealm.getAllCredit());
        this.props.topUpActions.setTopUpTotal(
            this.prepareTopUpData().reduce((total, item) => { return (total + item.topup) }, 0)
        );
    }


    prepareTopUpData() {

        if (this.props.topups.length > 0) {
            const totalCount = this.props.topups.length;
            let topupLogs = [...new Set(this.props.topups)];
            let topups = topupLogs.map((topup, index) => {
                return {
                    active: topup.active,
                    //id: topup.id,
                    createdAt: topup.createdDate,
                    topUpId: topup.topUpId,
                    customer_account_id: topup.customer_account_id,
                    total: topup.total,
                    topup: topup.topup,
                    balance: topup.balance,
                    totalCount
                };
            });

            topups.sort((a, b) => {
                return moment
                    .tz(a.createdAt, moment.tz.guess())
                    .isBefore(moment.tz(b.createdAt, moment.tz.guess()))
                    ? 1
                    : -1;
            });

            console.log('topups', topups);
            return topups.filter(r => r.customer_account_id === this.props.selectedCustomer.customerId);
        } else {
            return [];
        }

    }


    getRow = (item, index, separators) => {
        let isSelected = false;
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
                        {item.topup}
                    </Text>
                </View>
                <View style={{ flex: 1.5 }}>
                    <Text style={[styles.baseItem]}>
                        {item.balance}
                    </Text>
                </View>
                <View style={{ flex: 2 }}>
                    <Text style={[styles.baseItem]}>
                        {moment
                            .tz(item.created_at, moment.tz.guess())
                            .format('YYYY-MM-DD HH:mm')}
                    </Text>
                </View>
            </View>
        );
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
                        Amount
                    </Text>
                </View>
                <View style={[{ flex: 1.5 }]}>
                    <Text style={[styles.headerItem]}>
                        Balance
                    </Text>
                </View>
                <View style={[{ flex: 1 }]}>
                    <Text style={[styles.headerItem]}>Created</Text>
                </View>
            </View>
        );
    };



    onPressItem = item => {
        console.log('_onPressItem', item);
        // this.props.customerActions.CustomerSelected(item);
        // this.setState({ refresh: !this.state.refresh });
        // this.props.customerActions.setCustomerEditStatus(true);
        // this.props.navigation.setParams({ isCustomerSelected: true });
        // this.props.navigation.setParams({ customerName: item.name });
        // Events.trigger('onOrder', { customer: item });
    };

    comparePaymentTypeReceipts() {
        let receiptsPaymentTypes = [...this.comparePaymentTypes()];
        let customerReceipt = [...this.getCustomerRecieptData()];
        console.log(receiptsPaymentTypes);
        console.log(customerReceipt);
        let finalCustomerReceiptsPaymentTypes = [];
        for (let receiptsPaymentType of receiptsPaymentTypes) {
            const rpIndex = customerReceipt.map(function (e) { return e.id }).indexOf(receiptsPaymentType.receipt_id);
            console.log(rpIndex);
            if (rpIndex >= 0) {
                receiptsPaymentType.receipt = receiptsPaymentTypes[rpIndex];
                finalCustomerReceiptsPaymentTypes.push(receiptsPaymentType);
            }
        }
        return finalCustomerReceiptsPaymentTypes;
    }

    comparePaymentTypes() {
        let receiptsPaymentTypes = [...this.props.receiptsPaymentTypes];
        let paymentTypes = [...this.props.paymentTypes];

        let finalreceiptsPaymentTypes = [];

        for (let receiptsPaymentType of receiptsPaymentTypes) {
            const rpIndex = paymentTypes.map(function (e) { return e.id }).indexOf(receiptsPaymentType.payment_type_id);
            if (rpIndex >= 0) {
                if (paymentTypes[rpIndex].name === 'credit') {
                    receiptsPaymentType.name = paymentTypes[rpIndex].name;
                    finalreceiptsPaymentTypes.push(receiptsPaymentType);
                }
            }
        }
        return finalreceiptsPaymentTypes;
    }

    getCustomerRecieptData() {
        // Used for enumerating receipts
        //console.log("here selectedCustomer", this.props.selectedCustomer);

        if (this.props.receipts.length > 0) {
            const totalCount = this.props.receipts.length;

            let salesLogs = [...new Set(this.props.receipts)];
            let remoteReceipts = salesLogs.map((receipt, index) => {
                //console.log("customerAccount", receipt.customer_account);
                return {
                    active: receipt.active,
                    id: receipt.id,
                    createdAt: receipt.created_at,
                    customerAccount: receipt.customer_account,
                    customer_account_id: receipt.customer_account_id,
                    receiptLineItems: receipt.receipt_line_items,
                    isLocal: receipt.isLocal || false,
                    key: receipt.isLocal ? receipt.key : null,
                    index,
                    updated: receipt.updated,
                    amountLoan: receipt.amount_loan,
                    totalCount,
                    currency: receipt.currency_code,
                    totalAmount: receipt.total
                };
            });

            remoteReceipts.sort((a, b) => {
                return moment
                    .tz(a.createdAt, moment.tz.guess())
                    .isBefore(moment.tz(b.createdAt, moment.tz.guess()))
                    ? 1
                    : -1;
            });

            let siteId = 0;
            if (SettingRealm.getAllSetting()) {
                siteId = SettingRealm.getAllSetting().siteId;
            }
            return remoteReceipts.filter(r => r.customer_account_id === this.props.selectedCustomer.customerId);
        } else {
            return [];
        }

    }


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


function mapStateToProps(state, props) {
    return {
        selectedCustomer: state.customerReducer.selectedCustomer,
        customers: state.customerReducer.customers,
        receiptsPaymentTypes: state.paymentTypesReducer.receiptsPaymentTypes,
        paymentTypes: state.paymentTypesReducer.paymentTypes,
        searchString: state.customerReducer.searchString,
        receipts: state.receiptReducer.receipts,
        topups: state.topupReducer.topups,
        topupTotal: state.topupReducer.total,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        customerActions: bindActionCreators(CustomerActions, dispatch),
        toolbarActions: bindActionCreators(ToolbarActions, dispatch),
        topUpActions: bindActionCreators(TopUpActions, dispatch),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CreditHistory);



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
    leftToolbar: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center'
    },
    commandBarContainer: {
        flex: 1,
        backgroundColor: '#fff',
        height: 80,
		alignSelf: 'flex-start',
		flexDirection: 'row',
        marginLeft: 20,
        marginRight: 20
    },
    selectedCustomerText: {
        marginLeft: 10,
        alignSelf: 'center',
        flex: 0.5,
        color: 'black'
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
