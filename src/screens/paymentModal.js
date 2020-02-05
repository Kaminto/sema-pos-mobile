import React, { Component } from "react"
import { View, Alert, Text, TextInput, Button, FlatList, ScrollView, TouchableHighlight, StyleSheet, Dimensions, Image, TouchableNativeFeedback } from "react-native";
import { CheckBox } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from 'react-native-modal-datetime-picker';
import * as OrderActions from "../actions/OrderActions";
import * as CustomerBarActions from '../actions/CustomerBarActions';
import * as CustomerActions from '../actions/CustomerActions';
import * as PaymentTypesActions from "../actions/PaymentTypesActions";
import * as receiptActions from '../actions/ReceiptActions';
import * as TopUpActions from '../actions/TopUpActions';

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import i18n from "../app/i18n";
import Icon from 'react-native-vector-icons/Ionicons';
import CustomerDebtRealm from '../database/customer_debt/customer_debt.operations';

import PaymentMethod from '../components/orders/order-checkout/payment-method';
import PaymentDescription from '../components/orders/order-checkout/payment-description';

import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import SettingRealm from '../database/settings/settings.operations';
import CustomerRealm from '../database/customers/customer.operations';
import OrderRealm from '../database/orders/orders.operations';

import ReceiptPaymentTypeRealm from '../database/reciept_payment_types/reciept_payment_types.operations';
import * as Utilities from "../services/Utilities";
const widthQuanityModal = '100%';
const heightQuanityModal = 400;
const inputTextWidth = 400;

class PaymentModal extends Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedPaymentTypes: [],
			selectedType: {},
			checkedType: {},
			isDateTimePickerVisible: false,
			receiptDate: new Date(),
		};
	}

	showDateTimePicker = () => {
		this.setState({ isDateTimePickerVisible: true });
	};

	hideDateTimePicker = () => {
		this.setState({ isDateTimePickerVisible: false });
	};

	handleDatePicked = date => {
		var randomNumber = Math.floor(Math.random() * 59) + 1;
		var randomnumstr;
		if (Number(randomNumber) <= 9) {
			randomnumstr = "0" + randomNumber;
		} else {
			randomnumstr = randomNumber;
		}
		var datestr = date.toString();
		var aftergmt = datestr.slice(-14);
		var datestring = datestr.substring(0, 22) + randomnumstr + " " + aftergmt;
		this.setState({ receiptDate: new Date(datestring) });
		this.hideDateTimePicker();
	};

	getLimitDate = () => {
		let date = new Date();
		let days = date.getDay() === 1 ? 2 : 1;
		date.setDate(date.getDate() - days);
		return date;
	};

	render() {
		const state = this.state;
		return (
			// <View style={styles.modal3}>
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
						<FlatList
							data={this.props.paymentTypes}
							renderItem={({ item, index, separators }) => (
								this.paymentTypesRow(item, index, separators)
							)}
							extraData={this.props.selectedDebtPaymentTypes}
							// numColumns={2}
							contentContainerStyle={styles.container}
						/>

						<PaymentDescription
							title={`${i18n.t('previous-amount-due')}:`}
							total={Utilities.formatCurrency(
								this.calculateAmountDue()
							)}
						/>
						{/* {this.getBackDateComponent()} */}
						<View style={styles.completeOrder}>
							<View style={{ justifyContent: 'center', height: 50 }}>
								<TouchableHighlight
									underlayColor="#c0c0c0"
									onPress={() => this.clearLoan()}>
									<Text
										style={[
											{ paddingTop: 20, paddingBottom: 20 },
											styles.buttonText
										]}>
										{i18n.t('clear-loan')}
									</Text>
								</TouchableHighlight>
							</View>
						</View>
					</View>
				</ScrollView>


			// </View>

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
			console.log('--item--', item);
			if (item.name === 'cash') {
				PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
				this.props.paymentTypesActions.setSelectedDebtPaymentTypes({ ...item, created_at: new Date(), isSelected: item.isSelected === true ? false : true, amount: this.calculateOrderDue() });
				isSelectedAvailable = true;
			}
		}

		console.log('isSelectedAvailable', isSelectedAvailable);
		console.log('description', item.description);
		console.log('isSelected', item.isSelected);
		console.log('item.isSelected || isSelectedAvailable', item.isSelected || isSelectedAvailable);
		if (item.name != "loan") {
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
										console.log('press');
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
								console.log('textValue', textValue);
								console.log('selectedType', this.state.selectedType);
								this.valuePaymentChange(textValue,itemIndex);
							}
							}
							onFocus={(text) => {
								console.log(item)
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
		console.log('selectedDebtPaymentTypes', this.props.selectedDebtPaymentTypes);

		const itemIndex = this.props.selectedDebtPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);
		console.log(itemIndex);
		if (itemIndex >= 0) {

			let secondItemObj = this.props.selectedDebtPaymentTypes.filter(obj => obj.id != item.id).map(function (e) { return e.id });
			console.log('secondItemObj', secondItemObj);

			if (secondItemObj.length > 0) {
				const seconditemIndex2 = this.props.selectedDebtPaymentTypes.map(function (e) { return e.id }).indexOf(secondItemObj[0]);
				console.log('seconditemIndex2', seconditemIndex2);
				this.props.paymentTypesActions.updateSelectedDebtPaymentType({ ...this.props.selectedDebtPaymentTypes[seconditemIndex2], amount: Number(this.calculateOrderDue()) }, seconditemIndex2);

				PaymentTypeRealm.isSelected(item, false);
				this.props.paymentTypesActions.removeSelectedDebtPaymentType(item, itemIndex);
				this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
				console.log(this.props.selectedDebtPaymentTypes);
			}

			if (secondItemObj.length === 0) {
				this.props.paymentTypesActions.removeSelectedDebtPaymentType(item, itemIndex);
				this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
			}
			return;
		}

		if (this.props.selectedDebtPaymentTypes.length === 2) {
			Alert.alert(
				'Notice ',
				`You cannot select more than two payment methods.`,
				[{
					text: 'OK', onPress: () => {
						console.log('OK Pressed');
						this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
					}
				}],
				{ cancelable: false }
			);
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
		console.log(this.props.selectedDebtPaymentTypes);
		console.log('getPaymentTypes', PaymentTypeRealm.getPaymentTypes());
		//this.showTextInput(item);
	};

	valuePaymentChange = (textValue, itemIndex) => {
		console.log('textValue', textValue);
		console.log('selectedType', this.state.selectedType);
		if (Number(textValue) > Number(this.calculateOrderDue())) {
			Alert.alert(
				'Notice. ',
				`Amount can not be greater that ${this.calculateOrderDue()}`,
				[{ text: 'OK', onPress: () => console.log('OK Pressed') }],
				{ cancelable: false }
			);
			return;
		}

		if (this.props.selectedDebtPaymentTypes.length >= 0) {
			const itemIndex2 = this.props.selectedDebtPaymentTypes.map(function (e) { return e.id }).indexOf(this.state.selectedType.id);
			let secondItemObj = this.props.selectedDebtPaymentTypes.filter(obj => obj.id != this.state.selectedType.id).map(function (e) { return e.id });
			console.log('secondItemObj', secondItemObj);

			if (itemIndex2 >= 0) {
				this.props.selectedDebtPaymentTypes[itemIndex].amount = Number(textValue);
				this.props.paymentTypesActions.updateSelectedDebtPaymentType({ ...this.props.selectedDebtPaymentTypes[itemIndex2], amount: Number(textValue) }, itemIndex2);
				this.setState({
					selectedType: { ...this.props.selectedDebtPaymentTypes[itemIndex2], amount: Number(textValue) }
				});
			}

			if (secondItemObj.length > 0) {
				const seconditemIndex2 = this.props.selectedDebtPaymentTypes.map(function (e) { return e.id }).indexOf(secondItemObj[0]);
				console.log('seconditemIndex2', seconditemIndex2);
				this.props.selectedDebtPaymentTypes[seconditemIndex2].amount = Number(this.calculateOrderDue()) - Number(textValue);
				this.props.paymentTypesActions.updateSelectedDebtPaymentType({ ...this.props.selectedDebtPaymentTypes[seconditemIndex2], amount: Number(this.calculateOrderDue()) - Number(textValue) }, seconditemIndex2);
			}
		}
		console.log('selectedDebtPaymentTypes', this.props.selectedDebtPaymentTypes);

		this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());

	};

	clearLoan = () => {
		const creditIndex = this.props.selectedDebtPaymentTypes.map(function (e) { return e.name }).indexOf("credit");
		console.log('creditIndex', creditIndex);
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

		console.log(this.props.selectedDebtPaymentTypes.length);
		if (this.props.selectedDebtPaymentTypes.length > 0) {
			CustomerDebtRealm.createManyCustomerDebt(this.props.selectedDebtPaymentTypes, this.props.selectedCustomer.customerId);
			this.props.paymentTypesActions.setCustomerPaidDebt(
				CustomerDebtRealm.getCustomerDebts()
			);
		}

		if (this.props.selectedDebtPaymentTypes.length >= 0) {
			console.log('selectedDebtPaymentTypes', this.props.selectedDebtPaymentTypes)
			let amountPaid = this.props.selectedDebtPaymentTypes.reduce((total, item) => {
				console.log('amount Paid', item.amount);
				return (total + item.amount);
			}, 0)
			console.log('amount Paid', amountPaid);
			if (amountPaid >= 0) {
				this.props.selectedCustomer.dueAmount = Number(this.props.selectedCustomer.dueAmount) - Number(amountPaid);
				CustomerRealm.updateCustomerDueAmount(
					this.props.selectedCustomer,
					this.props.selectedCustomer.dueAmount
				);
				this.props.customerActions.CustomerSelected(this.props.selectedCustomer);
				this.props.customerActions.setCustomers(
					CustomerRealm.getAllCustomer()
				);
			}

			Alert.alert(
				'Notice',
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
					size={50}
					name="md-close"
					color="black"
				/>
			</TouchableHighlight>
		);
	}

	getBackDateComponent() {
		if (!this.isPayoffOnly()) {
			return (
				<View
					style={{
						marginTop: 10,
						marginBottom: 10,
						marginLeft: 100,
						marginRight: 100
					}}>
					<Button
						title="Change Receipt Date"
						onPress={this.showDateTimePicker}
					/>
					<DateTimePicker
						maximumDate={new Date()}
						isVisible={this.state.isDateTimePickerVisible}
						onConfirm={this.handleDatePicked}
						onCancel={this.hideDateTimePicker}
					/>
				</View>
			);
		} else {
			return null;
		}
	}

	calculateOrderDue() {
		if (this.isPayoffOnly()) {
			// If this is a loan payoff then the loan payment is negative the loan amount due
			return this.calculateAmountDue();
		} else {
			return this.props.products.reduce((total, item) => {
				return total + item.finalAmount;

			}, 0);
		}
	}

	calculateAmountDue() {
		return this.props.selectedCustomer.dueAmount;
	}

	isPayoffOnly() {
		return this.props.products.length === 0;
	}

	closePaymentModal = () => {
		this.props.closePaymentModal();
	};

}

function mapStateToProps(state, props) {
	return {
		products: state.orderReducer.products,
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		delivery: state.paymentTypesReducer.delivery,
		selectedPaymentTypes: state.paymentTypesReducer.selectedPaymentTypes,
		selectedDebtPaymentTypes: state.paymentTypesReducer.selectedDebtPaymentTypes,
		selectedDiscounts: state.orderReducer.discounts,
		flow: state.orderReducer.flow,
		channel: state.orderReducer.channel,
		payment: state.orderReducer.payment,
		selectedCustomer: state.customerReducer.selectedCustomer,
		topups: state.topupReducer.topups,
		topupTotal: state.topupReducer.total,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch),
		customerBarActions: bindActionCreators(CustomerBarActions, dispatch),
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
		fontSize: 30,
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
		marginTop: '1%',
		bottom: 0
	},

	modal3: {

		width: widthQuanityModal,
		height: heightQuanityModal,
	},

});
