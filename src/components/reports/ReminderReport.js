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

import DateFilter from './DateFilter';
import Events from 'react-native-simple-events';

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
					<View style={[{ flex: 2 }]}>
						<Text style={[styles.headerItem]}>Address</Text>
					</View>
					<View style={[{ flex: 1.5 }]}>
						<Text style={[styles.headerItem]}>Last Purchase Date</Text>
					</View>
					<View style={[{ flex: 1.5 }]}>
						<Text style={[styles.headerItem]}>Frequency</Text>
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

	addDays =(theDate, days) => {
		return new Date(theDate.getTime() + days*24*60*60*1000);
	}

	getRemindersNew = (data) => {
		const groupCustomers = this.groupBy("customer_account_id");
		groupCustomers(data);

		let final = [];
		for (let key of Object.keys(groupCustomers(data))) {
			let dateArray = groupCustomers(data)[key].map(e => e.created_at);
			const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
			const dateLength =groupCustomers(data)[key].map(e => e.created_at).length - 1;
			const lastDay = groupCustomers(data)[key].map(e => e.created_at)[dateLength];
			final.push({
			  customer: key,
			  name: groupCustomers(data)[key][0].customer_account.name,
			  phoneNumber: groupCustomers(data)[key][0].customer_account.phoneNumber,
			  address: groupCustomers(data)[key][0].customer_account.address,
			  lastPurchaseDate: new Date(lastDay),
			  frequency: this.pairwiseDifference(dateArray, dateArray.length),
			  avg: arrAvg(this.pairwiseDifference(dateArray, dateArray.length)).toFixed(0),
			  reminder:this.addDays(new Date(lastDay),Math.ceil(arrAvg(this.pairwiseDifference(dateArray, dateArray.length)))),
			  dates: groupCustomers(data)[key].map(e => e.created_at)
			});
		  }
		console.log("Galen Ask" + JSON.stringify(final));
		return final;
	}

	onPressItem = (item) => {
		console.log("_onPressReminderItem");
		this.props.customerActions.CustomerSelected(item);
		//this.props.customerActions.SearchCustomers(item);
		//this.props.customerBarActions.ShowHideCustomers(0);
		this.setState({ refresh: !this.state.refresh });
		//this.props.orderActions.ClearOrder();
		//this.props.orderActions.SetOrderFlow('products');
		Events.trigger('onOrder', { customer: item });
		//this.props.toolbarActions.ShowScreen('orderReminder');
		this.props.toolbarActions.ShowScreen("main");
		//

	};


	getRow = (item, index, separators) => {
		// console.log("getRow -index: " + index)
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
				<View style={{ flex: 2 }}>
					<Text style={[styles.baseItem]}>{item.address}</Text>
				</View>
				<View style={{ flex: 1.5 }}>
					<Text style={[styles.baseItem]}>{item.lastPurchaseDate}</Text>
				</View>
				<View style={{ flex: 1.5 }}>
					<Text style={[styles.baseItem]}>{item.avg}</Text>
				</View>
			</View>
		);
	};


	displayReminders() {
		if (!this.getRemindersNew(this.props.receipts) || this.getRemindersNew(this.props.receipts).length == 0) {
			return (
				<View style={{ flex: 1 }}>
					<Text style={[styles.titleText, {textAlign: 'center'}]}>No Reminders Available</Text>
				</View>
			);

		} else {

			return (
					<FlatList
						ListHeaderComponent={this.showHeader}
						extraData={this.state.refresh}
						data={this.getRemindersNew(this.props.receipts)}
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
			)
		}
	}

	render() {
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
