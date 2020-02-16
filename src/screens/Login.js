import React, { Component } from 'react';
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	Dimensions,
	Image,
	Picker,
	Alert,
	ActivityIndicator,
	ImageBackground
} from 'react-native';
import { Card, ListItem, Button, Input, ThemeProvider } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Synchronization from '../services/Synchronization';

import PosStorage from '../database/PosStorage';
import SettingRealm from '../database/settings/settings.operations';
import CreditRealm from '../database/credit/credit.operations';
import CustomerRealm from '../database/customers/customer.operations'
import InventroyRealm from '../database/inventory/inventory.operations';
import CustomerTypeRealm from '../database/customer-types/customer-types.operations';
import SalesChannelRealm from '../database/sales-channels/sales-channels.operations';
import ProductsRealm from '../database/products/product.operations';
import DiscountRealm from '../database/discount/discount.operations';
import OrderRealm from '../database/orders/orders.operations';
import SalesChannelSync from '../services/sync/sales-channel.sync';
import CustomerTypeSync from '../services/sync/customer-types.sync';


import * as TopUpActions from '../actions/TopUpActions';
import * as SettingsActions from '../actions/SettingsActions';
import * as ToolbarActions from '../actions/ToolBarActions';
import * as CustomerActions from '../actions/CustomerActions';
import * as NetworkActions from '../actions/NetworkActions';
import * as AuthActions from '../actions/AuthActions';
import * as ProductActions from '../actions/ProductActions';
import * as receiptActions from '../actions/ReceiptActions';
import * as InventoryActions from '../actions/InventoryActions';
import * as discountActions from '../actions/DiscountActions';


import Events from 'react-native-simple-events';

import Communications from '../services/Communications';
import i18n from '../app/i18n';

const { height, width } = Dimensions.get('window');
const inputFontHeight = Math.round((24 * height) / 752);
const marginTextInput = Math.round((5 * height) / 752);
const marginSpacing = Math.round((20 * height) / 752);
const inputTextWidth = 400;
const marginInputItems = width / 2 - inputTextWidth / 2;

const supportedUILanguages = [
	{ name: 'English', iso_code: 'en' },
	{ name: 'Français', iso_code: 'fr' },
	{ name: 'Kreyòl Ayisyen', iso_code: 'ht' }
];

class Login extends Component {
	constructor(props) {

		super(props);

		this.supportedLanguages = React.createRef();

		this.state = {
			language: '',
			user: "administrator",
			password: "Let'sGrow",
			selectedLanguage: {},
			isLoading: false
		};

		this.onShowLanguages = this.onShowLanguages.bind(this);
		this.onLanguageSelected = this.onLanguageSelected.bind(this);
	}

	componentDidMount() {
	}

	componentDidUpdate() {
	}

	render() {
		let serviceItems = supportedUILanguages.map((s, i) => {
			return <Picker.Item key={i} value={s.iso_code} label={s.name} />
		});
		return (
			<ImageBackground style={ styles.imgBackground }
                 resizeMode='cover'
                 source={require('../images/bottlesrackmin.jpg')}>
				<ScrollView style={{ flex: 1, backgroundColor: 'transparent' }}>
						<View style={{ flex: 1,  backgroundColor: 'transparent', alignItems: 'center' }}>
							<Card
								title={'Welcome to SEMA'}
								titleStyle={{ fontSize: 26 }}
								dividerStyle={{ display: 'none' }}
								containerStyle={{ width: '40%', marginTop: 30, borderRadius: 5, elevation: 10 }}>

								<Input
									label={i18n.t('username-or-email-placeholder')}
									onChangeText={this.onChangeEmail.bind(this)}
									inputContainerStyle={[styles.inputText]}
								/>
								<Input
									label={i18n.t('password-placeholder')}
									secureTextEntry={true}
									onChangeText={this.onChangePassword.bind(this)}
									inputContainerStyle={[styles.inputText]}
								/>
								<Picker
								    style={{ padding: 10, width:'95%', alignSelf:'center' }}
									selectedValue={this.state.selectedLanguage.iso_code}
									onValueChange={(itemValue, itemIndex) => {
										this.onLanguageSelected(itemIndex);
									}
									}
								>
									{serviceItems}
								</Picker>
								<Button
									onPress={this.onConnection.bind(this)}
									buttonStyle={{ borderRadius: 8, marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 10, padding: 10 }}
									title={i18n.t('connect')} />

							</Card>
						</View>
					{
						this.state.isLoading && (
							<ActivityIndicator size={100} color="#ABC1DE" />
						)
					}
				</ScrollView>

			 </ImageBackground>
		);
	}

	onShowLanguages() {
		this.supportedLanguages.current.show();
	}

	onSynchronize() {
		try {
			this.setState({ isLoading: true });
			Synchronization.synchronize().then(syncResult => {
				this.setState({ isLoading: false });

				Synchronization.getLatestSales();
				this.loadSyncedData();
				this.props.navigation.navigate('App')
			});

		} catch (error) { }
	};


	_clearDataAndSync() {
		try {
			PosStorage.clearDataOnly();

			Events.trigger('ClearLoggedSales', {});
			this.props.settingsActions.setSettings(SettingRealm.getAllSetting());
			this.props.customerActions.setCustomers(CustomerRealm.getAllCustomer());
			const saveConnected = Synchronization.isConnected;
			Synchronization.initialize(
				CustomerRealm.getLastCustomerSync(),
				ProductsRealm.getLastProductsync(),
				PosStorage.getLastSalesSync(),
				CreditRealm.getLastCreditSync(),
				InventroyRealm.getLastInventorySync(),
			);
			Synchronization.setConnected(saveConnected);
		} catch (error) { }
	}

	onChangeEmail = user => {
		this.setState({ user });
		//this.props.parent.forceUpdate();
	};

	onChangePassword = password => {
		this.setState({ password });
		//this.props.parent.forceUpdate();
	};

	onConnection() {
		this.setState({ isLoading: true });

		Communications.login()
			.then(result => {
				if (result.status === 200) {
					let oldSettings = { ...SettingRealm.getAllSetting() };
					SettingRealm.saveSettings(
						"http://142.93.115.206:3006/",
						result.response.data.kiosk.name,
						this.state.user,
						this.state.password,
						this.state.selectedLanguage,
						result.response.token,
						result.response.data.kiosk.id,
						false
					);

					Communications.initialize(
						"http://142.93.115.206:3006/",
						result.response.data.kiosk.name,
						this.state.user,
						this.state.password,
						result.response.token,
						result.response.data.kiosk.id,
					);

					Communications.setToken(
						result.response.token
					);
					Communications.setSiteId(result.response.data.kiosk.id);
					SettingRealm.setTokenExpiration();


					if (this.isSiteIdDifferent(result.response.data.kiosk.id, oldSettings.siteId)) {
						this.onSynchronize();
						this.props.settingsActions.setSettings(SettingRealm.getAllSetting());
						this.setState({ isLoading: false });
						this.props.navigation.navigate('App');
					}

					if (!this.isSiteIdDifferent(result.response.data.kiosk.id, oldSettings.siteId)) {
						this.props.settingsActions.setSettings(SettingRealm.getAllSetting());
						this.setState({ isLoading: false });
						this.props.navigation.navigate('App');
					}

				} else {
					this.setState({ isLoading: false });
					message =
						result.response.msg +
						'(Error code: ' +
						result.status +
						')';
					Alert.alert(
						i18n.t('network-connection'),
						message,
						[{ text: i18n.t('ok'), style: 'cancel' }],
						{ cancelable: true }
					);
				}
			})
			.catch(result => {
				this.setState({ isLoading: false });
				Alert.alert(
					i18n.t('network-connection'),
					result.response.message + '. (' + result.status + ')',
					[{ text: i18n.t('ok'), style: 'cancel' }],
					{ cancelable: true }
				);
			});

	}

	loadSyncedData() {
		PosStorage.loadLocalData();
		this.props.customerActions.setCustomers(
			CustomerRealm.getAllCustomer()
		);
		this.props.topUpActions.setTopups(
			CreditRealm.getAllCredit()
		);
		this.props.inventoryActions.setInventory(
			InventroyRealm.getAllInventory()
		);
		this.props.productActions.setProducts(
			ProductsRealm.getProducts()
		);
		this.props.receiptActions.setRemoteReceipts(
			PosStorage.getRemoteReceipts()
		);
		this.props.receiptActions.setReceipts(
            OrderRealm.getAllOrder()
        );

        this.props.discountActions.setDiscounts(
            DiscountRealm.getDiscounts()
        );
		Synchronization.initialize(
			CustomerRealm.getLastCustomerSync(),
			ProductsRealm.getLastProductsync(),
			PosStorage.getLastSalesSync(),
			CreditRealm.getLastCreditSync(),
			InventroyRealm.getLastInventorySync(),
		);

		Synchronization.setConnected(this.props.network.isNWConnected);
	}

	isSiteIdDifferent(newSiteID, oldSiteID) {
		//Check is locally stored siteID is different from the remote returned siteID
		if (newSiteID != oldSiteID) {
			// New site - clear all data
			this._clearDataAndSync();
			return true;
		}
		return false;
	}


	getDefaultUILanguage() {
		return this.props.settings.uiLanguage.iso_code;
	}

	getDefaultUILanguageIndex() {
		let langIdx = 0;
		supportedUILanguages.forEach((lang, idx) => {
			if (lang.name === this.props.settings.uiLanguage.name) {
				langIdx = idx;
			}
		});
		return langIdx;
	}

	onLanguageSelected(langIdx) {
		this.setState(
			{
				selectedLanguage: supportedUILanguages.filter(
					(lang, idx) => idx === Number(langIdx)
				)[0]
			},
			() => {
				i18n.locale = this.state.selectedLanguage.iso_code;
				SettingRealm.setUILanguage(this.state.selectedLanguage);
				this.props.settingsActions.setSettings(SettingRealm.getAllSetting());
			}
		);
	}
}


function mapStateToProps(state, props) {
	return {
		settings: state.settingsReducer.settings,
		auth: state.authReducer,
		network: state.networkReducer.network,
        discounts: state.discountReducer.discounts
	};
}
function mapDispatchToProps(dispatch) {
	return {
		networkActions: bindActionCreators(NetworkActions, dispatch),
		toolbarActions: bindActionCreators(ToolbarActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch),
		settingsActions: bindActionCreators(SettingsActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		authActions: bindActionCreators(AuthActions, dispatch),
		inventoryActions: bindActionCreators(InventoryActions, dispatch),
		productActions: bindActionCreators(ProductActions, dispatch),
		receiptActions: bindActionCreators(receiptActions, dispatch),
        discountActions: bindActionCreators(discountActions, dispatch),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Login);

const styles = StyleSheet.create({
	imgBackground: {
		width: '100%',
		height: '100%',
		flex: 1,
	},
	container: {
		flex: 1,
		width: '100%',
		height: '100%',
		backgroundColor: 'transparent'
	},

	headerText: {
		fontSize: 24,
		color: 'black',
		marginLeft: 100
	},
	submit: {
		backgroundColor: '#2858a7',
		borderRadius: 20,
		marginTop: '1%'
	},
	inputContainer: {
		borderWidth: 2,
		borderRadius: 10,
		borderColor: '#2858a7',
		backgroundColor: 'white'
	},
	inputText: {
		fontSize: 22,
		alignSelf: 'center',
		borderWidth: 2,
		borderRadius: 8,
		borderColor: '#f1f1f1',
		backgroundColor: '#f1f1f1',
		margin: 5
	},

	buttonText: {
		fontWeight: 'bold',
		fontSize: 24,
		color: 'white',
		textAlign: 'center',
		paddingLeft: 30,
		paddingRight: 30
	},
	labelText: {
		fontSize: inputFontHeight,
		alignSelf: 'flex-end',
		marginRight: 20
	},

	dropdownText: {
		fontSize: 24
	},

	imgBackground: {
        width: '100%',
        height: '100%',
        flex: 1
	},

	updating: {
		height: 100,
		width: 500,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ABC1DE',
		borderColor: '#2858a7',
		borderWidth: 5,
		borderRadius: 10
	},
	checkLabel: {
		left: 20,
		fontSize: 24
	},
	activityIndicator: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center'
	},
	spinnerTextStyle: {
		color: '#002b80',
		fontSize: 50,
		fontWeight: 'bold'
	}
});
