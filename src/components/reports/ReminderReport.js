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
import PosStorage from "../../database/PosStorage";
import CustomerBar from "../customers/CustomerBar";
//import {ViewSwitcher} from "../../components/PosApp";
import DateFilter from './DateFilter';
import Events from 'react-native-simple-events';

import i18n from '../../app/i18n';

class RemindersReport extends Component {
	constructor(props) {
		super(props);
		this.state = {
			refresh: false
		};
		this.reminderDate = null;
		// this.endDate=null;
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
			<View>
				{/* <CustomerBar /> */}
				<DateFilter />
				<View style={[{ flex: 1, flexDirection: 'row', height: 50, alignItems: 'center' }, styles.headerBackground]}>
					<View style={[{ flex: 2 }]}>
						<Text style={[styles.headerItem, styles.leftMargin]}>account-name</Text>
					</View>
					<View style={[{ flex: 2.5 }]}>
						<Text style={[styles.headerItem]}>telephone-number</Text>
					</View>
					<View style={[{ flex: 2 }]}>
						<Text style={[styles.headerItem]}>address</Text>
					</View>
					<View style={[{ flex: 2.5 }]}>
						<Text style={[styles.headerItem]}>products</Text>
					</View>
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
			  frequency: this.pairwiseDifference(dateArray, dateArray.length),
			  avg: arrAvg(this.pairwiseDifference(dateArray, dateArray.length)),
			  reminder:this.addDays(new Date(lastDay),Math.ceil(arrAvg(this.pairwiseDifference(dateArray, dateArray.length)))),
			  dates: groupCustomers(data)[key].map(e => e.created_at)
			});
		  }
		console.log(final);
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

	// getReceipts(){
	//     receipts = PosStorage.getReceipts();


	// }
	getRow = (item, index, separators) => {
		// console.log("getRow -index: " + index)
		let isSelected = false;
		if (this.props.selectedCustomer && this.props.selectedCustomer.customerId === item.customerId) {
			console.log("Selected item is " + item.customerId);
			isSelected = true;
		}
		// if( true ) {
		return (
			<View style={[this.getRowBackground(index, isSelected), { flex: 1, flexDirection: 'row', height: 100, alignItems: 'center' }]}>
				<View style={{ flex: 2 }}>
					<Text style={[styles.baseItem, styles.leftMargin]}>{item.name}</Text>
				</View>
				<View style={{ flex: 2.5 }}>
					<Text style={[styles.baseItem]}>{item.phoneNumber}</Text>
				</View>
				<View style={{ flex: 2 }}>
					<Text style={[styles.baseItem]}>{item.address}</Text>
				</View>

				<View style={{ flex: 2.5 }}>
					<Text style={[styles.baseItem]}>{item.product_name}</Text>
				</View>
			</View>
		);
		// }else{
		// 	return (<View/>);
		// }
	};

	getRowBackground = (index, isSelected) => {
		if (isSelected) {
			return styles.selectedBackground;
		} else {
			return ((index % 2) === 0) ? styles.lightBackground : styles.darkBackground;
		}
	};


	displayReminders() {
		if (!this.props.reminderData || this.props.reminderData.length == 0) {
			return (
				<View style={{ flex: 1 }}>
					<View>{this.showHeader()}</View>
					<Text style={styles.titleText}>No Reminders Available</Text>
				</View>
			);

		} else {
			console.log("I AM IN THE REPORTS=>" + Object.values(this.props.reminderData));

			return (
				<FlatList
					ListHeaderComponent={this.showHeader}
					extraData={this.state.refresh}
					data={this.getRemindersData()}
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
		console.log(this.props.receipts);
		console.log('getRemindersNew', this.getRemindersNew(this.props.receipts))
		if (this.props.reportType === "reminders") {
			return (
				<View style={{ flex: 1 }}>
					<View style={{ flex: .7, backgroundColor: 'white', marginLeft: 10, marginRight: 10, marginTop: 10, }}>
						<View style={styles.titleText}>
							<View style={styles.leftHeader}>
								<Text style={styles.titleItem}>Reminders</Text>
							</View>
						</View>

						{this.displayReminders()}
					</View>
				</View>
			);
		} else {
			return null;
		}

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
