import React, { Component } from "react"
import { View, Alert, Text, TextInput, Button, FlatList, ScrollView, TouchableHighlight, StyleSheet, Dimensions, Image, TouchableNativeFeedback } from "react-native";
import { CheckBox, Card } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from 'react-native-modal-datetime-picker';
import * as OrderActions from "../../actions/OrderActions";
import Modal from 'react-native-modalbox';
import * as CustomerBarActions from '../../actions/CustomerBarActions';
import * as CustomerActions from '../../actions/CustomerActions';
import * as PaymentTypesActions from "../../actions/PaymentTypesActions";
import * as receiptActions from '../../actions/ReceiptActions';
import * as TopUpActions from '../../actions/TopUpActions';

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import i18n from "../../app/i18n";
import Icon from 'react-native-vector-icons/Ionicons';
import CustomerTypeRealm from '../../database/customer-types/customer-types.operations';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';

import PaymentMethod from './order-checkout/payment-method';
import PaymentDescription from './order-checkout/payment-description';

import PaymentTypeRealm from '../../database/payment_types/payment_types.operations';
import SettingRealm from '../../database/settings/settings.operations';
import CustomerRealm from '../../database/customers/customer.operations';
import OrderRealm from '../../database/orders/orders.operations';

import ReceiptPaymentTypeRealm from '../../database/reciept_payment_types/reciept_payment_types.operations';
import * as Utilities from "../../services/Utilities";
import ToggleSwitch from 'toggle-switch-react-native';

import moment from 'moment-timezone';

const uuidv1 = require('uuid/v1');

const widthQuanityModal = '70%';
const heightQuanityModal = 540;
const inputTextWidth = 400;

class OrderCheckout extends Component {

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
			selectedPaymentTypes: [],
			selectedType: {},
			checkedType: {},
			textInputs: [],
			isCompleteOrderVisible: false,
			isDateTimePickerVisible: false,
			receiptDate: new Date(),
			canProceed: true,

			isCash: true,
			isLoan: false,
			isMobile: false,
			isCredit: false,
			isJibuCredit: false,
			isCheque: false,
			isBank: false,

			selectedPaymentType: "Cash",
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
		console.log('props', this.props);
		const state = this.state;
		return (
			<View style={styles.container}>
				<View style={[{ flexDirection: 'row' }, this.getOpacity()]}>
					<View style={{ flex: 1, justifyContent: 'center' }}>
						<TouchableHighlight underlayColor='#c0c0c0'
							onPress={() => this.onPay()}>
							<Text
								style={[{ paddingTop: 10, paddingBottom: 10, textAlign: 'center' },
								styles.buttonText]}>{i18n.t('pay')}</Text>
						</TouchableHighlight>
					</View>
				</View>
				<Modal style={[styles.modal, styles.modal2]}
					coverScreen={true}
					position={"center"} ref={"modal7"}
					isDisabled={this.state.isDisabled}>
						<View style={{ flex: 1, padding: 0, margin: 0 }}>
							<View
								style={{
									justifyContent: 'flex-end',
									flexDirection: 'row',
									right: 10,
									top: 0
								}}>
								{this.getBottlesCancelButton()}
							</View>

							<View
								style={{
									flex: 1,
									marginTop: 0,
									marginLeft: 20,
									marginRight: 20
								}}>


								<View style={{ flex: 1, flexDirection: 'row' }}>
									<Text style={[{ textAlign: 'left' }, styles.baseItem]}>Empties returned.</Text>
								</View>
							</View>

						</View>

				</Modal>

				<Modal
					style={[styles.modal, styles.modal3]}
					coverScreen={true}
					position={"center"} ref={"modal6"}
					onClosed={() => this.modalOnClose()}
					isDisabled={this.state.isDisabled}>

					<ScrollView>
						<View style={{ flex: 1, padding: 0, margin: 0 }}>
							<View
								style={{
									justifyContent: 'flex-end',
									flexDirection: 'row',
									right: 10,
									top: 0
								}}>
								{this.getCancelButton()}
							</View>
							<View
								style={{
									flex: 1,
									marginTop: 0,
									marginLeft: 20,
									marginRight: 20
								}}>


								<View style={{ flex: 1, flexDirection: 'row' }}>
									<Text style={[{ textAlign: 'left' }, styles.baseItem]}>Payment Method</Text>
								</View>

								<FlatList
									data={this.props.paymentTypes}
									renderItem={({ item, index, separators }) => (
										this.paymentTypesRow(item, index, separators)
									)}
									extraData={this.props.selectedPaymentTypes}
									numColumns={2}
									contentContainerStyle={styles.container}
								/>

								<Card
									containerStyle={{ backgroundColor: '#ABC1DE' }}
								>

									<View style={{ flex: 1, flexDirection: 'row' }}>
										{this.getSaleAmount()}
										<PaymentDescription
											title={`${i18n.t('available-credit')}:`}
											total={Utilities.formatCurrency(
												this.currentCredit()
											)}
										/>
									</View>


									<View style={{ flex: 1, flexDirection: 'row' }}>
										<PaymentDescription
											title={`${i18n.t('previous-amount-due')}:`}
											total={Utilities.formatCurrency(
												this.calculateAmountDue()
											)}
										/>
										<PaymentDescription
											title={`${i18n.t('total-amount-due')}:`}
											total={Utilities.formatCurrency(
												this.calculateTotalDue()
											)}
										/>
									</View>
								</Card>

								<View style={{ flex: 1, flexDirection: 'row' }}>
									<View style={{ flex: 1 }}>
										<Text style={[{ textAlign: 'left' }, styles.baseItem]}>Delivery Mode</Text>

									</View>
								</View>

								<View style={{ flex: 1, flexDirection: 'row', alignContent: 'center', paddingBottom: 10 }}>
									<CheckBox
										title={'Delivery'}
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
										checked={this.props.delivery === 'delivery'}
										onPress={() => {
											this.setState({ isWalkIn: false });
											if (this.props.delivery === 'delivery') {
												this.props.paymentTypesActions.setDelivery('walkin');
												return;
											}
											this.props.paymentTypesActions.setDelivery('delivery');
										}}
									/>
									<CheckBox
										title={'Walk In'}
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
										checked={this.props.delivery === 'walkin'}
										onPress={() => {
											this.setState({ isWalkIn: false });

											if (this.props.delivery === 'walkin') {
												this.props.paymentTypesActions.setDelivery('delivery');
												return;
											}

											this.props.paymentTypesActions.setDelivery('walkin');
										}}
									/>

								<TouchableHighlight underlayColor='#c0c0c0'
									onPress={() => this.onBottles()}>
									<Text
										style={{ paddingTop: 10, paddingBottom: 10, textAlign: 'center' }}>Bottles returned</Text>
								</TouchableHighlight>

								</View>
								<View style={{ flex: 1, flexDirection: 'row' }}>
									<Text style={[styles.baseItem, { fontSize: 16, paddingTop: 15, textAlign: 'left' }]}>Are you recording an old sale?</Text>{this.getBackDateComponent()}
								</View>
							</View>
							<View style={styles.completeOrderBtn}>
								<View style={{ justifyContent: 'center' }}>
									<TouchableHighlight
										underlayColor="#c0c0c0"
										onPress={() => this.onCompleteOrder()}>
										<Text
											style={[
												{ paddingTop: 10, paddingBottom: 20 },
												styles.buttonText
											]}>
											{i18n.t('complete-sale')}
										</Text>
									</TouchableHighlight>
								</View>
							</View>
						</View>
					</ScrollView>
				</Modal>


			</View>

		);
	}

	paymentTypesRow = (item, index, separators) => {

		let isSelectedAvailable = false;
		if (this.props.selectedPaymentTypes.length > 0) {
			const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);
			if (itemIndex >= 0) {
				isSelectedAvailable = true;
			}
		}

		if (this.props.selectedPaymentTypes.length === 0) {
			if (item.name === 'cash') {
				PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
				this.props.paymentTypesActions.setSelectedPaymentTypes({ ...item, created_at: new Date(), isSelected: item.isSelected === true ? false : true, amount: this.calculateOrderDue() });
				isSelectedAvailable = true;
			}
		}

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
								if (Number(textValue) > Number(this.calculateOrderDue())) {
									Alert.alert(
										'Notice. ',
										`Amount can not be greater that ${this.calculateOrderDue()}`,
										[{ text: 'OK', onPress: () => { } }],
										{ cancelable: false }
									);
									return;
								}

								if (this.props.selectedPaymentTypes.length >= 0) {
									const itemIndex2 = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(this.state.selectedType.id);
									let secondItemObj = this.props.selectedPaymentTypes.filter(obj => obj.id != this.state.selectedType.id).map(function (e) { return e.id });

									if (itemIndex2 >= 0) {
										this.props.selectedPaymentTypes[itemIndex].amount = Number(textValue);
										this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[itemIndex2], amount: Number(textValue) }, itemIndex2);
										this.setState({
											selectedType: { ...this.props.selectedPaymentTypes[itemIndex2], amount: Number(textValue) }
										});
									}

									if (secondItemObj.length > 0) {
										const seconditemIndex2 = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(secondItemObj[0]);
										this.props.selectedPaymentTypes[seconditemIndex2].amount = Number(this.calculateOrderDue()) - Number(textValue);
										this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[seconditemIndex2], amount: Number(this.calculateOrderDue()) - Number(textValue) }, seconditemIndex2);
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

		if (this.props.selectedPaymentTypes.length === 2) {
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


		if (this.props.selectedPaymentTypes.length === 0) {
			PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
			this.props.paymentTypesActions.setSelectedPaymentTypes({ ...item, created_at: new Date(), isSelected: item.isSelected === true ? false : true, amount: this.calculateOrderDue() });
		} else {
			PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
			this.props.paymentTypesActions.setSelectedPaymentTypes({ ...item, created_at: new Date(), isSelected: item.isSelected === true ? false : true, amount: 0 });
		}
		this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
	};

	valuePaymentChange = textValue => {

		if (this.props.selectedPaymentTypes.length >= 0) {

			if (this.props.selectedPaymentTypes.length === 0) {
				const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(this.state.selectedType.id);
				if (itemIndex >= 0) {
					this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[itemIndex], amount: Number(textValue) }, itemIndex);
				}
			}

			if (this.props.selectedPaymentTypes.length > 0) {
				const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(this.state.selectedType.id);
				if (itemIndex >= 0) {
					this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[itemIndex], amount: Number(textValue) }, itemIndex);
				}
			}

		}
	};

	modalOnClose() {
		PaymentTypeRealm.resetSelected();
		this.props.paymentTypesActions.resetSelectedPayment();
		this.props.paymentTypesActions.setPaymentTypes(
			PaymentTypeRealm.getPaymentTypes());
	}

	getSaleAmount() {
		if (!this.isPayoffOnly()) {
			return (
				<PaymentDescription
					styles={{ fontWeight: 'bold' }}
					title={`${i18n.t('sale-amount-due')}: `}
					total={Utilities.formatCurrency(this.calculateOrderDue())}
				/>
			);
		} else {
			return null;
		}
	}

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

	getBottlesCancelButton() {
		return (
			<TouchableHighlight onPress={() => this.closeBottlesModal()}>
				<Icon
					size={40}
					name="md-close-circle-outline"
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
						padding: 10
					}}>
					<Button
						style={{ flex: 1 }}
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

	_roundToDecimal(value) {
		return parseFloat(value.toFixed(2));
	}

	_isAnonymousCustomer(customer) {
		return CustomerTypeRealm.getCustomerTypeByName('anonymous').id ==
			customer.customerTypeId
			? true
			: false;
	}

	calculateTotalDue() {
		return this._roundToDecimal(
			this.calculateOrderDue() + this.calculateAmountDue()
		);
	}

	getItemPrice = item => {
		let productMrp = this._getItemMrp(item);
		if (productMrp) {
			return productMrp.priceAmount;
		}
		return item.priceAmount; // Just use product price
	};

	getItemCogs = item => {
		let productMrp = this._getItemMrp(item);
		if (productMrp) {
			return productMrp.cogsAmount;
		}
		return item.cogsAmount; // Just use product price
	};

	_getItemMrp = item => {
		let salesChannel = SalesChannelRealm.getSalesChannelFromName(
			this.props.channel.salesChannel
		);
		if (salesChannel) {
			let productMrp = ProductMRPRealm.getFilteredProductMRP()[
				ProductMRPRealm.getProductMrpKeyFromIds(
					item.productId,
					salesChannel.id
				)
			];
			if (productMrp) {
				return productMrp;
			}
		}
		return null;
	};

	getTotalOrders = () => {
		return this.props.products.reduce((total, item) => { return (total + item.quantity) }, 0);
	};

	getAmount = () => {
		return this.props.products.reduce((total, item) => { return (total + item.quantity * this.getItemPrice(item.product)) }, 0);
	};

	getItemPrice = (product) => {
		let salesChannel = SalesChannelRealm.getSalesChannelFromName(this.props.channel.salesChannel);
		if (salesChannel) {
			let productMrp = ProductMRPRealm.getFilteredProductMRP()[ProductMRPRealm.getProductMrpKeyFromIds(product.productId, salesChannel.id)];
			if (productMrp) {
				return productMrp.priceAmount;
			}
		}
		return product.priceAmount;	// Just use product price
	};

	onPay = () => {
		this.refs.modal6.open();
	};

	onBottles = () => {
		this.refs.modal7.open();
	};


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


	onCompleteOrder = () => {
		let receipt = null;
		let price_total = 0;
		let totalAmount = 0;

		if (!this.isPayoffOnly()) {
			// Assumes that there is at least one product
			let receiptDate = this.state.receiptDate
				? this.state.receiptDate
				: new Date(Date.now());


			receipt = {
				id: uuidv1(),
				createdDate: receiptDate,
				currency_code: this.props.products[0].product.priceCurrency,
				customer_account_id: this.props.selectedCustomer.customerId,
				isWalkIn: this.props.payment.isWalkIn,
				amount_cash: this.props.payment.cash,
				delivery: this.props.delivery,
				amount_loan: this.props.payment.credit,
				amountMobile: this.props.payment.mobile,
				amount_bank: this.props.payment.bank,
				amount_cheque: this.props.payment.cheque,
				amountjibuCredit: this.props.payment.jibuCredit,
				siteId: this.props.selectedCustomer.siteId
					? this.props.selectedCustomer.siteId
					: SettingRealm.getAllSetting().siteId,
				payment_type: '', // NOT sure what this is
				sales_channel_id: this.props.selectedCustomer.salesChannelId,
				customer_type_id: this.props.selectedCustomer.customerTypeId,
				products: [],
				active: 1
			};

			if (!receipt.siteId) {
				// This fixes issues with the pseudo direct customer
				if (SettingRealm.getAllSetting())
					receipt.siteId = SettingRealm.getAllSetting().siteId;
			}
			let cogs_total = 0;

			receipt.products = this.props.products.map(product => {
				let receiptLineItem = {};
				let tempValue = this.getItemCogs(product.product) * product.quantity;
				receiptLineItem.price_total = this.getItemPrice(product.product) * product.quantity;
				receiptLineItem.totalAmount = product.finalAmount;
				receiptLineItem.quantity = product.quantity;
				receiptLineItem.notes = product.notes;
				receiptLineItem.product_id = product.product.productId;
				receiptLineItem.product = product.product;
				receiptLineItem.cogs_total = tempValue == 0 ? product.quantity : tempValue;
				// The items below are used for reporting...
				receiptLineItem.sku = product.product.sku;
				receiptLineItem.description = product.product.description;
				if (product.product.unitMeasure == 'liters') {
					receiptLineItem.litersPerSku =
						product.product.unitPerProduct;
				} else {
					receiptLineItem.litersPerSku = 'N/A';
				}
				totalAmount += receiptLineItem.totalAmount;
				price_total += receiptLineItem.price_total;
				cogs_total += receiptLineItem.cogs_total;
				receiptLineItem.active = 1;
				return receiptLineItem;
			});
			receipt.total = price_total;
			receipt.totalAmount = totalAmount;
			receipt.cogs = cogs_total;
		}
		// Check loan payoff
		let payoff = 0;
		try {
			if (this.props.payment.hasOwnProperty('cashToDisplay')) {
				payoff = parseFloat(this.props.payment.cashToDisplay);
			} else if (this.props.payment.hasOwnProperty('mobileToDisplay')) {
				payoff = parseFloat(this.props.payment.mobileToDisplay);
			}
			if (payoff > price_total) {
				// User is paying of loan amount
				payoff -= price_total;
				if (payoff > this.props.selectedCustomer.dueAmount) {
					// Overpayment... this is an error
					Alert.alert(
						i18n.t('over-due-amount-title'),
						i18n.t('over-due-amount-text') +
						this.props.selectedCustomer.dueAmount,
						[
							{
								text: 'OK',
								onPress: () => { }
							}
						],
						{ cancelable: false }
					);

					//return false;
					payoff = 0;
				}
			} else {
				payoff = 0;
			}
		} catch (err) {

		}
		if (receipt != null) {
			const creditIndex = this.props.selectedPaymentTypes.map(function (e) { return e.name }).indexOf("credit");

			// if (creditIndex >= 0) {
			// 	if (Number(this.props.selectedPaymentTypes[creditIndex].amount) > Number(this.props.selectedCustomer.dueAmount)) {
			// 		Alert.alert(
			// 			i18n.t('credit-due-amount-title'),
			// 			i18n.t('credit-due-amount-text') +
			// 			this.props.selectedCustomer.dueAmount,
			// 			[
			// 				{
			// 					text: 'OK',
			// 					onPress: () => { }
			// 				}
			// 			],
			// 			{ cancelable: false }
			// 		);
			// 		return;
			// 	}
			// }

			if(this.currentCredit() === 0){
				Alert.alert(
					'No Jibu Credit',
					'There is no credit in the wallet',
					[{
						text: 'OK',
						onPress: () => {
						}
					}],
					{ cancelable: false }
				);
				return;
			}


			receipt.customer_account = this.props.selectedCustomer;
			if (this.props.selectedPaymentTypes.length > 0) {
				ReceiptPaymentTypeRealm.createManyReceiptPaymentType(this.props.selectedPaymentTypes, receipt.id);
				this.props.paymentTypesActions.setRecieptPaymentTypes(
					ReceiptPaymentTypeRealm.getReceiptPaymentTypes()
				);
			}


		


			OrderRealm.createOrder(receipt);
			this.props.receiptActions.setReceipts(
				OrderRealm.getAllOrder()
			);

			const rpIndex = this.props.selectedPaymentTypes.map(function (e) { return e.name }).indexOf("loan");

			if (rpIndex >= 0) {
				this.props.selectedCustomer.dueAmount = Number(this.props.selectedCustomer.dueAmount) + Number(this.props.selectedPaymentTypes[rpIndex].amount);
				CustomerRealm.updateCustomerDueAmount(
					this.props.selectedCustomer,
					this.props.selectedCustomer.dueAmount
				);
				this.props.customerActions.CustomerSelected(this.props.selectedCustomer);
			}



			Alert.alert(
				'Notice',
				'Payment Made',
				[{
					text: 'OK',
					onPress: () => {
						this.closePaymentModal();
						this.props.navigation.navigate("CustomerList");
					}
				}],
				{ cancelable: false }
			);

		} else {

		}
		return true;
	};

	closePaymentModal = () => {
		this.refs.modal6.close();
	};

	closeBottlesModal = () => {
		this.refs.modal7.close();
	};

	getCreditPurchases() {
		console.log('customerCreditPaymentTypeReceipts', this.customerCreditPaymentTypeReceipts());
		return this.customerCreditPaymentTypeReceipts().reduce((total, item) => { return (total + item.amount) }, 0)
	}

	currentCredit() {
		console.log('topupTotal', this.totalTopUp());
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

            console.log('topups', topups);
            return topups.filter(r => r.customer_account_id === this.props.selectedCustomer.customerId);
        } else {
            return [];
        }

    }

	customerCreditPaymentTypeReceipts() {
		let receiptsPaymentTypes = [...this.compareCreditPaymentTypes()];
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



	getOpacity = () => {
		if (this.props.products.length == 0 || this.props.flow.page != 'products') {
			return { opacity: .3 };
		} else {
			return { opacity: 1 };
		}
	}
}

function mapStateToProps(state, props) {
	return {
		products: state.orderReducer.products,
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		delivery: state.paymentTypesReducer.delivery,
		selectedPaymentTypes: state.paymentTypesReducer.selectedPaymentTypes,
		selectedDiscounts: state.orderReducer.discounts,
		flow: state.orderReducer.flow,
		channel: state.orderReducer.channel,
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
		orderActions: bindActionCreators(OrderActions, dispatch),
		customerBarActions: bindActionCreators(CustomerBarActions, dispatch),
		receiptActions: bindActionCreators(receiptActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		paymentTypesActions: bindActionCreators(PaymentTypesActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch),
	};
}
export default connect(mapStateToProps, mapDispatchToProps)(OrderCheckout);


const styles = StyleSheet.create({

	container: {
		flex: 1,
		backgroundColor: "#2858a7",

	},
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
	modal: {
		justifyContent: 'center',
		// alignItems: 'center'
	},

	modal2: {
		height: 230,
		width: '70%',
		backgroundColor: "#f1f1f1"
	},

	completeOrder: {
		backgroundColor: '#2858a7',
		borderRadius: 10,
		marginTop: '1%'
	},

	completeOrderBtn: {
		backgroundColor: '#2858a7',
		bottom: 0,
		marginBottom: 0
	},

	modal3: {
		width: widthQuanityModal,
		height: heightQuanityModal,
	},

});
