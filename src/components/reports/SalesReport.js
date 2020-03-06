import React from 'react';

import { Text, View, StyleSheet, FlatList, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as reportActions from "../../actions/ReportActions";
import DateFilter from "./DateFilter";
import { parseISO, isSameDay } from 'date-fns';

import i18n from '../../app/i18n';

class SalesReport extends React.PureComponent {
	constructor(props) {
		super(props);
		this.startDate = new Date();
		this.endDate = this.addDays(new Date(), 1);
		this.state = {
			refreshing: false,
		};
	}

	_onRefresh = async () => {
		this.setState({
			refreshing: true
		});

		await this.getTotalTypes();
		await this.getSalesData();

		this.setState({
			refreshing: false
		});
	  }


	addDays = (theDate, days) => {
		return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
	};
	render() {
		return (
			<View style={{ flex: 1, backgroundColor: 'white' }}>
				<ScrollView
						refreshControl={
						<RefreshControl
							refreshing={this.state.refreshing}
							onRefresh={this._onRefresh}
						/>
					}>
				<View style={{
					flex: .2,
					backgroundColor: 'white',
					marginLeft: 10,
					marginRight: 10,
					marginBottom: 10,
				}}>
					<View style={{ flex: 1, flexDirection: 'row' }}>
						<DateFilter />
						<View style={{ flex: .7, height: 90, borderRadius: 10, flexDirection: 'row', marginTop: 10, backgroundColor: '#2462a0', overflow: 'hidden', color: '#fff' }}>
							<View style={{ height: 90, flex: 1, color: '#fff' }} >
								<Text style={[styles.totalLabel, { flex: .4 }]}>{i18n.t('total-liters').toUpperCase()}</Text>
								<Text style={[styles.totalItem, { flex: .6 }]}>{this.props.salesData.totalLiters.toFixed(1)} L</Text>
							</View>
							<View style={{ height: 90, flex: 1, color: '#fff' }} >
								<Text style={[styles.totalLabel, { flex: .4 }]}>{i18n.t('total-sales').toUpperCase()}</Text>
								<Text style={[styles.totalItem, { flex: .6 }]}>{this.props.salesData.totalSales}</Text>
							</View>
							<View style={{ height: 90, flex: 1, color: '#fff' }} >
								<Text style={[styles.totalLabel, { flex: .4 }]}>DEBT COLLECTED</Text>
								<Text style={[styles.totalItem, { flex: .6 }]}>{this.props.salesData.totalDebt}</Text>
							</View>
						</View>
					</View>
				</View>
				<View style={{ flex: .8, flexDirection: 'row', backgroundColor: 'white', marginLeft: 10, marginRight: 10, marginTop: 10, }}>
					<View style={{ flex: .6, padding: 10 }}>
						<FlatList
							data={this.getSalesData()}
							ListHeaderComponent={this.showHeader}
							extraData={this.state.refreshing}
							renderItem={({ item, index, separators }) => (
								<View>
									{this.getRow(item, index, separators)}
								</View>
							)}
							keyExtractor={item => item.sku}
							initialNumToRender={50}
						/>
					</View>
					<View style={{ flex: .4, padding: 10 }}>
						<FlatList
							// onRefresh={this._onRefresh}
							data={this.getTotalTypes()}
							ListHeaderComponent={this.showPaymentHeader}
							extraData={this.state.refreshing}
							renderItem={({ item, index, separators }) => (
								<View>
									{this.getPaymentRow(item, index, separators)}
								</View>
							)}
							keyExtractor={item => item.name}
						/>
					</View>

				</View>
				</ScrollView>
			</View>
		);
	}

	getSalesData() {
		let sales = [];
		if (this.props.dateFilter.hasOwnProperty("startDate") && this.props.dateFilter.hasOwnProperty("endDate")) {
			if (this.props.dateFilter.startDate == this.startDate && this.props.dateFilter.endDate == this.endDate) {
				sales = this.props.salesData.salesItems;
			} else {
				// Get new data
				this.startDate = this.props.dateFilter.startDate;
				this.endDate = this.props.dateFilter.endDate;
				this.updateReport();
				sales = this.props.salesData.salesItems;
			}
		} else {
			sales = this.props.salesData.salesItems;
		}
		return sales;
	}


	getTotalTypes() {
		let groupedTypes = { ...this.groupPaymentTypes() };
		let groupedTotals = [];
		let objKeys = [...Object.keys(groupedTypes)];
		let totalEarnings = 0;
		for (let key of objKeys) {
			let amount = groupedTypes[key].reduce((total, item) => {
				console.log("Final tests "  + key + " = " + total + " - " +  item.amount, + " - " + totalEarnings)
				return total + item.amount;
			}, 0);
			groupedTotals.push({
				name: key,
				totalAmount: amount
			});
			totalEarnings = totalEarnings + Number(amount);
		}

		groupedTotals.push({
			name: 'TOTAL EARNINGS',
			totalAmount: totalEarnings
		});

		return groupedTotals;
	}

	groupPaymentTypes() {
		let types = [...this.comparePaymentTypes()],
			result = types.reduce(function (r, a) {
				r[a.name] = r[a.name] || [];
				r[a.name].push(a);
				return r;
			}, Object.create(null));
		return result;
	}

	comparePaymentTypes() {
		let filteredReceiptPaymentTypes = [];
		if (this.props.dateFilter.hasOwnProperty("startDate") && this.props.dateFilter.hasOwnProperty("endDate")) {
			filteredReceiptPaymentTypes = this.props.receiptsPaymentTypes.filter(receiptpayment =>
				isSameDay(parseISO(receiptpayment.created_at), this.props.dateFilter.startDate)
			);
		}

		let paymentTypes = [...this.props.paymentTypes];
		let finalreceiptsPaymentTypes = [];
		for (let receiptsPaymentType of filteredReceiptPaymentTypes) {
			const rpIndex = paymentTypes.map(function (e) { return e.id }).indexOf(receiptsPaymentType.payment_type_id);
			if (rpIndex >= 0) {
				receiptsPaymentType.name = paymentTypes[rpIndex].name;
				finalreceiptsPaymentTypes.push(receiptsPaymentType);
			}
		}
		return finalreceiptsPaymentTypes;
	}

	getRow = (item) => {
		return (
			<View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center' }, styles.rowBackground]}>
				<View style={[{ flex: 1 }]}>
					<Text numberOfLines={1} style={[styles.rowItem, styles.leftMargin]}>
						{item.description}</Text>
				</View>
				<View style={[{ flex: 1, }]}>
					<Text style={[styles.rowItemCenter]}>{item.quantity}</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.rowItemCenter]}>{!isNaN(item.totalLiters) ? item.totalLiters.toFixed(1) : 0}</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.rowItemCenter]}>{item.totalSales.toFixed(2)}</Text>
				</View>
			</View>
		);
	};

	getPaymentRow = (item) => {
		return (
			<View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center' }, styles.rowBackground]}>

				<View style={[{ flex: 1, }]}>
					<Text style={[styles.rowItemCenter]}>
					{item.name == 'credit' ? 'WALLET' : item.name.toUpperCase()}
					</Text>
				</View>

				<View style={[{ flex: 1 }]}>
					<Text style={[styles.rowItemCenter]}>{item.totalAmount !== null ? item.totalAmount.toFixed(2) : 0}</Text>
				</View>
			</View>
		);
	};

	showHeader = () => {
		return (
			<View style={[{ flex: 1, flexDirection: 'row', height: 50, alignItems: 'center' }, styles.headerBackground]}>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItem, styles.leftMargin]}>{'Product'.toUpperCase()}</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItemCenter]}>{i18n.t('quantity').toUpperCase()}</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItemCenter]}>{i18n.t('total-liters').toUpperCase()}</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItemCenter]}>{i18n.t('total-sales').toUpperCase()}</Text>
				</View>
			</View>
		);
	};

	showPaymentHeader = () => {
		return (
			<View style={[{ flex: 1, flexDirection: 'row', height: 50, alignItems: 'center' }, styles.headerBackground]}>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItemCenter]}>PAYMENT METHOD</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItemCenter]}>AMOUNT</Text>
				</View>
			</View>
		);
	};

	updateReport() {
		this.props.reportActions.GetSalesReportData(this.startDate, this.endDate);
	}
}

function mapStateToProps(state, props) {
	return {
		salesData: state.reportReducer.salesData,
		dateFilter: state.reportReducer.dateFilter,
		receiptsPaymentTypes: state.paymentTypesReducer.receiptsPaymentTypes,
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		receipts: state.receiptReducer.receipts,
	};
}

function mapDispatchToProps(dispatch) {
	return { reportActions: bindActionCreators(reportActions, dispatch) };
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(SalesReport);

const styles = StyleSheet.create({

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
		paddingTop: 5,
		paddingBottom: 5
	},
	rowItemCenter: {
		fontSize: 16,
		paddingLeft: 10,
		paddingTop: 5,
		paddingBottom: 5,
		textAlign: 'center'
	},

	rowBackground: {
		backgroundColor: 'white',
		borderLeftWidth: 1,
		borderColor: '#f1f1f1',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderRightWidth: 1,
		padding: 5
	},

	headerBackground: {
		backgroundColor: '#f1f1f1',
		borderColor: '#CCC',
		padding: 5
	},
	totalItem: {
		fontWeight: "bold",
		fontSize: 24,
		color: 'white',
		paddingLeft: 10,
	},
	totalLabel: {
		fontWeight: "bold",
		fontSize: 18,
		color: 'white',
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

});
