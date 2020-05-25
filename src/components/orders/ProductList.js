import React from 'react';

import {
	View,
	Text,
	FlatList,
	StyleSheet,
	Image,
	TouchableOpacity,
	InteractionManager
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as ProductActions from '../../actions/ProductActions';
import * as OrderActions from '../../actions/OrderActions';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import randomMC from 'random-material-color';

class ProductListItem extends React.PureComponent {

	handleOnPress = (item) => {
		requestAnimationFrame(() => {
			// InteractionManager.runAfterInteractions(() => {
			const unitPrice = this.getItemPrice(item);
			this.props.orderActions.AddProductToOrder(item, 1, unitPrice);
			});
		// });
	}
	render() {
		return(
			<TouchableOpacity
							onPress={() => this.handleOnPress(this.props.item)}
							onShowUnderlay={this.props.separators.highlight}
							onHideUnderlay={this.props.separators.unhighlight}>
				<View
						style={[
							this.getItemBackground(this.props.index), newStyle(this.props.viewWidth).heights
						]}>
						<Image
							source={{ uri: this.getImage(this.props.item) }}
							resizeMethod="scale"
							style={{ flex: 1 }}
						/>
						<Text
							style={[
								styles.imageLabel,
								this.getLabelBackground(this.props.item.categoryId)
							]}>
							{this.props.item.description}
							{'\n'}
							{this.getItemPrice(this.props.item)}
						</Text>
					</View>
					</TouchableOpacity>
		)
	}

	getImage = item => {
			return item.base64encodedImage;
	};

	getItemBackground = index => {
		return index % 2 === 0 ? styles.lightBackground : styles.darkBackground;
	};

	handleOnPress(item){
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

class ProductList extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	_renderItem = ({item, index, separators}) => (

							<ProductListItem
								item={item}
								index={index}
								viewWidth={this.props.viewWidth}
								orderActions={this.props.orderActions}
								filter={this.props.filter}
								orderActions={this.props.orderActions}
								separators={separators}
								/>
);

	render() {
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
