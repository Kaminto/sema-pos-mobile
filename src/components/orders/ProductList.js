import React, { Component } from 'react';
if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React);
  }
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	Image,
	TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as ProductActions from '../../actions/ProductActions';
import * as OrderActions from '../../actions/OrderActions';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import randomMC from 'random-material-color';

class ProductList extends React.PureComponent {
	constructor(props) {
		super(props);
		// this.onPressItem = this.onPressItem.bind(this);
	}

	static whyDidYouRender = true;

	render() {
		return (
			<View style={styles.container}>
				<FlatList
					data={this.prepareData()}
					renderItem={({ item, index, separators }) => (
						<TouchableOpacity
							onPress={() => this.onPressItem(item)}
							onShowUnderlay={separators.highlight}
							onHideUnderlay={separators.unhighlight}>
							{this.getItem(item, index, separators)}
						</TouchableOpacity>
					)}
					keyExtractor={item => item.productId}
					numColumns={4}

					horizontal={false}
				/>
			</View>
		);
	}

	getItem = (item, index) => {
		console.log(JSON.stringify(item));
		return (
			<View
				style={[
					this.getItemBackground(index),
					{
						flex: 1,
						height: this.props.viewWidth / 4,
						width: this.props.viewWidth / 4
					}
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
		);
	};

	prepareData = () => {
		let productMrp = ProductMRPRealm.getFilteredProductMRP();
		let ids = Object.keys(productMrp).map(key => productMrp[key].productId);
		return result = this.props.products.filter(prod => ids.includes(prod.productId));
	};

	getImage = item => {
		if (item.base64encodedImage.startsWith('data:image')) {
			return item.base64encodedImage;
		} else {
			return 'data:image/png;base64,' + item.base64encoded_image;
		}
	};

	onPressItem = item => {
		const unitPrice = this.getItemPrice(item)
		this.props.orderActions.AddProductToOrder(item, 1, unitPrice);
	};

	getItemBackground = index => {
		return index % 2 === 0 ? styles.lightBackground : styles.darkBackground;
	};

	getLabelBackground = categoryId => {
		return {
			backgroundColor: `${randomMC.getColor({
				text: `${categoryId}-${this.props.filter}`
			})}`
		};
	};

	getItemPrice = item => {
		let salesChannel = SalesChannelRealm.getSalesChannelFromName(
			this.props.filter
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
		products: state.productReducer.products,
		selectedCustomer: state.customerReducer.selectedCustomer
	};
}

function mapDispatchToProps(dispatch) {
	return {
		productActions: bindActionCreators(ProductActions, dispatch),
		orderActions: bindActionCreators(OrderActions, dispatch)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ProductList);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		borderColor: '#ABC1DE',
		borderTopWidth: 5
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
