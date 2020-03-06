import React from "react";
// if (process.env.NODE_ENV === 'development') {
//     const whyDidYouRender = require('@welldone-software/why-did-you-render');
//     whyDidYouRender(React);
// }
import { View, Text, StyleSheet } from "react-native";
import { connect } from "react-redux";
import i18n from "../../app/i18n";

class OrderSummary extends React.PureComponent {

	render() {
		return (
			<View style={styles.container}>
				<View style={{ flex: 1, flexDirection: 'row' }}>
					<Text style={[{ flex: 3, marginLeft: 20 }, styles.summaryText]}>{i18n.t('order-summary')}</Text>
					<Text style={[{ flex: 1 }, styles.summaryText]}>{i18n.t('cart')} ({this.getTotalOrders()})</Text>
				</View>
			</View>

		);
	}

	//static whyDidYouRender = true;

	getTotalOrders = () => {
		return this.props.products.reduce((total, item) => {
			if (item.product.description != 'discount' && item.product.description != 'delivery' ) {
				return (total + item.quantity);
			}else{
				return (total + 0);
			}
		}, 0);
	};
}

function mapStateToProps(state, props) {
	return { products: state.orderReducer.products };
}

export default connect(mapStateToProps)(OrderSummary);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		borderColor: '#2858a7',
		borderTopWidth: 5,
		borderRightWidth: 5,

	},
	summaryText: {
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	}

});


