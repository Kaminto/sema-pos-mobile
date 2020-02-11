import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableHighlight, Button, Alert, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as reportActions from "../../actions/ReportActions";
import * as customerActions from '../../actions/CustomerActions';
import * as customerBarActions from "../../actions/CustomerBarActions";
import * as toolBarActions from "../../actions/ToolBarActions";
import * as orderActions from "../../actions/OrderActions";
import * as reminderActions from "../../actions/ReminderActions.js";
import CustomerReminderRealm from '../../database/customer-reminder/customer-reminder.operations';
import * as CustomerReminderActions from '../../actions/CustomerReminderActions';
import DateFilter from './DateFilter';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment-timezone';
import i18n from '../../app/i18n';

class RemindersReport extends Component {
	constructor(props) {
		super(props);
		this.state = {
			refresh: false,
			selectedReminder: {},
			isDateTimePickerVisible: false,
			checkedType: {},
			customReminderDate: new Date(),
		};
		this.reminderDate = null;
	}
	componentDidMount() {
		this.props.reportActions.getRemindersReport(this.props.dateFilter.currentDate);
	}

	showDateTimePicker = (reminder) => {
		this.setState({ selectedReminder: reminder });
		this.setState({ isDateTimePickerVisible: true });
	};

	hideDateTimePicker = () => {
		this.setState({ isDateTimePickerVisible: false });
	};

	handleDatePicked = date => {

		Alert.alert(
			'Notice ',
			`You are about to set a custom Reminder`,
			[{
				text: 'OK',
				onPress: () => {
					console.log('OK Pressed');
					console.log(this.state.selectedReminder);
					CustomerReminderRealm.setCustomReminder(this.state.selectedReminder.customer_account_id, new Date(date))
					this.props.customerReminderActions.setCustomerReminders(
						CustomerReminderRealm.getCustomerReminders()
					);
					this.hideDateTimePicker();

				}
			}, {
				text: 'Cancel',
				onPress: () => {
					console.log('Cancel Pressed')
					this.hideDateTimePicker();
				},
				style: 'cancel',
			},],
			{ cancelable: false }
		);

	};


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
				{/* <View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItem]}>Frequency</Text>
				</View> */}
				<View style={[{ flex: 1.5 }]}>
					<Text style={[styles.headerItem]}>Reminder Date</Text>
				</View>
				<View style={[{ flex: 1.5 }]}>
					<Text style={[styles.headerItem]}>Custom Reminder</Text>
				</View>
			</View>
		);
	};

	getRow = (item, index, separators) => {
		console.log('index', index);
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
				{/* <View style={{ flex: 1 }}>
					<Text style={[styles.baseItem]}>{item.frequency}</Text>
				</View> */}
				<View style={{ flex: 1.5 }}>
					<Text style={[styles.baseItem]}>{moment.tz(new Date(item.reminder_date), moment.tz.guess()).format('ddd Do MMM YYYY') + ' ('+item.frequency+')'}</Text>
				</View>
				<View style={{ flex: 1.5 }}>
					<TouchableHighlight
						style={styles.currentInventory}
						onPress={() => this.showDateTimePicker(item)}
						underlayColor='#18376A'>
						<Text style={[styles.currentInventoryText, { padding: 5 }]}>
							{item.customReminderDate ? moment.tz(new Date(item.customReminderDate), moment.tz.guess()).format('ddd Do MMM YYYY') : 'SET'}
						</Text>
					</TouchableHighlight>
					<DateTimePicker
						key={index}
						minimumDate={new Date()}
						isVisible={this.state.isDateTimePickerVisible}
						onConfirm={this.handleDatePicked}
						onCancel={this.hideDateTimePicker}
					/>
				</View>
			</View>
		);
	};


	displayReminders() {
		if (this.props.customerReminder.length == 0) {
			return (
				<View style={{ flex: 1 }}>
					<Text style={[styles.titleText, { textAlign: 'center' }]}>No Reminders Available</Text>
				</View>
			);

		} else {

			return (
				<FlatList
					ListHeaderComponent={this.showHeader}
					extraData={this.state.refresh}
					data={this.props.customerReminder}
					renderItem={({ item, index, separators }) => (
						<TouchableHighlight
							onShowUnderlay={separators.highlight}
							onHideUnderlay={separators.unhighlight}>
							{this.getRow(item, index, separators)}
						</TouchableHighlight>
					)}
					keyExtractor={item => `${item.customerId}${item.receipt}`}
				/>
			)
		}
	}

	closeModal = () => {
		this.refs.customModal.close();
	};

	modalClosed() {

	}

	openModal = () => {
		this.setState({ selectedReminder: item });
		this.refs.customModal.open();
	}

	render() {
		console.log('customerReminder', this.props.customerReminder);
		console.log(this.props.dateFilter);
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
		customerReminderActions: bindActionCreators(CustomerReminderActions, dispatch),
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
