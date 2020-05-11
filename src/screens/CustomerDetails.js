import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	TouchableNativeFeedback,
	Alert,
	ToastAndroid,
	ScrollView,
	SectionList,
	SafeAreaView,
	RefreshControl
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Events from 'react-native-simple-events';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomerRealm from '../database/customers/customer.operations';
import SettingRealm from '../database/settings/settings.operations';
import * as PaymentTypesActions from "../actions/PaymentTypesActions";

import * as CustomerActions from '../actions/CustomerActions';
import * as TopUpActions from '../actions/TopUpActions';
import * as receiptActions from '../actions/ReceiptActions';

import SelectedCustomerDetails from './CustomerDetailSubHeader';

    
import CreditRealm from '../database/credit/credit.operations';
import CustomerDebtRealm from '../database/customer_debt/customer_debt.operations';

import i18n from '../app/i18n';

import { format, parseISO, isBefore } from 'date-fns';

class ReceiptLineItem extends React.PureComponent {
	constructor(props) {
		super(props);
	};

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
				<View style={{ justifyContent: 'space-around', flex: .65 }}>
					<View style={styles.itemData}>
						<Text style={[styles.label, { fontSize: 15 }]}>{this.props.item.product.description}</Text>
					</View>
					<View style={styles.itemData}>
						<Text style={[styles.label, { fontSize: 16 }]}>{this.props.item.quantity} </Text>
					</View>
				</View>
				<View style={[styles.itemData, { flex: .25, alignSelf: 'flex-end' }]}>
					<Text style={[styles.label, { fontSize: 15, padding: 10, textAlign: 'right' }]}>{this.getCurrency().toUpperCase()} {this.props.item.totalAmount ? this.props.item.totalAmount : this.props.item.price_total}</Text>
				</View>
			</View>
		);
	}

	getCurrency = () => {
		let settings = SettingRealm.getAllSetting();
		return settings.currency;
	};


	getImage = item => {
		const productImage =
			item.base64encodedImage || item.base64encoded_image ||
			this.props.products.reduce((image, product) => {
				if (product.productId === item.product_id)
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

class PaymentTypeItem extends React.PureComponent {
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

				<View style={[styles.itemData, { flex: 3 }]}>
					<Icon name={`md-cash`} size={25} color="#808080" />
					<Text style={[styles.label, { paddingLeft: 10, fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold' }]}>
						{this.props.item.name == 'credit' ? 'Wallet' : this.props.item.name}</Text>
				</View>
				<View style={[styles.itemData, { flex: 1 }]}>
					<Text style={[styles.label, { fontSize: 15, fontWeight: 'bold', alignItems: 'flex-end', textAlign: 'right' }]}>{this.getCurrency().toUpperCase()} {this.props.item.amount} </Text>
				</View>

			</View>
		);
	}

	getCurrency = () => {
		let settings = SettingRealm.getAllSetting();
		return settings.currency;
	};
}

class TransactionDetail extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			refresh: false
		};
	}

	handleUpdate() {
		this.setState({
			refresh: !this.state.refresh
		});
	}

	onDeleteReceipt(item) {
		//console.log('item-r', item);
		return () => {
			if (item.is_delete === 0) {
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
							this.deleteReceipt(item);
							this.setState({ refresh: !this.state.refresh });
						}
					}
				],
				{ cancelable: true }
			);
		};
	}


	onTopupCreditDelete(item) {
		return () => {

			if (!item.active) {
				return ToastAndroid.show(
					`${item.type} already deleted`,
					ToastAndroid.SHORT
				);
			}

			Alert.alert(
				`Confirm ${item.type}  Deletion`,
				`Are you sure you want to delete this ${item.type}? (this cannot be undone)`,
				[
					{
						text: i18n.t('no'),
						onPress: () => console.log('Cancel Pressed'),
						style: 'cancel'
					},
					{
						text: i18n.t('yes'),
						onPress: () => {
							this.deleteReceipt(item);
							this.setState({ refresh: !this.state.refresh });
						}
					}
				],
				{ cancelable: true }
			);
		};
	}

	deleteReceipt(item) {

		if (item.isReceipt) {
			OrderRealm.softDeleteOrder(item);
			const loanIndex = item.paymentTypes.map(function (e) { return e.name }).indexOf("loan");
			if (loanIndex >= 0) {
				item.customerAccount.dueAmount = Number(item.customerAccount.dueAmount) - Number(this.props.selectedPaymentTypes[loanIndex].amount);
				CustomerRealm.updateCustomerDueAmount(
					item.customerAccount,
					item.customerAccount.dueAmount
				);
				this.props.customerActions.CustomerSelected(this.props.selectedCustomer);
				this.props.customerActions.setCustomers(
					CustomerRealm.getAllCustomer()
				);
			}
			this.props.receiptActions.setReceipts(
				OrderRealm.getAllOrder()
			);
		}


		if (item.isDebt) {
			item.customerAccount.dueAmount = Number(item.customerAccount.dueAmount) + Number(item.totalAmount);
			CustomerRealm.updateCustomerDueAmount(
				item.customerAccount,
				item.customerAccount.dueAmount
			);
			CustomerDebtRealm.softDeleteCustomerDebt(item);
			this.props.customerActions.setCustomers(
				CustomerRealm.getAllCustomer()
			);
			this.props.paymentTypesActions.setCustomerPaidDebt(
				CustomerDebtRealm.getCustomerDebts()
			);
		}

		if (item.isTopUp) {
			item.customerAccount.walletBalance = Number(item.customerAccount.walletBalance) - Number(item.totalAmount);
			CustomerRealm.updateCustomerWalletBalance(
				item.customerAccount,
				item.customerAccount.walletBalance
			);
			CreditRealm.softDeleteCredit(item);
			this.props.customerActions.setCustomers(
				CustomerRealm.getAllCustomer()
			);
			this.props.topUpActions.setTopups(
				CreditRealm.getAllCredit()
			);
		}


	}

	getCurrency = () => {
		let settings = SettingRealm.getAllSetting();
		return settings.currency;
	};


	renderTopUp = (item) => {

		if (item.isTopUp) {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						marginTop: 10
					}}>
					<View style={{ flex: 1 }}>

						{/* <View>
							<Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>Top Up</Text>
						</View> */}

						<View
							style={{
								flex: 1,
								flexDirection: 'row',

							}}>
							<View style={[styles.itemData, { flex: 3 }]}>
								<Text style={[styles.label, { fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold' }]}>
									{'Top Up Amount'}</Text>

							</View>
							<View style={[styles.itemData, { flex: 1 }]}>
								<Text style={[styles.label, { fontSize: 15, fontWeight: 'bold', alignItems: 'flex-end', textAlign: 'right' }]}>{this.getCurrency().toUpperCase()} {item.topUp.topup} </Text>
							</View>
						</View>


						{/* <View
							style={{
								flex: 1,
								flexDirection: 'row',
								marginBottom: 5,
								marginTop: 5
							}}>
							<View style={[styles.itemData, { flex: 3 }]}>
								<Text style={[styles.label, { fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold' }]}>
									Wallet Balance</Text>

							</View>
							<View style={[styles.itemData, { flex: 1 }]}>
								<Text style={[styles.label, { fontSize: 15, fontWeight: 'bold', alignItems: 'flex-end', textAlign: 'right' }]}>{this.getCurrency().toUpperCase()} {item.topUp.balance} </Text>
							</View>
						</View> */}
					</View>
				</View>

			)
		} else {
			return (
				<View style={{ flex: 1 }}>
				</View>
			)
		}
	}

	renderDebt = (item) => {

		if (item.isDebt) {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						marginTop: 10
					}}>
					<View style={{ flex: 1 }}>

						{/* <View>
							<Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>Loan Cleared</Text>
						</View> */}

						<View
							style={{
								flex: 1,
								flexDirection: 'row'
							}}>
							<View style={[styles.itemData, { flex: 3 }]}>
								<Text style={[styles.label, { fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold' }]}>
									{'Loan Cleared'}</Text>

							</View>
							<View style={[styles.itemData, { flex: 1 }]}>
								<Text style={[styles.label, { fontSize: 15, fontWeight: 'bold', alignItems: 'flex-end', textAlign: 'right' }]}>{this.getCurrency().toUpperCase()} {item.debt.due_amount} </Text>
							</View>
						</View>


						{/* <View
							style={{
								flex: 1,
								flexDirection: 'row',
								marginBottom: 5,
								marginTop: 5
							}}>
							<View style={[styles.itemData, { flex: 3 }]}>
								<Text style={[styles.label, { fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold' }]}>
									Balance</Text>

							</View>
							<View style={[styles.itemData, { flex: 1 }]}>
								<Text style={[styles.label, { fontSize: 15, fontWeight: 'bold', alignItems: 'flex-end', textAlign: 'right' }]}>{this.getCurrency().toUpperCase()} {item.debt.balance} </Text>
							</View>
						</View> */}
					</View>
				</View>

			)
		} else {
			return (
				<View style={{ flex: 1 }}>
				</View>
			)
		}
	}

	render() {
		var receiptLineItems;
		var paymentTypes;
		var credit;
		var debt;

		if (this.props.item.isReceipt) {

			if (this.props.item.receiptLineItems !== undefined) {
				receiptLineItems = this.props.item.receiptLineItems.map((lineItem, idx) => {
					return (
						<ReceiptLineItem
							receiptActions={this.props.receiptActions}
							remoteReceipts={this.props.receipts}
							item={lineItem}
							key={lineItem.receiptId + idx}
							lineItemIndex={idx}
							products={this.props.products}
							handleUpdate={this.handleUpdate.bind(this)}
							receiptIndex={this.props.item.index}
						/>
					);
				});
			} else {
				receiptLineItems = {};
			}

			if (this.props.item.paymentTypes !== undefined) {
				paymentTypes = this.props.item.paymentTypes.map((paymentItem, idx) => {
					return (

						<PaymentTypeItem
							key={paymentItem.id + idx}
							item={paymentItem}
							lineItemIndex={idx}
						/>
					);
				});
			} else {
				paymentTypes = {};
			}

			if (this.props.item.hasOwnProperty("customerAccount")) {
				return (
					<View style={{ flex: 1, padding: 15 }}>
						<ScrollView style={{ flex: 1 }}>
							<View style={styles.deleteButtonContainer}>
								<TouchableOpacity
									onPress={this.onDeleteReceipt(this.props.item)}
									style={[
										styles.receiptDeleteButton,
										{ backgroundColor: (this.props.item.is_delete != 0) ? 'red' : 'grey' }
									]}>
									<Text style={styles.receiptDeleteButtonText}>X</Text>
								</TouchableOpacity>
							</View>
							<View style={styles.itemData}>
								<Text style={styles.customername}>{this.props.item.customerAccount.name}</Text>
							</View>
							<Text>
								{format(parseISO(this.props.item.createdAt), 'iiii d MMM yyyy')}
							</Text>
							<View>

							</View>
							<View style={styles.receiptStats}>
								{this.props.item.is_delete === 0 && (
									<Text style={styles.receiptStatusText}>
										{'Deleted -'.toUpperCase()}
									</Text>
								)}
								{!this.props.item.active ? (
									<View style={{ flexDirection: 'row' }}>
										<Text style={styles.receiptPendingText}>
											{' Pending'.toUpperCase()}
										</Text>
									</View>
								) : (
										<View style={{ flexDirection: 'row' }}>
											{!this.props.item.active && <Text> - </Text>}
											<Text style={styles.receiptSyncedText}>
												{' Synced'.toUpperCase()}
											</Text>
										</View>
									)}
							</View>
							<View>
								<Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>PAYMENT</Text>
							</View>

							{paymentTypes}

							<View>
								<Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>PRODUCTS</Text>
							</View>

							{receiptLineItems}

							<View style={{ flex: 1, marginTop: 20, flexDirection: 'row', fontWeight: 'bold' }}>
								<Text style={[styles.customername, { flex: 3, fontWeight: 'bold' }]}>Items Purchased</Text>
								<Text style={[styles.customername, { flex: 1, fontWeight: 'bold', paddingRight: 20, alignSelf: 'flex-end' }]}>
									{this.getCurrency().toUpperCase()} {this.props.item.totalAmount ? this.props.item.totalAmount : this.props.item.price_total}
								</Text>
							</View>

							{this.renderTopUp(this.props.item)}

							{this.renderDebt(this.props.item)}

						</ScrollView>
					</View>
				)
			} else {
				return (
					<View style={{ flex: 1 }}>
					</View>
				)
			}

		} else {
			return (
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						marginBottom: 5,
						marginTop: 5
					}}>
					<View style={{ flex: 1, padding: 15 }}>
						<ScrollView style={{ flex: 1 }}>
							<View style={styles.deleteButtonContainer}>
								<TouchableOpacity
									onPress={this.onTopupCreditDelete(this.props.item)}
									style={[
										styles.receiptDeleteButton,
										{ backgroundColor: (this.props.item.active) ? 'red' : 'grey' }
									]}>
									<Text style={styles.receiptDeleteButtonText}>X</Text>
								</TouchableOpacity>
							</View>
							<View style={styles.itemData}>
								<Text style={styles.customername}>{this.props.item.customerAccount.name}</Text>
							</View>
							<Text>
								{format(parseISO(this.props.item.createdAt), 'iiii d MMM yyyy')}
							</Text>
							<View>

							</View>
							<View style={styles.receiptStats}>
								{!this.props.item.active && (
									<Text style={styles.receiptStatusText}>
										{'Deleted -'.toUpperCase()}
									</Text>
								)}
								{!this.props.item.synched ? (
									<View style={{ flexDirection: 'row' }}>
										<Text style={styles.receiptPendingText}>
											{' Pending'.toUpperCase()}
										</Text>
									</View>
								) : (
										<View style={{ flexDirection: 'row' }}>
											{!this.props.item.synched && <Text> - </Text>}
											<Text style={styles.receiptSyncedText}>
												{' Synced'.toUpperCase()}
											</Text>
										</View>
									)}
							</View>
							<View>
								<Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>Amount</Text>
							</View>

							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginBottom: 5,
									marginTop: 5
								}}>
								<View style={[styles.itemData, { flex: 3 }]}>
									<Text style={[styles.label, { fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold' }]}>
										{this.props.item.type}</Text>

								</View>
								<View style={[styles.itemData, { flex: 1 }]}>
									<Text style={[styles.label, { fontSize: 15, fontWeight: 'bold', alignItems: 'flex-end', textAlign: 'right' }]}>{this.getCurrency().toUpperCase()} {this.props.item.totalAmount} </Text>
								</View>
							</View>


							<View
								style={{
									flex: 1,
									flexDirection: 'row',
									marginBottom: 5,
									marginTop: 5
								}}>
								<View style={[styles.itemData, { flex: 3 }]}>
									<Text style={[styles.label, { fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold' }]}>
										Balance</Text>

								</View>
								<View style={[styles.itemData, { flex: 1 }]}>
									<Text style={[styles.label, { fontSize: 15, fontWeight: 'bold', alignItems: 'flex-end', textAlign: 'right' }]}>{this.getCurrency().toUpperCase()} {this.props.item.balance} </Text>
								</View>
							</View>



							{/* <View>
								<Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>PRODUCTS</Text>
							</View>

							{receiptLineItems}

							<View style={{ flex: 1, marginTop: 20, flexDirection: 'row', fontWeight: 'bold' }}>
								<Text style={[styles.customername, { flex: .7, fontWeight: 'bold' }]}>TOTAL AMOUNT</Text>
								<Text style={[styles.customername, { flex: .3, fontWeight: 'bold', paddingRight: 20, alignSelf: 'flex-end' }]}>
									{this.getCurrency().toUpperCase()} {this.props.item.totalAmount ? this.props.item.totalAmount : this.props.item.price_total}
								</Text>
							</View> */}
						</ScrollView>
					</View>



				</View>


			)
		}

	}

}
class CustomerDetails extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			refresh: false,
			topup: "",
			searchString: '',
			hasScrolled: false,
			selected: this.prepareSectionedData().length > 0 ? this.prepareSectionedData()[0].data[0] : {},
		};


	}
	componentDidMount() {
		Events.on(
			'ScrollCustomerTo',
			'customerId1',
			this.onScrollCustomerTo.bind(this)
		);
	}
	componentWillUnmount() {
		// this.props.customerActions.CustomerSelected({});
		this.props.customerActions.setCustomerEditStatus(false);
		Events.rm('ScrollCustomerTo', 'customerId1');
	}

	setSelected(item) {
		this.setState({ selected: item });
	}

	onScrollCustomerTo(data) {

	}
	getItemLayout = (data, index) => ({
		length: 50,
		offset: 50 * index,
		index
	});

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: '#fff', flexDirection: 'column' }}>
				<SelectedCustomerDetails
					paymentTypesActions={this.props.paymentTypesActions}
					creditSales={this.customerCreditPaymentTypeReceipts()}
					navigation={this.props.navigation}
					topupTotal={this.totalTopUp()}
					selectedCustomer={this.props.selectedCustomer}
				/>

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
					createdAt: topup.created_at,
					topUpId: topup.topUpId,
					customer_account_id: topup.customer_account_id,
					total: topup.total,
					topup: topup.topup,
					balance: topup.balance,
					totalCount
				};
			});

			topups.sort((a, b) => {
				return isBefore(new Date(new Date(a.createdAt)), new Date(new Date(b.createdAt)))
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
				return isBefore(new Date(new Date(a.createdAt)), new Date(new Date(b.createdAt)))
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
				<View style={{ flex: 1, flexDirection: 'row',marginLeft: 20, }}>
					<View style={{ flex: 1, backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#CCC' }}>
						<SafeAreaView style={styles.container}>
							<ScrollView
								style={{ flex: 1 }}
								refreshControl={
									<RefreshControl
										refreshing={this.state.refreshing}
										onRefresh={this._onRefresh}
									/>
								}>
								<SectionList
									extraData={this.state.refreshing}
									ItemSeparatorComponent={this.renderSeparator}
									sections={this.prepareSectionedData()}
									keyExtractor={(item, index) => item + index}
									renderItem={this.renderReceipt.bind(this)}
									renderSectionHeader={({ section: { title } }) => (
										<Text style={styles.sectionTitle}>{title}</Text>
									)}
								/>
							</ScrollView>
						</SafeAreaView>
					</View>

					<View style={{ flex: 2, backgroundColor: '#fff', paddingLeft: 20 }}>
						<TransactionDetail
							// key={}
							item={this.state.selected}
							products={this.props.products}
							customerActions={this.props.customerActions}
							paymentTypesActions={this.props.paymentTypesActions}
							topUpActions={this.props.topUpActions}							
							receiptActions={this.props.receiptActions}
							receipts={this.props.receipts}
							paymentTypes={this.props.receiptsPaymentTypes}
						/>
					</View>
				</View>

			);
		} else {
			return (
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<Text style={{ fontSize: 20, fontWeight: 'bold', alignSelf: "center", alignContent: "center", padding: 20 }}>Record customers sales.</Text>

				</View>
			);
		}
	}

 

	prepareData() {
		// Used for enumerating receipts
		const totalCount = this.props.receipts.length;

		let receipts = this.comparePaymentTypeReceipts().map((receipt, index) => {
			return {
				active: receipt.active,
				synched: receipt.synched,
				id: receipt.id,
				receiptId: receipt.id,
				createdAt: receipt.created_at,
				topUp: CreditRealm.getCreditByRecieptId(receipt.id),
				debt: CustomerDebtRealm.getCustomerDebtByRecieptId(receipt.id),
				isDebt: CustomerDebtRealm.getCustomerDebtByRecieptId(receipt.id) === undefined ? false : true,
				isTopUp: CreditRealm.getCreditByRecieptId(receipt.id) === undefined ? false : true,
				sectiontitle: format(parseISO(receipt.created_at), 'iiii d MMM yyyy'),
				customerAccount: receipt.customer_account,
				receiptLineItems: receipt.receipt_line_items,
				paymentTypes: receipt.paymentTypes,
				isLocal: receipt.isLocal || false,
				key: receipt.isLocal ? receipt.key : null,
				index,
				updated: receipt.updated,
				is_delete: receipt.is_delete,
				amountLoan: receipt.amount_loan,
				totalCount,
				currency: receipt.currency_code,
				isReceipt: true,
				type: 'Receipt',
				totalAmount: receipt.total
			};
		});

		receipts.sort((a, b) => {
			return isBefore(new Date(a.createdAt), new Date(b.createdAt))
				? 1
				: -1;
		});
	//
	
	//console.log(receipts);

		return [...receipts.filter(r => r.customerAccount.customerId === this.props.selectedCustomer.customerId)];
	}

	prepareCustomerDebt() {
		let debtArray = CustomerDebtRealm.getCustomerDebtsTransactions();
		const totalCount = debtArray.length;

		let debtPayment = debtArray.map((receipt, index) => {
			return {
				active: receipt.active,
				synched: receipt.synched,
				id: receipt.customer_debt_id,
				customer_debt_id: receipt.customer_debt_id,
				receiptId: receipt.receipt_id,
				createdAt: receipt.created_at,
				sectiontitle: format(parseISO(receipt.created_at), 'iiii d MMM yyyy'),
				customerAccount: CustomerRealm.getCustomerById(receipt.customer_account_id) ? CustomerRealm.getCustomerById(receipt.customer_account_id) : receipt.customer_account_id,
				customer_account_id: receipt.customer_account_id,
				receiptLineItems: undefined,
				paymentTypes: undefined,
				description: [{ amount: receipt.due_amount, name: 'cash' }],
				isLocal: receipt.isLocal || false,
				key: null,
				index,
				updated: receipt.updated_at,
				// is_delete: receipt.is_delete,
				// amountLoan: receipt.amount_loan,
				totalCount,
				// currency: receipt.currency_code,
				isReceipt: false,
				isDebt: true,
				isTopUp: false,
				type: 'Debt Payment',
				totalAmount: receipt.due_amount,
				balance: receipt.balance
			};
		});

		debtPayment.sort((a, b) => {
			return isBefore(new Date(a.createdAt), new Date(b.createdAt))
				? 1
				: -1;
		});
		// receipts = this.filterItems(receipts);
		return [...debtPayment.filter(r => r.customer_account_id === this.props.selectedCustomer.customerId)];
		//return [...debtPayment];
	}

	prepareTopUpData() {
		// Used for enumerating receipts
		let creditArray = CreditRealm.getCreditTransactions();
		const totalCount = creditArray.length;
		let topups = creditArray.map((receipt, index) => {
			return {
				active: receipt.active,
				synched: receipt.synched,
				id: receipt.topUpId,
				topUpId: receipt.topUpId,
				receiptId: receipt.receipt_id,
				createdAt: receipt.created_at,
				sectiontitle: format(parseISO(receipt.created_at), 'iiii d MMM yyyy'),
				customerAccount: CustomerRealm.getCustomerById(receipt.customer_account_id) ? CustomerRealm.getCustomerById(receipt.customer_account_id) : receipt.customer_account_id,
				receiptLineItems: undefined,
				customer_account_id: receipt.customer_account_id,
				paymentTypes: undefined,
				description: [{ amount: receipt.due_amount, name: 'cash' }],
				isLocal: receipt.isLocal || false,
				key: null,
				index,
				updated: receipt.updated_at,
				// is_delete: receipt.is_delete,
				// amountLoan: receipt.amount_loan,
				totalCount,
				// currency: receipt.currency_code,
				isReceipt: false,
				isDebt: false,
				isTopUp: true,
				type: 'Top Up',
				balance: receipt.balance,
				totalAmount: receipt.topup
			};
		});

		topups.sort((a, b) => {
			return isBefore(new Date(a.createdAt), new Date(b.createdAt))
				? 1
				: -1;
		});
		// receipts = this.filterItems(receipts);
		return [...topups.filter(r => r.customer_account_id === this.props.selectedCustomer.customerId)];
		//return [...topups];
	}

	groupBySectionTitle(objectArray, property) {
		return objectArray.reduce(function (acc, obj) {
			let key = obj[property];
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(obj);
			return acc;
		}, {});
	}

	prepareSectionedData() {
		// Used for enumerating receipts
		let receipts = this.prepareData();
		let topups = this.prepareTopUpData();
		let deptPayment = this.prepareCustomerDebt();
		let finalArray = (deptPayment.concat(topups)).concat(receipts).sort((a, b) => {
			return isBefore(new Date(a.createdAt), new Date(b.createdAt))
				? 1
				: -1;
		});

		let transformedarray = this.groupBySectionTitle(finalArray, 'sectiontitle');
		let newarray = [];
		for (let i of Object.getOwnPropertyNames(transformedarray)) {
			newarray.push({
				title: i,
				data: transformedarray[i],
			});
		}
		return newarray;
	}


	filterItems = data => {
		// let filter = {
		// 	paymentTypes: this.props.paymentTypeFilter.length > 0 ? this.props.paymentTypeFilter === 'all' ? "" : this.props.paymentTypeFilter : "",
		// };

		let filteredItems = data.filter(function (item) {
			for (var key in filter) {
				if (key === "paymentTypes") {
					if (filter[key].length === 0) {
						return true;
					}
					if (item[key] != undefined) {
						let filteredTypes = item[key].filter(function (elements) {
							if (elements["name"] === filter[key]) {
								return true;
							}
						});
						if (filteredTypes.length > 0) {
							return true;
						}
					}
				}
			}
		});

		return filteredItems;
	};




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

	getCurrency = () => {
		let settings = SettingRealm.getAllSetting();
		return settings.currency;
	};

	renderReceipt({ item, index }) {
		return (
			<TouchableNativeFeedback onPress={() => this.setSelected(item)}>
				<View key={index} style={{ padding: 10 }}>
					<View style={styles.itemData}>
						<Icon name={`md-barcode`} size={25} color="#808080" />
						<Text style={styles.customername}>{item.type}</Text>
					</View>
					<View style={styles.itemData}>
						<Text style={styles.customername}>{item.isReceipt ? item.customerAccount.name : item.customerAccount.name}</Text>
					</View>
					<Text style={styles.customername}>
						{this.getCurrency().toUpperCase()} {item.totalAmount}
					</Text>
					<View style={styles.receiptStats}>
						{item.isReceipt ? item.is_delete === 0 && (
							<Text style={styles.receiptStatusText}>
								{'Deleted - '.toUpperCase()}
							</Text>
						): !item.isReceipt ? !item.active && (
							<Text style={styles.receiptStatusText}>
								{'Deleted - '.toUpperCase()}
							</Text>
						): null}
						
						{!item.isReceipt ?  !item.synched ? (
							<View style={{ flexDirection: 'row' }}>
								<Text style={styles.receiptPendingText}>
									{' Pending'.toUpperCase()}
								</Text>
							</View>
						) : (
								<View style={{ flexDirection: 'row' }}>
									{!item.synched && <Text> - </Text>}
									<Text style={styles.receiptSyncedText}>
										{' Synced'.toUpperCase()}
									</Text>
								</View>
							)   :
						!item.active ? (
							<View style={{ flexDirection: 'row' }}>
								<Text style={styles.receiptPendingText}>
									{' Pending'.toUpperCase()}
								</Text>
							</View>
						) : (
								<View style={{ flexDirection: 'row' }}>
									{!item.active && <Text> - </Text>}
									<Text style={styles.receiptSyncedText}>
										{' Synced'.toUpperCase()}
									</Text>
								</View>
							)}
					</View>
				</View>
			</TouchableNativeFeedback>
		);
	}

	showHeader = () => {
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
				if (receiptsPaymentType.receipt_id === customerReceipt.id) {
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
		topUpActions: bindActionCreators(TopUpActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
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
	sectionTitle: {
		fontSize: 16,
		backgroundColor: '#ABC1DE',
		color: '#000',
		fontWeight: 'bold',
		padding: 10,
		textTransform: 'uppercase'
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
		backgroundColor: '#2858a7',
		fontWeight: 'bold',
		fontSize: 18,
		color: 'white',
		alignSelf: "center",
		justifyContent: "center"
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
