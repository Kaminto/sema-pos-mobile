import React from "react";
if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React);
  }
import { Dimensions, Animated } from "react-native";
import ProductList from "./ProductList";
import { connect } from "react-redux";
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import slowlog from 'react-native-slowlog';

class ProductListScreen extends React.PureComponent {
	constructor(props) {
		super(props);
		slowlog(this, /.*/);
		let { height, width } = Dimensions.get('window');
		// Empirically we know that this view has flex of 1 and the view beside it,
		// (OrderSummaryScreen has a flex of .6 This makes the width of this view 1/1.6 * screen width
		// Since there is no way to dynamilcally determine view width until the layout is complete, use
		// this to set width. (Note this will break if view layout changes
		this.viewWidth = 1 / 1.6 * width;
		this.salesChannel;
		this.state = {
			fadeAnim: new Animated.Value(-this.viewWidth)  // Initial value for sliding in from left
		}
	}

	componentDidMount() {
		this.setState({
			salesChannel: SalesChannelRealm.getSalesChannelFromId(this.props.selectedCustomer.salesChannelId)
		}, () => {
			Animated.timing(                  // Animate over time
				this.state.fadeAnim,            // The animated value to drive
				{
					toValue: 0,                   // Animate to opacity: 1 (opaque)
					duration: 150,
					useNativeDriver: true,
				}
			).start();
		});
	}

	render() {
		let { fadeAnim } = this.state;
		if (this.state.salesChannel) {
			return (
				<Animated.View style={{ flex: 1, backgroundColor: '#ABC1DE', transform: [{ translateX: fadeAnim }] }}>
					<ProductList filter={this.state.salesChannel.name} viewWidth={this.viewWidth} />
				</Animated.View>
			);
		}
		return null;
	}
}

function mapStateToProps(state, props) {
	return {
		products: state.orderReducer.products,
		selectedCustomer: state.customerReducer.selectedCustomer,
		channel: state.orderReducer.channel
	};
}

export default connect(mapStateToProps)(ProductListScreen);
