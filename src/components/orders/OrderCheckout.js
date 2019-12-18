import React, { Component } from "react"
import { View, Alert, Text, TextInput, Button, CheckBox, Picker, TouchableHighlight, StyleSheet, Dimensions, Image, TouchableNativeFeedback } from "react-native";

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from 'react-native-modal-datetime-picker';
import * as OrderActions from "../../actions/OrderActions";
import Modal from 'react-native-modalbox';
import * as CustomerBarActions from '../../actions/CustomerBarActions';
import * as CustomerActions from '../../actions/CustomerActions';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import i18n from "../../app/i18n";
import Icon from 'react-native-vector-icons/Ionicons';
import PosStorage from "../../database/PosStorage";
import CustomerTypeRealm from '../../database/customer-types/customer-types.operations';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import * as Utilities from "../../services/Utilities";
const uuidv1 = require('uuid/v1');
import Events from "react-native-simple-events";
const { height, width } = Dimensions.get('window');
const widthQuanityModal = 1000;
const heightQuanityModal = 500;
const inputTextWidth = 400;
const marginInputItems = width / 2 - inputTextWidth / 2;

const inputFontHeight = Math.round((24 * height) / 752);
const marginTextInput = Math.round((5 * height) / 752);
const marginSpacing = Math.round((20 * height) / 752);



class PaymentDescription extends Component {
	render() {
		return (
			<View style={[{ flex: 1, flexDirection: 'row', marginTop: '1%' }]}>
				<View style={[{ flex: 3 }]}>
					<Text style={[styles.totalTitle]}>{this.props.title}</Text>
				</View>
				<View style={[{ flex: 2 }]}>
					<Text style={[styles.totalValue]}>{this.props.total}</Text>
				</View>
			</View>
		);
	}
}

class PaymentMethod extends Component {
	render() {
		return (
			<View style={styles.checkBoxRow}>
				<View style={[{ flex: 1 }]}>
					<CheckBox
						style={styles.checkBox}
						value={this.props.checkBox}
						onValueChange={this.props.checkBoxChange}
					/>
				</View>
				<View style={[{ flex: 3 }]}>
					<Text style={styles.checkLabel}>
						{this.props.checkBoxLabel}
					</Text>
				</View>
				<View style={[{ flex: 3 }]}>{this.showTextInput()}</View>
			</View>
		);
	}
	showTextInput() {
		if (
			this.props.parent.state.isCredit ||
			this.props.parent.isPayoffOnly()
		) {
			if (this.props.type === 'cash' && this.props.parent.state.isCash) {
				return (
					<TextInput
						underlineColorAndroid="transparent"
						onChangeText={this.props.valueChange}
						keyboardType="numeric"
						value={this.props.value}
						style={[styles.cashInput]}
					/>
				);
			} else if (this.props.type === 'credit') {
				return (
					<Text style={styles.checkLabel}>{this.props.value}</Text>
				);
			}
			if (
				this.props.type === 'mobile' &&
				this.props.parent.state.isMobile
			) {
				return (
					<TextInput
						underlineColorAndroid="transparent"
						onChangeText={this.props.valueChange}
						keyboardType="numeric"
						value={this.props.value}
						style={[styles.cashInput]}
					/>
				);
			}
		}
		return null;
	}
}

class OrderCheckout extends Component {

	constructor(props) {
		super(props);
		this.saleSuccess = false;
		this.state = {
			isQuantityVisible: false,
			selectedItem: {},
			accumulator: 0,
			firstKey: true,
			isKajibu: false,
			is20LTap: false,
			isOpen: false,
			isDisabled: false,
			swipeToClose: true,
			sliderValue: 0.3,
			paymentOptions: "",

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


		const state = this.state;

		return (
			<View style={styles.container}>
				<View style={[{ flexDirection: 'row' }, this.getOpacity()]}>
					<View style={{ flex: 0.5, justifyContent: 'center' }}>
						<TouchableHighlight underlayColor='#c0c0c0'
							onPress={() => this.onPay()}>
							<Text style={[{ paddingTop: 10, paddingBottom: 10, textAlign: 'center' }, styles.buttonText]}>{i18n.t('pay')}</Text>
						</TouchableHighlight>
					</View>
					<View style={{ flex: 0.5, justifyContent: 'center' }}>
						<TouchableHighlight underlayColor='#c0c0c0'
							onPress={() => this.onSaveOrder()}>
							<Text style={[{ paddingTop: 10, paddingBottom: 10, textAlign: 'center' }, styles.buttonText]}>{i18n.t('save-order')}</Text>
						</TouchableHighlight>
					</View>
				</View>


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
					{this.getBackDateComponent()}
					<View
						style={{
							flex: 1,
							marginTop: 0,
							marginBottom: 50,
							marginLeft: 100,
							marginRight: 100
						}}>
						<PaymentMethod
							parent={this}
							type={'cash'}
							checkBox={this.state.isCash}
							checkBoxChange={this.checkBoxChangeCash.bind(this)}
							checkBoxLabel={i18n.t('cash')}
							value={this.props.payment.cashToDisplay}
							valueChange={this.valuePaymentChange}
						/>
						{this.getCreditComponent()}
						<PaymentMethod
							parent={this}
							type={'mobile'}
							checkBox={this.state.isMobile}
							checkBoxChange={this.checkBoxChangeMobile.bind(this)}
							checkBoxLabel={i18n.t('mobile')}
							value={this.props.payment.mobileToDisplay}
							valueChange={this.valuePaymentChange}
						/>
						<Picker
							selectedValue={this.state.paymentOptions}
							onValueChange={(itemValue, itemIndex) => {
								this.setState({ paymentOptions: itemValue });
								console.log(itemValue);
								if (itemValue === 'isJibuCredit') {
									this.setState({ isJibuCredit: true });
									this.setState({ isCheque: false });
									this.setState({ isBank: false });
								} else if (itemValue === 'isCheque') {
									this.setState({ isJibuCredit: false });
									this.setState({ isCheque: true });
									this.setState({ isBank: false });
								} else if (itemValue === 'isBank') {
									this.setState({ isJibuCredit: false });
									this.setState({ isCheque: false });
									this.setState({ isBank: true });
								}
								this.setState({ isCash: false });
								this.setState({ isMobile: false });
							}
							}>
							<Picker.Item label="More Options" value="" />
							<Picker.Item label="Jibu Credit" value="isJibuCredit" />
							<Picker.Item label="Cheque" value="isCheque" />
							<Picker.Item label="Bank Transfer" value="isBank" />
						</Picker>
						{this.getSaleAmount()}
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
						<View style={styles.completeOrder}>
							<View style={{ justifyContent: 'center', height: 50 }}>
								<TouchableHighlight
									underlayColor="#c0c0c0"
									onPress={() => this.onCompleteOrder()}>
									<Text
										style={[
											{ paddingTop: 20, paddingBottom: 20 },
											styles.buttonText
										]}>
										{i18n.t('make-payment')}
									</Text>
								</TouchableHighlight>
							</View>
						</View>
					</View>
					<Modal
						visible={this.state.isCompleteOrderVisible}
						backdropColor={'red'}
						transparent={true}
						onRequestClose={this.closeHandler}>
						{this.ShowCompleteOrder()}
					</Modal>
				</Modal>


			</View>

		);
	}

	getSaleAmount() {
		if (!this.isPayoffOnly()) {
			return (
				<PaymentDescription
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

	getCreditComponent() {
		if (
			!this._isAnonymousCustomer(this.props.selectedCustomer) &&
			!this.isPayoffOnly()
		) {
			return (
				<PaymentMethod
					parent={this}
					type={'credit'}
					checkBox={this.state.isCredit}
					checkBoxChange={this.checkBoxChangeCredit.bind(this)}
					checkBoxLabel={i18n.t('loan')}
					value={Utilities.formatCurrency(this.props.payment.credit)}
				/>
			);
		} else {
			return null;
		}
	}

	_roundToDecimal(value) {
		return parseFloat(value.toFixed(2));
	}

	_isAnonymousCustomer(customer) {
		if(CustomerTypeRealm.getCustomerTypeByName('anonymous')){
			return CustomerTypeRealm.getCustomerTypeByName('anonymous').id ==
			customer.customerTypeId
			? true
			: false;
		}
		return false;
	}

	calculateOrderDue() {
		if (this.isPayoffOnly()) {
			// If this is a loan payoff then the loan payment is negative the loan amount due
			return this.calculateAmountDue();
		} else {
			return this.props.products.reduce((total, item) => {
				return total + item.quantity * this.getItemPrice(item.product);
			}, 0);
		}
	}

	calculateAmountDue() {
		return this.props.selectedCustomer.dueAmount;
	}

	calculateTotalDue() {
		if (this.isPayoffOnly()) {
			let paymentAmount = this.props.payment.cash;
			if (this.props.payment.hasOwnProperty('mobileToDisplay')) {
				paymentAmount = this.props.payment.mobile;
			}
			return this._roundToDecimal(
				this.calculateAmountDue() - paymentAmount
			);
		} else {
			return this._roundToDecimal(
				this.calculateOrderDue() + this.calculateAmountDue()
			);
		}
	}

	onCompleteOrder = () => {

		console.log(this.isPayoffOnly());
		console.log(this.props.payment);
		console.log(this.props.selectedCustomer);
		console.log("there")
		this.formatAndSaveSale();
		Alert.alert(
			'Notice',
			'Payment Made',
			[{
				text: 'OK',
				onPress: () => {
					this.closePaymentModal();
					this.props.orderActions.ClearOrder();
				}
			}],
			{ cancelable: false }
		);
	}


	onCompleteOrderd = () => {
		if (this.isPayoffOnly()) {

			let payoff = 0;
			try {
				if (this.props.payment.hasOwnProperty('cashToDisplay')) {
					payoff = parseFloat(this.props.payment.cashToDisplay);
				} else if (
					this.props.payment.hasOwnProperty('mobileToDisplay')
				) {
					payoff = parseFloat(this.props.payment.mobileToDisplay);
				}

				if (payoff > this.props.selectedCustomer.dueAmount) {
					Alert.alert(
						i18n.t('over-due-amount-title'),
						i18n.t('over-due-amount-text') +
						this.props.selectedCustomer.dueAmount,
						[
							{
								text: 'OK',
								onPress: () => console.log('OK Pressed')
							}
						],
						{ cancelable: false }
					);
				} else {
					console.log("check")
					this.setState({ isCompleteOrderVisible: true });
				}
			} catch (err) {
				console.log('formatAndSaveSale ' + err.message);
			}
		} else {
			console.log("there")
			this.setState({ isCompleteOrderVisible: true });
		}
	};



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
				ProductMRPRealm.getgProductMrpKeyFromIds(
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



	valuePaymentChange = textValue => {
		console.log('textValue', textValue);
		if (!textValue.endsWith('.')) {
			let cashValue = parseFloat(textValue);
			if (isNaN(cashValue)) {
				cashValue = 0;
			}
			if (cashValue > this.calculateOrderDue()) {
				cashValue = this.calculateOrderDue();
			}
			let credit = this._roundToDecimal(
				this.calculateOrderDue() - cashValue
			);
			this.updatePayment(credit, textValue);
		} else {
			this.updatePayment(
				this.calculateOrderDue() - parseFloat(textValue),
				textValue
			);
		}
	};

	checkBoxChangeCredit = () => {
		this.setState({ isCredit: !this.state.isCredit }, function () {
			this.updatePayment(0, this.calculateOrderDue().toFixed(2));
		});
	};

	checkBoxChangeMobile = () => {
		this.setState({ isMobile: !this.state.isMobile }, function () {
			this.updatePayment(0, this.calculateOrderDue().toFixed(2));
		});
		this.setState({ isCash: false });
		this.setState({ paymentOptions: "" });
	};

	checkBoxChangeCash = () => {
		this.setState({ isCash: !this.state.isCash });
		console.log('calculateOrderDue', this.calculateOrderDue());
		this.setState({ isMobile: false }, function () {
			console.log('calculateOrderDue', this.calculateOrderDue());
			this.updatePayment(0, this.calculateOrderDue().toFixed(2));
		});
		this.setState({ paymentOptions: "" });

		// this.setState({ isMobile: !this.state.isMobile });

		// this.setState({ isCash: !this.state.isCash }, function() {
		// 	this.updatePayment(
		// 		this.state.isCredit ? this.calculateOrderDue().toFixed(2) - this.props.payment.cash : 0,
		// 		this.state.isCredit ? '0.00' : this.calculateOrderDue().toFixed(2));
		// });

	};

	updatePayment = (credit, textToDisplay) => {
		let payment = {
			cash: this.calculateOrderDue() - credit,
			cashToDisplay: textToDisplay,
			credit: credit,
			mobile: 0
		};
		if (this.state.isMobile) {
			payment = {
				mobile: this.calculateOrderDue() - credit,
				mobileToDisplay: textToDisplay,
				credit: credit,
				cash: 0
			};
		}
		console.log('payment', payment);
		this.props.orderActions.SetPayment(payment);
	};

	closeHandler = () => {
		console.log('closeHandler');
		this.setState({ isCompleteOrderVisible: false });
		if (this.saleSuccess) {
			console.log('closeHandler2');
			this.props.customerBarActions.ShowHideCustomers(1);
			console.log('closeHandler33');
			this.props.customerActions.CustomerSelected({});
			console.log('closeHandler3');
		} else {
			Alert.alert(
				'Invalid payment amount. ',
				'The amount paid cannot exceed to cost of goods and customer amount due',
				[{ text: 'OK', onPress: () => console.log('OK Pressed') }],
				{ cancelable: false }
			);
		}
	};

	ShowCompleteOrder = () => {
		let that = this;
		if (this.state.isCompleteOrderVisible) {
			console.log('isCompleteOrderVisible');
			if (this.formatAndSaveSale()) {
				console.log('formatAndSaveSale');
				this.saleSuccess = true;
				setTimeout(() => {
					that.closeHandler();
				}, 500);
			} else {
				this.saleSuccess = false;
				setTimeout(() => {
					that.closeHandler();
				}, 1);
			}
		}
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center'
				}}>
				<View style={styles.orderProcessing}>
					<Text style={{ fontSize: 24, fontWeight: 'bold' }}>
						{i18n.t('processing-order')}
					</Text>
				</View>


				<Modal style={[styles.modal, styles.modal3]} coverScreen={true} position={"center"} ref={"modal6"} isDisabled={this.state.isDisabled}>

					{/* <View style={{ flex: 1, flexDirection: 'row' }}>
						<Text style={[{ flex: 3, marginLeft: 20 }, styles.summaryText]}>{i18n.t('order-summary')}</Text>
						<Text style={[{ flex: 1 }, styles.summaryText]}>{i18n.t('cart')} ({this.getTotalOrders()})</Text>
					</View> */}

					{/* <View style={{ flex: 1 }}>
						<Text style={[styles.totalText]}>{i18n.t('order-total')}</Text>
						<Text style={[{ flex: 1 }, styles.totalText]}>{Utilities.formatCurrency(this.getAmount())}</Text>
					</View>

					<View
						style={{
							height: 1,
							backgroundColor: '#ddd',
							width: '100%'
						}}
					/> */}



					<View
						style={{
							justifyContent: 'flex-end',
							flexDirection: 'row',
							right: 100,
							top: 10
						}}>
						{this.getCancelButton()}
					</View>

					{this.getBackDateComponent()}

					<View
						style={{
							flex: 1,
							marginTop: 0,
							marginBottom: 50,
							marginLeft: 100,
							marginRight: 100
						}}>
						<PaymentMethod
							parent={this}
							type={'cash'}
							checkBox={this.state.isCash}
							checkBoxChange={this.checkBoxChangeCash.bind(this)}
							checkBoxLabel={i18n.t('cash')}
							value={this.props.payment.cashToDisplay}
							valueChange={this.valuePaymentChange}
						/>
						{this.getCreditComponent()}
						<PaymentMethod
							parent={this}
							type={'mobile'}
							checkBox={this.state.isMobile}
							checkBoxChange={this.checkBoxChangeMobile.bind(this)}
							checkBoxLabel={i18n.t('mobile')}
							value={this.props.payment.mobileToDisplay}
							valueChange={this.valuePaymentChange}
						/>


						<Picker
							selectedValue={this.state.paymentOptions}
							onValueChange={(itemValue, itemIndex) => {
								this.setState({ paymentOptions: itemValue });

								console.log(itemValue);

								if (itemValue === 'isJibuCredit') {
									this.setState({ isJibuCredit: true });
									this.setState({ isCheque: false });
									this.setState({ isBank: false });
								} else if (itemValue === 'isCheque') {
									this.setState({ isJibuCredit: false });
									this.setState({ isCheque: true });
									this.setState({ isBank: false });
								} else if (itemValue === 'isBank') {
									this.setState({ isJibuCredit: false });
									this.setState({ isCheque: false });
									this.setState({ isBank: true });
								}


								this.setState({ isCash: false });
								this.setState({ isMobile: false });
							}
							}>
							<Picker.Item label="More Options" value="" />
							<Picker.Item label="Jibu Credit" value="isJibuCredit" />
							<Picker.Item label="Cheque" value="isCheque" />
							<Picker.Item label="Bank Transfer" value="isBank" />
						</Picker>



						{this.getSaleAmount()}





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
						<View style={styles.completeOrder}>
							<View style={{ justifyContent: 'center', height: 50 }}>
								<TouchableHighlight
									underlayColor="#c0c0c0"
									onPress={() => this.onCompleteOrder()}>
									<Text
										style={[
											{ paddingTop: 20, paddingBottom: 20 },
											styles.buttonText
										]}>
										{!this.isPayoffOnly()
											? i18n.t('complete-sale')
											: i18n.t('payoff')}
									</Text>
								</TouchableHighlight>
							</View>
						</View>
					</View>
					<Modal
						visible={this.state.isCompleteOrderVisible}
						backdropColor={'red'}
						transparent={true}
						onRequestClose={this.closeHandler}>
						{this.ShowCompleteOrder()}
					</Modal>



				</Modal>


			</View>

		);
	}



	getSaleAmount() {
		if (!this.isPayoffOnly()) {
			return (
				<PaymentDescription
					title={`${i18n.t('sale-amount-due')}: `}
					total={Utilities.formatCurrency(this.calculateOrderDue())}
				/>
			);
		} else {
			return null;
		}
	}

	getCancelButton() {
		if (!this.isPayoffOnly()) {
			return (
				<TouchableHighlight onPress={() => this.onCancelOrder()}>
				 
					<Icon
					size={50}
					name="md-close"
					color="black"
				/>
				</TouchableHighlight>
			);
		} else {
			return null;
		}
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

	getCreditComponent() {
		if (
			!this._isAnonymousCustomer(this.props.selectedCustomer) &&
			!this.isPayoffOnly()
		) {
			return (
				<PaymentMethod
					parent={this}
					type={'credit'}
					checkBox={this.state.isCredit}
					checkBoxChange={this.checkBoxChangeCredit.bind(this)}
					checkBoxLabel={i18n.t('loan')}
					value={Utilities.formatCurrency(this.props.payment.credit)}
				/>
			);
		} else {
			return null;
		}
	}

	_roundToDecimal(value) {
		return parseFloat(value.toFixed(2));
	}

	_isAnonymousCustomer(customer) {

		if(CustomerTypeRealm.getCustomerTypeByName('anonymous')){
			return CustomerTypeRealm.getCustomerTypeByName('anonymous').id ==
			customer.customerTypeId
			? true
			: false;
		}
		return false;

		
	}

	calculateOrderDue() {
		if (this.isPayoffOnly()) {
			// If this is a loan payoff then the loan payment is negative the loan amount due
			return this.calculateAmountDue();
		} else {
			return this.props.products.reduce((total, item) => {
				return total + item.quantity * this.getItemPrice(item.product);
			}, 0);
		}
	}

	calculateAmountDue() {
		return this.props.selectedCustomer.dueAmount;
	}

	calculateTotalDue() {
		if (this.isPayoffOnly()) {
			let paymentAmount = this.props.payment.cash;
			if (this.props.payment.hasOwnProperty('mobileToDisplay')) {
				paymentAmount = this.props.payment.mobile;
			}
			return this._roundToDecimal(
				this.calculateAmountDue() - paymentAmount
			);
		} else {
			return this._roundToDecimal(
				this.calculateOrderDue() + this.calculateAmountDue()
			);
		}
	}

	onCompleteOrder = () => {
		if (this.isPayoffOnly()) {
			let payoff = 0;
			try {
				if (this.props.payment.hasOwnProperty('cashToDisplay')) {
					payoff = parseFloat(this.props.payment.cashToDisplay);
				} else if (
					this.props.payment.hasOwnProperty('mobileToDisplay')
				) {
					payoff = parseFloat(this.props.payment.mobileToDisplay);
				}

				if (payoff > this.props.selectedCustomer.dueAmount) {
					Alert.alert(
						i18n.t('over-due-amount-title'),
						i18n.t('over-due-amount-text') +
						this.props.selectedCustomer.dueAmount,
						[
							{
								text: 'OK',
								onPress: () => console.log('OK Pressed')
							}
						],
						{ cancelable: false }
					);
				} else {
					this.setState({ isCompleteOrderVisible: true });
				}
			} catch (err) {
				console.log('formatAndSaveSale ' + err.message);
			}
		} else {
			this.setState({ isCompleteOrderVisible: true });
		}
	};



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
		console.log('salesChannel', salesChannel);
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



	valuePaymentChange = textValue => {
		if (!textValue.endsWith('.')) {
			let cashValue = parseFloat(textValue);
			if (isNaN(cashValue)) {
				cashValue = 0;
			}
			if (cashValue > this.calculateOrderDue()) {
				cashValue = this.calculateOrderDue();
			}
			let credit = this._roundToDecimal(
				this.calculateOrderDue() - cashValue
			);
			this.updatePayment(credit, textValue);
		} else {
			this.updatePayment(
				this.calculateOrderDue() - parseFloat(textValue),
				textValue
			);
		}
	};

	checkBoxChangeCredit = () => {
		this.setState({ isCredit: !this.state.isCredit }, function () {
			this.updatePayment(0, this.calculateOrderDue().toFixed(2));
		});
	};

	checkBoxChangeMobile = () => {
		this.setState({ isMobile: !this.state.isMobile }, function () {
			this.updatePayment(0, this.calculateOrderDue().toFixed(2));
		});
		this.setState({ isCash: false });
		this.setState({ paymentOptions: "" });
	};

	checkBoxChangeCash = () => {
		this.setState({ isCash: !this.state.isCash });
		this.setState({ isMobile: false }, function () {
			this.updatePayment(0, this.calculateOrderDue().toFixed(2));
		});
		this.setState({ paymentOptions: "" });
	};

	updatePayment = (credit, textToDisplay) => {
		let payment = {
			cash: this.calculateOrderDue() - credit,
			cashToDisplay: textToDisplay,
			credit: credit,
			mobile: 0
		};
		if (this.state.isMobile) {
			payment = {
				mobile: this.calculateOrderDue() - credit,
				mobileToDisplay: textToDisplay,
				credit: credit,
				cash: 0
			};
		}
		this.props.orderActions.SetPayment(payment);
	};

	closeHandler = () => {
		this.setState({ isCompleteOrderVisible: false });
		if (this.saleSuccess) {
			this.props.customerBarActions.ShowHideCustomers(1);
			this.props.customerActions.CustomerSelected({});
		} else {
			Alert.alert(
				'Invalid payment amount. ',
				'The amount paid cannot exceed to cost of goods and customer amount due',
				[{ text: 'OK', onPress: () => console.log('OK Pressed') }],
				{ cancelable: false }
			);
		}
	};

	ShowCompleteOrder = () => {
		let that = this;
		if (this.state.isCompleteOrderVisible) {
			if (this.formatAndSaveSale()) {
				this.saleSuccess = true;
				setTimeout(() => {
					that.closeHandler();
				}, 500);
			} else {
				this.saleSuccess = false;
				setTimeout(() => {
					that.closeHandler();
				}, 1);
			}
		}
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center'
				}}>
				<View style={styles.orderProcessing}>
					<Text style={{ fontSize: 24, fontWeight: 'bold' }}>
						{i18n.t('processing-order')}
					</Text>
				</View>
			</View>
		);
	};

	formatAndSaveSale = async () => {
		let receipt = null;
		let priceTotal = 0;
		console.log('payment', this.props.payment);

		if (!this.isPayoffOnly()) {
			// Assumes that there is at least one product
			let receiptDate = this.state.receiptDate
				? this.state.receiptDate
				: new Date(Date.now());

			console.log(receiptDate + " ---- " + uuidv1());

			receipt = {
				// id: receiptDate.toISOString(),
				id: uuidv1(),
				createdDate: receiptDate,
				currencyCode: this.props.products[0].product.priceCurrency,
				customerId: this.props.selectedCustomer.customerId,
				amountCash: this.props.payment.cash,
				amountLoan: this.props.payment.credit,
				amountMobile: this.props.payment.mobile,
				siteId: this.props.selectedCustomer.siteId
					? this.props.selectedCustomer.siteId
					: PosStorage.loadSettings().siteId,
				paymentType: '', // NOT sure what this is
				salesChannelId: this.props.selectedCustomer.salesChannelId,
				customerTypeId: this.props.selectedCustomer.customerTypeId,
				products: [],
				active: 1
			};

			if (!receipt.siteId) {
				// This fixes issues with the pseudo direct customer
				if (PosStorage.loadSettings())
					receipt.siteId = PosStorage.loadSettings().siteId;
			}
			console.log(PosStorage.loadSettings());
			let cogsTotal = 0;

			receipt.products = await this.props.products.map(product => {
				let receiptLineItem = {};
				let tempValue =
					this.getItemCogs(product.product) * product.quantity;
				receiptLineItem.priceTotal =
					this.getItemPrice(product.product) * product.quantity;
				receiptLineItem.quantity = product.quantity;
				receiptLineItem.productId = product.product.productId;
				receiptLineItem.cogsTotal =
					tempValue == 0 ? product.quantity : tempValue;
				// The items below are used for reporting...
				receiptLineItem.sku = product.product.sku;
				receiptLineItem.description = product.product.description;
				if (product.product.unitMeasure == 'liters') {
					receiptLineItem.litersPerSku =
						product.product.unitPerProduct;
				} else {
					receiptLineItem.litersPerSku = 'N/A';
				}
				priceTotal += receiptLineItem.priceTotal;
				cogsTotal += receiptLineItem.cogsTotal;
				receiptLineItem.active = 1;
				return receiptLineItem;
			});
			receipt.total = priceTotal;
			receipt.cogs = cogsTotal;
			console.log('receipt.products ', receipt.products);
			console.log(receipt);
			console.log('receipt.receiptreceiptreceipt()');
		}
		// Check loan payoff
		let payoff = 0;
		try {
			if (this.props.payment.hasOwnProperty('cashToDisplay')) {
				payoff = parseFloat(this.props.payment.cashToDisplay);
			} else if (this.props.payment.hasOwnProperty('mobileToDisplay')) {
				payoff = parseFloat(this.props.payment.mobileToDisplay);
			}
			if (payoff > priceTotal) {
				// User is paying of loan amount
				payoff -= priceTotal;
				if (payoff > this.props.selectedCustomer.dueAmount) {
					// Overpayment... this is an error
					Alert.alert(
						i18n.t('over-due-amount-title'),
						i18n.t('over-due-amount-text') +
						this.props.selectedCustomer.dueAmount,
						[
							{
								text: 'OK',
								onPress: () => console.log('OK Pressed')
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
			console.log('formatAndSaveSale ' + err.message);
		}
		if (receipt != null) {
			await PosStorage.addSale(receipt).then(saleKey => {
				Events.trigger('NewSaleAdded', {
					key: saleKey,
					sale: receipt
				});
			});
			console.log('check1');
			// Update dueAmount if required
			if (receipt.amountLoan > 0) {
				this.props.selectedCustomer.dueAmount += receipt.amountLoan;
				await PosStorage.updateCustomer(
					this.props.selectedCustomer,
					this.props.selectedCustomer.phoneNumber,
					this.props.selectedCustomer.name,
					this.props.selectedCustomer.address,
					this.props.selectedCustomer.salesChannelId,
					this.props.selectedCustomer.frequency
				);
				console.log('check2');
			} else if (payoff > 0) {
				this.props.selectedCustomer.dueAmount -= payoff;
				await PosStorage.updateCustomer(
					this.props.selectedCustomer,
					this.props.selectedCustomer.phoneNumber,
					this.props.selectedCustomer.name,
					this.props.selectedCustomer.address,
					this.props.selectedCustomer.salesChannelId,
					this.props.selectedCustomer.frequency
				);
				console.log('check3');
			}
			console.log('check4');
		} else {
			if (payoff > 0) {
				this.props.selectedCustomer.dueAmount -= payoff;
				await PosStorage.updateCustomer(
					this.props.selectedCustomer,
					this.props.selectedCustomer.phoneNumber,
					this.props.selectedCustomer.name,
					this.props.selectedCustomer.address,
					this.props.selectedCustomer.salesChannelId,
					this.props.selectedCustomer.frequency
				);
			}
		}
		return true;
	};

	isPayoffOnly() {
		return this.props.products.length === 0;
	}


	getTotalOrders = () => {
		console.log("getTotalOrders");
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
		console.log("onPay");
		if (this.props.products.length > 0) {
			this.updatePayment(0, this.calculateOrderDue().toFixed(2));
			this.refs.modal6.open();
		}
	};

	onSaveOrder = () => {

	}

	closePaymentModal = () => {
		this.refs.modal6.close();
	};
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
		flow: state.orderReducer.flow,
		channel: state.orderReducer.channel,
		payment: state.orderReducer.payment,
		selectedCustomer: state.customerReducer.selectedCustomer
	};
}
function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch),
		customerBarActions: bindActionCreators(CustomerBarActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch)
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
	modal: {
		justifyContent: 'center',
		// alignItems: 'center'
	},

	modal2: {
		height: 230,
		backgroundColor: "#3B5998"
	},
	completeOrder: {
		backgroundColor: '#2858a7',
		borderRadius: 30,
		marginTop: '1%'
	},

	modal3: {
		// height: 300,
		// width: 500
		width: widthQuanityModal,
		height: heightQuanityModal,
	},

});
