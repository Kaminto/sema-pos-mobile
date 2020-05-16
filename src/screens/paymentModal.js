import React from "react";

import { View, Alert, Text, TextInput, FlatList, ScrollView, TouchableHighlight, StyleSheet } from "react-native";
import { CheckBox, Card } from 'react-native-elements';
import * as CustomerActions from '../actions/CustomerActions';
import * as PaymentTypesActions from "../actions/PaymentTypesActions";
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
const widthQuanityModal = '75%';
const heightQuanityModal = 100;

class PaymentModal extends React.PureComponent {

	constructor(props) {
		super(props);

		this.state = {
			selectedPaymentTypes: [],
			selectedType: {},
			checkedType: {},
			topup: "",
			paymentnote: "",
			buttonDisabled: false,
		};

		this.handleOnPress = this.handleOnPress.bind(this);
	}

	render() {
		return (
			<ScrollView>
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
					<Card style={{ flex: 1, backgroundColor: '#f1f1f1' }}>
						<PaymentDescription
							title={`${i18n.t('previous-amount-due')}:`}
							total={this.calculateAmountDue()}
						/>
						<PaymentDescription
							title={`${i18n.t('customer-wallet')}:`}
							total={this.props.selectedCustomer.walletBalance}
						/>
					</Card>
					<FlatList
						data={this.props.paymentTypes}
						renderItem={({ item, index, separators }) => (
							this.paymentTypesRow(item, index, separators)
						)}
						// extraData={this.props.selectedDebtPaymentTypes}
						numColumns={3}
						contentContainerStyle={styles.container}
					/>
					<View style={{ flex: 1, padding: 10 }}>

					<View style={{ flex: 1, flexDirection: 'row', marginTop: 10 }}>
						<View style={{ flex: 1 }}>
							<Text style={[{ textAlign: 'left' }, styles.baseItem]}>NOTES</Text>
						</View>
					</View>

					<View style={{ flex: 1, flexDirection: 'row', borderBottomWidth: 1 }}>
						<View style={{ flex: 1, height: 50 }}>
							{this.notesValue()}
						</View>
					</View>
					</View>

					<View style={styles.completeOrder}>
						<View style={{ justifyContent: 'center', height: 50 }}>
							<TouchableHighlight
								underlayColor="#c0c0c0"
								disabled={this.state.buttonDisabled}
								onPress={this.handleOnPress}>
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
			</ScrollView>

		);
	}


	notesValue() {
		return (
			<TextInput
				style={{
					padding: 10
				}}
				onChangeText={this.setNotes}
				value={this.state.paymentnote}
				underlineColorAndroid="transparent"
				placeholder="Add a Note"
			/>
		)
	}


	setNotes = paymentnote => {
		this.setState({ paymentnote });
	};

	paymentTypesRow = (item, index, separators) => {
		let isSelectedAvailable = false;
		if (this.props.selectedPaymentTypes.length > 0) {
			const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);
			if (itemIndex >= 0) {
				isSelectedAvailable = true;
			}
		}

		if (item.name != 'loan' && item.name != 'credit') {

			return (
				<View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
					<View style={{ flex: 1, height: 45 }}>
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
		if (this.props.selectedPaymentTypes.length >= 0) {
			const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);
			if (itemIndex >= 0) {
				if (this.props.selectedPaymentTypes[itemIndex].isSelected) {
					return (
						<TextInput
							underlineColorAndroid="transparent"
							onChangeText={(textValue) => {

								if (this.props.selectedPaymentTypes.length >= 0) {
									const itemIndex2 = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(this.state.selectedType.id);
									if (itemIndex2 >= 0) {
										this.props.selectedPaymentTypes[itemIndex].amount = Number(textValue);
										this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[itemIndex2], amount: Number(textValue) }, itemIndex2);
										this.setState({
											selectedType: { ...this.props.selectedPaymentTypes[itemIndex2], amount: Number(textValue) }
										});
									}
								}

								this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());

							}
							}
							onFocus={(text) => {
								this.setState({
									selectedType: item
								});
							}
							}
							keyboardType="numeric"
							value={(this.props.selectedPaymentTypes[itemIndex].amount).toString()}
							style={[styles.cashInput]}
						/>
					);
				}
			}
		}
	}

	checkBoxType = (item) => {
		const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);

		if (itemIndex >= 0) {

			let secondItemObj = this.props.selectedPaymentTypes.filter(obj => obj.id != item.id).map(function (e) { return e.id });

			if (secondItemObj.length > 0) {
				const seconditemIndex2 = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(secondItemObj[0]);
				this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[seconditemIndex2], amount: Number(this.calculateOrderDue()) }, seconditemIndex2);

				PaymentTypeRealm.isSelected(item, false);
				this.props.paymentTypesActions.removeSelectedPaymentType(item, itemIndex);
				this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
			}

			if (secondItemObj.length === 0) {
				this.props.paymentTypesActions.removeSelectedPaymentType(item, itemIndex);
				this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
			}
			return;
		}

		this.setState({
			checkedType: { ...item, isSelected: item.isSelected === true ? false : true }
		});

		if (this.props.selectedPaymentTypes.length === 0) {
			PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
			this.props.paymentTypesActions.setSelectedPaymentTypes({ ...item, created_at: new Date(), isSelected: item.isSelected === true ? false : true, amount: this.calculateOrderDue() });
		} else {
			PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
			this.props.paymentTypesActions.setSelectedPaymentTypes({ ...item, created_at: new Date(), isSelected: item.isSelected === true ? false : true, amount: 0 });
		}
		this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
	};


	clearDebt(amount, customerId, dueAmount, status) {
		CustomerDebtRealm.createCustomerDebt(amount, customerId, dueAmount, status, this.state.paymentnote);
		this.setState({ paymentnote: "" });
		this.props.paymentTypesActions.setCustomerPaidDebt(CustomerDebtRealm.getCustomerDebts());
	}

	topUpWallet(customerId, creditsurplus, walletBalance, status) {
		CreditRealm.createCredit(customerId, creditsurplus, walletBalance, status, this.state.paymentnote);
		this.setState({ topup: "", paymentnote: "" });
		this.props.topUpActions.setTopups(CreditRealm.getAllCredit());
	}

	updateCustomerDueAmount(customer, dueAmount) {
		CustomerRealm.updateCustomerDueAmount(customer, dueAmount);
		this.props.customerActions.CustomerSelected(customer);
		this.props.customerActions.setCustomers(CustomerRealm.getAllCustomer());
	}

	updateCustomerWalletBalance(customer, walletBalance) {
		CustomerRealm.updateCustomerWalletBalance(customer, walletBalance);
		this.props.customerActions.CustomerSelected(customer);
		this.props.customerActions.setCustomers(CustomerRealm.getAllCustomer());
	}

	handleOnPress() {

		this.setState({
			buttonDisabled: true
		});


		if (this.props.selectedPaymentTypes.length > 0) {
			let amountPaid = this.props.selectedPaymentTypes.reduce((total, item) => {
				return (total + item.amount);
			}, 0);

			if (amountPaid > 0) {

				if (amountPaid < Number(this.props.selectedCustomer.dueAmount)) {

					this.props.selectedCustomer.dueAmount = Number(this.props.selectedCustomer.dueAmount) - Number(amountPaid);
					this.updateCustomerDueAmount(this.props.selectedCustomer, this.props.selectedCustomer.dueAmount);
					this.clearDebt(amountPaid, this.props.selectedCustomer.customerId, this.props.selectedCustomer.dueAmount, null)

				} else if (amountPaid > Number(this.props.selectedCustomer.dueAmount)) {

					this.props.selectedCustomer.dueAmount = Number(this.props.selectedCustomer.dueAmount);
					let creditsurplus = Number(amountPaid) - Number(this.props.selectedCustomer.dueAmount);

					if (this.props.selectedCustomer.dueAmount > 0) {
						let amountCleared = this.props.selectedCustomer.dueAmount;
						this.props.selectedCustomer.dueAmount = 0;
						this.updateCustomerDueAmount(this.props.selectedCustomer, this.props.selectedCustomer.dueAmount);
						this.clearDebt(amountCleared, this.props.selectedCustomer.customerId, this.props.selectedCustomer.dueAmount, null)
					}


					if (creditsurplus > 0) {
						this.props.selectedCustomer.walletBalance = Number(this.props.selectedCustomer.walletBalance) + Number(creditsurplus);
						this.updateCustomerWalletBalance(this.props.selectedCustomer, this.props.selectedCustomer.walletBalance);
						this.topUpWallet(this.props.selectedCustomer.customerId, creditsurplus, this.props.selectedCustomer.walletBalance, null);
					}

				}
			}


			Alert.alert(
				'Payment Made.',
				'Customer\'s Loan Balance: ' + this.props.selectedCustomer.dueAmount +
				'\nCustomer Wallet Balance: ' + this.props.selectedCustomer.walletBalance,
				[{
					text: 'OK',
					onPress: () => {
						this.props.closePaymentModal();
					}
				}],
				{ cancelable: false }
			);

		}
		return true;
	};

	getCancelButton() {
		return (
			<TouchableHighlight onPress={() => this.props.closePaymentModal()}>
				<Icon
					size={40}
					name="md-close-circle-outline"
					color="black"
				/>
			</TouchableHighlight>
		);
	}

	//Isn't this cyclic
	calculateOrderDue() {
		// If this is a loan payoff then the loan payment is negative the loan amount due
		return this.calculateAmountDue();

	}

	calculateAmountDue() {
		return this.props.selectedCustomer.dueAmount;
	}


}

function mapStateToProps(state, props) {
	return {
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		selectedPaymentTypes: state.paymentTypesReducer.selectedPaymentTypes,
		selectedDebtPaymentTypes: state.paymentTypesReducer.selectedDebtPaymentTypes,
		payment: state.orderReducer.payment,
		selectedCustomer: state.customerReducer.selectedCustomer,
		topups: state.topupReducer.topups,
		topupTotal: state.topupReducer.total,
	};
}

function mapDispatchToProps(dispatch) {
	return {
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
	}

});
