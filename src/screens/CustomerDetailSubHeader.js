import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableHighlight,
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as ToolbarActions from '../actions/ToolBarActions';


import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import CustomerReminderRealm from '../database/customer-reminder/customer-reminder.operations';

import * as PaymentTypesActions from "../actions/PaymentTypesActions";
import Ionicons from 'react-native-vector-icons/Ionicons';

import * as CustomerActions from '../actions/CustomerActions';
import * as TopUpActions from '../actions/TopUpActions';
import * as reportActions from '../actions/ReportActions';
import * as receiptActions from '../actions/ReceiptActions';


import PaymentModal from './paymentModal';

import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modalbox';

class SelectedCustomerDetails extends React.Component {
	constructor(props) {
		super(props);
		this.saleSuccess = false;
		this.state = {
			isQuantityVisible: false,
			firstKey: true,
			isOpen: false,
			isWalkIn: true,
			isDisabled: false,
			swipeToClose: true,
			sliderValue: 0.3,
			paymentOptions: "",
			selectedPaymentTypes: [],
			selectedType: {},
			checkedType: {},
			textInputs: [],
			isCompleteOrderVisible: false,
			isDateTimePickerVisible: false,
			receiptDate: new Date(),
			canProceed: true,
			selectedPaymentType: "Cash",
		};
	}

	render() {
		return (
			<>
				<View style={styles.commandBarContainer}>
					<View style={{ flexDirection: 'column', flex: 1.5, height: 100, paddingLeft: 10 }}>
						<Text style={[styles.selectedCustomerText, { fontSize: 20 }]}>
							{this.getName()} . {this.getPhone()}
						</Text>
						{/* <Text style={[styles.selectedCustomerText, { fontSize: 18 }]}>
							Last Purchase Date: {CustomerReminderRealm.getCustomerReminderById(this.props.selectedCustomer.customerId) === 'N/A' ? 'N.A' : CustomerReminderRealm.getCustomerReminderById(this.props.selectedCustomer.customerId).lastPurchaseDate }
						</Text> */}
						<Text style={styles.selectedCustomerText}>
								<Ionicons
										name='md-alarm'
										size={24}
										color='black'
									/> :
									  {CustomerReminderRealm.getCustomerReminderById(this.props.selectedCustomer.customerId) === ' N/A' ? ' N/A' : CustomerReminderRealm.getCustomerReminderById(this.props.selectedCustomer.customerId).reminder_date }
						</Text>
						<View style={styles.completeOrder}>
							<TouchableHighlight
								onPress={() => this.props.navigation.navigate('OrderView')}>
								<Text style={styles.buttonText}>Make Sale</Text>
							</TouchableHighlight>
						</View>
					</View>
					<View style={{ flexDirection: 'column', flex: 1, height: 100 }}>
						{/* <Text style={styles.selectedCustomerText}>
					{this.getCreditPurchases()} Credit Purchases
					</Text> */}
						<Text style={styles.selectedCustomerText}>
							Customer Wallet: {this.props.topupTotal - this.getCreditPurchases()}
						</Text>

						<View style={[styles.completeOrder, {marginLeft: 10}]}>
							<TouchableHighlight
								onPress={() => this.props.navigation.navigate('CustomerWallet')}>
								<Text style={[styles.buttonText, {marginLeft: 10}]}>Topup Wallet</Text>
							</TouchableHighlight>
						</View>
					</View>

					<View style={{ flexDirection: 'column', flex: 1, height: 100 }}>
						<Text style={styles.selectedCustomerText}>
							Loan Balance:  {this.props.selectedCustomer.dueAmount}
						</Text>
						<View style={styles.completeOrder}>
							<TouchableHighlight
								onPress={() => {
									this.refs.modal6.open();
								}}>
								<Text style={styles.buttonText}>Loan Repayment</Text>
							</TouchableHighlight>
						</View>
					</View>
				</View>

				<View style={styles.modalPayment}>
					<Modal
						style={[styles.modal, styles.modal3]}
						coverScreen={true}
						position={"center"} ref={"modal6"}
						onClosed={() => this.modalOnClose()}
						isDisabled={this.state.isDisabled}>
						<PaymentModal
							modalOnClose={this.modalOnClose}
							closePaymentModal={this.closePaymentModal}
						/>
					</Modal>
				</View>
			</>
		);
	}



	modalOnClose() {
		PaymentTypeRealm.resetSelected();
		this.props.paymentTypesActions.resetSelectedDebt();
		this.props.paymentTypesActions.setPaymentTypes(
			PaymentTypeRealm.getPaymentTypes());
	}

	closePaymentModal = () => {
		this.refs.modal6.close();
	};

	getCreditPurchases() {
		return this.props.creditSales.reduce((total, item) => { return (total + item.amount) }, 0)
	}

	getReminder(id) {
		if (CustomerReminderRealm.getCustomerReminderById(id).length > 0) {
			return CustomerReminderRealm.getCustomerReminderById(id)[0].reminder_date;
		} else {
			return 'N/A';
		}
	}

	getLastPurchaseDate(id) {
		if (CustomerReminderRealm.getCustomerReminderById(id).length > 0) {
			return CustomerReminderRealm.getCustomerReminderById(id)[0].lastPurchaseDate;
		} else {
			return 'N/A';
		}
	}



	getName() {
		if (this.props.selectedCustomer.hasOwnProperty('name')) {
			return this.props.selectedCustomer.name;
		} else {
			return '';
		}

	}

	getPhone() {
		if (this.props.selectedCustomer.hasOwnProperty('phoneNumber')) {
			return this.props.selectedCustomer.phoneNumber;
		} else {
			return '';
		}
	}

	getCustomerType() {
		if (this.props.selectedCustomer.hasOwnProperty('customertype')) {
			return this.props.selectedCustomer.customerType;
		} else {
			return '';
		}
	}
}

function mapStateToProps(state, props) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer,
		settings: state.settingsReducer.settings,
		receipts: state.receiptReducer.receipts,
		remoteReceipts: state.receiptReducer.remoteReceipts,
		customers: state.customerReducer.customers,
		receiptsPaymentTypes: state.paymentTypesReducer.receiptsPaymentTypes,
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		products: state.productReducer.products,
		topups: state.topupReducer.topups,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		toolbarActions: bindActionCreators(ToolbarActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		reportActions: bindActionCreators(reportActions, dispatch),
		paymentTypesActions: bindActionCreators(PaymentTypesActions, dispatch),
		receiptActions: bindActionCreators(receiptActions, dispatch)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SelectedCustomerDetails);

const styles = StyleSheet.create({

	buttonText: {
		backgroundColor: '#2858a7',
		fontWeight: 'bold',
		fontSize: 18,
		color: 'white',

	},

	commandBarContainer: {
		flex: .25,
		flexDirection: 'row',
		backgroundColor: '#f1f1f1',
		top: 10,
		height: 70,
		elevation: 10,
		alignSelf: 'center',
		width: '85%',
		justifyContent: 'center',
		color: 'white',
		paddingBottom: 20
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
	selectedCustomerText: {
		marginLeft: 10,
		alignSelf: 'flex-start',
		flex: 0.5,
		fontSize: 18,
		color: 'black'
	},

	completeOrder: {
		backgroundColor: '#2858a7',
		borderRadius: 5,
		flex: .4,
		margin: '1%',
		padding: 10,
		width: 200
	}

});
