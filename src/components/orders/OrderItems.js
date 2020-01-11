import React, { Component } from "react";
import { View, Text, Button, ScrollView, FlatList, Switch, Image, TextInput, Dimensions, TouchableHighlight, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as OrderActions from "../../actions/OrderActions";
import * as ToolbarActions from '../../actions/ToolBarActions';
import * as DiscountActions from '../../actions/DiscountActions';

import i18n from "../../app/i18n";
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/Ionicons';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import DiscountRealm from '../../database/discount/discount.operations';
import ToggleSwitch from 'toggle-switch-react-native';
import { Input } from 'react-native-elements';

const { height, width } = Dimensions.get('window');
const widthQuanityModal = 1000;
const heightQuanityModal = 500;
const inputTextWidth = 400;
const marginInputItems = width / 2 - inputTextWidth / 2;

const inputFontHeight = Math.round((24 * height) / 752);
const marginTextInput = Math.round((5 * height) / 752);
const marginSpacing = Math.round((20 * height) / 752);

class OrderItems extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isQuantityVisible: false,
			selectedItem: {},
			accumulator: 0,
			selectedDiscounts: [],
			firstKey: true,
			switch1Value: false,
			isOpen: false,
			isDisabled: false,
			swipeToClose: true,
			sliderValue: 0.3,
		};
	}

	onClose() {
		console.log('Modal just closed');
	}

	onOpen() {
		console.log('Modal just opened');
	}

	onClosingState(state) {
		console.log('the open/close of the swipeToClose just changed');
	}

	renderList() {
		var list = [];

		for (var i = 0; i < 50; i++) {
			list.push(<Text style={styles.text} key={i}>Elem {i}</Text>);
		}

		return list;
	}


	onChangeQuantity = text => {
		this.setState({
			address: text
		});
	};


	render() {

		const state = this.state;
		console.log('discounts', this.props.discounts);
		return (
			<View style={styles.container}>
				<FlatList
					data={this.props.products}
					ListHeaderComponent={this.showHeader}
					extraData={this.props.channel.salesChannel}
					renderItem={({ item, index, separators }) => (
						<TouchableHighlight
							onPress={() => this.onPressItem(item)}
							onShowUnderlay={separators.highlight}
							onHideUnderlay={separators.unhighlight}>
							{this.getRow(item, index, separators)}
						</TouchableHighlight>
					)}
					keyExtractor={item => item.product.productId.toString()}
				/>


				<Modal style={[styles.modal, styles.modal3]}
					coverScreen={true}
					position={"center"}
					onClosed={() => this.modalOnClose()}
					ref={"productModel"}
					sDisabled={this.state.isDisabled}>
					<View style={{ flex: 1 }}>
						{/* <Text>{this.state.selectedItem.product.name}</Text> */}
						<View
							style={{
								justifyContent: 'flex-end',
								flexDirection: 'row',
								right: 100,
							}}>

							{this.getCancelButton()}
						</View>
					</View>



					<ScrollView>

						<View
							style={{
								height: 1,
								marginTop: 10,
								marginBottom: 10,
								backgroundColor: '#ddd',
								width: '100%'
							}}
						/>

						<View style={{
							flex: 1,
							width: "100%",
							flexDirection: 'row',
							alignItems: 'stretch',
						}}>
							<View style={{ flex: 1, height: 50 }}>

								<TouchableHighlight style={{ flex: 1 }}
									onPress={() => this.counterChangedHandler('inc')}>
									{/* <Text style={[{ textAlign: 'center' }, styles.baseItem, styles.leftMargin]}>-</Text> */}

									<Icon
										size={50}
										style={[{ textAlign: 'center' }, styles.leftMargin]}
										name="md-remove-circle-outline"
										color="black"
									/>
								</TouchableHighlight>

							</View>
							<View style={{ flex: 1, height: 50 }} >
								<Input
									inputStyle={{ flex: .4 }}
									placeholder={'Quantity'}
									value={this.state.selectedItem.quantity}
									keyboardType="number-pad"
									onChangeText={this.onChangeQuantity.bind(this)}
								/>
							</View>
							<View style={{ flex: 1, height: 50 }}>
								<TouchableHighlight style={{ flex: 1 }}
									onPress={() => this.counterChangedHandler('dec')}>
									<Icon
										size={50}
										name="md-add-circle-outline"
										color="black"
									/>
									{/* <Text style={[styles.baseItem, styles.leftMargin]}>+</Text> */}
								</TouchableHighlight>
							</View>
						</View>

						<View
							style={{
								height: 1,
								backgroundColor: '#ddd',
								width: '100%'
							}}
						/>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[{ textAlign: 'center' }, styles.baseItem]}>Price</Text>
							</View>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[styles.baseItem]}>{(this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product)).toFixed(2)}</Text>
							</View>
						</View>

						<View
							style={{
								height: 1,
								backgroundColor: '#ddd',
								width: '100%'
							}}
						/>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<TouchableHighlight onPress={() => {
									console.log(this.state.selectedDiscounts);
								}}>
									<Text style={[{ textAlign: 'center' }, styles.baseItem]}>Discounts</Text>
								</TouchableHighlight>
							</View>
						</View>


						<View style={{ flex: 1, flexDirection: 'row', alignContent: 'center' }}>
							<FlatList
								data={this.props.discounts}
								renderItem={({ item, index, separators }) => (
									this.discountRows(item, index, separators)
								)}
							/>

						</View>

						<View style={{ flex: 1, flexDirection: 'row', alignContent: 'center' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[{
									marginLeft: 12,
								}, styles.baseItem]}>Custom</Text>
							</View>
							<View style={{ flex: 1, height: 50 }}>
								<TextInput
									style={{
										backgroundColor: "#eee",
										borderColor: "#bbb"
									}}
									onChangeText={this.customDiscount}
									underlineColorAndroid="transparent"
									placeholder="Custom Discount"
								/>
							</View>
						</View>

						<View
							style={{
								height: 1,
								backgroundColor: '#ddd',
								width: '100%'
							}}
						/>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[{ textAlign: 'center' }, styles.baseItem]}>Notes</Text>
							</View>
						</View>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<TextInput
									style={{
										backgroundColor: "#eee",
										borderColor: "#bbb"
									}}
									underlineColorAndroid="transparent"
									placeholder="Notes"
								/>
							</View>
						</View>

						<View
							style={{
								height: 1,
								backgroundColor: '#ddd',
								width: '100%'
							}}
						/>

					</ScrollView>

				</Modal>

			</View>

		);
	}

	closeHandler = () => {
		this.setState({ isQuantityVisible: false });
	};

	getCancelButton() {
		return (
			<TouchableHighlight onPress={() => this.onCancelOrder()}>
				<Icon
					size={40}
					name="md-close"
					color="black"
				/>
			</TouchableHighlight>
		);

	}

	modalOnClose() {
		console.log('selectedDiscounts', this.state.selectedDiscounts);
		console.log('itemPrice', (this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product)).toFixed(2));
		DiscountRealm.resetSelected();
		this.setState(state => {
			return {
				selectedDiscounts: []
			};
		});
		this.props.discountActions.setDiscounts(
			DiscountRealm.getDiscounts()
		);
	}

	onCancelOrder = () => {
		this.refs.productModel.close();
	};


	showQuantityChanger() {
		this.props.toolbarActions.ShowScreen('quanityChanger');
	}

	onPressItem = (item) => {
		this.setState({ isQuantityVisible: true });
		this.setState({ selectedItem: item });
		this.setState({ accumulator: item.quantity });
		this.setState({ firstKey: true });
		this.refs.productModel.open();
	};


	getRow = (item) => {
		return (
			<View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
				<View style={[{ flex: 3 }]}>
					<Text style={[styles.baseItem, styles.leftMargin]}>{item.product.description}</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.baseItem]}>{item.quantity}</Text>

				</View>
				<View style={[{ flex: 1 }]}>
					<Text numberOfLines={1} style={[styles.baseItem]}>
						{(item.quantity * this.getItemPrice(item.product)).toFixed(2)}</Text>
				</View>
			</View>
		);
	};

	customDiscount = searchText => {
		console.log(searchText);
		const productIndex = this.props.selectedDiscounts.map(function (e) { return e.product.productId }).indexOf(this.state.selectedItem.product.productId);
		console.log('productIndex', productIndex);
		if (productIndex >= 0) {
			console.log('this.props.selectedDiscounts[productIndex]', this.props.selectedDiscounts[productIndex]);

			if (this.props.selectedDiscounts[productIndex].discount.length > 0 && this.state.selectedDiscounts.length === 0) {

				//	this.props.selectedDiscounts[productIndex].discount.forEach(element=>{
				// this.setState(state => {
				// 	//console.log('element==', element);
				// 	// const selectedDiscounts2 = state.selectedDiscounts.concat(element);
				// 	// console.log('selectedDiscounts2', selectedDiscounts2);
				// 	return {
				// 		selectedDiscounts: this.props.selectedDiscounts[productIndex].discount
				// 	};
				// });
				this.props.orderActions.SetOrderDiscounts('Custom', searchText, this.state.selectedItem.product, this.props.selectedDiscounts[productIndex].discount, (this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product)).toFixed(2));

				//	});					

			} else {

				this.props.orderActions.SetOrderDiscounts('Custom', searchText, this.state.selectedItem.product, this.state.selectedDiscounts, (this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product)).toFixed(2));

			}

		}

		//this.props.customerActions.SearchCustomers(searchText);
		//console.log('customDiscount ---' + this.props.customers.length);
	};


	discountRows = (item, index, separators) => {
		const productIndex = this.props.selectedDiscounts.map(function (e) { return e.product.productId }).indexOf(this.state.selectedItem.product.productId);
		let isDiscountAvailable = false;
		if (productIndex >= 0) {
			const discountIndex = this.props.selectedDiscounts[productIndex].discount.map(function (e) { return e.id }).indexOf(item.id);
			if (this.props.selectedDiscounts[productIndex].discount.length > 0 && this.state.selectedDiscounts.length === 0) {
				this.setState(state => {
					return {
						selectedDiscounts: this.props.selectedDiscounts[productIndex].discount
					};
				});
			}


			if (discountIndex >= 0) {
				isDiscountAvailable = true;
			}
		}
		console.log('isDiscountAvailable', isDiscountAvailable)

		return (

			<View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
				<View style={{ flex: 1, height: 50 }}>
					<Text style={[{ marginLeft: 12 }, styles.baseItem]}>{item.applies_to}-{item.amount}</Text>
				</View>
				<View style={{ flex: 1, height: 50 }}>
					<ToggleSwitch
						isOn={item.isSelected || isDiscountAvailable}
						onColor="green"
						offColor="red"
						labelStyle={{ color: "black", fontWeight: "900" }}
						size="large"
						onToggle={isOn => {
							DiscountRealm.isSelected(item, isOn === true ? true : false);
							this.props.discountActions.setDiscounts(
								DiscountRealm.getDiscounts()
							);
							console.log('selectedItem', this.state.selectedItem);
							if (isOn) {
								this.setState(state => {
									const selectedDiscounts = state.selectedDiscounts.concat(item);
									this.props.orderActions.SetOrderDiscounts('Not Custom', 0, this.state.selectedItem.product, selectedDiscounts, (this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product)).toFixed(2));
									console.log('selectedDiscounts', selectedDiscounts);
									return {
										selectedDiscounts
									};
								});
							}

							if (!isOn) {
								this.setState(state => {
									const itemIndex = state.selectedDiscounts.map(function (e) { return e.id }).indexOf(item.id);
									console.log('itemIndex', itemIndex);
									if (itemIndex >= 0) {
										let discountArray = [...state.selectedDiscounts];
										discountArray.splice(itemIndex, 1);
										this.props.orderActions.RemoveProductDiscountsFromOrder(this.state.selectedItem.product, discountArray, item.id);
										console.log('discountArray', discountArray);
										return {
											selectedDiscounts: discountArray
										};
									}

								});
							}

							console.log('selectedDiscounts', this.state.selectedDiscounts);


						}}
					/>

				</View>

			</View>
		);
	};

	showHeader = () => {
		return (
			<View style={[{ flex: 1, flexDirection: 'row' }, styles.headerBackground]}>
				<View style={[{ flex: 3 }]}>
					<Text style={[styles.headerItem, styles.headerLeftMargin]}>{i18n.t('item')}</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItem]}>{i18n.t('quantity')}</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItem]}>{i18n.t('charge')}</Text>
				</View>
			</View>
		);
	};



	counterChangedHandler = (action, value) => {
		this.setState({ isQuantityVisible: false });
		let unitPrice = this.getItemPrice(this.state.selectedItem.product);
		switch (action) {
			case 'inc':
				if (this.state.accumulator === 0) {
					this.refs.productModel.close();
					this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
				} else {
					this.setState((prevState) => { return { accumulator: prevState.accumulator - 1 } })

					this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
				}
				break;
			case 'dec':
				if (this.state.accumulator === 0) {
					this.refs.productModel.close();
					this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
				} else {
					this.setState((prevState) => { return { accumulator: prevState.accumulator + 1 } })

					this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
				}
				break;
			case 'qty':
				if (this.state.accumulator === 0) {
					this.refs.productModel.close();
					this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
				} else {
					this.setState((prevState) => { return { accumulator: prevState.accumulator + 1 } })

					this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
				}
				break;
		}
	}


	getItemPrice = (item) => {
		if (!item) {
			return 1;
		}
		let salesChannel = SalesChannelRealm.getSalesChannelFromName(this.props.channel.salesChannel);
		if (salesChannel) {
			let productMrp = ProductMRPRealm.getFilteredProductMRP()[ProductMRPRealm.getProductMrpKeyFromIds(item.productId, salesChannel.id)];
			if (productMrp) {
				return productMrp.priceAmount;
			}
		}
		return item.priceAmount;	// Just use product price
	};

}


function mapStateToProps(state, props) {
	return {
		products: state.orderReducer.products,
		selectedDiscounts: state.orderReducer.discounts,
		channel: state.orderReducer.channel,
		discounts: state.discountReducer.discounts
	};
}

function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch),
		toolbarActions: bindActionCreators(ToolbarActions, dispatch),
		discountActions: bindActionCreators(DiscountActions, dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderItems);

const styles = StyleSheet.create({
	container: {
		flex: 6,
		backgroundColor: "white",
		borderColor: '#2858a7',
		borderTopWidth: 5,
		borderRightWidth: 5,
	},
	headerBackground: {
		backgroundColor: '#ABC1DE'
	},
	leftMargin: {
		left: 10
	},
	rightMargin: {
		left: 10
	},
	headerLeftMargin: {
		left: 10
	},
	headerItem: {
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		paddingTop: 5,
		paddingBottom: 5,
	},
	baseItem: {
		fontWeight: 'bold',
		fontSize: 16,
		color: 'black',
		paddingTop: 4,
		paddingBottom: 4,

	},
	quantityModal: {
		width: widthQuanityModal,
		height: heightQuanityModal,
		position: 'absolute',
		bottom: 120,
		right: 100,
		backgroundColor: '#e0e0e0',
		// padding: 22,
		// justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
		borderColor: 'rgba(0, 0, 0, 1)',
		borderWidth: 2
	},
	modalTotal: {
		flex: .15,
		flexDirection: 'row',
		backgroundColor: 'white',
		alignItems: 'center',
		borderColor: 'black',
		borderWidth: 4,
		borderRadius: 3
	},
	production: {
		fontWeight: "bold",
		fontSize: 24,
	},
	modalCalculator: {
		flex: .70,
		flexDirection: 'row',
	},
	modalDone: {
		flex: .15,
		backgroundColor: '#2858a7',
		flexDirection: 'row',
		alignItems: 'center',

	},
	inputText: {
		fontSize: inputFontHeight,
		alignSelf: 'center',
		backgroundColor: 'white',
	},
	digitContainer: {
		flex: 1,
		width: widthQuanityModal / 3,
		height: (.7 * heightQuanityModal) / 4,
		alignItems: 'center',
		justifyContent: 'center'
	},
	clearContainer: {
		flex: 1,
		width: widthQuanityModal * 2 / 3,
		height: (.7 * heightQuanityModal) / 4,
		alignItems: 'center',
		justifyContent: 'center'
	},
	digit: {
		textAlign: 'center',
		color: 'black',
		fontWeight: 'bold',
		fontSize: 30,
	},
	accumulator: {
		color: 'black',
		fontWeight: 'bold',
		fontSize: 30,
		flex: 1,
		textAlign: 'center'
	},
	doneButton: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 30,
		flex: 1,
		textAlign: 'center'
	},



	wrapper: {
		paddingTop: 50,
		flex: 1
	},

	modal: {
		justifyContent: 'center',
		// alignItems: 'center'
	},

	modal2: {
		height: 230,
		backgroundColor: "#3B5998"
	},

	modal3: {
		// height: 300,
		// width: 500
		width: widthQuanityModal,
		height: heightQuanityModal,
	},

	modal4: {
		height: 300
	},

	btn: {
		margin: 10,
		backgroundColor: "#3B5998",
		color: "white",
		padding: 10
	},
	totalItem: {
		fontWeight: "bold",
		fontSize: 18,
		paddingLeft: 10,
	},
	btnModal: {
		position: "absolute",
		top: 0,
		right: 0,
		width: 50,
		height: 50,
		backgroundColor: "transparent"
	},

	text: {
		color: "black",
		fontSize: 22
	}
});
