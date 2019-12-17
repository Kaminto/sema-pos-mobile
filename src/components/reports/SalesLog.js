import React, { Component } from 'react';

import {
	Text,
	View,
	StyleSheet,
	FlatList,
	Image,
	Button,
	TouchableOpacity,
	Alert,
	TextInput,
	ToastAndroid
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as reportActions from '../../actions/ReportActions';
import * as receiptActions from '../../actions/ReceiptActions';
import * as CustomerActions from '../../actions/CustomerActions';
import * as CustomerBarActions from '../../actions/CustomerBarActions';

import DateTimePicker from 'react-native-modal-datetime-picker';

import i18n from '../../app/i18n';
import moment from 'moment-timezone';
import PosStorage from '../../database/PosStorage';
import Events from 'react-native-simple-events';

class SalesFilter extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isDateTimePickerVisible: false,
			receiptDate: "",
		};
	}

	render() {
		return (
			<View
				style={{
					flex: 1, 
							flexDirection: 'row', 
							alignItems: 'stretch',
				}}>
			<View style={[styles.leftToolbar]}>
				<TextInput
					// Adding hint in Text Input using Place holder.
					placeholder={i18n.t('salefilter-placeholder')}
					// Making the Under line Transparent.
					underlineColorAndroid="transparent"
					onChangeText={this.onTextChange}
					value={this.props.recieptSearchString}
					style={[styles.SearchInput]}
				/>
				</View>
				<View style={[styles.rightToolbar]}>
				<Button
					title={`Date ${this.state.receiptDate}`}
					onPress={this.showDateTimePicker}
				/>
				<DateTimePicker
					maximumDate={new Date()}
					isVisible={this.state.isDateTimePickerVisible}
					onConfirm={this.handleDatePicked}
					onCancel={this.hideDateTimePicker}
				/>
			</View>
			</View>
		);
	}



	showDateTimePicker = () => {
		this.setState({ isDateTimePickerVisible: true });
	};

	hideDateTimePicker = (check) => {
		let that = this;
		if (!check) {
			this.setState({ receiptDate: "" });
			that.props.parent.props.receiptActions.SearchReceipts("");

		}
		this.setState({ isDateTimePickerVisible: false });
	};

	handleDatePicked = date => {
		let that = this;
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
		that.props.parent.props.receiptActions.SearchReceipts(this.formatDate(new Date(datestring)));
		this.setState({ receiptDate: this.formatDate(new Date(datestring)) });
		this.hideDateTimePicker(true);
	};

	formatDate = (date) => {
		date = new Date(date);
		var day = date.getDate(),
			month = date.getMonth() + 1,
			year = date.getFullYear();
		if (month.toString().length == 1) {
			month = "0" + month;
		}
		if (day.toString().length == 1) {
			day = "0" + day;
		}

		return date = year + '-' + month + '-' + day;
	};

	onTextChange = searchText => {
		let that = this;
		that.props.parent.props.receiptActions.SearchReceipts(searchText);
	};

}

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

class SalesLog extends Component {
	constructor(props) {
		super(props);

		this.state = {
			refresh: false,
			recieptSearchString: '',
		};
	}

	componentDidMount() {
		console.log('SalesLog - componentDidMount');
		Events.on(
			'RemoveLocalReceipt',
			'RemoveLocalReceipt2',
			this.onRemoveLocalReceipt.bind(this)
		);
	}

	componentWillUnmount() {
		Events.rm('RemoveLocalReceipt', 'RemoveLocalReceipt2');
	}

	onRemoveLocalReceipt() {
		this.setState({ refresh: !this.state.refresh });
	}

	render() {
			return (
				<View style={styles.container}>

					<View style={{
						flexDirection: 'row',
						height: 100,
						alignItems: 'center'
					}}>
						<SalesFilter parent={this} />

					</View>
					<View
						style={{
							height: 1,
							backgroundColor: '#ddd',
							width: '100%'
						}}
					/>

					<FlatList
						data={this.prepareData()}
						renderItem={this.renderReceipt.bind(this)}
						keyExtractor={(item, index) => item.id}
						ItemSeparatorComponent={this.renderSeparator}
						extraData={this.state.refresh}
					/>
					<SearchWatcher parent={this}>
						{this.props.recieptSearchString}
					</SearchWatcher>
				</View>
			);
	}

	handleUpdate() {
		this.setState({
			refresh: !this.state.refresh
		});
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

	renderReceipt({ item, index }) {
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

	prepareData() {
		// Used for enumerating receipts
		const totalCount = this.props.remoteReceipts.length;

		let salesLogs = [...new Set(this.props.remoteReceipts)];
		let remoteReceipts = salesLogs.map((receipt, index) => {
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
		remoteReceipts = this.filterItems(remoteReceipts);
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

		return remoteReceipts
	}


	filterItems = data => {
		let filteredItems = data.filter(reciept => {
			// If there is a search string
			if (this.state.recieptSearchString.length > 0) {
				const filterString = this.state.recieptSearchString.toLowerCase();
				const name = reciept.customerAccount.name.toLowerCase();
				const names = name.split(' ');
				return name.startsWith(filterString) ||
					(names.length > 1 &&
						names[names.length - 1].startsWith(filterString)) ||
					reciept.createdAt.startsWith(filterString);

			}
			return true;
		});
		return filteredItems;
	};

	getCustomer(customerId) {
		return this.props.customers.filter(
			customer => customer.customerId === customerId
		)[0];
	}

	getProducts(products) {
		return products.map(product => {
			product.product = this.getProduct(product.productId);
			product.product.base64encoded_image =
				product.product.base64encodedImage;
			product.active = product.product.active;
			return product;
		});
	}

	getProduct(productId) {
		return this.props.products.filter(product => {
			return product.productId === productId;
		})[0];
	}
}

class SearchWatcher extends React.Component {
	render() {
		return this.searchEvent();
	}

	// TODO: Use states instead of setTimeout
	searchEvent() {
		console.log('SearchWatcher');
		let that = this;
		setTimeout(() => {
			if (
				that.props.parent.props.recieptSearchString !==
				that.props.parent.state.recieptSearchString
			) {
				that.props.parent.state.recieptSearchString =
					that.props.parent.props.recieptSearchString;
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
		reportType: state.reportReducer.reportType,
		localReceipts: state.receiptReducer.localReceipts,
		remoteReceipts: state.receiptReducer.remoteReceipts,
		recieptSearchString: state.receiptReducer.recieptSearchString,
		customers: state.customerReducer.customers,
		products: state.productReducer.products
	};
}

function mapDispatchToProps(dispatch) {
	return {
		reportActions: bindActionCreators(reportActions, dispatch),
		receiptActions: bindActionCreators(receiptActions, dispatch)
	};
}

//Connect everything
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SalesLog);

const styles = StyleSheet.create({
	receiptPendingText: {
		color: 'orange'
	},

	receiptSyncedText: {
		color: 'green'
	},
	SearchInput: {
		textAlign: 'left',
		height: 50,
		borderWidth: 2,
		borderColor: '#404040',
		borderRadius: 10,
		backgroundColor: '#FFFFFF',
		flex: 1, 
		marginLeft: 30
	},
	receiptStats: {
		flex: 1,
		flexDirection: 'row'
	},
	leftToolbar: {
		flex: 1,
	},
	rightToolbar: {
		flex: 1,
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
	}
});
