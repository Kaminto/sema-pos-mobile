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
	ToastAndroid
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Events from 'react-native-simple-events';

import * as ToolbarActions from '../actions/ToolBarActions';
import ModalDropdown from 'react-native-modal-dropdown';
import PosStorage from '../database/PosStorage';
import TopUps from '../database/topup/index';
import * as CustomerActions from '../actions/CustomerActions';
import { Card, ListItem, Button, Input, ThemeProvider } from 'react-native-elements';
import * as reportActions from '../actions/ReportActions';
import * as receiptActions from '../actions/ReceiptActions';

import i18n from '../app/i18n';
import moment from 'moment-timezone';
import { FloatingAction } from "react-native-floating-action";
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modalbox';
const actions = [
	{
		text: "Top Up",
		name: "topup",
		icon: <Icon
			name='md-wallet'
			size={24}
			color='black'
		/>,
		position: 1
	},
];
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
					style={styles.productImage}
				/>
				<View style={{ justifyContent: 'space-around' }}>
					<View style={styles.itemData}>
						<Text style={styles.label}>Product Description: </Text>
						<Text>{this.props.item.product.description}</Text>
					</View>
					<View style={styles.itemData}>
						<Text style={styles.label}>Product SKU: </Text>
						<Text>{this.props.item.product.sku}</Text>
					</View>
					<View style={styles.itemData}>
						<Text style={styles.label}>Quantity Purchased: </Text>
						<Text>{this.props.item.quantity}</Text>
					</View>
					<View style={styles.itemData}>
						<Text style={styles.label}>Total Cost: </Text>
						<Text>{this.props.item.price_total}</Text>
					</View>
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
		PosStorage.saveRemoteReceipts(this.props.remoteReceipts);
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

class CustomerDetails extends Component {
	constructor(props) {
		super(props);

		this.state = {
			refresh: false,
			topup: "",
			searchString: '',
			hasScrolled: false
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

		console.log('props -', this.props.topups);
		console.log('TopUps', TopUps.getTopUps());
		console.log('pendingTopUps', TopUps.getPendingTopUps());
		console.log('getReceipts', PosStorage.getReceipts())
		return (
			<View style={{ flex: 1 }}>

				<View style={{
					flexDirection: 'row',
					height: 100,
					backgroundColor: '#0e73c9',
					alignItems: 'center'
				}}>
					<View style={[styles.leftToolbar]}>
						<SelectedCustomerDetails
							selectedCustomer={this.props.selectedCustomer}
						/>
					</View>
				</View>

				<View style={{ flex: 1, backgroundColor: '#fff' }}>
					<FlatList
						data={this.prepareData()}
						renderItem={this.renderReceipt.bind(this)}
						keyExtractor={(item, index) => item.id}
						ItemSeparatorComponent={this.renderSeparator}
						extraData={this.state.refresh}
					/>
				</View>
				<FloatingAction
					actions={actions}
					onPressItem={name => {
						console.log(`selected button: ${name}`);
						this.refs.modal6.open();
					}}
				/>

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
					<View
						style={{
							flex: 1,
							marginTop: 0,
							marginBottom: 50,
							marginLeft: 100,
							marginRight: 100
						}}>


						<View style={[{ flex: 1, flexDirection: 'row', marginTop: '1%' }]}>
							<Input
								placeholder={i18n.t(
									'topup-placeholder'
								)}
								label={i18n.t('topup-placeholder')}
								onChangeText={this.onChangeTopup.bind(this)}
							/>
						</View>


						<View style={styles.completeOrder}>
							<View style={{ justifyContent: 'center', height: 50 }}>
								<TouchableHighlight
									underlayColor="#c0c0c0"
									onPress={() => this.addCredit()}>
									<Text
										style={[
											{ paddingTop: 20, paddingBottom: 20 },
											styles.buttonText
										]}>
										{i18n.t('topup')}
									</Text>
								</TouchableHighlight>
							</View>
						</View>


						<View style={{ flex: 1, backgroundColor: '#fff' }}>
					<FlatList
						data={this.prepareTopUpData()}
						renderItem={this.renderTopUps.bind(this)}
						keyExtractor={(item, index) => item.id}
						ItemSeparatorComponent={this.renderSeparator}
						extraData={this.state.refresh}
					/>
				</View>


					</View>
				</Modal>

			</View>
		);
		return null;
	}

	closePaymentModal = () => {
		this.refs.modal6.close();
	};

	onChangeTopup = topup => {
		console.log(topup);
		this.setState({ topup });
		//this.props.parent.forceUpdate();
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

	addCredit = () => {

		console.log(this.state.topup);
		console.log(this.props.selectedCustomer);


		let newTopUp = TopUps.createTopUp(
			this.props.selectedCustomer.customerId,
			this.state.topup,
			this.state.topup
		);

		// console.log(this.props.payment);
		// console.log(this.props.selectedCustomer);
		// console.log("there")
		// this.formatAndSaveSale();
		// Alert.alert(
		// 	'Notice',
		// 	'Payment Made',
		// 	[{
		// 		text: 'OK',
		// 		onPress: () => {
		// 			this.closePaymentModal();
		// 			this.props.orderActions.ClearOrder();
		// 		}
		// 	}],
		// 	{ cancelable: false }
		// );
	}


	prepareData() {
		// Used for enumerating receipts
		console.log("here selectedCustomer", this.props.selectedCustomer);

		if (this.props.remoteReceipts.length > 0) {
			const totalCount = this.props.remoteReceipts.length;

			let salesLogs = [...new Set(this.props.remoteReceipts)];
			let remoteReceipts = salesLogs.map((receipt, index) => {
				console.log("customerAccount", receipt.customer_account);
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
					totalCount
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
			if (PosStorage.getSettings()) {
				siteId = PosStorage.getSettings().siteId;
			}
	
			// return [
			// 	...remoteReceipts.filter(r => r.customerAccount.kiosk_id === siteId)
			// ];
			console.log('remoteReceipts', remoteReceipts[0].customerAccount);
			console.log('remoteReceiptsno', remoteReceipts.filter(r => r.customerAccount.id === this.props.selectedCustomer.customerId));
			return remoteReceipts.filter(r => r.customerAccount.id === this.props.selectedCustomer.customerId);
		}else{
			return [];
		}

	}


	prepareTopUpData() {
		// Used for enumerating receipts
		console.log("here selectedCustomer", this.props.selectedCustomer);

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
		
	console.log('topups',topups);
			return topups.filter(r => r.customer_account_id === this.props.selectedCustomer.customerId);
		}else{
			return [];
		}

	}


	renderTopUps({ item, index }) {

		console.log("Item reciep", item);
		//const receiptLineItems = item.receiptLineItems.map((lineItem, idx) => {
			return (
				<View
				style={{
					flex: 1,
					flexDirection: 'row',
					marginBottom: 10,
					marginTop: 10
				}}>
				
				<View style={{ justifyContent: 'space-around' }}>
					<View style={styles.itemData}>
						<Text style={styles.label}>Total: </Text>
						<Text>{item.topup}</Text>
					</View>
					<View style={styles.itemData}>
						<Text style={styles.label}>Balance: </Text>
						<Text>{item.balance}</Text>
					</View>
				</View>
			</View>
			);
	//	});


		
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

			PosStorage.updateCustomer(
				item.customerAccount,
				item.customerAccount.phoneNumber,
				item.customerAccount.name,
				item.customerAccount.address,
				item.customerAccount.salesChannelId,
				item.customerAccount.frequency
			);
		}

		this.setState({ refresh: !this.state.refresh });
	}

	renderReceipt({ item, index }) {

		console.log("Item reciep", item);
		const receiptLineItems = item.receiptLineItems.map((lineItem, idx) => {
			return (
				<ReceiptLineItem
					receiptActions={this.props.receiptActions}
					remoteReceipts={this.props.remoteReceipts}
					item={lineItem}
					key={lineItem.id}
					lineItemIndex={idx}
					products={this.props.products}
					handleUpdate={this.handleUpdate.bind(this)}
					receiptIndex={item.index}
				/>
			);
		});


		return (
			<View key={index} style={{ padding: 15 }}>
				<View style={styles.deleteButtonContainer}>
					<TouchableOpacity
						onPress={this.onDeleteReceipt(item)}
						style={[
							styles.receiptDeleteButton,
							{ backgroundColor: item.active ? 'red' : 'grey' }
						]}>
						<Text style={styles.receiptDeleteButtonText}>X</Text>
					</TouchableOpacity>
				</View>
				<Text style={{ fontSize: 17 }}>#{item.totalCount - index}</Text>
				<View style={styles.receiptStats}>
					{!item.active && (
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
					<Text style={styles.label}>Receipt Id: </Text>
					<Text>{item.id}</Text>
				</View> */}
				<View style={styles.itemData}>
					<Text style={styles.label}>Date Created: </Text>
					<Text>
						{moment
							.tz(item.createdAt, moment.tz.guess())
							.format('YYYY-MM-DD HH:mm')}
					</Text>
				</View>
				<View style={styles.itemData}>
					<Text style={styles.label}>Customer Name: </Text>
					<Text>{item.customerAccount.name}</Text>
				</View>
				{receiptLineItems}
			</View>
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


class SelectedCustomerDetails extends React.Component {
	render() {
		return (
			<View style={styles.commandBarContainer}>
				<View style={{ flexDirection: 'row', height: 40 }}>
					<Text style={styles.selectedCustomerText}>
						{i18n.t('account-name')}
					</Text>
					<Text style={styles.selectedCustomerText}>
						{this.getName()}
					</Text>
				</View>
				<View style={{ flexDirection: 'row', height: 40 }}>
					<Text style={styles.selectedCustomerText}>
						{i18n.t('telephone-number')}
					</Text>
					<Text style={styles.selectedCustomerText}>
						{this.getPhone()}
					</Text>
				</View>
			</View>
		);
	}
	getName() {
		if (this.props.selectedCustomer.hasOwnProperty('name')) {
			return this.props.selectedCustomer.name;
		} else {
			return '';
		}
	}
	getPhone() {
		if (this.props.selectedCustomer.hasOwnProperty('phoneNumber')) {
			return this.props.selectedCustomer.phoneNumber;
		} else {
			return '';
		}
	}
}

function mapStateToProps(state, props) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer,
		settings: state.settingsReducer.settings,
		localReceipts: state.receiptReducer.localReceipts,
		remoteReceipts: state.receiptReducer.remoteReceipts,
		customers: state.customerReducer.customers,
		products: state.productReducer.products,
		topups: state.topupReducer.topups
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
)(CustomerDetails);

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
	completeOrder: {
		backgroundColor: '#2858a7',
		borderRadius: 30,
		marginTop: '1%'
	},
	commandBarContainer: {
		flex: 1,
		backgroundColor: '#ABC1DE',
		height: 80,
		alignSelf: 'center',
		marginLeft: 20,
		marginRight: 20
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
		alignSelf: 'center',
		flex: 0.5,
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