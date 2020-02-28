import React from "react";
if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React);
  }
import { View, Alert, TouchableOpacity, Text, TextInput, FlatList, ScrollView, TouchableHighlight, StyleSheet } from "react-native";
import { CheckBox, Card } from 'react-native-elements';
import * as CustomerActions from '../actions/CustomerActions';
import * as PaymentTypesActions from "../actions/PaymentTypesActions";
import * as receiptActions from '../actions/ReceiptActions';
import * as TopUpActions from '../actions/TopUpActions';

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import i18n from "../app/i18n";
import Icon from 'react-native-vector-icons/Ionicons';
import CustomerDebtRealm from '../database/customer_debt/customer_debt.operations';

import PaymentDescription from '../components/orders/order-checkout/payment-description';

import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import CreditRealm from '../database/credit/credit.operations';
import CustomerRealm from '../database/customers/customer.operations';

import * as Utilities from "../services/Utilities";
const widthQuanityModal = '75%';
const heightQuanityModal = 150;

import slowlog from 'react-native-slowlog';

class PaymentModal extends React.PureComponent {

	constructor(props) {
		super(props);

		slowlog(this, /.*/);
		this.state = {
			selectedPaymentTypes: [],
			selectedType: {},
			checkedType: {},
			topup: "",
			buttonDisabled: false,
		};
	}

	handleOnPress = () => {
		this.clearLoan();
	};


	render() {
		return (
			<ScrollView>
				<TouchableOpacity>
				<View
						style={{
							flex: 1,
							marginTop: 0,
							padding: 10
						}}>
						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[{ textAlign: 'left' }, styles.baseItem]}>Payment Method</Text>

							</View>
							<View
								style={{
									justifyContent: 'flex-end',
									flexDirection: 'row',
									right: 0,
									top: 10
								}}>
								{this.getCancelButton()}
							</View>
						</View>
						<FlatList
							data={this.props.paymentTypes}
							renderItem={({ item, index, separators }) => (
								this.paymentTypesRow(item, index, separators)
							)}
							extraData={this.props.selectedDebtPaymentTypes}
							numColumns={3}
							contentContainerStyle={styles.container}
						/>
					<Card style={{ flex: 1 }}>
						<PaymentDescription
							title={`${i18n.t('previous-amount-due')}:`}
							total={Utilities.formatCurrency(
								this.calculateAmountDue()
							)}
						/>
						<PaymentDescription
											title={`${i18n.t('customer-wallet')}:`}
											total={Utilities.formatCurrency(
												this.props.selectedCustomer.walletBalance
											)}
										/>
					</Card>

						<View style={styles.completeOrder}>
							<View style={{ justifyContent: 'center', height: 50 }}>
								<TouchableHighlight
									underlayColor="#c0c0c0"
									disabled={this.state.buttonDisabled}
									onPress={() => this.handleOnPress()}>
									<Text
										style={[
											{ paddingTop: 20, paddingBottom: 20 },
											styles.buttonText
										]}>
									{this.props.selectedCustomer.dueAmount > 0 ? i18n.t('clear-loan') : 'Topup Customer Wallet'}
									</Text>
								</TouchableHighlight>
							</View>
						</View>
					</View>
					</TouchableOpacity>
				</ScrollView>

		);
	}

	paymentTypesRow = (item, index, separators) => {

		let isSelectedAvailable = false;
		if (this.props.selectedDebtPaymentTypes.length > 0) {
			const itemIndex = this.props.selectedDebtPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);
			if (itemIndex >= 0) {
				isSelectedAvailable = true;
			}
		}

		if (this.props.selectedDebtPaymentTypes.length === 0) {
			if (item.name === 'cash') {
				PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
				this.props.paymentTypesActions.setSelectedDebtPaymentTypes({ ...item, created_at: new Date(), isSelected: item.isSelected === true ? false : true, amount: this.calculateOrderDue() });
				isSelectedAvailable = true;
			}
		}

		if (item.name != "loan" && item.name != "credit") {
			return (
				<View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
					<View style={{ flex: 1, height: 50 }}>
						<View style={styles.checkBoxRow}>
							<View style={[{ flex: 1 }]}>
								<CheckBox
									title={item.description}
									checkedIcon={<Icon
										name="md-checkbox"
										size={20}
										color="black"
									/>}
									uncheckedIcon={<Icon
										name="md-square-outline"
										size={20}
										color="black"
									/>}
									checked={item.isSelected || isSelectedAvailable}
									onPress={() => {
										this.checkBoxType(item);
									}}
								/>
							</View>
							<View style={[{ flex: 1 }]}>{this.showTextInput(item)}</View>
						</View>
					</View>
				</View>
			);

		}
	};

	showTextInput(item) {
		if (this.props.selectedDebtPaymentTypes.length >= 0) {
			const itemIndex = this.props.selectedDebtPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);
			if (itemIndex >= 0) {
				if (this.props.selectedDebtPaymentTypes[itemIndex].isSelected) {
					return (
						<TextInput
							underlineColorAndroid="transparent"
							onChangeText={(textValue) => {
								this.valuePaymentChange(textValue,itemIndex);
							}
							}
							onFocus={(text) => {
								this.setState({
									selectedType: item
								});
							}
							}
							keyboardType="numeric"
							value={(this.props.selectedDebtPaymentTypes[itemIndex].amount).toString()}
							style={[styles.cashInput]}
						/>
					);
				}
			}
		}
	}

	checkBoxType = (item) => {
			const itemIndex = this.props.selectedDebtPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);

		if (itemIndex >= 0) {

			let secondItemObj = this.props.selectedDebtPaymentTypes.filter(obj => obj.id != item.id).map(function (e) { return e.id });

			if (secondItemObj.length > 0) {
				const seconditemIndex2 = this.props.selectedDebtPaymentTypes.map(function (e) { return e.id }).indexOf(secondItemObj[0]);
				this.props.paymentTypesActions.updateSelectedDebtPaymentType({ ...this.props.selectedDebtPaymentTypes[seconditemIndex2], amount: Number(this.calculateOrderDue()) }, seconditemIndex2);

				PaymentTypeRealm.isSelected(item, false);
				this.props.paymentTypesActions.removeSelectedDebtPaymentType(item, itemIndex);
				this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
			}

			if (secondItemObj.length === 0) {
				this.props.paymentTypesActions.removeSelectedDebtPaymentType(item, itemIndex);
				this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
			}
			return;
		}


		this.setState({
			checkedType: { ...item, isSelected: item.isSelected === true ? false : true }
		});


		if (this.props.selectedDebtPaymentTypes.length === 0) {
			PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
			this.props.paymentTypesActions.setSelectedDebtPaymentTypes({ ...item, created_at: new Date(), isSelected: item.isSelected === true ? false : true, amount: this.calculateOrderDue() });
		} else {
			PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
			this.props.paymentTypesActions.setSelectedDebtPaymentTypes({ ...item, created_at: new Date(), isSelected: item.isSelected === true ? false : true, amount: 0 });
		}


		this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
	};

	valuePaymentChange = (textValue, itemIndex) => {

		if (this.props.selectedDebtPaymentTypes.length >= 0) {
			const itemIndex2 = this.props.selectedDebtPaymentTypes.map(function (e) { return e.id }).indexOf(this.state.selectedType.id);
			let secondItemObj = this.props.selectedDebtPaymentTypes.filter(obj => obj.id != this.state.selectedType.id).map(function (e) { return e.id });

			if (itemIndex2 >= 0) {
				this.props.selectedDebtPaymentTypes[itemIndex].amount = Number(textValue);
				this.props.paymentTypesActions.updateSelectedDebtPaymentType({ ...this.props.selectedDebtPaymentTypes[itemIndex2],
					amount: Number(textValue) }, itemIndex2);
				this.setState({
					selectedType: { ...this.props.selectedDebtPaymentTypes[itemIndex2], amount: Number(textValue) }
				});
			}

			if (secondItemObj.length > 0) {
				const seconditemIndex2 = this.props.selectedDebtPaymentTypes.map(function (e) { return e.id }).indexOf(secondItemObj[0]);
				if(Number(this.calculateOrderDue()) <= Number(textValue)){
				this.props.selectedDebtPaymentTypes[seconditemIndex2].amount = Number(textValue);
				this.props.paymentTypesActions.updateSelectedDebtPaymentType({ ...this.props.selectedDebtPaymentTypes[seconditemIndex2], amount: Number(textValue) }, seconditemIndex2);
				}
			}
		}

		this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());

	};

	clearLoan = () => {
		this.setState({
			buttonDisabled: true
		});
		const creditIndex = this.props.selectedDebtPaymentTypes.map(function (e) { return e.name }).indexOf("credit");
		if (creditIndex >= 0) {
			if (Number(this.props.selectedDebtPaymentTypes[creditIndex].amount) > Number(this.props.selectedCustomer.dueAmount)) {
				Alert.alert(
					i18n.t('credit-due-amount-title'),
					i18n.t('credit-due-amount-text') +
					this.props.selectedCustomer.dueAmount,
					[
						{
							text: 'OK',
							onPress: () => console.log('OK Pressed')
						}
					],
					{ cancelable: false }
				);
				return;
			}
		}
		if (this.props.selectedDebtPaymentTypes.length > 0) {
			CustomerDebtRealm.createManyCustomerDebt(this.props.selectedDebtPaymentTypes, this.props.selectedCustomer.customerId);
			this.props.paymentTypesActions.setCustomerPaidDebt(
				CustomerDebtRealm.getCustomerDebts()
			);
		}

		if (this.props.selectedDebtPaymentTypes.length >= 0) {
			let amountPaid = this.props.selectedDebtPaymentTypes.reduce((total, item) => {
				return (total + item.amount);
			}, 0);


			if (amountPaid >= 0 && amountPaid <= Number(this.props.selectedCustomer.dueAmount)) {

				this.props.selectedCustomer.dueAmount = Number(this.props.selectedCustomer.dueAmount) - Number(amountPaid);
				CustomerRealm.updateCustomerDueAmount(
					this.props.selectedCustomer,
					this.props.selectedCustomer.dueAmount
				);
				this.props.customerActions.CustomerSelected(this.props.selectedCustomer);
				this.props.customerActions.setCustomers(
					CustomerRealm.getAllCustomer()
				);
			} else if (amountPaid >= 0 && amountPaid > Number(this.props.selectedCustomer.dueAmount)) {
				   this.props.selectedCustomer.dueAmount = Number(this.props.selectedCustomer.dueAmount);

				   let creditsurplus = Number(amountPaid) - Number(this.props.selectedCustomer.dueAmount);
				    if(this.props.selectedCustomer.dueAmount > 0) {

						this.props.selectedCustomer.dueAmount = 0;

						CustomerRealm.updateCustomerDueAmount(
							this.props.selectedCustomer,
							this.props.selectedCustomer.dueAmount
						);

						this.props.customerActions.CustomerSelected(this.props.selectedCustomer);
						this.props.customerActions.setCustomers(
							CustomerRealm.getAllCustomer()
						);
					}

					CreditRealm.createCredit(
						this.props.selectedCustomer.customerId,
						creditsurplus,
						creditsurplus
					);
					this.setState({ topup: "" });
					this.props.topUpActions.setTopups(CreditRealm.getAllCredit());

					this.props.selectedCustomer.walletBalance = Number(this.props.selectedCustomer.walletBalance) + Number(creditsurplus);
					CustomerRealm.updateCustomerWalletBalance(
						this.props.selectedCustomer,
						this.props.selectedCustomer.walletBalance
					);
					this.props.customerActions.CustomerSelected(this.props.selectedCustomer);
					this.props.customerActions.setCustomers(
						CustomerRealm.getAllCustomer()
					);

			}



			Alert.alert(
				'SEMA',
				'Payment Made',
				[{
					text: 'OK',
					onPress: () => {
						this.closePaymentModal();
					}
				}],
				{ cancelable: false }
			);

		}

		return true;
	};

	getCancelButton() {
		return (
			<TouchableHighlight onPress={() => this.closePaymentModal()}>
				<Icon
					size={40}
					name="md-close-circle-outline"
					color="black"
				/>
			</TouchableHighlight>
		);
	}

	calculateOrderDue() {
			// If this is a loan payoff then the loan payment is negative the loan amount due
			return this.calculateAmountDue();

	}

	calculateAmountDue() {
		return this.props.selectedCustomer.dueAmount;
	}

	closePaymentModal = () => {
		this.props.closePaymentModal();
	};

}

function mapStateToProps(state, props) {
	return {
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		selectedPaymentTypes: state.paymentTypesReducer.selectedPaymentTypes,
		selectedDebtPaymentTypes: state.paymentTypesReducer.selectedDebtPaymentTypes,
		receiptsPaymentTypes: state.paymentTypesReducer.receiptsPaymentTypes,
		receipts: state.receiptReducer.receipts,
		payment: state.orderReducer.payment,
		selectedCustomer: state.customerReducer.selectedCustomer,
		topups: state.topupReducer.topups,
		topupTotal: state.topupReducer.total,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		receiptActions: bindActionCreators(receiptActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		paymentTypesActions: bindActionCreators(PaymentTypesActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch),
	};
}
export default connect(mapStateToProps, mapDispatchToProps)(PaymentModal);


const styles = StyleSheet.create({
	checkBoxRow: {
		flex: 1,
		flexDirection: 'row',
		marginTop: '1%',
		alignItems: 'center'
	},
	checkBox: {},
	checkLabel: {
		left: 20,
		fontSize: 20
	},
	totalText: {
		marginTop: 10,
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	},
	buttonText: {
		fontWeight: 'bold',
		fontSize: 24,
		alignSelf: 'center',
		color: 'white'
	},
	summaryText: {
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	},
	baseItem: {
		fontWeight: 'bold',
		fontSize: 16,
		color: 'black',
		paddingTop: 4,
		paddingBottom: 4,

	},

	completeOrder: {
		backgroundColor: '#2858a7',
		borderRadius: 5,
		marginTop: '5%',
		bottom: 0
	},

	modal3: {
		width: widthQuanityModal,
		height: heightQuanityModal,
	},

});
