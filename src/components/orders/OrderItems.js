import React, { Component } from "react";
import { View, Text, Button, ScrollView, FlatList, TextInput, Dimensions, TouchableHighlight, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as OrderActions from "../../actions/OrderActions";
import PosStorage from "../../database/PosStorage";
import * as ToolbarActions from '../../actions/ToolBarActions';
import i18n from "../../app/i18n";
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/FontAwesome';

import ToggleSwitch from 'toggle-switch-react-native';

import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
const { height, width } = Dimensions.get('window');
const widthQuanityModal = 1000;
const heightQuanityModal = 500;
const inputTextWidth = 400;
const marginInputItems = width / 2 - inputTextWidth / 2;

const inputFontHeight = Math.round((24 * height) / 752);
const marginTextInput = Math.round((5 * height) / 752);
const marginSpacing = Math.round((20 * height) / 752);

var screen = Dimensions.get('window');
const calculatorDigits = [
	{ id: 7, display: "7" },
	{ id: 8, display: "8" },
	{ id: 9, display: "9" },
	{ id: 4, display: "4" },
	{ id: 5, display: "5" },
	{ id: 6, display: "6" },
	{ id: 1, display: "1" },
	{ id: 2, display: "2" },
	{ id: 3, display: "3" },
	{ id: 0, display: "0" },
	{ id: 99, display: "CLEAR" },
];
class OrderItems extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isQuantityVisible: false,
			selectedItem: {},
			accumulator: 0,
			firstKey: true,
			isKajibu: false,
			is20LTap: false,
			isOpen: false,
			isDisabled: false,
			swipeToClose: true,
			sliderValue: 0.3,

			tableHead: ['Quantity'],
			tableData: [
				['-', '10', '+'],
				['Discounts (Show All Discounts applicable to this store)'],
				['Kajibu', ''],
				['20L Tap 10 Purchase', ''],
				['Custom', 'An input field for custom discount value'],
				['Notes'],
				['Save', 'Remove Item']
			]
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


	render() {
		var BContent = (
			<View style={[styles.btn, styles.btnModal]}>
				<Button title="X" color="black" onPress={() => this.setState({ isOpen: false })} />
			</View>
		);
		const state = this.state;
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


				{/* <Button title="Position bottom + ScrollView" onPress={() => this.refs.modal6.open()} style={styles.btn} /> */}


				<Modal style={[styles.modal, styles.modal3]} coverScreen={true} position={"center"} ref={"modal6"} isDisabled={this.state.isDisabled} backdropContent={BContent}>
					<Text style={styles.text}>Modal centered</Text>
					<Button title={`Disable (${this.state.isDisabled ? "true" : "false"})`} onPress={() => this.setState({ isDisabled: !this.state.isDisabled })} style={styles.btn} />
				</Modal>

				<Modal style={[styles.modal4]} swipeToClose={true} position={"bottom"} ref={"modal16"} swipeArea={10}>
					<ScrollView>

						<View style={{
							flex: 1,
							width: "100%",
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'stretch',
						}}>
							<View style={{ flex: 1, height: 50, backgroundColor: 'powderblue' }}>

								<TouchableHighlight style={{ flex: 1 }}
									onPress={() => this.counterChangedHandler('inc')}>
									<Text style={[styles.baseItem, styles.leftMargin]}>-</Text>
								</TouchableHighlight>

							</View>
							<View style={{ flex: 1, height: 50, backgroundColor: 'skyblue' }} >
								<Text style={[styles.baseItem]}>{this.state.selectedItem.quantity}@{this.getItemPrice(this.state.selectedItem.product)}</Text>
							</View>
							<View style={{ flex: 1, height: 50, backgroundColor: 'steelblue' }}>
								<TouchableHighlight style={{ flex: 1 }}
									onPress={() => this.counterChangedHandler('dec')}>
									<Text style={[styles.baseItem, styles.leftMargin]}>+</Text>
								</TouchableHighlight>


							</View>
						</View>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50, backgroundColor: 'steelblue' }}>
								<Text style={[styles.baseItem]}>Price</Text>
							</View>
							<View style={{ flex: 1, height: 50, backgroundColor: 'steelblue' }}>
								<Text style={[styles.baseItem]}>{(this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product)).toFixed(2)}</Text>
							</View>
						</View>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[styles.baseItem]}>Discounts (Show all discount applicable to this store)</Text>
							</View>
						</View>


						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50, backgroundColor: 'steelblue' }}>
								<Text style={[styles.baseItem]}>Kajibu</Text>
							</View>
							<View style={{ flex: 1, height: 50, backgroundColor: 'steelblue' }}>
								<ToggleSwitch
									isOn={this.state.isKajibu}
									onColor="green"
									offColor="red"
									labelStyle={{ color: "black", fontWeight: "900" }}
									size="large"
									onToggle={isOn => {
										console.log("changed to : ", isOn);
										this.setState({ isKajibu: isOn === true ? true : false });
									}}
								/>
							</View>
						</View>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50, backgroundColor: 'steelblue' }}>
								<Text style={[styles.baseItem]}>20L Tap 10th Purchase</Text>
							</View>
							<View style={{ flex: 1, height: 50, backgroundColor: 'steelblue' }}>
								<ToggleSwitch
									isOn={this.state.is20LTap}
									onColor="green"
									offColor="red"
									labelStyle={{ color: "black", fontWeight: "900" }}
									size="large"
									onToggle={isOn => {
										console.log("changed to : ", isOn);

										this.setState({ is20LTap: isOn === true ? true : false });
									}}
								/>
							</View>
						</View>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50, backgroundColor: 'steelblue' }}>
								<Text style={[styles.baseItem]}>Custom</Text>
							</View>
							<View style={{ flex: 1, height: 50, backgroundColor: 'steelblue' }}>
								<TextInput
									style={[styles.inputText]}
									underlineColorAndroid="transparent"
									placeholder="Custom Discount"
								/>
							</View>
						</View>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[styles.baseItem]}>Notes</Text>
							</View>
						</View>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<TextInput
									style={[styles.inputText]}
									underlineColorAndroid="transparent"
									placeholder="Notes"
								/>
							</View>
						</View>



					</ScrollView>
				</Modal>



				{/* <Modal animationType="slide" visible={this.state.isQuantityVisible}
					backdropColor={'red'}
					transparent={true}
					onRequestClose={this.closeHandler}>
					{this.ShowQuantityContent()}
				</Modal> */}
			</View>

		);
	}

	closeHandler = () => {
		this.setState({ isQuantityVisible: false });
	};


	showQuantityChanger() {
		this.props.toolbarActions.ShowScreen('quanityChanger');
	}

	onPressItem = (item) => {
		this.setState({ isQuantityVisible: true });
		this.setState({ selectedItem: item });
		this.setState({ accumulator: item.quantity });
		this.setState({ firstKey: true });
		this.refs.modal6.open();
	};


	getRow = (item) => {
		return (
			<View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
				<View style={[{ flex: 3 }]}>
					<Text style={[styles.baseItem, styles.leftMargin]}>{item.product.description}</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<TouchableHighlight onPress={() => this.showQuantityChanger()}>
						<Text style={[styles.baseItem]}>{item.quantity}</Text>
					</TouchableHighlight>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text numberOfLines={1} style={[styles.baseItem]}>{(item.quantity * this.getItemPrice(item.product)).toFixed(2)}</Text>
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

	ShowQuantityContent = () => (
		<View style={styles.quantityModal}>
			<View style={styles.modalTotal}>
				<Text style={styles.accumulator}>{this.state.accumulator}</Text>
			</View>
			<View style={styles.modalCalculator}>
				<View style={{ flex: 1 }}>
					<FlatList
						data={calculatorDigits}
						renderItem={({ item, index, separators }) => (
							<TouchableHighlight
								onPress={() => this.onDigit(item)}
								onShowUnderlay={separators.highlight}
								onHideUnderlay={separators.unhighlight}>
								{this.getDigit(item)}
							</TouchableHighlight>
						)}
						keyExtractor={item => item.id}
						numColumns={3}
					/>

				</View>
			</View>

			<View style={styles.modalDone}>
				<TouchableHighlight style={{ flex: 1 }}
					onPress={() => this.onDone()}>
					<Text style={styles.doneButton}>Done</Text>
				</TouchableHighlight>
			</View>
		</View>
	);

	onDigit = (digit) => {
		if (digit.id === 99) {
			this.setState({ accumulator: 0 });
		} else if (this.state.firstKey) {
			this.setState({ firstKey: false });
			this.setState({ accumulator: digit.id });
		} else {
			this.setState({ accumulator: (this.state.accumulator * 10) + digit.id });
		}
	};

	onAdd = () => {
		this.setState({ isQuantityVisible: false });
		let unitPrice = this.getItemPrice(this.state.selectedItem.product);
		console.log('first -add', this.state.accumulator);
		this.setState((prevState) => { return { accumulator: prevState.accumulator + 1 } })
		//this.state.selectedItem.quantity
		console.log('second -add', this.state.accumulator);
		//console.log(this.state.selectedItem.quantity);

		if (this.state.accumulator === 0) {
			this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
		} else {
			this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
		}
	};


	counterChangedHandler = (action, value) => {
		this.setState({ isQuantityVisible: false });
		let unitPrice = this.getItemPrice(this.state.selectedItem.product);
		switch (action) {
			case 'inc':
				if (this.state.accumulator === 0) {
					this.refs.modal6.close();
					this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
				} else {
					this.setState((prevState) => { return { accumulator: prevState.accumulator - 1 } })

					this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
				}
				break;
			case 'dec':
				if (this.state.accumulator === 0) {
					this.refs.modal6.close();
					this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
				} else {
					this.setState((prevState) => { return { accumulator: prevState.accumulator + 1 } })

					this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
				}
				break;
		}
	}



	onSub = () => {
		this.setState({ isQuantityVisible: false });
		let unitPrice = this.getItemPrice(this.state.selectedItem.product);
		console.log('first -sub', this.state.accumulator)
		this.setState((prevState) => { return { accumulator: prevState.accumulator - 1 } })
		//this.state.selectedItem.quantity
		console.log('second - sub', this.state.accumulator);
		//console.log(this.state.selectedItem.quantity);

		if (this.state.accumulator === 0) {
			this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
		} else {
			this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
		}
	};

	getDigit = (digit) => {
		return (
			<View style={this.getDigitStyle(digit)}>
				<Text style={styles.digit} >{digit.display}</Text>
			</View>
		)
	};

	getDigitStyle = (digit) => {
		return (digit.id === 99) ? styles.clearContainer : styles.digitContainer;
	};

	onDone = () => {
		this.setState({ isQuantityVisible: false });
		let unitPrice = this.getItemPrice(this.state.selectedItem.product);

		if (this.state.accumulator === 0) {
			this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
		} else {
			this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
		}
	};

	getItemPrice = (item) => {
		if (!item) {
			return 1;
		}
		let salesChannel = PosStorage.getSalesChannelFromName(this.props.channel.salesChannel);
		if (salesChannel) {
			let productMrp = PosStorage.getProductMrps()[PosStorage.getProductMrpKeyFromIds(item.productId, salesChannel.id)];
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
		channel: state.orderReducer.channel
	};
}
function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch),
		toolbarActions: bindActionCreators(ToolbarActions, dispatch)
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
		alignItems: 'center'
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
