import React from 'react';
if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React);
  }
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
import slowlog from 'react-native-slowlog';

class RemindersReport extends React.PureComponent {
	constructor(props) {
		super(props);
		slowlog(this, /.*/);
		this.state = {
			refresh: false,
			filterDate: new Date(),
			selectedReminder: {},
			isDateTimePickerVisible: false,
			isDatePickerFilterVisible: false,
			checkedType: {},
			customReminderDate: new Date(),

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
				<View style={[{ flex: 2 }]}>
					<Text style={[styles.headerItem]}>Custom Reminder</Text>
				</View>
			</View>
		);
	};

	getRow = (item, index, separators) => {
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
					<Text style={[styles.baseItem]}>{format(parseISO(item.lastPurchaseDate), 'iiii d MMM yyyy')}
					</Text>
				</View>
				<View style={{ flex: 2 }}>
					<TouchableHighlight
						style={styles.currentInventory}
						onPress={() => this.showDateTimePicker(item)}
						underlayColor='#18376A'>
						<Text style={[styles.currentInventoryText, { padding: 5 }]}>
							{item.customReminderDate ? format(new Date(item.customReminderDate), 'iiii d MMM yyyy'): 'SET'}
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
				<View style={{ flex: 1, marginTop: '50%' }}>
					<Text style={[styles.titleText, { textAlign: 'center' }]}>No Reminders Available</Text>
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
			if (!item.customReminderDate) {
				if (isSameDay(parseISO(item.reminder_date), this.props.dateFilter.startDate)) {
					return true;
				} else {
					return false;
				}
			}

			if (item.customReminderDate) {
				if (isSameDay(parseISO(item.customReminderDate), this.props.dateFilter.startDate)) {
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
			<View style={{ flex: 1, flexDirection: 'column' }}>
				<View style={{ flex: .15, flexDirection: 'row' }}>
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
		backgroundColor: '#f1f1f1',
		borderColor: '#CCC',
		padding: 5
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
	},

	emptyListStyle: {
		flex: 1,
		justifyContent: 'center'
	  },
	  emptyMessageStyle: {
		textAlign: 'center',
		fontWeight: 'bold',
		fontSize: 18
		}
});
