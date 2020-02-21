import React from "react";
import { View, StyleSheet } from 'react-native';
import ProductListScreen from './ProductListScreen';
import OrderSummaryScreen from "./OrderSummaryScreen";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as OrderActions from "../../actions/OrderActions";
import * as CustomerActions from '../../actions/CustomerActions';
import slowlog from 'react-native-slowlog';

class OrderView extends React.PureComponent {
	constructor(props) {
		super(props);
		slowlog(this, /.*/);
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
