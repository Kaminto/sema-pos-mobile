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

import SelectedCustomerDetails from './CustomerDetailSubHeader';

import i18n from '../app/i18n';
import moment from 'moment-timezone';

class ReceiptLineItem extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					marginBottom: 10,
					marginTop: 10
				}}>
				<Image
					source={{ uri: this.getImage(this.props.item.product) }}
					style={[styles.productImage, { flex: .1 }]}
				/>
				<View style={{ justifyContent: 'space-around', flex: .6 }}>
					<View style={styles.itemData}>
						<Text style={[styles.label, { fontSize: 15 }]}>{this.props.item.product.description}</Text>
					</View>
					<View style={styles.itemData}>
						<Text style={[styles.label, { fontSize: 16 }]}>{this.props.item.quantity} </Text>
					</View>
				</View>
				<View style={[styles.itemData, { flex: .3 }]}>
					<Text style={[styles.label, { fontSize: 15, padding: 10 }]}>{this.props.item.currency_code.toUpperCase()} {this.props.item.price_total}</Text>
				</View>
			</View>
		);
	}

	// We'll keep this feature for later
	onDeleteReceiptLineItem(receiptIndex, item) {
		return () => {
			Alert.alert(
				'Confirm Receipt Line Item Deletion',
				'Are you sure you want to delete this receipt line item? (this cannot be undone)',
				[
					{
						text: i18n.t('no'),
						onPress: () => console.log('Cancel Pressed'),
						style: 'cancel'
					},
					{
						text: i18n.t('yes'),
						onPress: () => {
							this.deleteReceiptLineItem(
								receiptIndex,
								this.props.lineItemIndex,
								{ active: false, updated: true }
							);
						}
					}
				],
				{ cancelable: true }
			);
		};
	}

	deleteReceiptLineItem(receiptIndex, receiptLineItemIndex, updatedFields) {
		this.props.receiptActions.updateReceiptLineItem(
			receiptIndex,
			receiptLineItemIndex,
			updatedFields
		);
		PosStorage.saveRemoteReceipts(this.props.receipts);
		this.props.handleUpdate();
	}

	getImage = item => {
		const productImage =
			item.base64encodedImage ||
			this.props.products.reduce((image, product) => {
				if (product.productId === item.id)
					return product.base64encodedImage;
				return image;
			}, '');

		if (productImage.startsWith('data:image')) {
			return productImage;
		} else {
			return 'data:image/png;base64,' + productImage;
		}
	};
}

class PaymentTypeItem extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					marginBottom: 5,
					marginTop: 5
				}}>
					<View style={[styles.itemData, {flex: 3}]}>
						<Text style={[styles.label, { fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold' }]}>{this.props.item.name}</Text>
					</View>
					<View style={[styles.itemData, {flex: 1}]}>
						<Text style={[styles.label, { fontSize: 15, fontWeight: 'bold'}]}>{this.props.item.amount} </Text>
					</View>

			</View>
		);
	}
}

class CustomerDetails extends Component {
	constructor(props) {
		super(props);

		this.state = {
			refresh: false,
			topup: "",
			searchString: '',
			hasScrolled: false,
			selected: this.prepareData()[0],
		};


	}
	componentDidMount() {
		console.log(
			'CustomerDetails:componentDidMount - filter: ' + this.props.filter
		);
		Events.on(
			'ScrollCustomerTo',
			'customerId1',
			this.onScrollCustomerTo.bind(this)
		);
	}
	componentWillUnmount() {
		this.props.customerActions.CustomerSelected({});
		this.props.customerActions.setCustomerEditStatus(false);
		Events.rm('ScrollCustomerTo', 'customerId1');
	}

	setSelected(item) {
		this.setState({ selected: item });
	}

	onScrollCustomerTo(data) {
		console.log('onScrollCustomerTo');
		// Commented onto scrollToItem requires getItemLayout and getItemLayout fails with
		// searches. Expect since not all items are rendered on sea
		// this.flatListRef.scrollToItem({animated: false, item: data.customer, viewPosition:0.5});
	}
	getItemLayout = (data, index) => ({
		length: 50,
		offset: 50 * index,
		index
	});

	shouldComponentUpdate(nextProps, nextState) {
		console.log('onScrollCustomerTo');
		return true;
	}


	render() {
		return (
			<View style={{ flex: 1, backgroundColor: '#fff', flexDirection: 'column' }}>

				 	{/* <View style={[styles.leftToolbar]}> */}
						<SelectedCustomerDetails
							paymentTypesActions={this.props.paymentTypesActions}
							creditSales={this.customerCreditPaymentTypeReceipts()}
							navigation={this.props.navigation}
							topupTotal={this.totalTopUp()}
							selectedCustomer={this.props.selectedCustomer}
						/>
				{/* </View> */}

				{this.getTransactionDetail()}
			</View>
		);
		return null;
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


	compareLoanPaymentTypes() {
		let receiptsPaymentTypes = [...this.props.receiptsPaymentTypes];
		let paymentTypes = [...this.props.paymentTypes];

		let finalreceiptsPaymentTypes = [];

		for (let receiptsPaymentType of receiptsPaymentTypes) {
			const rpIndex = paymentTypes.map(function (e) { return e.id }).indexOf(receiptsPaymentType.payment_type_id);
			if (rpIndex >= 0) {
				if (paymentTypes[rpIndex].name === 'loan') {
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

	getTransactionDetail() {
		if (this.state.selected) {
			return (

				<View style={{ flex: .75, flexDirection: 'row', paddingTop: 20, width: '80%', alignSelf:'center'}}>
					<View style={{ flex: .3, backgroundColor: '#f1f1f1', borderRightWidth: 4, borderRightColor: '#CCC' }}>
						<FlatList
							data={this.prepareData()}
							renderItem={this.renderReceipt.bind(this)}
							keyExtractor={(item, index) => item.id}
							ItemSeparatorComponent={this.renderSeparator}
							extraData={this.state.refresh}
						/>
					</View>

					<View style={{ flex: .7, backgroundColor: '#fff' }}>
						<ScrollView>
							<TransactionDetail
								item={this.state.selected}
								products={this.props.products}
								receiptActions={this.props.receiptActions}
								remoteReceipts={this.props.receipts}
								paymentTypes={this.props.receiptsPaymentTypes}
							/>
						</ScrollView>
					</View>
				</View>
			);
		} else {
			return (
				<View style={{ flex: .75, flexDirection: 'row', width: '90%', alignSelf:'center' }}>
					<Text style={{ fontSize: 20, fontWeight: 'bold', alignSelf: "center", justifyContent: "center" }}>Record this customer's sales.</Text>
				</View>
			);
		}
	}

	prepareData() {
		// Used for enumerating receipts
		//console.log("here selectedCustomer", this.props.selectedCustomer);

		if (this.props.receipts.length > 0) {
			const totalCount = this.props.receipts.length;

			let salesLogs = [...new Set(this.props.receipts)];
			let remoteReceipts = salesLogs.map((receipt, index) => {
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


	renderSeparator() {
		return (
			<View
				style={{
					height: 1,
					backgroundColor: '#ddd',
					width: '100%'
				}}
			/>
		);
	}

	handleUpdate() {
		this.setState({
			refresh: !this.state.refresh
		});
	}

	onDeleteReceipt(item) {
		return () => {
			if (!item.active) {
				return ToastAndroid.show(
					'Receipt already deleted',
					ToastAndroid.SHORT
				);
			}

			Alert.alert(
				'Confirm Receipt Deletion',
				'Are you sure you want to delete this receipt? (this cannot be undone)',
				[
					{
						text: i18n.t('no'),
						onPress: () => console.log('Cancel Pressed'),
						style: 'cancel'
					},
					{
						text: i18n.t('yes'),
						onPress: () => {
							this.deleteReceipt(item, {
								active: 0,
								updated: true
							});
						}
					}
				],
				{ cancelable: true }
			);
		};
	}

	deleteReceipt(item, updatedFields) {
		this.props.receiptActions.updateRemoteReceipt(
			item.index,
			updatedFields
		);

		PosStorage.updateLoggedReceipt(item.id, updatedFields);

		PosStorage.updatePendingSale(item.id);

		// Take care of customer due amount
		if (item.amountLoan) {
			item.customerAccount.dueAmount -= item.amountLoan;

			CustomerRealm.updateCustomer(
				item.customerAccount,
				item.customerAccount.phoneNumber,
				item.customerAccount.name,
				item.customerAccount.address,
				item.customerAccount.salesChannelId,
				item.customerAccount.customerTypeId,
				item.customerAccount.frequency,
				item.customerAccount.secondPhoneNumber
			);
		}

		this.setState({ refresh: !this.state.refresh });
	}

	renderReceipt({ item, index }) {

		return (
			<TouchableNativeFeedback onPress={() => this.setSelected(item)}>
			<View key={index} style={{ padding: 15 }}>
			<View style={styles.label}>
				<Text>
					{moment
						.tz(item.createdAt, moment.tz.guess())
						.format('dddd Do MMMM YYYY')}
				</Text>
			</View>
			<Text style={styles.customername}>
			{item.currency.toUpperCase()} {item.totalAmount}
			</Text>
			<View style={styles.itemData}>
				<Text style={styles.customername}>{item.customerAccount.name}</Text>
			</View>
			</View>
			</TouchableNativeFeedback>
		);
	}

	showHeader = () => {
		console.log('Displaying header');
		return (
			<View
				style={[
					{
						flex: 1,
						flexDirection: 'row',
						height: 50,
						alignItems: 'center'
					},
					styles.headerBackground
				]}>
				<View style={[{ flex: 2 }]}>
					<Text style={[styles.headerItem, styles.leftMargin]}>
						{i18n.t('product')}
					</Text>
				</View>
				<View style={[{ flex: 1.5 }]}>
					<Text style={[styles.headerItem]}>
						{i18n.t('quantity')}
					</Text>
				</View>
				<View style={[{ flex: 1.5 }]}>
					<Text style={[styles.headerItem]}>
						{i18n.t('unitPrice')}
					</Text>
				</View>
			</View>
		);
	};

	comparePaymentTypeReceipts() {
		let receiptsPaymentTypes = [...this.comparePaymentTypes()];
		let customerReceipts = [...this.props.receipts];
		let finalCustomerReceiptsPaymentTypes = [];
		for (let customerReceipt of customerReceipts) {
			let paymentTypes = [];
			for (let receiptsPaymentType of receiptsPaymentTypes) {
				if (receiptsPaymentType.receipt_id === customerReceipt.receiptId) {
					paymentTypes.push(receiptsPaymentType);
				}
			}
			customerReceipt.paymentTypes = paymentTypes;
			finalCustomerReceiptsPaymentTypes.push(customerReceipt);

		}
		return finalCustomerReceiptsPaymentTypes;
	}

	comparePaymentTypes() {
		let receiptsPaymentTypes = [...this.props.receiptsPaymentTypes];
		let paymentTypes = [...this.props.paymentTypes];

		let finalreceiptsPaymentTypes = [];

		for (let receiptsPaymentType of receiptsPaymentTypes) {
			const rpIndex = paymentTypes.map(function (e) { return e.id }).indexOf(receiptsPaymentType.payment_type_id);
			if (rpIndex >= 0) {
				receiptsPaymentType.name = paymentTypes[rpIndex].name;
				finalreceiptsPaymentTypes.push(receiptsPaymentType);

			}
		}
		return finalreceiptsPaymentTypes;
	}

}

class TransactionDetail extends Component {
	constructor(props) {
		super(props);

		this.state = {
			refresh: false,
		};
	}

	handleUpdate() {
		this.setState({
			refresh: !this.state.refresh
		});
	}

	onDeleteReceipt(item) {
		return () => {
			if (!item.active) {
				return ToastAndroid.show(
					'Receipt already deleted',
					ToastAndroid.SHORT
				);
			}

			Alert.alert(
				'Confirm Receipt Deletion',
				'Are you sure you want to delete this receipt? (this cannot be undone)',
				[
					{
						text: i18n.t('no'),
						onPress: () => console.log('Cancel Pressed'),
						style: 'cancel'
					},
					{
						text: i18n.t('yes'),
						onPress: () => {
							this.deleteReceipt(item, {
								active: 0,
								updated: true
							});
						}
					}
				],
				{ cancelable: true }
			);
		};
	}

	deleteReceipt(item, updatedFields) {
		this.props.receiptActions.updateRemoteReceipt(
			item.index,
			updatedFields
		);

		PosStorage.updateLoggedReceipt(item.id, updatedFields);

		PosStorage.updatePendingSale(item.id);

		// Take care of customer due amount
		if (item.amountLoan) {
			item.customerAccount.dueAmount -= item.amountLoan;

			CustomerRealm.updateCustomer(
				item.customerAccount,
				item.customerAccount.phoneNumber,
				item.customerAccount.name,
				item.customerAccount.address,
				item.customerAccount.salesChannelId,
				item.customerAccount.customerTypeId,
				item.customerAccount.frequency,
				item.customerAccount.secondPhoneNumber
			);
		}

		this.setState({ refresh: !this.state.refresh });
	}

	render() {
		const receiptLineItems = this.props.item.receiptLineItems.map((lineItem, idx) => {
			return (
				<ReceiptLineItem
					receiptActions={this.props.receiptActions}
					remoteReceipts={this.props.receipts}
					item={lineItem}
					key={lineItem.id}
					lineItemIndex={idx}
					products={this.props.products}
					handleUpdate={this.handleUpdate.bind(this)}
					receiptIndex={this.props.item.index}
				/>
			);
		});

		const paymentTypes = this.props.item.paymentTypes.map((paymentItem, idx) => {
				return (

					<PaymentTypeItem
					 item={paymentItem}
					/>
				);
			});


		return (
			<View style={{ padding: 15 }}>
				<View style={styles.deleteButtonContainer}>
					<TouchableOpacity
						onPress={this.onDeleteReceipt(this.props.item)}
						style={[
							styles.receiptDeleteButton,
							{ backgroundColor: this.props.item.active ? 'red' : 'grey' }
						]}>
						<Text style={styles.receiptDeleteButtonText}>X</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.itemData}>
					<Text style={styles.customername}>{this.props.item.customerAccount.name}</Text>
				</View>
				<View style={styles.itemData}>
					<Text>
						{moment
							.tz(this.props.item.createdAt, moment.tz.guess())
							.format('dddd Do MMMM YYYY')}
					</Text>
				</View>
				<View>

				</View>
				<View style={styles.receiptStats}>
					{!this.props.item.active && (
						<Text style={styles.receiptStatusText}>
							{'Deleted'.toUpperCase()}
						</Text>
					)}
					{this.props.item.isLocal || this.props.item.updated ? (
						<View style={{ flexDirection: 'row' }}>
							{!this.props.item.active && <Text> - </Text>}
							<Text style={styles.receiptPendingText}>
								{'Pending'.toLowerCase()}
							</Text>
						</View>
					) : (
							<View style={{ flexDirection: 'row' }}>
								{!this.props.item.active && <Text> - </Text>}
								<Text style={styles.receiptSyncedText}>
									{'Synced'.toLowerCase()}
								</Text>
							</View>
						)}
				</View>
				<View>
					<Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>PAYMENT</Text>
				</View>

				{paymentTypes}

				<View>
					<Text style={{ fontSize: 16, fontWeight: "bold" }}>PRODUCTS</Text>
				</View>

				{receiptLineItems}

				<View style={{ flex: 1, marginTop: 20, flexDirection: 'row', fontWeight: 'bold' }}>
					<Text style={[styles.customername, { flex: .7, fontWeight: 'bold' }]}>TOTAL </Text>
					<Text style={[styles.customername, { flex: .3, fontWeight: 'bold' }]}>
						{this.props.item.currency.toUpperCase()} {this.props.item.totalAmount}
					</Text>
				</View>
			</View>
		)
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
)(CustomerDetails);

const styles = StyleSheet.create({
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
