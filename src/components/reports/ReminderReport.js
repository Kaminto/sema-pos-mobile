import React from 'react';
import { Text, View, StyleSheet, TouchableHighlight, Alert, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as customerActions from '../../actions/CustomerActions';
import * as reminderActions from "../../actions/ReminderActions.js";
import CustomerReminderRealm from '../../database/customer-reminder/customer-reminder.operations';
import * as CustomerReminderActions from '../../actions/CustomerReminderActions';
import DateFilter from './ReminderDateFilter';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { format, parseISO, isSameDay } from 'date-fns';


class RemindersReport extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			refresh: false,
			filterDate: new Date(),
			selectedReminder: {},
			isDateTimePickerVisible: false,
			isDatePickerFilterVisible: false,
			checkedType: {},
			custom_reminder_date: new Date(),

		};

		this.reminderDate = null;
	}

	showDateTimePicker = (reminder) => {
		this.setState({ selectedReminder: reminder });
		this.setState({ isDateTimePickerVisible: true });
	};

	showDatePickerFilter = () => {
		this.setState({ isDatePickerFilterVisible: true });
	};

	hideDateTimePicker = () => {
		this.setState({ isDateTimePickerVisible: false });
	};


	hideDatePickerFilter = () => {
		this.setState({ isDatePickerFilterVisible: false });
	};

	handleDatePickedFilter = date => {

		this.setState({ filterDate: new Date(date) })
		this.hideDatePickerFilter();

	};

	handleDatePicked = date => {

		Alert.alert(
			'Notice ',
			`You are about to set a custom Reminder`,
			[{
				text: 'OK',
				onPress: () => {
					CustomerReminderRealm.setCustomReminder(this.state.selectedReminder.customer_account_id, new Date(date))
					this.props.customerReminderActions.setCustomerReminders(
						CustomerReminderRealm.getCustomerReminders()
					);
					this.hideDateTimePicker();

				}
			}, {
				text: 'Cancel',
				onPress: () => {
					this.hideDateTimePicker();
				},
				style: 'cancel',
			},],
			{ cancelable: false }
		);

	};


	showHeader = () => {
		return (
			<View style={styles.headerBackground}>
				<View style={styles.flex2}>
					<Text style={styles.headerItem}>Customer Name</Text>
				</View>
				<View style={styles.flex15}>
					<Text style={styles.headerItem}>Phone Number</Text>
				</View>
				<View style={styles.flex15}>
					<Text style={styles.headerItem}>Address</Text>
				</View>
				<View style={styles.flex2}>
					<Text style={styles.headerItem}>Last Purchase Date</Text>
				</View>
				<View style={styles.flex2}>
					<Text style={styles.headerItem}>Custom Reminder</Text>
				</View>
			</View>
		);
	};

	getRow = (item, index, separators) => {
		return (
			<View style={styles.rowCont}>
				<View style={styles.flex2}>
					<Text style={[styles.baseItem, styles.leftMargin]}>{item.customer.name}</Text>
				</View>
				<View style={styles.flex15}>
					<Text style={styles.baseItem}>{item.customer.phoneNumber}</Text>
				</View>
				<View style={styles.flex15}>
					<Text style={styles.baseItem}>{item.customer.address}</Text>
				</View>
				<View style={styles.flex2}>
					<Text style={styles.baseItem}>{format(parseISO(item.last_purchase_date), 'iiii d MMM yyyy')}
					</Text>
				</View>
				<View style={styles.flex2}>
					<TouchableHighlight
						style={styles.currentInventory}
						onPress={() => this.showDateTimePicker(item)}
						underlayColor='#18376A'>
						<Text style={styles.currentInventoryText}>
							{item.custom_reminder_date ? format(new Date(item.custom_reminder_date), 'iiii d MMM yyyy'): 'SET'}
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
		if (this.props.customerReminder.length <= 0) {
			return (
				<View style={styles.tltxtCont}>
					<Text style={styles.titleText}>No Reminders Available</Text>
				</View>
			);

		} else {

			return (
				<View>
				{this.prepareData().length?

          (
				<FlatList
					ListHeaderComponent={this.showHeader}
					extraData={this.state.refresh}
					data={this.prepareData()}
					renderItem={({ item, index, separators }) => (
						<TouchableHighlight
							onShowUnderlay={separators.highlight}
							onHideUnderlay={separators.unhighlight}>
							{this.getRow(item, index, separators)}
						</TouchableHighlight>
					)}
					keyExtractor={item => `${item.customerId}${item.receipt}`}
				/>)
				:
				(
				  <View style={styles.emptyListStyle}>
					<Text style={styles.emptyMessageStyle}>No Reminders Available.</Text>
				  </View>
				)
		}
		</View>

			)
		}
	}

	prepareData() {
		return this.filterDate(this.props.customerReminder);
	}

	formateDate(date) {
		return format(new Date(date), 'yyyy-MM-dd') ;
	}

	filterDate(data) {
		let filteredItems = data.filter((item) => {
			if (!item.custom_reminder_date) {
				if (isSameDay(parseISO(item.reminder_date), this.props.dateFilter.currentDate)) {
					return true;
				} else {
					return false;
				}
			}

			if (item.custom_reminder_date) {
				if (isSameDay(parseISO(item.custom_reminder_date), this.props.dateFilter.currentDate)) {
					return true;
				} else {
					return false;
				}
			}
			return true;
		});
		return filteredItems
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
		return (
			<View style={styles.remContainer}>
				<View style={styles.dateCont}>
					<DateFilter />
				</View>
				<View style={styles.remindersCont}>
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
		products: state.productReducer.products,
		dateFilter: state.reportReducer.dateFilter,
		receipts: state.receiptReducer.receipts,
		customerReminder: state.customerReminderReducer.customerReminder,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		customerActions: bindActionCreators(customerActions, dispatch),
		reminderActions: bindActionCreators(reminderActions, dispatch),
		customerReminderActions: bindActionCreators(CustomerReminderActions, dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(RemindersReport);

const styles = StyleSheet.create({
	baseItem: {
		fontSize: 18
	},

	flex2: {
		flex: 2
	},

	flex15: {
		flex: 1.5
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
	remindersCont: {
		flex: .85, backgroundColor: 'white', marginLeft: 10, marginRight: 10
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
		backgroundColor: '#2858a7',
		borderRadius: 5,
		borderWidth: 1,
		borderColor: '#fff'
	},
	currentInventoryText: {
		fontSize: 16,
		color: '#fff',
		textAlign: 'center',
		padding: 5
	},
	rowBackground: {
		backgroundColor: 'white'
	},

	tltxtCont:{
		flex: 1, marginTop: '50%'
	},

	dateCont: {
		flex: .15, flexDirection: 'row'
	},

	remContainer: {
		flex: 1, flexDirection: 'column', backgroundColor: 'white'
	},

	headerBackground: {
		backgroundColor: '#f1f1f1',
		borderColor: '#CCC',
		padding: 5,
		flex: 1, flexDirection: 'row', height: 50, alignSelf: 'center'
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
		textAlign: 'center'
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
	},

	emptyListStyle: {
		flex: 1,
		justifyContent: 'center'
	  },
	  emptyMessageStyle: {
		marginTop: '40%',
		textAlign: 'center',
		fontWeight: 'bold',
		fontSize: 18
		},
		rowCont: {
			flex: 1, flexDirection: 'row', height: 50, alignItems: 'center'
		}
});
