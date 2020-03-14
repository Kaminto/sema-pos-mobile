import React from "react";
import { View, Text, StyleSheet } from "react-native";

import * as OrderActions from "../../../actions/OrderActions";
import * as CustomerActions from '../../../actions/CustomerActions';
import * as PaymentTypesActions from "../../../actions/PaymentTypesActions";
import SettingRealm from '../../../database/settings/settings.operations';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

class PaymentDescription extends React.PureComponent {
	render() {
		return (
			<View style={[{ flex: 1, flexDirection: 'row', marginTop: '1%' }]}>
				<View style={[{ flex: 3 }]}>
					<Text style={[styles.totalTitle]}>{this.props.title}</Text>
				</View>
				<View style={[{ flex: 2 }]}>
		<Text style={[styles.totalValue]}>{this.getCurrency().toUpperCase()} {this.props.total}</Text>
				</View>
			</View>
		);
	}

	getCurrency = () => {
		let settings = SettingRealm.getAllSetting();
		return settings.currency;
	};
}

function mapStateToProps(state, props) {
	return {
		products: state.orderReducer.products,
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		selectedPaymentTypes: state.paymentTypesReducer.selectedPaymentTypes,
		selectedDiscounts: state.orderReducer.discounts,
		flow: state.orderReducer.flow,
		channel: state.orderReducer.channel,
		payment: state.orderReducer.payment,
		selectedCustomer: state.customerReducer.selectedCustomer
	};
}

function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		paymentTypesActions: bindActionCreators(PaymentTypesActions, dispatch)
	};
}
export default connect(mapStateToProps, mapDispatchToProps)(PaymentDescription);

const styles = StyleSheet.create({

	container: {
		flex: 1,
		backgroundColor: "#2858a7",

	},
	totalText: {
		marginTop: 10,
		fontWeight: 'bold',
		fontSize: 16,
		color: 'black',
		alignSelf: 'center'
	},

	totalTitle: {
		textTransform: 'uppercase',
		fontWeight: 'bold'
	},

	totalValue: {
		fontSize: 16,
		fontWeight: 'bold',
	},

});
