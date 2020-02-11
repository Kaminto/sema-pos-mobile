import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableHighlight, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as reportActions from "../../actions/ReportActions";
import * as customerActions from '../../actions/CustomerActions';
import * as customerBarActions from "../../actions/CustomerBarActions";
import * as toolBarActions from "../../actions/ToolBarActions";
import * as orderActions from "../../actions/OrderActions";
import * as reminderActions from "../../actions/ReminderActions.js";
import Modal from 'react-native-modalbox';
import DateFilter from './DateFilter';
import SetCustomReminderDate from './SetCustomRemiderDate';
import Events from 'react-native-simple-events';
import moment from 'moment-timezone';
import i18n from '../../app/i18n';

class RemindersReport extends Component {
	constructor(props) {
		super(props);
		this.state = {
			refresh: false
		};
		this.reminderDate = null;
	}
	componentDidMount() {

		this.props.reportActions.getRemindersReport(this.props.dateFilter.currentDate);
		this.onPressItem.bind(this);
	}

	getReminders(filterDate) {
		this.props.reportActions.getRemindersReport(filterDate);
	}

	getRemindersData() {
		if (this.props.dateFilter.hasOwnProperty("startDate") && this.props.dateFilter.hasOwnProperty("endDate")) {
			this.reminderDate = this.props.dateFilter.startDate;

			if (this.props.dateFilter.endDate == this.reminderDate) {
				this.getReminders(this.reminderDate);
				return this.props.reminderData;

			} else {
				this.reminderDate = this.props.dateFilter.startDate;
				this.getReminders(this.reminderDate);
				return this.props.reminderData;
			}

		} else {
			console.log("LASTTRY");
			this.getReminders(new Date());
			return this.props.reminderData;
		}
	}


	showHeader = () => {

		return (
			<View style={[{ flex: 1, flexDirection: 'row', height: 50, alignSelf: 'center' }, styles.headerBackground]}>
				<View style={[{ flex: 2 }]}>
					<Text style={[styles.headerItem]}>Customer Name</Text>
				</View>
				<View style={[{ flex: 1.5 }]}>
					<Text style={[styles.headerItem]}>Phone Number</Text>
				</View>
				<View style={[{ flex: 1.5 }]}>
					<Text style={[styles.headerItem]}>Address</Text>
				</View>
				<View style={[{ flex: 2 }]}>
					<Text style={[styles.headerItem]}>Last Purchase Date</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItem]}>Frequency</Text>
				</View>
				<View style={[{ flex: 1.5 }]}>
					<Text style={[styles.headerItem]}>Reminder Date</Text>
				</View>
				<View style={[{ flex: 1.5 }]}>
					<Text style={[styles.headerItem]}>Custom Reminder</Text>
				</View>
			</View>

		);
	};

	datediff = (date1, date2) => {
		date1 = new Date(date1);
		date2 = new Date(date2);
		const diffTime = Math.abs(date2 - date1);
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	};

	groupBy = key => array =>
		array.reduce((objectsByKeyValue, obj) => {
			const value = obj[key];
			objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
			return objectsByKeyValue;
		}, {});


	pairwiseDifference = (arr, n) => {
		let diff = 0,
			arrCalc = [];
		for (let i = 0; i < n - 1; i++) {
			diff = this.datediff(arr[i], arr[i + 1]);
			arrCalc.push(diff);
		}
		return arrCalc;
	};

	addDays = (theDate, days) => {
		return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
	}

	getRemindersNew = (data) => {
		const groupCustomers = this.groupBy("customer_account_id");
		groupCustomers(data);

		let final = [];
		for (let key of Object.keys(groupCustomers(data))) {
			let dateArray = groupCustomers(data)[key].map(e => e.created_at);
			const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
			const dateLength = groupCustomers(data)[key].map(e => e.created_at).length - 1;
			const lastDay = groupCustomers(data)[key].map(e => e.created_at)[dateLength];
			final.push({
				customer: key,
				name: groupCustomers(data)[key][0].customer_account.name,
				phoneNumber: groupCustomers(data)[key][0].customer_account.hasOwnProperty('phone_number') ? groupCustomers(data)[key][0].customer_account.phone_number : 'N/A',
				address: groupCustomers(data)[key][0].customer_account.hasOwnProperty('address') ? groupCustomers(data)[key][0].customer_account.address : groupCustomers(data)[key][0].customer_account.address_line1,
				frequency: this.pairwiseDifference(dateArray, dateArray.length),
				avg: Math.ceil(arrAvg(this.pairwiseDifference(dateArray, dateArray.length))) >= 0 ? Math.ceil(arrAvg(this.pairwiseDifference(dateArray, dateArray.length))) : 0,
				reminder: this.addDays(new Date(lastDay), Math.ceil(arrAvg(this.pairwiseDifference(dateArray, dateArray.length)))),
				dates: groupCustomers(data)[key].map(e => e.created_at),
				lastPurchaseDate: new Date(lastDay)
			});
		}
		console.log(final);


		return final;
	}

	onPressItem = (item) => {

	};


	getRow = (item, index, separators) => {
		let isSelected = false;
		if (this.props.selectedCustomer && this.props.selectedCustomer.customerId === item.customerId) {
			console.log("Selected item is " + item.customerId);
			isSelected = true;
		}
		return (
			<View style={{ flex: 1, flexDirection: 'row', height: 50, alignItems: 'center' }}>
				<View style={{ flex: 2 }}>
					<Text style={[styles.baseItem, styles.leftMargin]}>{item.name}</Text>
				</View>
				<View style={{ flex: 1.5 }}>
					<Text style={[styles.baseItem]}>{item.phoneNumber}</Text>
				</View>
				<View style={{ flex: 1.5 }}>
					<Text style={[styles.baseItem]}>{item.address}</Text>
				</View>
				<View style={{ flex: 2 }}>
					<Text style={[styles.baseItem]}>{moment.tz(item.lastPurchaseDate, moment.tz.guess()).format('ddd Do MMM YYYY')}</Text>
				</View>
				<View style={{ flex: 1.5 }}>
					<Text style={[styles.baseItem]}>{item.frequency}</Text>
				</View>
				<View style={{ flex: 1.5 }}>
					<Text style={[styles.baseItem]}>{moment.tz(new Date(item.reminderDate), moment.tz.guess()).format('YYYY-MM-DD')}</Text>
				</View>
				<View style={{ flex: 1.5 }}>
					<TouchableHighlight
						style={styles.currentInventory}
						onPress={() => this.openModal()}
						underlayColor='#18376A'>
						<Text style={[styles.currentInventoryText, { padding: 5 }]}>
							{item.customReminderDate ? moment.tz(new Date(item.customReminderDate), moment.tz.guess()).format('YYYY-MM-DD') : 'N/A'}
						</Text>
					</TouchableHighlight>
				</View>
			</View>
		);
	};

	// displayNotDispatcheModal(wastageName) {
	// 	this.setState({ notDispatchedEdit: wastageName });
	// 	this.setState({ refresh: !this.state.refresh });
	// }


	displayReminders() {
		if (!this.getRemindersNew(this.getFilteredReceipts()) || this.getRemindersNew(this.getFilteredReceipts()).length == 0) {
			return (
				<View style={{ flex: 1 }}>
					<Text style={[styles.titleText, { textAlign: 'center' }]}>No Reminders Available</Text>
				</View>
			);

		} else {

			return (
				<><FlatList
					ListHeaderComponent={this.showHeader}
					extraData={this.state.refresh}
					data={this.props.customerReminder}
					renderItem={({ item, index, separators }) => (
						<TouchableHighlight
							onPress={() => this.onPressItem(item)}
							onShowUnderlay={separators.highlight}
							onHideUnderlay={separators.unhighlight}>
							{this.getRow(item, index, separators)}
						</TouchableHighlight>
					)}
					keyExtractor={item => `${item.customerId}${item.receipt}`}
				/>
					<Modal
						style={[styles.modal, styles.modal3]}
						coverScreen={true}
						position={"center"} ref={"customModal"}
						onClosed={() => this.modalClosed()}
						isDisabled={this.state.isDisabled}>
						<SetCustomReminderDate closeModal={this.closeModal} />
					</Modal></>
			)
		}
	}

	closeModal = () => {
        this.refs.customModal.close();
	};

	modalClosed() {

	}

	openModal = () => {
        this.refs.customModal.open();
    }


	subtractDays = (theDate, days) => {
		return new Date(theDate.getTime() - days * 24 * 60 * 60 * 1000);
	}

	getFilteredReceipts() {
		return this.props.receipts.filter(receipt => {
			return moment
				.tz(new Date(receipt.created_at), moment.tz.guess())
				.isBetween(this.subtractDays(new Date(), 90), new Date())
		}
		);
	}

	isDate(value) {
		switch (typeof value) {
			case 'number':
				return true;
			case 'string':
				return !isNaN(Date.parse(value));
			case 'object':
				if (value instanceof Date) {
					return !isNaN(value.getTime());
				}
			default:
				return false;
		}
	}

	getCurrentFilteredReceipts() {
		return this.getRemindersNew(this.getFilteredReceipts()).filter(receipt => {
			if (this.isDate(receipt.reminder)) {
				console.log('startDate', moment
					.tz(new Date(receipt.reminder), moment.tz.guess())
					.isBetween(new Date(this.props.dateFilter.startDate), new Date(this.props.dateFilter.endDate)));
				return moment
					.tz(new Date(receipt.reminder), moment.tz.guess())
					.isBetween(new Date(this.props.dateFilter.startDate), new Date(this.props.dateFilter.endDate));
			}
		}
		);
	}

	render() {
		console.log('customerReminder', this.props.customerReminder);
		console.log(this.props.dateFilter);
		console.log(this.getCurrentFilteredReceipts());
		console.log('getFilteredReceipts', this.getFilteredReceipts());
		console.log('getRemindersNew', this.getRemindersNew(this.getFilteredReceipts()));
		return (
			<View style={{ flex: 1, flexDirection: 'column' }}>
				<View style={{ flex: .15 }}>
					<DateFilter />
				</View>
				<View style={{ flex: .85, backgroundColor: 'white', marginLeft: 10, marginRight: 10 }}>
					{this.displayReminders()}
				</View>
			</View>
		);

	}
}

function mapStateToProps(state, props) {
	return {
		reportType: state.reportReducer.reportType,
		reminderData: state.reportReducer.reminderData,
		selectedCustomer: state.customerReducer.selectedCustomer,
		orderProducts: state.orderReducer.products,
		showView: state.customerBarReducer.showView,
		products: state.productReducer.products,
		dateFilter: state.reportReducer.dateFilter,
		receipts: state.receiptReducer.receipts,
		customerReminder: state.customerReminderReducer.customerReminder,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		reportActions: bindActionCreators(reportActions, dispatch),
		customerActions: bindActionCreators(customerActions, dispatch),
		toolbarActions: bindActionCreators(toolBarActions, dispatch),
		customerBarActions: bindActionCreators(customerBarActions, dispatch),
		reminderActions: bindActionCreators(reminderActions, dispatch),
		orderActions: bindActionCreators(orderActions, dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(RemindersReport);


const styles = StyleSheet.create({
	baseItem: {
		fontSize: 18
	},
	headerItem: {
		fontWeight: "bold",
		fontSize: 18,
	},
	headerItemCenter: {
		fontWeight: "bold",
		fontSize: 18,
		textAlign: 'center'
	},
	rowItem: {
		fontSize: 16,
		paddingLeft: 10,
		borderLeftWidth: 1,
		borderColor: 'black',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderRightWidth: 1
	},
	rowItemCenter: {
		fontSize: 16,
		paddingLeft: 10,
		borderLeftWidth: 1,
		borderColor: 'black',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderRightWidth: 1,
		textAlign: 'center'
	},
	modalPayment: {
        backgroundColor: 'white',
    },
    modal3: {
        width: '70%',
        height: 400,
    },
    modal: {
        justifyContent: 'center',
    },
	currentInventory: {
		marginRight: 2,
		marginLeft: 2,
		// marginTop:2,
		// paddingTop:2,
		// paddingBottom:2,
		backgroundColor: '#2858a7',
		borderRadius: 5,
		borderWidth: 1,
		borderColor: '#fff'
	},
	currentInventoryText: {
		fontSize: 16,
		color: '#fff',
		textAlign: 'center',
	},
	rowBackground: {
		backgroundColor: 'white'
	},

	headerBackground: {
		backgroundColor: 'white'
	},
	totalItem: {
		fontWeight: "bold",
		fontSize: 18,
		paddingLeft: 10,
	},
	titleItem: {
		fontWeight: "bold",
		fontSize: 20
	},
	titleText: {
		backgroundColor: 'white',
		height: 36,
		flexDirection: 'row',
	},

	leftHeader: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center'

	},
	lightBackground: {
		backgroundColor: 'white'
	},
	darkBackground: {
		backgroundColor: '#F0F8FF'
	},
	selectedBackground: {
		backgroundColor: '#9AADC8'
	}
});
