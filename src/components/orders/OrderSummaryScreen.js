import React  from "react";
if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React);
  }
import { View } from "react-native";
import OrderSummary from "./OrderSummary";
import OrderTotal from "./OrderTotal";
import OrderItems from "./OrderItems";
import OrderCheckout from "./OrderCheckout";

export default class OrderSummaryScreen extends React.PureComponent {

	static whyDidYouRender = true;

	render() {
		return (
			<View style = {{flex:.6, backgroundColor:"blue", borderColor: '#2858a7', borderLeftWidth:5}}>
				<OrderSummary/>
				<OrderTotal/>
				<OrderItems/>
				<OrderCheckout
				navigation={this.props.navigation}/>
			</View>
		);
	}
}
