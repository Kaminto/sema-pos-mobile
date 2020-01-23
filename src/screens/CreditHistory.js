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
import OrderRealm from '../database/orders/orders.operations';
import CustomerTypeRealm from '../database/customer-types/customer-types.operations';
import SalesChannelRealm from '../database/sales-channels/sales-channels.operations';
import Events from 'react-native-simple-events';
import i18n from '../app/i18n';
import Modal from 'react-native-modalbox';

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

    }

    componentWillUnmount() {

    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    render() {
        return (
            <View style={{ backgroundColor: '#fff', width: '100%', height: '100%' }}>
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

                <Modal style={[styles.modal, styles.modal3]} coverScreen={true} position={"center"} ref={"modal6"} isDisabled={this.state.isDisabled}>
                    <View
                        style={{
                            justifyContent: 'flex-end',
                            flexDirection: 'row',
                            right: 100,
                            top: 10
                        }}>
                        {this.getCancelButton()}
                    </View>

                    <View
                        style={{
                            flex: 1,
                            marginTop: 0,
                            marginLeft: 100,
                            marginRight: 100
                        }}>

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


                        <View style={{ flex: 1, backgroundColor: '#fff' }}>
                            <FlatList
                                data={this.prepareTopUpData()}
                                renderItem={this.renderTopUps.bind(this)}
                                keyExtractor={(item, index) => item.id}
                                ItemSeparatorComponent={this.renderSeparator}
                                extraData={this.state.refresh}
                            />
                        </View>


                    </View>
                </Modal>
            </View>
        );
    }

    renderTopUps({ item, index }) {

		//	console.log("Item reciep", item);
		//const receiptLineItems = item.receiptLineItems.map((lineItem, idx) => {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					marginBottom: 10,
				}}>

				<View style={{ justifyContent: 'space-around' }}>
					<View style={styles.itemData}>
						<Text style={styles.label}>Total: </Text>
						<Text>{item.topup}</Text>
					</View>
					<View style={styles.itemData}>
						<Text style={styles.label}>Balance: </Text>
						<Text>{item.balance}</Text>
					</View>
				</View>
			</View>
		);
		//	});



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

    }


    prepareData = () => {
        let data = [];
        if (this.props.topups.length > 0) {
            data = this.props.topups;
        }
        return data;
    };

    prepareTopUpData() {
        // Used for enumerating receipts
        //console.log("here selectedCustomer", this.props.selectedCustomer);

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
        topups: state.topupReducer.topups
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
