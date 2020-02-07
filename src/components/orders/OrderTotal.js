import React, { Component } from "react"
import { View, Text, FlatList, ScrollView, TouchableHighlight, StyleSheet } from "react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as OrderActions from "../../actions/OrderActions";
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import * as Utilities from "../../services/Utilities";
import * as ToolbarActions from '../../actions/ToolBarActions';
import i18n from "../../app/i18n";

import Modal from 'react-native-modalbox';
import ToggleSwitch from 'toggle-switch-react-native';

class OrderTotal extends Component {

	constructor(props) {
		super(props);
		this.state = {
			isCash: true,
			isLoan: false,
			isMobile: false,
			isJibuCredit: false,
			isCheque: false,
			isBank: false,
			selectedPaymentType: "Cash"
		};
	}

	getPaymentType = (item) => {
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

	render() {
		return (
			<View style={styles.container}>
				<Text style={[{ flex: 2 }, styles.totalText]}>{i18n.t('order-total')}</Text>
		<Text style={[{ flex: 3 }, styles.totalText]}>{this.getCurrency().toUpperCase()} {Utilities.formatCurrency(this.getAmount())}</Text>


				<Modal style={[styles.modal4]} coverScreen={true} swipeToClose={true} position={"bottom"} ref={"modal6"} swipeArea={10}>
					<ScrollView>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[styles.baseItem, styles.leftMargin]}>Cash</Text>
							</View>
							<View style={{ flex: 1, height: 50 }}>
								<ToggleSwitch
									isOn={this.state.isCash}
									onColor="green"
									offColor="red"
									labelStyle={{ color: "black", fontWeight: "900" }}
									size="large"
									onToggle={isOn => {
										console.log("changed to : ", isOn);
										this.setState({ isCash: isOn === true ? true : false });
										this.setState({ selectedPaymentType: isOn === true ? "Cash" : this.state.selectedPaymentType });
										if (isOn) {
											this.setState({ isMobile: false });
											this.setState({ isBank: false });
											this.setState({ isCheque: false });
											this.setState({ isLoan: false });
											this.setState({ isJibuCredit: false });
										} else {
											this.setState({ selectedPaymentType: "Cash" });
											this.setState({ isCash: true });
										}
									}}
								/>
							</View>
						</View>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[styles.baseItem, styles.leftMargin]}>Loan</Text>
							</View>
							<View style={{ flex: 1, height: 50 }}>
								<ToggleSwitch
									isOn={this.state.isLoan}
									onColor="green"
									offColor="red"
									labelStyle={{ color: "black", fontWeight: "900" }}
									size="large"
									onToggle={isOn => {
										console.log("changed to : ", isOn);

										this.setState({ isLoan: isOn === true ? true : false });
										this.setState({ selectedPaymentType: isOn === true ? "Loan" : this.state.selectedPaymentType });
										if (isOn) {
											this.setState({ isCash: false });
											this.setState({ isBank: false });
											this.setState({ isCheque: false });
											this.setState({ isMobile: false });
											this.setState({ isJibuCredit: false });
										} else {
											this.setState({ selectedPaymentType: "Cash" });
											this.setState({ isCash: true });
										}
									}}
								/>
							</View>
						</View>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[styles.baseItem, styles.leftMargin]}>Mobile</Text>
							</View>
							<View style={{ flex: 1, height: 50 }}>
								<ToggleSwitch
									isOn={this.state.isMobile}
									onColor="green"
									offColor="red"
									labelStyle={{ color: "black", fontWeight: "900" }}
									size="large"
									onToggle={isOn => {
										console.log("changed to : ", isOn);

										this.setState({ isMobile: isOn === true ? true : false });
										this.setState({ selectedPaymentType: isOn === true ? "Mobile" : this.state.selectedPaymentType });
										if (isOn) {
											this.setState({ isCash: false });
											this.setState({ isBank: false });
											this.setState({ isCheque: false });
											this.setState({ isLoan: false });
											this.setState({ isJibuCredit: false });
										} else {
											this.setState({ selectedPaymentType: "Cash" });
											this.setState({ isCash: true });
										}
									}}
								/>
							</View>
						</View>


						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[styles.baseItem, styles.leftMargin]}>Jibu Credit</Text>
							</View>
							<View style={{ flex: 1, height: 50 }}>
								<ToggleSwitch
									isOn={this.state.isJibuCredit}
									onColor="green"
									offColor="red"
									labelStyle={{ color: "black", fontWeight: "900" }}
									size="large"
									onToggle={isOn => {
										console.log("changed to : ", isOn);

										this.setState({ isJibuCredit: isOn === true ? true : false });
										this.setState({ selectedPaymentType: isOn === true ? "Jibu Credit" : this.state.selectedPaymentType });
										if (isOn) {
											this.setState({ isCash: false });
											this.setState({ isBank: false });
											this.setState({ isCheque: false });
											this.setState({ isLoan: false });
											this.setState({ isMobile: false });
										} else {
											this.setState({ selectedPaymentType: "Cash" });
											this.setState({ isCash: true });
										}
									}}
								/>
							</View>
						</View>

						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[styles.baseItem, styles.leftMargin]}>Cheque</Text>
							</View>
							<View style={{ flex: 1, height: 50 }}>
								<ToggleSwitch
									isOn={this.state.isCheque}
									onColor="green"
									offColor="red"
									labelStyle={{ color: "black", fontWeight: "900" }}
									size="large"
									onToggle={isOn => {
										console.log("changed to : ", isOn);

										this.setState({ isCheque: isOn === true ? true : false });
										this.setState({ selectedPaymentType: isOn === true ? "Cheque" : this.state.selectedPaymentType });
										if (isOn) {
											this.setState({ isCash: false });
											this.setState({ isBank: false });
											this.setState({ isJibuCredit: false });
											this.setState({ isLoan: false });
											this.setState({ isMobile: false });
										} else {
											this.setState({ selectedPaymentType: "Cash" });
											this.setState({ isCash: true });
										}
									}}
								/>
							</View>
						</View>


						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[styles.baseItem, styles.leftMargin]}>Bank Transfer</Text>
							</View>
							<View style={{ flex: 1, height: 50 }}>
								<ToggleSwitch
									isOn={this.state.isBank}
									onColor="green"
									offColor="red"
									labelStyle={{ color: "black", fontWeight: "900" }}
									size="large"
									onToggle={isOn => {
										console.log("changed to : ", isOn);

										this.setState({ isBank: isOn === true ? true : false });
										this.setState({ selectedPaymentType: isOn === true ? "Bank" : this.state.selectedPaymentType });
										if (isOn) {
											this.setState({ isCash: false });
											this.setState({ isCheque: false });
											this.setState({ isJibuCredit: false });
											this.setState({ isLoan: false });
											this.setState({ isMobile: false });
										} else {
											this.setState({ selectedPaymentType: "Cash" });
											this.setState({ isCash: true });
										}
									}}
								/>
							</View>
						</View>







					</ScrollView>
				</Modal>



			</View>


		);
	}

	showPaymentType() {
		//	this.props.toolbarActions.ShowScreen('paymentTypes');
		this.refs.modal6.open();
	}

	getAmount = () => {
		if(this.props.products.length > 0){
			return this.props.products.reduce((total, item) => {
				return total + item.finalAmount;
		 }, 0);
		}
		return 0;

	};

	getCurrency = () => {
		if(this.props.products.length > 0){
			return this.props.products[0].product.priceCurrency;
		}
		return '';

	};

	getItemPrice = (product) => {
		let salesChannel = SalesChannelRealm.getSalesChannelFromName(this.props.channel.salesChannel);
		if (salesChannel) {
			let productMrp = ProductMRPRealm.getFilteredProductMRP()[ProductMRPRealm.getProductMrpKeyFromIds(product.productId, salesChannel.id)];
			if (productMrp) {
				return productMrp.priceAmount;
			}
		}
		return product.priceAmount;	// Just use product price
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

export default connect(mapStateToProps, mapDispatchToProps)(OrderTotal);

const styles = StyleSheet.create({
	container: {
		flex: 2,
		backgroundColor: "#e0e0e0",
		borderColor: '#2858a7',
		borderTopWidth: 5,
		borderRightWidth: 5,

	},
	totalText: {
		marginTop: 10,
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	},
	baseItem: {
		fontWeight: 'bold',
		fontSize: 16,
		color: 'black',
		paddingTop: 4,
		paddingBottom: 4,

	},
	leftMargin: {
		left: 10
	},
	modal4: {
		height: 300
	},

});
