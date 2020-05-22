import React from "react";

import { Dimensions } from "react-native";
import ProductList from "./ProductList";
import { connect } from "react-redux";
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';


class ProductListScreen extends React.PureComponent {
	constructor(props) {
		super(props);

		let { width } = Dimensions.get('window');
		// Empirically we know that this view has flex of 1 and the view beside it,
		// (OrderSummaryScreen has a flex of .6 This makes the width of this view 1/1.6 * screen width
		// Since there is no way to dynamilcally determine view width until the layout is complete, use
		// this to set width. (Note this will break if view layout changes
		this.viewWidth = 1 / 1.6 * width;
		// this.salesChannel;
		this.state = {
			salesChannel: SalesChannelRealm.getSalesChannelFromId(this.props.selectedCustomer.salesChannelId)
		}
	};

	render() {
		if (this.state.salesChannel) {
			return (<ProductList filter={this.state.salesChannel.name} viewWidth={this.viewWidth} />);
		}
		return null;
	}
}

function mapStateToProps(state, props) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer,
		channel: state.orderReducer.channel
	};
}

export default connect(mapStateToProps)(ProductListScreen);
