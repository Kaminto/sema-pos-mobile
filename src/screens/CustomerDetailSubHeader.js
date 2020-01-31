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
import * as PaymentTypesActions from "../actions/PaymentTypesActions";

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
				<View style={{ flexDirection: 'column', flex: 1 }}>
					<Text style={styles.selectedCustomerText}>
						{this.getName()}
					</Text>

					<Text style={styles.selectedCustomerText}>
						{this.getPhone()}
					</Text>
					<Text style={styles.selectedCustomerText}>
						{this.getCustomerType()}
					</Text>
				</View>
				<View style={{ flexDirection: 'column', flex: 1 }}>
					{/* <Text style={styles.selectedCustomerText}>
					{this.getCreditPurchases()} Credit Purchases
					</Text> */}
					<Text style={styles.selectedCustomerText}>
						Credit Balance: {this.props.topupTotal - this.getCreditPurchases()}
					</Text>
					<Text style={styles.selectedCustomerText}>
						Loan:  {this.props.selectedCustomer.dueAmount}
					</Text>
					</View>
				<View style={{ flexDirection: 'column', flex: 1 }}>
					<TouchableHighlight
						style={styles.selectedCustomerText}
						onPress={() => {
							this.refs.modal6.open();
						}}>
						<Text >Loan Payment</Text>
					</TouchableHighlight>
					<TouchableHighlight
						style={styles.selectedCustomerText}
						onPress={() => this.props.navigation.navigate('OrderView')}>
						<Text >Make Sale</Text>
					</TouchableHighlight>
				</View>
			</View>

			<View  style={styles.modalPayment}>
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
		console.log('Modal closed here')
		PaymentTypeRealm.resetSelected();
		this.props.paymentTypesActions.setPaymentTypes(
			PaymentTypeRealm.getPaymentTypes());
	}

	closePaymentModal = () => {
		this.refs.modal6.close();
	};

	getCreditPurchases() {
		console.log(this.props.creditSales);
		return this.props.creditSales.reduce((total, item) => { return (total + item.amount) }, 0)
	}

	getName() {
		console.log('balanceCredit', this.props.balanceCredit);
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
		topupTotal: state.topupReducer.total,
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
		fontWeight: 'bold',
		fontSize: 28,
		color: 'white',
		textAlign: 'center',
		width: 300
	},

	commandBarContainer: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: '#fff',
		height: 150,
		top: 20,
		left: '10%',
		right: '10%',
		position: 'absolute',
		elevation: 10,
		alignSelf: 'center',
		width: '80%',
		justifyContent: 'center',
        alignItems: 'center'
	},
	modalPayment: {
		backgroundColor: 'white',
	},
	modal3: {
		width: 1000,
		height: 500,
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

});
