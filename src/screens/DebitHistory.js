import React, { Component } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableHighlight,
    StyleSheet,
} from 'react-native';

import moment from 'moment-timezone';
import * as CustomerActions from '../actions/CustomerActions';
import * as ToolbarActions from '../actions/ToolBarActions';
import * as TopUpActions from '../actions/TopUpActions';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import SettingRealm from '../database/settings/settings.operations';
import SelectedCustomerDetails from './CustomerDetailSubHeader';

class DebitHistory extends React.PureComponent {
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

    }

    componentWillUnmount() {

    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    render() {
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
                            creditSales={this.comparePaymentCreditTypes()}
                            navigation={this.props.navigation}
                            topupTotal={this.props.topupTotal}
                            selectedCustomer={this.props.selectedCustomer}
                        />
                    </View>
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

            </View>
        );
    }

    onChangeTopup = topup => {
        this.setState({ topup });
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



    prepareData = () => {
        let data = [];
        if (this.props.topups.length > 0) {
            data = this.props.topups;
        }
        return data;
    };

    prepareTopUpData() {
        return this.comparePaymentTypeReceipts();

    }

    comparePaymentTypeReceipts() {
        let receiptsPaymentTypes = [...this.comparePaymentTypes()];
        let customerReceipt = [...this.getCustomerRecieptData()];
        let finalCustomerReceiptsPaymentTypes = [];

        for (let receiptsPaymentType of receiptsPaymentTypes) {
            const rpIndex = customerReceipt.map(function (e) { return e.id }).indexOf(receiptsPaymentType.receipt_id);
            if (rpIndex >= 0) {
                receiptsPaymentType.receipt = receiptsPaymentTypes[rpIndex];
                finalCustomerReceiptsPaymentTypes.push(receiptsPaymentType);
            }
        }
        return finalCustomerReceiptsPaymentTypes;
    }

    comparePaymentCreditTypes() {
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


    comparePaymentTypes() {
        let receiptsPaymentTypes = [...this.props.receiptsPaymentTypes];
        let paymentTypes = [...this.props.paymentTypes];

        let finalreceiptsPaymentTypes = [];

        for (let receiptsPaymentType of receiptsPaymentTypes) {
            const rpIndex = paymentTypes.map(function (e) { return e.id }).indexOf(receiptsPaymentType.payment_type_id);
            if (rpIndex >= 0) {
                if (paymentTypes[rpIndex].name === 'loan') {
                    receiptsPaymentType.name = paymentTypes[rpIndex].name;
                    finalreceiptsPaymentTypes.push(receiptsPaymentType);
                }
            }
        }
        return finalreceiptsPaymentTypes;
    }


    getCustomerRecieptData() {
        // Used for enumerating receipts

        if (this.props.receipts.length > 0) {
            const totalCount = this.props.receipts.length;

            let salesLogs = [...new Set(this.props.receipts)];
            let remoteReceipts = salesLogs.map((receipt, index) => {

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
                        {item.amount}
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
                <View style={[{ flex: 1 }]}>
                    <Text style={[styles.headerItem]}>Created</Text>
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

function mapStateToProps(state, props) {
    return {
        selectedCustomer: state.customerReducer.selectedCustomer,
        customers: state.customerReducer.customers,
        searchString: state.customerReducer.searchString,
        topups: state.topupReducer.topups,
        receiptsPaymentTypes: state.paymentTypesReducer.receiptsPaymentTypes,
        paymentTypes: state.paymentTypesReducer.paymentTypes,
        settings: state.settingsReducer.settings,
        receipts: state.receiptReducer.receipts,
        products: state.productReducer.products,
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
)(DebitHistory);



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

