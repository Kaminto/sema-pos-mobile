import React, { Component } from "react"
import { View, Text, FlatList, ScrollView, TouchableHighlight, StyleSheet } from "react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as OrderActions from "../../actions/OrderActions";
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import * as Utilities from "../../services/Utilities";
import * as ToolbarActions from '../../actions/ToolBarActions';
import i18n from "../../app/i18n";
import Modal from 'react-native-modalbox';
import ToggleSwitch from 'toggle-switch-react-native';

class OrderTotal extends Component {

	constructor(props) {
		super(props);
		// slowlog(this, /.*/);
		this.state = {
		};
	}

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
					console.log('finalAmount', i.product.description);
					totalAmount = totalAmount - i.finalAmount;
				}
				 else if (i.product.description === 'delivery') {
					console.log('finalAmount', i.product.description);
					totalAmount = totalAmount + i.finalAmount;
				} else {
					totalAmount = totalAmount + i.finalAmount;
				}
			}
			return totalAmount;

			// return this.props.products.reduce((total, item) => {

			// 	if (item.product.description === 'discount') {
			// 		console.log('finalAmount', item.product.description);
			// 		return total - item.finalAmount;
			// 	} else {
			// 		return total + item.finalAmount;
			// 	}

			// }, 0);
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
		orderActions: bindActionCreators(OrderActions, dispatch),
		toolbarActions: bindActionCreators(ToolbarActions, dispatch)
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
	baseItem: {
		fontWeight: 'bold',
		fontSize: 16,
		color: 'black',
		paddingTop: 4,
		paddingBottom: 4,

	},
	leftMargin: {
		left: 10
	},
	modal4: {
		height: 300
	},

});
