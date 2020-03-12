import React from "react";
import { View, Text, TouchableOpacity, ScrollView, FlatList, TextInput, Dimensions, TouchableHighlight, StyleSheet, Alert } from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as OrderActions from "../../actions/OrderActions";
import * as DiscountActions from '../../actions/DiscountActions';

import i18n from "../../app/i18n";
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/Ionicons';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import DiscountRealm from '../../database/discount/discount.operations';
import ToggleSwitch from 'toggle-switch-react-native';
import slowlog from 'react-native-slowlog';

const widthQuanityModal = '70%';
const heightQuanityModal = 500;
class OrderListItem extends React.PureComponent {
	render() {
		return(
			<View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white', padding: 5 }}>
				<View style={[{ flex: 2 }]}>
					<Text style={[styles.baseItem, styles.leftMargin]}>{this.props.item.product.description}</Text>
				</View>
				<View style={[{ flex: 1.2 }]}>
					<Text style={[styles.baseItem, { textAlign: 'center' }]}>{this.props.item.quantity}</Text>
				</View>
				<View style={[{ flex: 2 }]}>
					<Text numberOfLines={1} style={[styles.baseItem, { textAlign: 'right', paddingRight: 5 }]}>
						{this.getCurrency(this.props.item)} {this.getDiscountPrice((this.props.item.quantity * this.props.item.unitPrice), this.props.item)}</Text>
				</View>
			</View>
		)
	}

		getCurrency = (item) => {
			if (item.hasOwnProperty('product')) {
				return item.product.priceCurrency.toUpperCase();
			}
		};

		getDiscountPrice = (amountPerQuantity, item) => {
			if (!item.hasOwnProperty('discount')) {
				return amountPerQuantity;
			}

			if (Number(item.discount) === 0) {
				return amountPerQuantity;
			}

			if (item.type === 'Flat') {
				return amountPerQuantity - Number(item.discount);
			}

			if (item.type === 'Percentage') {
				return amountPerQuantity * (Number(item.discount) / 100);
			}
		};

  }

class OrderItems extends React.PureComponent {
	constructor(props) {
		super(props);
		slowlog(this, /.*/);
		this.state = {
			selectedItem: {},
			accumulator: 0,
			selectedDiscounts: {},
			firstKey: true,
			switch1Value: false,
			isOpen: false,
			isDisabled: false,
			swipeToClose: true,
			sliderValue: 0.3,
		};
	}

	handleOnPress(item) {
		this.setState({ selectedItem: item });
		this.setState({ accumulator: item.quantity });
		this.setState({ firstKey: true });
		this.refs.productModel.open();
	}

	_renderItem = ({item, index, separators}) => (
			<TouchableHighlight
				onPress={() => this.handleOnPress(item)}
				onShowUnderlay={separators.highlight}
				onHideUnderlay={separators.unhighlight}>
				{this.getRow(item, index, separators)}
				{/* <OrderListItem
				 item={item}
				  /> */}
			</TouchableHighlight>
     )

	render() {
		return (
			<View style={styles.container}>
				<FlatList
					data={this.props.products}
					ListHeaderComponent={this.showHeader}
					extraData={this.props.channel.salesChannel}
					renderItem={this._renderItem}
					keyExtractor={item => item.product.productId.toString()}
				/>

				<Modal style={[styles.modal, styles.modal3]}
					coverScreen={true}
					position={"center"}
					onClosed={() => this.modalOnClose()}
					ref={"productModel"}
					sDisabled={this.state.isDisabled}>

					<ScrollView>
						<TouchableOpacity>
							<View style={[styles.headerBackground, { flex: 1, flexDirection: 'row', paddingLeft: 20, margin: 0 }]}>
								<View style={{ flex: .3 }}>
									{this.getProductDescripion()}
								</View>
								<View style={{ flex: .6 }}>
									<Text style={[{ textAlign: 'center' }, styles.baseItem]}>
										{this.getCurrency(this.state.selectedItem)} {this.getDiscountPrice((this.state.selectedItem.quantity * this.state.selectedItem.unitPrice), this.state.selectedItem)}</Text>
								</View>
								<View
									style={{
										flex: .1,
										justifyContent: 'flex-end',
										flexDirection: 'row',
										right: 0,
										top: 0
									}}>
									{this.getCancelButton()}
								</View>
							</View>
							<View
								style={{
									height: 1,
									backgroundColor: '#ddd',
									marginBottom: 10,
									width: '100%'
								}}
							/>
							<View style={{ flex: 1, paddingRight: 20, paddingLeft: 20 }}>
								{this.qtyAmount()}

								{this.bottlesReturned()}

								<View
									style={{
										height: 1,
										backgroundColor: '#ddd',
										marginBottom: 10,
										width: '100%'
									}}
								/>

								<View style={{ flex: 1, flexDirection: 'row' }}>
									<View style={{ flex: 1 }}>
										<Text style={[{ textAlign: 'left' }, styles.baseItem]}>NOTES</Text>
									</View>
								</View>

								<View style={{ flex: 1, flexDirection: 'row' }}>
									<View style={{ flex: 1, height: 50 }}>
										{this.notesValue()}
									</View>
								</View>

								<View
									style={{
										height: 1,
										backgroundColor: '#ddd',
										marginBottom: 10,
										width: '100%'
									}}
								/>

								{this.discountCmpt()}

								<View
									style={{
										flex: .2,
										width: 100,
										marginTop: 10,
										alignSelf: 'flex-end',
										flexDirection: 'row',
										right: 0,
										bottom: 0
									}}>
									<TouchableHighlight style={{ flex: 1 }}
										onPress={() => this.onCancelOrder()}>
										<Text style={{ padding: 10, fontWeight: 'bold', color: '#fff', backgroundColor: '#036' }}>SAVE</Text>
									</TouchableHighlight>
								</View>

							</View>
						</TouchableOpacity>
					</ScrollView>

				</Modal>

			</View>

		);
	}

	discountCmpt() {
		if (this.state.selectedItem.hasOwnProperty('product')) {
			if (!this.state.selectedItem.product.description.includes('delivery') &&
				!this.state.selectedItem.product.description.includes('discount')
			) {
				return (
					<View>
						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[{ textAlign: 'left' }, styles.baseItem]}>DISCOUNTS</Text>
							</View>
						</View>


						<View style={{ flex: 1, flexDirection: 'row', alignContent: 'center' }}>
							<FlatList
								data={this.props.discounts}
								extraData={this.state.selectedDiscounts}
								renderItem={({ item, index, separators }) => (
									this.discountRows(item, index, separators)
								)}
							/>
						</View>

						<View style={{ flex: 1, flexDirection: 'row', alignContent: 'center' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[styles.baseItem, {
									marginLeft: 12, padding: 10
								}]}>Custom</Text>
							</View>
							<View style={{ flex: 1, height: 50 }}>
								{this.customDiscountValue()}
							</View>
						</View>
						<View
							style={{
								height: 1,
								backgroundColor: '#ddd',
								width: '100%'
							}}
						/>
					</View>
				);
			}
		}
	}

	qtyAmount() {
		if (this.state.selectedItem.hasOwnProperty('product')) {
			if (this.state.selectedItem.product.description.includes('delivery') ||
				this.state.selectedItem.product.description.includes('discount')
			) {
				return (
					<View style={{ flex: 1 }}>
						<View style={{ flex: 1 }}>
							<Text style={[{ textAlign: 'left' }, styles.baseItem]}>AMOUNT</Text>
						</View>
						<View style={{ flex: 1, height: 40, textAlign: 'center' }} >
							{this.qtyValue()}
						</View>
					</View>
				);
			} else {
				return (
					<View>
						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1 }}>
								<Text style={[{ textAlign: 'left' }, styles.baseItem]}>QUANTITY</Text>
							</View>
						</View>
						<View style={{
							flex: 1,
							width: "100%",
							flexDirection: 'row',
							alignItems: 'stretch',

						}}>
							<View style={{ flex: .2, height: 40 }}>
								<TouchableHighlight style={{ flex: 1 }}
									onPress={this.counterChangedHandler.bind(this, 'dec')}>
									<Icon
										size={40}
										style={[{ textAlign: 'center' }, styles.leftMargin]}
										name="md-remove-circle-outline"
										color="black"
									/>
								</TouchableHighlight>
							</View>
							<View style={{ flex: .6, height: 40, textAlign: 'center' }} >
								<View style={{ flex: .5, alignSelf: 'center' }}>
									{this.qtyValue()}
								</View>
							</View>
							<View style={{ flex: .2, height: 40 }}>
								<TouchableHighlight style={{ flex: 1 }}
									onPress={this.counterChangedHandler.bind(this, 'inc')}>
									<Icon
										size={40}
										style={[{ textAlign: 'center' }, styles.leftMargin]}
										name="md-add-circle-outline"
										color="black"
									/>
								</TouchableHighlight>
							</View>
						</View>
					</View>
				);
			}
		}

	}

	getCancelButton() {
		return (
			<TouchableHighlight onPress={() => this.onCancelOrder()}>
				<Icon
					size={40}
					name="md-close-circle-outline"
					color="black"
				/>
			</TouchableHighlight>
		);

	}

	qtyValue() {

		let qty = '';

		if (!this.state.selectedItem.hasOwnProperty('quantity')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('quantity')) {
			qty = this.state.selectedItem.quantity.toString();
		}

		return (
			<TextInput
				// ref={input => { this.changeQuantity(input) }}
				style={{
					textAlign: 'center',
					height: 50,
					fontSize: 24
				}}
				keyboardType="number-pad"
				onChangeText={(value) => this.changeQuantity(value)}
				value={qty}
				underlineColorAndroid="transparent"
				placeholder='Quantity'
			/>
		)
	}

	bottlesReturned() {
		if (this.state.selectedItem.hasOwnProperty('product')) {
			if (this.state.selectedItem.product.description.includes('refill')) {
				return (
					<View>
						<View
							style={{
								height: 1,
								backgroundColor: '#ddd',
								marginBottom: 10,
								width: '100%'
							}}
						/>
						<View style={[{ flex: 1, flexDirection: 'row' }]}>
							<View style={[{ flex: 1 }]}>
								<Text style={[styles.headerItem, { textTransform: 'uppercase' }]}>Empties Returned</Text>
							</View>
							<View style={[{ flex: 1 }]}>
								<Text style={[styles.headerItem, { textTransform: 'uppercase' }]}>Damaged Bottles</Text>
							</View>
							<View style={[{ flex: 1 }]}>
								<Text style={[styles.headerItem, { textTransform: 'uppercase' }]}>Pending Bottles</Text>
							</View>
						</View>

						<View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white', padding: 5 }}>
							<View style={[{ flex: 1 }]}>
								{this.emptiesReturnedValue()}
							</View>
							<View style={[{ flex: 1 }]}>
								{this.emptiesDamagedValue()}
							</View>
							<View style={[{ flex: 1 }]}>
								{this.refillPendingValue()}
							</View>
						</View>
					</View>
				);
			}
		}

	}

	notesValue() {
		let notes = '';
		if (!this.state.selectedItem.hasOwnProperty('notes')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('notes')) {
			notes = this.state.selectedItem.notes;
		}

		return (
			<TextInput
				style={{
					padding: 10
				}}
				onChangeText={this.setNotes}
				value={notes}
				underlineColorAndroid="transparent"
				placeholder="Add a Note"
			/>
		)
	}

	emptiesReturnedValue() {
		let emptiesReturned = '';
		let qty = this.state.selectedItem.quantity.toString();

		if (!this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			emptiesReturned = this.state.selectedItem.emptiesReturned;
			if (emptiesReturned === '') {
				emptiesReturned = qty;
			}
		}

		return (
			<TextInput
				style={{
					textAlign: 'center',
					height: 50,
					fontSize: 24
				}}
				onChangeText={this.setEmptiesReturned}
				value={emptiesReturned}
				keyboardType="number-pad"
				underlineColorAndroid="transparent"
				placeholder="0"
			/>
		)
	}

	emptiesDamagedValue() {
		let emptiesDamaged = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			emptiesDamaged = this.state.selectedItem.emptiesDamaged;
		}

		return (
			<TextInput
				style={{
					textAlign: 'center',
					height: 50,
					fontSize: 24
				}}
				onChangeText={this.setEmptiesDamaged}
				value={emptiesDamaged}
				keyboardType="number-pad"
				underlineColorAndroid="transparent"
				placeholder="0"
			/>
		)
	}

	refillPendingValue() {
		let refillPending = '';
		if (!this.state.selectedItem.hasOwnProperty('refillPending')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('refillPending')) {
			refillPending = this.state.selectedItem.refillPending;
		}

		return (
			<TextInput
				style={{
					textAlign: 'center',
					height: 50,
					fontSize: 24
				}}
				onChangeText={this.setRefillPending}
				value={refillPending}
				keyboardType="number-pad"
				underlineColorAndroid="transparent"
				placeholder="0"
			/>
		)
	}

	getProductDescripion() {
		if (this.state.selectedItem.hasOwnProperty('product')) {
			return (
				<Text style={[{ textAlign: 'left' }, styles.baseItem]}>{this.state.selectedItem.product.description}</Text>
			)
		}
	}

	customDiscountValue() {

		if (!this.state.selectedItem.hasOwnProperty('product')) {
			return;
		}

		const productIndex = this.props.selectedDiscounts.map(function (e) { return e.product.productId }).indexOf(this.state.selectedItem.product.productId);


		let customValue = 0;
		if (productIndex >= 0) {
			customValue = this.props.selectedDiscounts[productIndex].customDiscount;
		}
		return (
			<TextInput
				style={{
					padding: 10
				}}
				onChangeText={this.customDiscount}
				value={(customValue.toString())}
				keyboardType="number-pad"
				underlineColorAndroid="transparent"
				placeholder="Custom Discount"
			/>
		)
	}

	modalOnClose() {
		DiscountRealm.resetSelected();
		this.setState(state => {
			return {
				selectedDiscounts: {}
			};
		});
		this.props.discountActions.setDiscounts(
			DiscountRealm.getDiscounts()
		);
	}

	onCancelOrder() {
		this.refs.productModel.close();
	};


	showQuantityChanger() {
		this.props.toolbarActions.ShowScreen('quanityChanger');
	}

	getRow = (item) => {
		return (
			<View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white', padding: 5 }}>
				<View style={[{ flex: 2 }]}>
					<Text style={[styles.baseItem, styles.leftMargin]}>{item.product.description}</Text>
				</View>
				<View style={[{ flex: 1.2 }]}>
					<Text style={[styles.baseItem, { textAlign: 'center' }]}>{item.quantity}</Text>
				</View>
				<View style={[{ flex: 2 }]}>
					<Text numberOfLines={1} style={[styles.baseItem, { textAlign: 'right', paddingRight: 5 }]}>
						{this.getCurrency(item)} {this.getDiscountPrice((item.quantity * item.unitPrice), item)}</Text>
				</View>
			</View>
		);
	};

	customDiscount = searchText => {
		const productIndex = this.props.selectedDiscounts.map(function (e) { return e.product.productId }).indexOf(this.state.selectedItem.product.productId);

		if (Number(searchText) > (this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product))) {
			Alert.alert("Custom Discount",
				"Discount cannot exceed order amount.",
				[{
					text: 'OK',
					onPress: () => {
					}
				}],
				{ cancelable: false }
			);
			return;
		}

		if (productIndex >= 0) {
			DiscountRealm.isSelected(this.state.selectedDiscounts, false);
			this.props.discountActions.setDiscounts(DiscountRealm.getDiscounts());
			if (this.props.selectedDiscounts[productIndex].discount.length > 0 && this.state.selectedDiscounts.length === 0) {
				this.props.orderActions.SetOrderDiscounts('Custom', searchText, this.state.selectedItem.product, this.props.selectedDiscounts[productIndex].discount, (this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product)));
			} else {
				this.props.orderActions.SetOrderDiscounts('Custom', searchText, this.state.selectedItem.product, this.state.selectedDiscounts, (this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product)));
			}

		} else {
			this.props.orderActions.SetOrderDiscounts('Custom', searchText, this.state.selectedItem.product, this.state.selectedDiscounts, (this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product)));

		}

	};

	setNotes = notes => {
		let emptiesReturned = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			emptiesReturned = this.state.selectedItem.emptiesReturned;
		}

		let refillPending = '';
		if (!this.state.selectedItem.hasOwnProperty('refillPending')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('refillPending')) {
			refillPending = this.state.selectedItem.refillPending;
		}

		let emptiesDamaged = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			emptiesDamaged = this.state.selectedItem.emptiesDamaged;
		}


		this.props.orderActions.AddNotesToProduct(this.state.selectedItem.product, notes, emptiesReturned, refillPending, emptiesDamaged);
	};

	setEmptiesDamaged = emptiesDamaged => {
		let refillPending = '';
		if (!this.state.selectedItem.hasOwnProperty('refillPending')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('refillPending')) {
			refillPending = this.state.selectedItem.refillPending;
		}

		let emptiesReturned = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			emptiesReturned = this.state.selectedItem.emptiesReturned;
		}

		let notes = '';
		if (!this.state.selectedItem.hasOwnProperty('notes')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('notes')) {
			notes = this.state.selectedItem.notes;
		}

		this.props.orderActions.AddNotesToProduct(this.state.selectedItem.product, notes, emptiesReturned, refillPending, emptiesDamaged);
	};

	setEmptiesReturned = emptiesReturned => {
		let refillPending = '';
		if (!this.state.selectedItem.hasOwnProperty('refillPending')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('refillPending')) {
			refillPending = this.state.selectedItem.refillPending;
		}

		let emptiesDamaged = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			emptiesDamaged = this.state.selectedItem.emptiesDamaged;
		}

		let notes = '';
		if (!this.state.selectedItem.hasOwnProperty('notes')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('notes')) {
			notes = this.state.selectedItem.notes;
		}

		this.props.orderActions.AddNotesToProduct(this.state.selectedItem.product, notes, emptiesReturned, refillPending, emptiesDamaged);

	};

	setRefillPending = refillPending => {
		let emptiesReturned = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			emptiesReturned = this.state.selectedItem.emptiesReturned;
		}

		let emptiesDamaged = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			emptiesDamaged = this.state.selectedItem.emptiesDamaged;
		}

		let notes = '';
		if (!this.state.selectedItem.hasOwnProperty('notes')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('notes')) {
			notes = this.state.selectedItem.notes;
		}

		this.props.orderActions.AddNotesToProduct(this.state.selectedItem.product, notes, emptiesReturned, refillPending, emptiesDamaged);

	};

	changeQuantity = value => {
		let unitPrice = this.getItemPrice(this.state.selectedItem.product);
		if (Number(value) != 0) {

			if (this.state.selectedItem.product.description.includes('discount')) {
				console.log('Number(value)', Number(value));
				if (Number(value) > this.calculateOrderDue()) {
					Alert.alert("Discount",
						"Discount cannot exceed Order amount.",
						[{
							text: 'OK',
							onPress: () => {
							}
						}],
						{ cancelable: false }
					);
					return;
				}

			}

			this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, Number(value), unitPrice);
			this.setState({
				accumulator: Number(value)
			});
		}

		if (!value) {
			this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, '', unitPrice);
			this.setState({
				accumulator: ''
			})
		}
	};

	calculateOrderDue() {
		let totalAmount = 0;
		for (let i of this.props.products) {
			if (i.product.description === 'discount') {
				totalAmount = totalAmount + i.finalAmount;
			}
			else if (i.product.description === 'delivery') {
				totalAmount = totalAmount + i.finalAmount;
			} else {
				totalAmount = totalAmount + i.finalAmount;
			}
		}
		return totalAmount;
	}

	discountRows = (item, index, separators) => {
		const productIndex = this.props.selectedDiscounts.map(function (e) { return e.product.productId }).indexOf(this.state.selectedItem.product.productId);

		let isDiscountAvailable = false;
		if (productIndex >= 0) {
			isDiscountAvailable = this.props.selectedDiscounts[productIndex].discount.id === item.id;
		}

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

							if (this.state.selectedDiscounts.hasOwnProperty('id')) {
								DiscountRealm.isSelected(this.state.selectedDiscounts, false);
							}

							this.props.discountActions.setDiscounts(DiscountRealm.getDiscounts());

							if (isOn) {
								const selectedDiscounts = item;
								this.props.orderActions.SetOrderDiscounts('Not Custom', 0, this.state.selectedItem.product, selectedDiscounts, (this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product)));
								this.setState({ selectedDiscounts });
							}

							if (!isOn) {
								this.props.orderActions.RemoveProductDiscountsFromOrder(this.state.selectedItem.product);
								this.setState({ selectedDiscounts: {} });
							}
						}}
					/>

				</View>

			</View>
		);
	};

	showHeader = () => {
		return (
			<View style={[{ flex: 1, flexDirection: 'row' }, styles.headerBackground]}>
				<View style={[{ flex: 2 }]}>
					<Text style={[styles.headerItem, styles.headerLeftMargin]}>{i18n.t('item')}</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItem]}>{i18n.t('quantity')}</Text>
				</View>
				<View style={[{ flex: 2 }]}>
					<Text style={[styles.headerItem, { textAlign: 'center' }]}>{i18n.t('charge')}</Text>
				</View>
			</View>
		);
	};

	counterChangedHandler(action) {
		let unitPrice = this.getItemPrice(this.state.selectedItem.product);
		switch (action) {
			case 'inc':
				if (this.state.accumulator <= 0) {
					this.refs.productModel.close();
					this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
				} else {
					this.setState((prevState) => {
						this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, prevState.accumulator + 1, unitPrice);
						return {
							accumulator: prevState.accumulator + 1
						}
					})

					//this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
				}
				break;
			case 'dec':
				if (this.state.accumulator <= 0) {
					this.refs.productModel.close();
					this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
				} else {
					this.setState((prevState) => {
						this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, prevState.accumulator - 1, unitPrice);
						return { accumulator: prevState.accumulator - 1 }
					})

					//this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
				}
				break;
		}
	}

	// Wrong sales channel for Retailers or Resellers.
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
		return item.unitPrice;	// Just use product price
	};

	getCurrency = (item) => {
		if (item.hasOwnProperty('product')) {
			return item.product.priceCurrency.toUpperCase();
		}
	};

	getDiscountPrice = (amountPerQuantity, item) => {
		if (!item.hasOwnProperty('discount')) {
			return amountPerQuantity;
		}

		if (Number(item.discount) === 0) {
			return amountPerQuantity;
		}

		if (item.type === 'Flat') {
			return amountPerQuantity - Number(item.discount);
		}

		if (item.type === 'Percentage') {
			return amountPerQuantity * (Number(item.discount) / 100);
		}
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
