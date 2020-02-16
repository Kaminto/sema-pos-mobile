import React, { Component } from "react"
import { View, Alert, Text, TextInput, FlatList, ScrollView, TouchableHighlight, StyleSheet } from "react-native";
import { CheckBox, Card } from 'react-native-elements';
import * as OrderActions from "../actions/OrderActions";
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
import SettingRealm from '../database/settings/settings.operations';
import CustomerRealm from '../database/customers/customer.operations';

import * as Utilities from "../services/Utilities";
const widthQuanityModal = '80%';
const heightQuanityModal = 400;

import moment from 'moment-timezone';

class PaymentModal extends Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedPaymentTypes: [],
			selectedType: {},
			checkedType: {},
		};
	}


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
							numColumns={3}
							contentContainerStyle={styles.container}
						/>
					<Card>
						<PaymentDescription
							title={`${i18n.t('previous-amount-due')}:`}
							total={Utilities.formatCurrency(
								this.calculateAmountDue()
							)}
						/>
						<PaymentDescription
											title={`${i18n.t('customer-wallet')}:`}
											total={Utilities.formatCurrency(
												this.currentCredit()
											)}
										/>
					</Card>

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


	getCreditPurchases() {
		return this.customerCreditPaymentTypeReceipts().reduce((total, item) => { return (total + item.amount) }, 0)
	}

	currentCredit() {
		return this.totalTopUp() - this.getCreditPurchases();
	}

	totalTopUp() {
        return this.prepareTopUpData().reduce((total, item) => { return (total + item.topup) }, 0)
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
            return topups.filter(r => r.customer_account_id === this.props.selectedCustomer.customerId);
        } else {
            return [];
        }

    }

	customerCreditPaymentTypeReceipts() {
		let receiptsPaymentTypes = [...this.compareCreditPaymentTypes()];
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

	compareCreditPaymentTypes() {
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

		if (this.props.selectedDebtPaymentTypes.length === 2) {
			Alert.alert(
				'Notice ',
				`You cannot select more than two payment methods.`,
				[{
					text: 'OK', onPress: () => {
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
	};

	valuePaymentChange = (textValue, itemIndex) => {
		if (Number(textValue) > Number(this.calculateOrderDue())) {
			// Alert.alert(
			// 	'Notice. ',
			// 	`Amount can not be greater that ${this.calculateOrderDue()}`,
			// 	[{ text: 'OK', onPress: () => console.log('OK Pressed') }],
			// 	{ cancelable: false }
			// );
			// return;
		}

		if (this.props.selectedDebtPaymentTypes.length >= 0) {
			const itemIndex2 = this.props.selectedDebtPaymentTypes.map(function (e) { return e.id }).indexOf(this.state.selectedType.id);
			let secondItemObj = this.props.selectedDebtPaymentTypes.filter(obj => obj.id != this.state.selectedType.id).map(function (e) { return e.id });

			if (itemIndex2 >= 0) {
				this.props.selectedDebtPaymentTypes[itemIndex].amount = Number(textValue);
				this.props.paymentTypesActions.updateSelectedDebtPaymentType({ ...this.props.selectedDebtPaymentTypes[itemIndex2], amount: Number(textValue) }, itemIndex2);
				this.setState({
					selectedType: { ...this.props.selectedDebtPaymentTypes[itemIndex2], amount: Number(textValue) }
				});
			}

			if (secondItemObj.length > 0) {
				const seconditemIndex2 = this.props.selectedDebtPaymentTypes.map(function (e) { return e.id }).indexOf(secondItemObj[0]);
				this.props.selectedDebtPaymentTypes[seconditemIndex2].amount = Number(this.calculateOrderDue()) - Number(textValue);
				this.props.paymentTypesActions.updateSelectedDebtPaymentType({ ...this.props.selectedDebtPaymentTypes[seconditemIndex2], amount: Number(this.calculateOrderDue()) - Number(textValue) }, seconditemIndex2);
			}
		}

		this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());

	};

	clearLoan = () => {
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
		receiptsPaymentTypes: state.paymentTypesReducer.receiptsPaymentTypes,
		receipts: state.receiptReducer.receipts,
		payment: state.orderReducer.payment,
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
