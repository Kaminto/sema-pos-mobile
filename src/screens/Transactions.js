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
import OrderRealm from '../database/orders/orders.operations';
import SettingRealm from '../database/settings/settings.operations';
import * as CustomerActions from '../actions/CustomerActions';
import * as receiptActions from '../actions/ReceiptActions';
import * as paymentTypesActions from '../actions/PaymentTypesActions';
import * as TopUpActions from '../actions/TopUpActions';
import CreditRealm from '../database/credit/credit.operations';
import CustomerDebtRealm from '../database/customer_debt/customer_debt.operations';

import i18n from '../app/i18n';
import { format, parseISO, isBefore } from 'date-fns';

class ReceiptLineItem extends React.Component {
	constructor(props) {
		super(props);
	};

	render() {
		return (
			<View
				style={styles.receiptlinecont}>
				<Image
					source={{ uri: this.getImage(this.props.item.product) }}
					style={styles.productImage}
				/>
				<View style={styles.receipttext}>
					<View style={styles.itemData}>
						<Text style={styles.label, styles.font15}>{this.props.item.product.description}</Text>
					</View>
					<View style={styles.itemData}>
						<Text style={styles.label, styles.font16}>{this.props.item.quantity} </Text>
					</View>
				</View>
				<View style={styles.itemData, styles.rlidata}>
					<Text style={[styles.label, styles.receiptitemamt]}>
						{this.getCurrency().toUpperCase()} {this.props.item.totalAmount ? this.props.item.totalAmount : this.props.item.price_total}</Text>
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

class PaymentTypeItem extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View
				style={styles.receiptlinecont}>

				<View style={[styles.itemData, { flex: 3 }]}>
					<Icon name={`md-cash`} size={25} color="#808080" />
					<Text style={[styles.label, styles.payitemname]}>
						{this.props.item.name == 'credit' ? 'Wallet' : this.props.item.name}</Text>
				</View>
				<View style={[styles.itemData, { flex: 1 }]}>
					<Text style={[styles.label, styles.payitemamt]}>{this.getCurrency().toUpperCase()} {this.props.item.amount} </Text>
				</View>

			</View>
		);
	}

	getCurrency = () => {
		let settings = SettingRealm.getAllSetting();
		return settings.currency;
	};
}

class TransactionDetail extends React.Component {
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

	shouldComponentUpdate(nextProps, nextState) {
        return true;
    }


	onDeleteReceipt(item) {
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
						onPress: () => {},
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
						onPress: () => {},
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
					style={styles.topupdebtcont}>
					<View style={{ flex: 1 }}>
						<View
							style={{
								flex: 1,
								flexDirection: 'row',

							}}>
							<View style={[styles.itemData, { flex: 3 }]}>
								<Text style={styles.label, styles.tdlbl}>
									{'Top Up Amount'}</Text>

							</View>
							<View style={[styles.itemData, { flex: 1 }]}>
								<Text style={styles.label, styles.tdlbamt}>{this.getCurrency().toUpperCase()} {item.topUp.topup} </Text>
							</View>
						</View>
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
					style={styles.topupdebtcont}>
					<View style={{ flex: 1 }}>
						<View
							style={{
								flex: 1,
								flexDirection: 'row'
							}}>
							<View style={[styles.itemData, { flex: 3 }]}>
								<Text style={styles.label, styles.tdlbl}>
									{'Loan Cleared'}</Text>

							</View>
							<View style={[styles.itemData, { flex: 1 }]}>
								<Text style={styles.label, styles.tdlbamt}>{this.getCurrency().toUpperCase()} {item.debt.due_amount} </Text>
							</View>
						</View>
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

	isEmpty(obj) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key))
				return false;
		}
		return true;
	}

	render() {
		var receiptLineItems;
		var paymentTypes;

		if (!this.isEmpty(this.props.item)) {

			if (this.props.item.isReceipt) {

				if (this.props.item.receiptLineItems !== undefined) {
					receiptLineItems = this.props.item.receiptLineItems.map((lineItem, idx) => {
						return (
							<ReceiptLineItem
								receiptActions={this.props.receiptActions}
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
						<View style={styles.transcont}>
							<ScrollView style={{ flex: 1 }}>
								<View style={styles.deleteButtonContainer}>
									<TouchableOpacity
										onPress={this.onDeleteReceipt(this.props.item)}
										style={ ostyle(this.props.item.active).touchstyle }>
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
									<Text style={styles.detailheader}>PAYMENT</Text>
								</View>

								{paymentTypes}

								<View>
									<Text style={styles.detailheader}>PRODUCTS</Text>
								</View>

								{receiptLineItems}

								<View style={styles.itemspurchcont}>
									<Text style={styles.customername, styles.itemsplbl}>Items Purchased</Text>
									<Text style={[styles.customername, styles.itemsPurchasedValue]}>
										{this.getCurrency().toUpperCase()} {this.props.item.totalAmount ? this.props.item.totalAmount : this.props.item.price_total}
									</Text>
								</View>

								{this.renderTopUp(this.props.item)}

								{this.renderDebt(this.props.item)}

								<View>
									<Text style={styles.detailheader}>NOTES</Text>
								</View>
								<View>
									<Text style={styles.notesst}>{this.props.item.notes}</Text>
								</View>

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
						style={styles.detcont}>
						<View style={styles.detsubcont}>
							<ScrollView style={{ flex: 1 }}>
								<View style={styles.deleteButtonContainer}>
									<TouchableOpacity
										onPress={this.onTopupCreditDelete(this.props.item)}
										style={ ostyle(this.props.item.active).touchstyle }>
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
									<Text style={styles.detailheader}>Amount</Text>
								</View>

								<View
									style={styles.detcont}>
									<View style={[styles.itemData, { flex: 3 }]}>
										<Text style={styles.label, styles.tdlbl}>
											{this.props.item.type}</Text>

									</View>
									<View style={[styles.itemData, { flex: 1 }]}>
										<Text style={styles.label, styles.tdlbamt}>{this.getCurrency().toUpperCase()} {this.props.item.totalAmount} </Text>
									</View>
								</View>


								<View
									style={styles.detcont}>
									<View style={[styles.itemData, { flex: 3 }]}>
										<Text style={styles.label, styles.tdlbl}>
											Balance</Text>

									</View>
									<View style={[styles.itemData, { flex: 1 }]}>
										<Text style={styles.label, styles.tdlbamt}>{this.getCurrency().toUpperCase()} {this.props.item.balance} </Text>
									</View>
								</View>

								<View>
									<Text style={styles.detailheader}>NOTES</Text>
								</View>
								<View>
									<Text style={styles.notesst}>{this.props.item.notes}</Text>
								</View>
							</ScrollView>
						</View>



					</View>


				)
			}

		} else {
			return null;
		}

	}

}

class Transactions extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			refresh: false,
			refreshing: false,
			searchString: '',
			hasScrolled: false,
			paymentTypeValue: '',
			selected: this.props.transactions.length > 0 ? this.props.transactions[0].data[0] : {},
		};
	}


	shouldComponentUpdate(nextProps, nextState) {
        return true;
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
		this.props.receiptActions.setIsUpate(true);
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
				<View style={styles.detmain}>
					<View style={styles.detailcont}>
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
									sections={this.props.transactions}
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
							item={this.state.selected}
							products={this.props.products}
							customerActions={this.props.customerActions}
							paymentTypesActions={this.props.paymentTypesActions}
							topUpActions={this.props.topUpActions}
							receiptActions={this.props.receiptActions}
						/>
					</View>
				</View>

			);
		} else {
			return (
				<View style={styles.detmain}>
					<Text style={styles.emptystate}>Record customers sales.</Text>

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


	renderSeparator() {
		return (
			<View
				style={styles.aseparator}
			/>
		);
	}

	handleUpdate() {
		this.setState({
			refresh: !this.state.refresh
		});
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
						) : !item.isReceipt ? !item.active && (
							<Text style={styles.receiptStatusText}>
								{'Deleted - '.toUpperCase()}
							</Text>
						) : null}

						{!item.isReceipt ? !item.synched ? (
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
							) :
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
				style={styles.headerBg}>
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

class SearchWatcher extends React.Component {
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
		isUpdate: state.receiptReducer.isUpdate,
		transactions: state.receiptReducer.transactions,
		products: state.productReducer.products,
		paymentTypeFilter: state.customerReducer.paymentTypeFilter,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		customerActions: bindActionCreators(CustomerActions, dispatch),
		paymentTypesActions: bindActionCreators(paymentTypesActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch),
		receiptActions: bindActionCreators(receiptActions, dispatch)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Transactions);

const ostyle = (actives) => StyleSheet.create({
	touchstyle: {
	    width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: (actives) ? 'red' : 'grey'
	}
})

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff'
	},

	aseparator: {
		height: 1,
		backgroundColor: '#ddd',
		width: '100%'
	},

	itemsplbl: {
		flex: 3, fontWeight: 'bold'
	},

	detailcont: {
		flex: 1, backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#CCC'
	},

	font15:{
		fontSize: 15
	},
	font16:{
		fontSize: 16
	},

	receiptlinecont: {
		flex: 1,
		flexDirection: 'row',
		marginBottom: 10,
		marginTop: 10
	},

	itemsPurchasedValue: {
		flex: 1, fontWeight: 'bold',
		 paddingRight: 20, alignSelf: 'flex-end'
	},
	sectionTitle: {
		fontSize: 16,
		backgroundColor: '#ABC1DE',
		color: '#000',
		fontWeight: 'bold',
		padding: 10,
		textTransform: 'uppercase'
	},
	headerText: {
		fontSize: 24,
		color: 'black',
		marginLeft: 100
	},
	leftMargin: {
		left: 10
	},

	emptystate: {
		fontSize: 20, fontWeight: 'bold', alignSelf: "center", alignContent: "center", padding: 20
	},

	detmain: {
		flex: 1, flexDirection: 'row'
	},
	headerItem: {
		fontWeight: 'bold',
		fontSize: 18
	},
	headerBackground: {
		backgroundColor: '#ABC1DE'
	},

	headerBg: {
		backgroundColor: '#ABC1DE',
		flex: 1,
		flexDirection: 'row',
		height: 50,
		alignItems: 'center'
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
	detsubcont: {
		flex: 1, padding: 15
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

	detcont: {
		flex: 1,
		flexDirection: 'row',
		marginBottom: 5,
		marginTop: 5
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

	notesst: {
		fontSize: 13, fontWeight: "bold", marginTop: 5
	},

	container: {
		flex: 1,
		backgroundColor: '#fff'
	},

	receiptStatusText: {
		color: 'red',
		fontWeight: 'bold'
	},

	transcont: {
		flex: 1, padding: 15
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

	detailheader: {
		fontSize: 16, fontWeight: "bold", marginTop: 10
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
		flex: .1,
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
	}, payitemname: {
		paddingLeft: 10, fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold'
	},

	itemspurchcont: {
		flex: 1, marginTop: 20, flexDirection: 'row', fontWeight: 'bold'
	},
	payitemamt: {
		fontSize: 15, fontWeight: 'bold', alignItems: 'flex-end', textAlign: 'right'
	}, receiptitemamt: {
		fontSize: 15, padding: 10, textAlign: 'right'
	},
	receipttext: {
		justifyContent: 'space-around', flex: .65
	},

	rlidata:{
		flex: .25, alignSelf: 'flex-end'
	},

	topupdebtcont: {
		flex: 1,
		flexDirection: 'row',
		marginTop: 10
	},
	tdlbl: {
		fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold'
	},
	tdlbamt: {
		fontSize: 15, fontWeight: 'bold', alignItems: 'flex-end', textAlign: 'right'
	}
});
