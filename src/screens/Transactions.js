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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Events from 'react-native-simple-events';

import * as ToolbarActions from '../actions/ToolBarActions';
import ModalDropdown from 'react-native-modal-dropdown';
import PosStorage from '../database/PosStorage';
import SettingRealm from '../database/settings/settings.operations';
import CustomerRealm from '../database/customers/customer.operations';
import * as CustomerActions from '../actions/CustomerActions';

import * as reportActions from '../actions/ReportActions';
import * as receiptActions from '../actions/ReceiptActions';

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
					style={[styles.productImage, {flex:.1 }]}
				/>
				<View style={{ justifyContent: 'space-around', flex:.6 }}>
					<View style={styles.itemData}>
						<Text style={[styles.label, {fontSize: 15}]}>{this.props.item.product.description}</Text>
					</View>
					<View style={styles.itemData}>
						<Text style={[styles.label, {fontSize: 16}]}>{this.props.item.quantity} </Text>
					</View>
				</View>
				<View style={[styles.itemData, {flex:.3}]}>
				<Text style={[styles.label, {fontSize: 15, padding:10}]}>{this.props.item.currency_code.toUpperCase()} {this.props.item.price_total}</Text>
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
				console.log('product', product);
				console.log('item', item);
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


class TransactionDetail extends Component {
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

		var receiptLineItems;
		if(this.props.item.receiptLineItems !== undefined) {
			receiptLineItems = this.props.item.receiptLineItems.map((lineItem, idx) => {
				console.log('lineItem-lineItem-lineItem', lineItem);
				return (
						<ReceiptLineItem
							receiptActions={this.props.receiptActions}
							receipts={this.props.receipts}
							receipts={this.props.receipts}
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
				<Text style={{ fontSize: 16, fontWeight: "bold" }}>PRODUCTS</Text>
			</View>

		    	{receiptLineItems}

			<View style={{ flex: 1, marginTop: 20, flexDirection: 'row', fontWeight: 'bold' }}>
			    <Text style={[styles.customername, { flex: .7, fontWeight: 'bold'}]}>TOTAL </Text>
				<Text style={[styles.customername, { flex: .3, fontWeight: 'bold'}]}>
			    	{this.props.item.currency.toUpperCase()} {this.props.item.totalAmount}
				</Text>
			</View>
		</View>
		)
	}

}


class Transactions extends Component {
	constructor(props) {
		super(props);

		this.state = {
			refresh: false,
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
		Events.rm('ScrollCustomerTo', 'customerId1');
	}

	onScrollCustomerTo(data) {
		console.log('onScrollCustomerTo');
	}

	setSelected(item) {
		this.setState({ selected: item });
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

	getTransactionDetail() {
		if (this.state.selected) {
			return (
				<View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1, backgroundColor: '#fff', borderRightWidth: 4, borderRightColor: '#CCC' }}>
						<FlatList
							data={this.prepareData()}
							renderItem={this.renderReceipt.bind(this)}
							keyExtractor={(item, index) => item.id}
							ItemSeparatorComponent={this.renderSeparator}
							extraData={this.state}
						/>
					</View>

					<View style={{ flex: 2, backgroundColor: '#fff' }}>
						<ScrollView>
						<TransactionDetail
							    item={this.state.selected}
								products={this.props.products}
								receiptActions={this.props.receiptActions}
								receipts={this.props.receipts}
							/>
						</ScrollView>
					</View>
				</View>
			);
		} else {
			return (
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<Text style={{ fontSize: 20, fontWeight: 'bold', alignContent:"center", justifyContent:"center" }}>Record this customers sales.</Text>
				</View>
			);
		}
	}

	render() {

        console.log('props -', this.props);
			return (
				<View style={{ flex: 1 }}>
							{this.getTransactionDetail()}
				</View>
			);
		return null;
	}


	prepareData() {
		// Used for enumerating receipts
		const totalCount = this.props.receipts.length;
		//const totalCount = this.props.receipts.length;
		console.log('this.props.receipts', this.props.receipts);
		console.log(this.props.receiptsPaymentTypes);
		console.log(this.props.paymentTypes);
		console.log(this.comparePaymentTypes());
		console.log(this.comparePaymentTypeReceipts());
		let salesLogs = [...new Set(this.props.receipts)];
		let receipts = this.props.receipts.map((receipt, index) => {
			return {
				active: receipt.active,
				id: receipt.id,
				createdAt: receipt.created_at,
				customerAccount: receipt.customer_account,
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

		receipts.sort((a, b) => {
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

		// this.setState({
		// 	refresh: !this.state.refresh
		// })
		return [...receipts];
	}

	comparePaymentTypeReceipts() {
        let receiptsPaymentTypes = [...this.comparePaymentTypes()];
        let customerReceipts = [...this.props.receipts];
        console.log(receiptsPaymentTypes);
        console.log(customerReceipts);
        let finalCustomerReceiptsPaymentTypes = [];

        for (let customerReceipt of customerReceipts) {
            
			let paymentTypes = [];
			for (let receiptsPaymentType of receiptsPaymentTypes) {
				console.log(receiptsPaymentType.receipt_id === customerReceipt.receiptId);
				if(receiptsPaymentType.receipt_id === customerReceipt.receiptId){
					console.log(receiptsPaymentType);
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

				{/* <Text style={{ fontSize: 17 }}>#{item.totalCount - index}</Text> */}
				<View style={styles.receiptStats}>
					{!item.active && !item.syncAction === "update" && (
						<Text style={styles.receiptStatusText}>
							{'Deleted'.toUpperCase()}
						</Text>
					)}
					{item.isLocal || item.updated ? (
						<View style={{ flexDirection: 'row' }}>
							{!item.active && <Text> - </Text>}
							<Text style={styles.receiptPendingText}>
								{'Pending'.toLowerCase()}
							</Text>
						</View>
					) : (
							<View style={{ flexDirection: 'row' }}>
								{!item.active && <Text> - </Text>}
								<Text style={styles.receiptSyncedText}>
									{'Synced'.toLowerCase()}
								</Text>
							</View>
						)}
				</View>
				{/* <View style={styles.itemData}>
					<Text style={styles.label}># {item.id}</Text>
				</View> */}
				<Text style={styles.customername}>
				{item.currency.toUpperCase()} {item.totalAmount}
				</Text>
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
		products: state.productReducer.products
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
