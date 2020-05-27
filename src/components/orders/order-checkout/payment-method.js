import React from "react";
import { View, Text, TextInput, CheckBox, StyleSheet } from "react-native";

import * as OrderActions from "../../../actions/OrderActions";
import * as CustomerActions from '../../../actions/CustomerActions';
import * as PaymentTypesActions from "../../../actions/PaymentTypesActions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

const widthQuanityModal = 1000;
const heightQuanityModal = 500;


class PaymentMethod extends React.PureComponent {
	render() {
		return (
			<View style={styles.checkBoxRow}>
				<View style={styles.flex1}>
					<CheckBox
						style={styles.checkBox}
						value={this.props.checkBox}
						onValueChange={this.props.checkBoxChange}
					/>
				</View>
				<View style={styles.flex3}>
					<Text style={styles.checkLabel}>
						{this.props.checkBoxLabel}
					</Text>
				</View>
				<View style={styles.flex3}>{this.showTextInput()}</View>
			</View>
		);
	}
	showTextInput() {
		if (
			this.props.parent.state.isCredit
		) {
			if (this.props.type === 'cash' && this.props.parent.state.isCash) {
				return (
					<TextInput
						underlineColorAndroid="transparent"
						onChangeText={this.props.valueChange}
						keyboardType="numeric"
						value={this.props.value}
						style={[styles.cashInput]}
					/>
				);
			} else if (this.props.type === 'credit') {
				return (
					<Text style={styles.checkLabel}>{this.props.value}</Text>
				);
			}

			if (
				this.props.type === 'mobile' &&
				this.props.parent.state.isMobile ||
				this.props.type === 'jibu-credit' &&
				this.props.parent.state.isJibuCredit ||
				this.props.type === 'cheque' &&
				this.props.parent.state.isCheque ||
				this.props.type === 'bank-transfer' &&
				this.props.parent.state.isBank
			) {
				return (
					<TextInput
						underlineColorAndroid="transparent"
						onChangeText={this.props.valueChange}
						keyboardType="numeric"
						value={this.props.value}
						style={[styles.cashInput]}
					/>
				);
			}
		}
		return null;
	}
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
export default connect(mapStateToProps, mapDispatchToProps)(PaymentMethod);

const styles = StyleSheet.create({

	flex: {
		flex: 1
	},

	flex3: {
		flex: 3
	},

	container: {
		flex: 1,
		backgroundColor: "#2858a7",

	},
	checkBoxRow: {
		flex: 1,
		flexDirection: 'row',
		marginTop: '1%',
		alignItems: 'center'
	},
	checkBox: {},
	checkLabel: {
		left: 20,
		fontSize: 20
	},
	totalText: {
		marginTop: 10,
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	},
	buttonText: {
		fontWeight: 'bold',
		fontSize: 30,
		alignSelf: 'center',
		color: 'white'
	},
	summaryText: {
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	},
	modal: {
		justifyContent: 'center',
		// alignItems: 'center'
	},

	modal2: {
		height: 230,
		backgroundColor: "#3B5998"
	},
	completeOrder: {
		backgroundColor: '#2858a7',
		borderRadius: 30,
		marginTop: '1%'
	},

	modal3: {
		// height: 300,
		// width: 500
		width: widthQuanityModal,
		height: heightQuanityModal,
	},

});
