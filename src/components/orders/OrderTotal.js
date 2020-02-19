import React, { Component } from "react";
if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React);
  }
import { View, Text,  StyleSheet } from "react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as OrderActions from "../../actions/OrderActions";
import * as Utilities from "../../services/Utilities";
import i18n from "../../app/i18n";

class OrderTotal extends React.PureComponent {

	constructor(props) {
		super(props);
	}

	// static whyDidYouRender = true;

	render() {
		return (
			<View style={styles.container}>
				<Text style={[{ flex: 2 }, styles.totalText]}>{i18n.t('order-total')}</Text>
				<Text style={[{ flex: 3 }, styles.totalText]}>{this.getCurrency().toUpperCase()} {Utilities.formatCurrency(this.getAmount())}</Text>
			</View>
		);
	}

	getAmount = () => {
		if (this.props.products.length > 0) {
			let totalAmount = 0;
			for (let i of this.props.products) {
				if (i.product.description === 'discount') {
					totalAmount = totalAmount - i.finalAmount;
				}
				 else if (i.product.description === 'delivery') {
					totalAmount = totalAmount + i.finalAmount;
				} else {
					totalAmount = totalAmount + i.finalAmount;
				}
			}
			return totalAmount;

		}
		return 0;
	};

	getCurrency = () => {
		if (this.props.products.length > 0) {
			return this.props.products[0].product.priceCurrency;
		}
		return '';
	};
}

function mapStateToProps(state, props) {
	return {
		products: state.orderReducer.products,
		channel: state.orderReducer.channel
	};
}
function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderTotal);

const styles = StyleSheet.create({
	container: {
		flex: 2,
		backgroundColor: "#e0e0e0",
		borderColor: '#2858a7',
		borderTopWidth: 5,
		borderRightWidth: 5,

	},
	totalText: {
		marginTop: 10,
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	},
	leftMargin: {
		left: 10
	}

});
