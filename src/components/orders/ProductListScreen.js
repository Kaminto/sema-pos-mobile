import React from "react";
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	Image,
	Dimensions,
	TouchableOpacity,
	InteractionManager
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from "react-redux";
import randomMC from 'random-material-color';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import * as ProductActions from '../../actions/ProductActions';
import * as OrderActions from '../../actions/OrderActions';
import OrderSummaryScreen from "./OrderSummaryScreen";
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


	handleOnPress = (item) => {
		requestAnimationFrame(() => {
			// InteractionManager.runAfterInteractions(() => {
			const unitPrice = this.getItemPrice(item);
			this.props.orderActions.AddProductToOrder(item, 1, unitPrice);
		});
		// });
	}
	getImage = item => {
		return item.base64encodedImage;
	};

	getItemBackground = index => {
		return index % 2 === 0 ? styles.lightBackground : styles.darkBackground;
	};

	handleOnPress(item) {
		requestAnimationFrame(() => {
			// InteractionManager.runAfterInteractions(() => {
			const unitPrice = this.getItemPrice(item);
			this.props.orderActions.AddProductToOrder(item, 1, unitPrice);
		});
		// });
	}

	getLabelBackground = categoryId => {
		return {
			backgroundColor: `${randomMC.getColor({
				text: `${categoryId}-${this.state.salesChannel.name}`
			})}`
		};
	};

	getItemPrice = item => {
		let salesChannel = SalesChannelRealm.getSalesChannelFromName(
			this.state.salesChannel.name
		);

		if (salesChannel) {
			let productMrp = ProductMRPRealm.getFilteredProductMRP()[
				ProductMRPRealm.getProductMrpKeyFromIds(
					item.productId,
					salesChannel.id
				)
			];
			if (productMrp) {
				return productMrp.priceAmount;
			}
		}
		return item.priceAmount; // Just use product price
	};


	_renderItem = ({ item, index, separators }) => (
		this.productListItem(item, index, this.viewWidth, separators)
	);


	productListItem = (item, index, viewWidth, separators) => {
		return (
			<TouchableOpacity
				onPress={() => this.handleOnPress(item)}
				onShowUnderlay={separators.highlight}
				onHideUnderlay={separators.unhighlight}>
				<View
					style={[
						this.getItemBackground(index), newStyle(viewWidth).heights
					]}>
					<Image
						source={{ uri: this.getImage(item) }}
						resizeMethod="scale"
						style={{ flex: 1 }}
					/>
					<Text
						style={[
							styles.imageLabel,
							this.getLabelBackground(item.categoryId)
						]}>
						{item.description}
						{'\n'}
						{this.getItemPrice(item)}
					</Text>
				</View>
			</TouchableOpacity>
		)
	}


	render() {
		if (this.state.salesChannel) {
			return (
				<View style={styles.container}>
					<FlatList
						data={this.prepareData()}
						renderItem={this._renderItem}
						keyExtractor={item => item.productId}
						numColumns={4}
						horizontal={false}
						removeClippedSubviews={true}

					/>
					
				</View>
			);

		}
		return null;
	}

	prepareData = () => {
		let productMrp = ProductMRPRealm.getFilteredProductMRP();
		let ids = Object.keys(productMrp).map(key => productMrp[key].productId);
		return this.props.products.filter(prod => ids.includes(prod.productId));
	};

	getImage = item => {
		return item.base64encodedImage;
	};

	getItemBackground = index => {
		return index % 2 === 0 ? styles.lightBackground : styles.darkBackground;
	};

	getLabelBackground = (categoryId) => {
		return {
			backgroundColor: `${randomMC.getColor({
				text: `${categoryId}-${this.state.salesChannel.name}`
			})}`
		};
	};

	getItemPrice = item => {
		let salesChannel = SalesChannelRealm.getSalesChannelFromName(
			this.state.salesChannel.name
		);

		if (salesChannel) {
			let productMrp = ProductMRPRealm.getFilteredProductMRP()[
				ProductMRPRealm.getProductMrpKeyFromIds(
					item.productId,
					salesChannel.id
				)
			];
			if (productMrp) {
				return productMrp.priceAmount;
			}
		}
		return item.priceAmount; // Just use product price
	};

}


function mapStateToProps(state, props) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer,
		channel: state.orderReducer.channel,
		products: state.productReducer.products,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		productActions: bindActionCreators(ProductActions, dispatch),
		orderActions: bindActionCreators(OrderActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductListScreen);


const newStyle = (viewWidth) => StyleSheet.create({
	heights: {
		flex: 1,
		height: viewWidth / 4,
		width: viewWidth / 4
	}
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		borderColor: '#ABC1DE',
		borderTopWidth: 5
	},

	heightStyle: {
		flex: 1,
	},

	imageLabel: {
		fontWeight: 'bold',
		paddingTop: 5,
		paddingBottom: 5,
		textAlign: 'center',
		color: 'white'
	},

	lightBackground: {
		backgroundColor: '#ABC1DE'
	},

	darkBackground: {
		backgroundColor: '#ABC1DE'
	}
});
