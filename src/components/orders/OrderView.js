import React, { Component } from "react";
import { View, StyleSheet } from 'react-native';
import ProductListScreen from './ProductListScreen';
import OrderSummaryScreen from "./OrderSummaryScreen";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as OrderActions from "../../actions/OrderActions";
import * as CustomerActions from '../../actions/CustomerActions';


class OrderView extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View style={styles.orderView}>
				<ProductListScreen />
				<OrderSummaryScreen
					navigation={this.props.navigation} />
			</View>
		);
	}

	componentDidMount() {
	}

	componentWillUnmount() {
		this.props.orderActions.ClearOrder();
	}

}
function mapStateToProps(state) {
	return {
		flow: state.orderReducer.flow,
		selectedCustomer: state.customerReducer.selectedCustomer
	};
}

function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch)
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
