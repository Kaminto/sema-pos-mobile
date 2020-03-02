import React from "react";
import { View, StyleSheet } from 'react-native';
import ProductListScreen from './ProductListScreen';
import OrderSummaryScreen from "./OrderSummaryScreen";
import * as OrderActions from "../../actions/OrderActions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import slowlog from 'react-native-slowlog';

class OrderView extends React.PureComponent {
	constructor(props) {
		super(props);
		slowlog(this, /.*/);
	}
	static whyDidYouRender = true;

	// shouldComponentUpdate(nextProps, nextState){
	// 	return this.props.navigation !== nextProps.navigation;
	// }

	render() {
		return (
			<View style={styles.orderView}>
				<ProductListScreen />
				<OrderSummaryScreen
					 navigation={this.props.navigation} />
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
		orderActions: bindActionCreators(OrderActions, dispatch)
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
