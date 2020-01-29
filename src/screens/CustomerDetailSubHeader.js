import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Image,
	TouchableOpacity,
	TouchableHighlight,
	Alert,
	ToastAndroid,
	ScrollView,
	TouchableNativeFeedback
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Events from 'react-native-simple-events';

import * as ToolbarActions from '../actions/ToolBarActions';
import ModalDropdown from 'react-native-modal-dropdown';
import PosStorage from '../database/PosStorage';
import CreditRealm from '../database/credit/credit.operations';
import CustomerRealm from '../database/customers/customer.operations';
import SettingRealm from '../database/settings/settings.operations';

import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import * as PaymentTypesActions from "../actions/PaymentTypesActions";

import * as CustomerActions from '../actions/CustomerActions';
import * as TopUpActions from '../actions/TopUpActions';
import { Card, ListItem, Button, Input, ThemeProvider } from 'react-native-elements';
import * as reportActions from '../actions/ReportActions';
import * as receiptActions from '../actions/ReceiptActions';


import PaymentModal from './paymentModal';

import i18n from '../app/i18n';
import moment from 'moment-timezone';
import { FloatingAction } from "react-native-floating-action";
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modalbox';
import { isEmptyObj } from '../services/Utilities';
const actions = [
	{
		text: "Top Up",
		name: "topup",
		icon: <Icon
			name='md-wallet'
			size={24}
			color='black'
		/>,
		position: 1
	},
];
 
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
	container: {
		flex: 1,
		backgroundColor: '#fff'
	},
	headerText: {
		fontSize: 24,
		color: 'black',
		marginLeft: 100
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
	submit: {
		backgroundColor: '#2858a7',
		borderRadius: 20,
		marginTop: '1%'
	},
	inputContainer: {
		borderWidth: 2,
		borderRadius: 10,
		borderColor: '#2858a7',
		backgroundColor: 'white'
	},
	leftToolbar: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center'
	},
	rightToolbar: {
		flexDirection: 'row-reverse',
		flex: 0.34,
		alignItems: 'center'
	},
	buttonText: {
		fontWeight: 'bold',
		fontSize: 28,
		color: 'white',
		textAlign: 'center',
		width: 300
	},
	completeOrder: {
		backgroundColor: '#2858a7',
		borderRadius: 30,
	},
	commandBarContainer: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: '#fff',
		height: 80,
		alignSelf: 'center',
		marginLeft: 20,
		marginRight: 20
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
	inputText: {
		fontSize: 24,
		alignSelf: 'center',
		backgroundColor: 'white',
		width: 400,
		margin: 5
	},
	phoneInputText: {
		fontSize: 24,
		alignSelf: 'center',
		backgroundColor: 'white',
		width: 195,
		margin: 5,
		paddingRight: 5
	},
	dropdownText: {
		fontSize: 24
	},
	receiptPendingText: {
		color: 'orange'
	},

	receiptSyncedText: {
		color: 'green'
	},

	receiptStats: {
		flex: 1,
		flexDirection: 'row'
	},

	container: {
		flex: 1,
		backgroundColor: '#fff'
	},

	receiptStatusText: {
		color: 'red',
		fontWeight: 'bold'
	},

	deleteButtonContainer: {
		width: 40,
		height: 40,
		alignSelf: 'flex-end',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		zIndex: 1,
		top: 15,
		right: 15
	},

	receiptDeleteButton: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center'
	},

	receiptDeleteButtonText: {
		fontSize: 25,
		color: '#fff',
		fontWeight: 'bold'
	},

	productImage: {
		width: 80,
		height: 80,
		marginRight: 5,
		marginLeft: 20,
		borderWidth: 5,
		borderColor: '#eee'
	},

	label: {
		color: '#111'
	},

	itemData: {
		flexDirection: 'row'
	},
	updating: {
		height: 100,
		width: 500,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ABC1DE',
		borderColor: '#2858a7',
		borderWidth: 5,
		borderRadius: 10
	}
});
