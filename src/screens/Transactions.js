import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Image,
	TouchableOpacity,
	TouchableHighlight,
	TouchableNativeFeedback,
	Alert,
	ToastAndroid,
	ScrollView,
	SectionList
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Events from 'react-native-simple-events';

import * as ToolbarActions from '../actions/ToolBarActions';
import CustomerRealm from '../database/customers/customer.operations';
import OrderRealm from '../database/orders/orders.operations';
import * as CustomerActions from '../actions/CustomerActions';

import * as reportActions from '../actions/ReportActions';
import * as receiptActions from '../actions/ReceiptActions';

import i18n from '../app/i18n';
import moment from 'moment-timezone';


class ReceiptLineItem extends React.PureComponent {
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


	getImage = item => {
		const productImage =
			item.base64encodedImage ||
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
					<Text style={[styles.label, { fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold' }]}>{this.props.item.name}</Text>
				</View>
				<View style={[styles.itemData, { flex: 1 }]}>
					<Text style={[styles.label, { fontSize: 15, fontWeight: 'bold' }]}>{this.props.item.amount} </Text>
				</View>

			</View>
		);
	}
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
		return () => {
			if (item.isDelete === null) {
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
						}
					}
				],
				{ cancelable: true }
			);
		};
	}


	deleteReceipt(item) {
		console.log(item);
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
		this.setState({ refresh: !this.state.refresh });
	}

	render() {

		var receiptLineItems;
		var paymentTypes;
		if (this.props.item.receiptLineItems !== undefined) {
			receiptLineItems = this.props.item.receiptLineItems.map((lineItem, idx) => {
				// console.log('lineItem-lineItem-lineItem', lineItem);
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
		} else {
			receiptLineItems = {};
		}

		if (this.props.item.paymentTypes !== undefined) {
			paymentTypes = this.props.item.paymentTypes.map((paymentItem, idx) => {
				return (

					<PaymentTypeItem
						key={paymentItem.id}
						item={paymentItem}
						lineItemIndex={idx}
					/>
				);
			});
		} else {
			paymentTypes = {};
		}


		return (
			<View style={{ padding: 15 }}>
				<View style={styles.deleteButtonContainer}>
					<TouchableOpacity
						onPress={this.onDeleteReceipt(this.props.item)}
						style={[
							styles.receiptDeleteButton,
							{ backgroundColor: (this.props.item.isDelete == null) ? 'red' : 'grey' }
						]}>
						<Text style={styles.receiptDeleteButtonText}>X</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.itemData}>
					<Text style={styles.customername}>{this.props.item.customerAccount.name}</Text>
				</View>
				<Text>
					{moment
						.tz(this.props.item.createdAt, moment.tz.guess())
						.format('dddd Do MMMM YYYY')}
				</Text>
				<View>

				</View>
				<View style={styles.receiptStats}>
					{this.props.item.isDelete != null && (
						<Text style={styles.receiptStatusText}>
							{'Deleted'.toUpperCase()}
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
					<Text style={[styles.customername, { flex: .7, fontWeight: 'bold' }]}>TOTAL </Text>
					<Text style={[styles.customername, { flex: .3, fontWeight: 'bold' }]}>
						{this.props.item.currency.toUpperCase()} {this.props.item.totalAmount}
					</Text>
				</View>
			</View>
		)
	}

}

class Transactions extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			refresh: false,
			searchString: '',
			hasScrolled: false,
			paymentTypeValue: '',
			selected: this.prepareData()[0],
		};
	}
	componentDidMount() {
		this.props.navigation.setParams({ paymentTypeValue: 'all' });
		this.props.navigation.setParams({ checkPaymentTypefilter: this.checkPaymentTypefilter });

		Events.on(
			'ScrollCustomerTo',
			'customerId1',
			this.onScrollCustomerTo.bind(this)
		);
	}

	checkPaymentTypefilter = (searchText) => {
		this.props.navigation.setParams({ paymentTypeValue: searchText });
		this.props.customerActions.SearchPaymentType(searchText);
	};

	componentWillUnmount() {
		Events.rm('ScrollCustomerTo', 'customerId1');
	}

	onScrollCustomerTo(data) {

	}

	setSelected(item) {
		this.setState({ selected: item });
	}

	getItemLayout = (data, index) => ({
		length: 50,
		offset: 50 * index,
		index
	});

	getTransactionDetail() {
		if (this.state.selected) {
			return (
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<View style={{ flex: 1, backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#CCC' }}>
						<FlatList
							data={this.prepareData()}
							renderItem={this.renderReceipt.bind(this)}
							keyExtractor={(item, index) => item.id}
							ItemSeparatorComponent={this.renderSeparator}
							extraData={this.state}
						/>
					</View>

					<View style={{ flex: 2, backgroundColor: '#fff', paddingLeft: 20 }}>
						<ScrollView>
							<TransactionDetail
								item={this.state.selected}
								products={this.props.products}
								receiptActions={this.props.receiptActions}
								receipts={this.props.receipts}
								paymentTypes={this.props.receiptsPaymentTypes}
							/>
						</ScrollView>
					</View>
				</View>
			);
		} else {
			return (
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<Text style={{ fontSize: 20, fontWeight: 'bold', alignSelf: "center", alignContent: "center" }}>Record customers sales.</Text>

				</View>
			);
		}
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				{this.getTransactionDetail()}
				<SearchWatcher parent={this}>
					{this.props.paymentTypeFilter}
				</SearchWatcher>
			</View>
		);
		return null;
	}


	prepareData() {
		// Used for enumerating receipts
		const totalCount = this.props.receipts.length;

		let receipts = this.comparePaymentTypeReceipts().map((receipt, index) => {
			return {
				active: receipt.active,
				id: receipt.id,
				receiptId: receipt.id,
				createdAt: receipt.created_at,
				customerAccount: receipt.customer_account,
				receiptLineItems: receipt.receipt_line_items,
				paymentTypes: receipt.paymentTypes,
				isLocal: receipt.isLocal || false,
				key: receipt.isLocal ? receipt.key : null,
				index,
				updated: receipt.updated,
				isDelete: receipt.isDelete,
				amountLoan: receipt.amount_loan,
				totalCount,
				currency: receipt.currency_code,
				totalAmount: receipt.total
			};
		});
		receipts.sort((a, b) => {
			return moment
				.tz(a.createdAt, moment.tz.guess())
				.isBefore(moment.tz(b.createdAt, moment.tz.guess()))
				? 1
				: -1;
		});
		receipts = this.filterItems(receipts);

		return [...receipts];
	}


	filterItems = data => {
		let filter = {
			paymentTypes: this.props.paymentTypeFilter.length > 0 ? this.props.paymentTypeFilter === 'all' ? "" : this.props.paymentTypeFilter : "",
		};

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


	renderReceipt({ item, index }) {
		console.log(JSON.stringify(item))
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
					<View style={styles.itemData}>
						<Text style={styles.customername}>{item.customerAccount.name}</Text>
					</View>
					<Text style={styles.customername}>
						{item.currency.toUpperCase()} {item.totalAmount}
					</Text>
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

}

class SearchWatcher extends React.PureComponent {
	render() {

		return this.searchEvent();
	}

	// TODO: Use states instead of setTimeout
	searchEvent() {
		let that = this;

		setTimeout(() => {
			if (
				that.props.parent.props.paymentTypeFilter !==
				that.props.parent.state.paymentTypeFilter
			) {
				that.props.parent.state.paymentTypeFilter =
					that.props.parent.props.paymentTypeFilter;
				that.props.parent.setState({
					refresh: !that.props.parent.state.refresh
				});
			}
		}, 50);
		return null;
	}
}

function mapStateToProps(state, props) {
	return {
		settings: state.settingsReducer.settings,
		localReceipts: state.receiptReducer.localReceipts,
		remoteReceipts: state.receiptReducer.remoteReceipts,
		receipts: state.receiptReducer.receipts,
		receiptsPaymentTypes: state.paymentTypesReducer.receiptsPaymentTypes,
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		customers: state.customerReducer.customers,
		products: state.productReducer.products,
		paymentTypeFilter: state.customerReducer.paymentTypeFilter,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		toolbarActions: bindActionCreators(ToolbarActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		reportActions: bindActionCreators(reportActions, dispatch),
		receiptActions: bindActionCreators(receiptActions, dispatch)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Transactions);

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
	commandBarContainer: {
		flex: 1,
		backgroundColor: '#ABC1DE',
		height: 80,
		alignSelf: 'center',
		marginLeft: 20,
		marginRight: 20
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

	customername: {
		color: '#111',
		fontSize: 18
	},

	itemData: {
		flexDirection: 'row',
		padding: 1
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
