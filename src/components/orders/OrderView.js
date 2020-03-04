import React from "react";
import { View, StyleSheet } from 'react-native';
import ProductListScreen from './ProductListScreen';
import OrderSummaryScreen from "./OrderSummaryScreen";
import * as OrderActions from "../../actions/OrderActions";

import * as CustomerActions from "../../actions/CustomerActions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";


class OrderView extends React.PureComponent {
	constructor(props) {
		super(props);
	}


	render() {
		return (
			<View style={styles.orderView}>
				<ProductListScreen />
				<OrderSummaryScreen />
			</View>
		);
	}
	componentDidMount(){
		this.props.navigation.setParams({ 'ordertitle': this.props.selectedCustomer.name + "'s Order" });
	}

	componentWillUnmount() {
		this.props.orderActions.ClearOrder();
	}

}
function mapStateToProps(state) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer
	};
}
function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderView);

const styles = StyleSheet.create({
	orderView: {
		flex: 1,
		backgroundColor: "#ABC1DE",
		flexDirection: 'row'
	}
});
