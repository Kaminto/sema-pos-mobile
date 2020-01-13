import React, { Component } from "react"
import { View, Alert, Text, TextInput, Button, CheckBox, FlatList, Picker, ScrollView, TouchableHighlight, StyleSheet, Dimensions, Image, TouchableNativeFeedback } from "react-native";

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from 'react-native-modal-datetime-picker';
import * as OrderActions from "../../actions/OrderActions";
import Modal from 'react-native-modalbox';
import * as CustomerBarActions from '../../actions/CustomerBarActions';
import * as CustomerActions from '../../actions/CustomerActions';
import * as PaymentTypesActions from "../../actions/PaymentTypesActions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import i18n from "../../app/i18n";
import Icon from 'react-native-vector-icons/Ionicons';
import PosStorage from "../../database/PosStorage";
import CustomerTypeRealm from '../../database/customer-types/customer-types.operations';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';

import PaymentTypeRealm from '../../database/payment_types/payment_types.operations';
import SettingRealm from '../../database/settings/settings.operations';
import CustomerRealm from '../../database/customers/customer.operations';
import OrderRealm from '../../database/orders/orders.operations';
import * as Utilities from "../../services/Utilities";
import ToggleSwitch from 'toggle-switch-react-native';
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
			//      
			if (
				this.props.type === 'mobile' &&
				this.props.parent.state.isMobile ||
				this.props.type === 'jibu-credit' &&
				this.props.parent.state.isJibuCredit ||
				this.props.type === 'cheque' &&
				this.props.parent.state.isCheque ||
				this.props.type === 'bank-transfer' &&
				this.props.parent.state.isBank
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
			firstKey: true,
			isOpen: false,
			isWalkIn: false,
			isDisabled: false,
			swipeToClose: true,
			sliderValue: 0.3,
			paymentOptions: "",
			selectedPaymentTypes: [],
			selectedType: {},
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
		const state = this.state;
		console.log(this.props.paymentTypes);
		return (
			<View style={styles.container}>
				<View style={[{ flexDirection: 'row' }, this.getOpacity()]}>
					<View style={{ flex: 0.5, justifyContent: 'center' }}>
						<TouchableHighlight underlayColor='#c0c0c0'
							onPress={() => this.onPay()}>
							<Text style={[{ paddingTop: 20, paddingBottom: 20, textAlign: 'center' }, styles.buttonText]}>{i18n.t('pay')}</Text>
						</TouchableHighlight>
					</View>
					<View style={{ flex: 0.5, justifyContent: 'center' }}>
						<TouchableHighlight underlayColor='#c0c0c0'
							onPress={() => this.onSaveOrder()}>
							<Text style={[{ paddingTop: 20, paddingBottom: 20, textAlign: 'center' }, styles.buttonText]}>{i18n.t('save-order')}</Text>
						</TouchableHighlight>
					</View>
				</View>


				<Modal
					style={[styles.modal, styles.modal3]}
					coverScreen={true}
					position={"center"} ref={"modal6"}
					onClosed={() => this.modalOnClose()}
					isDisabled={this.state.isDisabled}>

					<ScrollView>
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

							<FlatList
								data={this.props.paymentTypes}
								renderItem={({ item, index, separators }) => (
									this.paymentTypesRow(item, index, separators)
								)}
								extraData={this.props.selectedPaymentTypes}
							/>

							<ToggleSwitch
								isOn={this.state.isWalkIn}
								onColor="green"
								offColor="red"
								labelStyle={{ color: "black", fontWeight: "900" }}
								size="large"
								onToggle={isOn => {
									//DiscountRealm.isSelected(item, isOn === true ? true : false);

									if (isOn) {

									}

									if (!isOn) {

									}

									console.log('selectedDiscounts', this.state.selectedDiscounts);


								}}
							/>



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

				isSelectedAvailable = true
			}
		}
		console.log('isSelectedAvailable', isSelectedAvailable)



		return (
			<View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
				<View style={{ flex: 1, height: 50 }}>
					<Text style={[{ marginLeft: 12 }, styles.baseItem]}>{item.applies_to}-{item.amount}</Text>
				</View>
				<View style={{ flex: 1, height: 50 }}>

					<View style={styles.checkBoxRow}>
						<View style={[{ flex: 1 }]}>
							<CheckBox
								style={styles.checkBox}
								value={item.isSelected || isSelectedAvailable}
								onValueChange={() => this.checkBoxType(item)}
							/>
						</View>
						<View style={[{ flex: 3 }]}>
							<Text style={styles.checkLabel}>
								{item.description}
							</Text>
						</View>
						<View style={[{ flex: 3 }]}>{this.showTextInput(item)}</View>
					</View>
				</View>
			</View>
		);
	};

	showTextInput(item) {
		console.log('PaymentTypes', this.props.paymentTypes);
		console.log('SelectedPaymentTypes', this.props.selectedPaymentTypes);

		if (this.props.selectedPaymentTypes.length >= 0) {

			const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);
			if (itemIndex >= 0) {

				//	if (this.props.selectedPaymentTypes[0].isSelected) {
				if (this.props.selectedPaymentTypes[itemIndex].isSelected) {
					return (
						<TextInput
							underlineColorAndroid="transparent"
							onChangeText={(textValue) => {
								console.log('textValue', textValue);
								console.log('selectedType', this.state.selectedType);

								if (this.props.selectedPaymentTypes.length >= 0) {

										const itemIndex2 = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(this.state.selectedType.id);
										let secondItemObj = this.props.selectedPaymentTypes.filter(obj => obj.id != this.state.selectedType.id).map(function (e) { return e.id });
										console.log('secondItemObj', secondItemObj);
										const seconditemIndex2 = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(secondItemObj[0]);
										console.log('seconditemIndex2', seconditemIndex2);
										if (itemIndex2 >= 0) {
											this.props.selectedPaymentTypes[itemIndex].amount = Number(textValue);
											this.props.selectedPaymentTypes[seconditemIndex2].amount = Number(this.calculateOrderDue()) - Number(textValue);
											this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[itemIndex2], amount: Number(textValue) }, itemIndex2);
											this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[seconditemIndex2], amount: Number(this.calculateOrderDue()) - Number(textValue) }, seconditemIndex2);
											
											this.setState({
												selectedType: { ...this.props.selectedPaymentTypes[itemIndex2], amount: Number(textValue) }
											});
										}
									


								}
								console.log('selectedPaymentTypes', this.props.selectedPaymentTypes);

								this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
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
							value={(this.props.selectedPaymentTypes[itemIndex].amount).toString()}
							style={[styles.cashInput]}
						/>
					);
				}
			}


		}


		// if (
		// 	this.props.parent.state.isCredit ||
		// 	this.props.parent.isPayoffOnly()
		// ) {
		// 	if (this.props.type === 'cash' && this.props.parent.state.isCash) {
		// 		return (
		// 			<TextInput
		// 				underlineColorAndroid="transparent"
		// 				onChangeText={this.valuePaymentChange
		// 				}
		// 				keyboardType="numeric"
		// 				value={this.props.value}
		// 				style={[styles.cashInput]}
		// 			/>
		// 		);
		// 	} else if (this.props.type === 'credit') {
		// 		return (
		// 			<Text style={styles.checkLabel}>{this.props.value}</Text>
		// 		);
		// 	}
		// 	//      
		// 	if (
		// 		this.props.type === 'mobile' &&
		// 		this.props.parent.state.isMobile ||
		// 		this.props.type === 'jibu-credit' &&
		// 		this.props.parent.state.isJibuCredit ||
		// 		this.props.type === 'cheque' &&
		// 		this.props.parent.state.isCheque ||
		// 		this.props.type === 'bank-transfer' &&
		// 		this.props.parent.state.isBank
		// 	) {
		// 		return (
		// 			<TextInput
		// 				underlineColorAndroid="transparent"
		// 				onChangeText={this.props.valueChange}
		// 				keyboardType="numeric"
		// 				value={this.props.value}
		// 				style={[styles.cashInput]}
		// 			/>
		// 		);
		// 	}
		// }
		// return null;
	}

	checkBoxType = (item) => {
		console.log('item', item);
		console.log('item', item.isSelected === true ? false : true);
		PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
		this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
		console.log(this.props.selectedPaymentTypes);

		if (this.props.selectedPaymentTypes.length === 0) {

			this.props.paymentTypesActions.setSelectedPaymentTypes({ ...item, isSelected: item.isSelected === true ? false : true, amount: this.calculateOrderDue() });

		} else {
			this.props.paymentTypesActions.setSelectedPaymentTypes({ ...item, isSelected: item.isSelected === true ? false : true, amount: 0 });

		}

		console.log(this.props.selectedPaymentTypes);
		this.showTextInput(item);
	};

	valuePaymentChange = textValue => {
		console.log('textValue', textValue);
		console.log('selectedType', this.state.selectedType);

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
		console.log('selectedPaymentTypes', this.props.selectedPaymentTypes);

		// if (!textValue.endsWith('.')) {
		// 	let cashValue = parseFloat(textValue);
		// 	if (isNaN(cashValue)) {
		// 		cashValue = 0;
		// 	}
		// 	if (cashValue > this.calculateOrderDue()) {
		// 		cashValue = this.calculateOrderDue();
		// 	}
		// 	let credit = this._roundToDecimal(
		// 		this.calculateOrderDue() - cashValue
		// 	);
		// 	this.updatePayment(credit, textValue);
		// } else {
		// 	this.updatePayment(
		// 		this.calculateOrderDue() - parseFloat(textValue),
		// 		textValue
		// 	);
		// }
	};


	updatePayment = (credit, textToDisplay) => {
		let payment = {
			cash: this.calculateOrderDue() - credit,
			cashToDisplay: textToDisplay,
			credit: credit,
			mobile: 0,
			jibuCredit: 0,
			bank: 0,
			cheque: 0,
		};
		if (this.state.isMobile) {
			payment = {
				mobile: this.calculateOrderDue() - credit,
				mobileToDisplay: textToDisplay,
				credit: credit,
				jibuCredit: 0,
				cash: 0,
				bank: 0,
				cheque: 0
			};
		}

		if (this.state.isJibuCredit) {
			payment = {
				jibuCredit: this.calculateOrderDue() - credit,
				jibuCreditToDisplay: textToDisplay,
				credit: credit,
				cash: 0,
				mobile: 0,
				bank: 0,
				cheque: 0
			};
		}

		if (this.state.isCheque) {
			payment = {
				cheque: this.calculateOrderDue() - credit,
				chequeToDisplay: textToDisplay,
				credit: credit,
				jibuCredit: 0,
				cash: 0,
				mobile: 0,
				bank: 0,
			};
		}

		if (this.state.isBank) {
			payment = {
				bank: this.calculateOrderDue() - credit,
				bankTranferToDisplay: textToDisplay,
				credit: credit,
				jibuCredit: 0,
				cash: 0,
				mobile: 0,
				cheque: 0
			};
		}

		console.log('payment', payment);
		this.props.orderActions.SetPayment(payment);
	};




	modalOnClose() {
		//console.log('selectedDiscounts', this.state.selectedDiscounts);
		//	console.log('itemPrice', (this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product)).toFixed(2));
		PaymentTypeRealm.resetSelected();
		// this.setState(state => {
		// 	return {
		// 		selectedDiscounts: []
		// 	};
		// });
		this.props.paymentTypesActions.setPaymentTypes(
			PaymentTypeRealm.getPaymentTypes());
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
		return CustomerTypeRealm.getCustomerTypeByName('anonymous').id ==
			customer.customerTypeId
			? true
			: false;
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
		this.setState({ isCheque: false });
		this.setState({ isBank: false });
		this.setState({ isJibuCredit: false });
		this.setState({ paymentOptions: "" });
	};

	checkBoxChangeCash = () => {
		this.setState({ isCash: !this.state.isCash });
		this.setState({ isCheque: false });
		this.setState({ isBank: false });
		this.setState({ isJibuCredit: false });
		console.log('calculateOrderDue', this.calculateOrderDue());
		this.setState({ isMobile: false }, function () {
			console.log('calculateOrderDue', this.calculateOrderDue());
			this.updatePayment(0, this.calculateOrderDue().toFixed(2));
		});
		this.setState({ paymentOptions: "" });
	};




	checkBoxChangeJibuCredit = () => {
		this.setState({ isJibuCredit: !this.state.isJibuCredit });
		this.setState({ isCheque: false });
		this.setState({ isBank: false });
		this.setState({ isCash: false });
		console.log('calculateOrderDue', this.calculateOrderDue());
		this.setState({ isMobile: false }, function () {
			console.log('calculateOrderDue', this.calculateOrderDue());
			this.updatePayment(0, this.calculateOrderDue().toFixed(2));
		});
		this.setState({ paymentOptions: "" });
	};

	checkBoxChangeCheque = () => {
		this.setState({ isCheque: !this.state.isCheque });
		this.setState({ isJibuCredit: false });
		this.setState({ isBank: false });
		this.setState({ isCash: false });
		console.log('calculateOrderDue', this.calculateOrderDue());
		this.setState({ isMobile: false }, function () {
			console.log('calculateOrderDue', this.calculateOrderDue());
			this.updatePayment(0, this.calculateOrderDue().toFixed(2));
		});
		this.setState({ paymentOptions: "" });
	};

	checkBoxChangeBank = () => {
		this.setState({ isBank: !this.state.isBank });
		this.setState({ isJibuCredit: false });
		this.setState({ isCheque: false });
		this.setState({ isCash: false });
		console.log('calculateOrderDue', this.calculateOrderDue());
		this.setState({ isMobile: false }, function () {
			console.log('calculateOrderDue', this.calculateOrderDue());
			this.updatePayment(0, this.calculateOrderDue().toFixed(2));
		});
		this.setState({ paymentOptions: "" });
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
			</View>
		);
	};




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

	isPayoffOnly() {
		return this.props.products.length === 0;
	}

	onCompleteOrder = () => {

		console.log(this.isPayoffOnly());
		console.log(this.props.payment);
		console.log(this.props.selectedCustomer);
		console.log(this.props.selectedDiscounts);
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

	formatAndSaveSale = async () => {
		let receipt = null;
		let price_total = 0;
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
				currency_code: this.props.products[0].product.priceCurrency,
				customer_account_id: this.props.selectedCustomer.customerId,
				isWalkIn: this.props.payment.isWalkIn,
				amount_cash: this.props.payment.cash,
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
			console.log(SettingRealm.getAllSetting());
			let cogs_total = 0;

			receipt.products = await this.props.products.map(product => {
				let receiptLineItem = {};
				let tempValue =
					this.getItemCogs(product.product) * product.quantity;
				receiptLineItem.price_total =
					this.getItemPrice(product.product) * product.quantity;
				receiptLineItem.quantity = product.quantity;
				receiptLineItem.product_id = product.product.productId;
				receiptLineItem.product = product.product;
				receiptLineItem.cogs_total =
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
				price_total += receiptLineItem.price_total;
				cogs_total += receiptLineItem.cogs_total;
				receiptLineItem.active = 1;
				return receiptLineItem;
			});
			receipt.total = price_total;
			receipt.cogs = cogs_total;
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

			console.log('receipt', receipt)

			await PosStorage.addSale(receipt).then(saleKey => {
				Events.trigger('NewSaleAdded', {
					key: saleKey,
					sale: receipt
				});
			});
			receipt.customer_account = this.props.selectedCustomer;
			OrderRealm.createOrder(receipt);

			console.log('check1');
			// Update dueAmount if required
			if (receipt.amount_loan > 0) {
				this.props.selectedCustomer.dueAmount += receipt.amount_loan;
				await CustomerRealm.updateCustomer(
					this.props.selectedCustomer,
					this.props.selectedCustomer.phoneNumber,
					this.props.selectedCustomer.name,
					this.props.selectedCustomer.address,
					this.props.selectedCustomer.salesChannelId,
					this.props.selectedCustomer.customerTypeId,
					this.props.selectedCustomer.frequency,
					this.props.selectedCustomer.secondPhoneNumber
				);
				console.log('check2');
			} else if (payoff > 0) {
				this.props.selectedCustomer.dueAmount -= payoff;
				await CustomerRealm.updateCustomer(
					this.props.selectedCustomer,
					this.props.selectedCustomer.phoneNumber,
					this.props.selectedCustomer.name,
					this.props.selectedCustomer.address,
					this.props.selectedCustomer.salesChannelId,
					this.props.selectedCustomer.customerTypeId,
					this.props.selectedCustomer.frequency,
					this.props.selectedCustomer.secondPhoneNumber
				);
				console.log('check3');
			}
			console.log('check4');
		} else {
			if (payoff > 0) {
				this.props.selectedCustomer.dueAmount -= payoff;
				await CustomerRealm.updateCustomer(
					this.props.selectedCustomer,
					this.props.selectedCustomer.phoneNumber,
					this.props.selectedCustomer.name,
					this.props.selectedCustomer.address,
					this.props.selectedCustomer.salesChannelId,
					this.props.selectedCustomer.customerTypeId,
					this.props.selectedCustomer.frequency,
					this.props.selectedCustomer.secondPhoneNumber
				);
			}
		}
		return true;
	};

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
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		selectedPaymentTypes: state.paymentTypesReducer.selectedPaymentTypes,
		selectedDiscounts: state.orderReducer.discounts,
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
		customerActions: bindActionCreators(CustomerActions, dispatch),
		paymentTypesActions: bindActionCreators(PaymentTypesActions, dispatch)
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
