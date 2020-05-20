import React from 'react';
import {
	View,
	ScrollView,
	StyleSheet,
	Dimensions,
	Picker,
	Alert,
	ActivityIndicator,
	ImageBackground
} from 'react-native';
import { Card, Button, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Synchronization from '../services/Synchronization';
import * as WastageActions from "../actions/WastageActions";
import CustomerReminderRealm from '../database/customer-reminder/customer-reminder.operations';
import SettingRealm from '../database/settings/settings.operations';
import CreditRealm from '../database/credit/credit.operations';
import CustomerRealm from '../database/customers/customer.operations';
import InventroyRealm from '../database/inventory/inventory.operations';
import ProductsRealm from '../database/products/product.operations';
import DiscountRealm from '../database/discount/discount.operations';
import OrderRealm from '../database/orders/orders.operations';
import * as CustomerReminderActions from '../actions/CustomerReminderActions';
import * as TopUpActions from '../actions/TopUpActions';
import * as SettingsActions from '../actions/SettingsActions';
import * as CustomerActions from '../actions/CustomerActions';
import * as NetworkActions from '../actions/NetworkActions';
import * as AuthActions from '../actions/AuthActions';
import * as ProductActions from '../actions/ProductActions';
import * as receiptActions from '../actions/ReceiptActions';
import * as InventoryActions from '../actions/InventoryActions';
import * as discountActions from '../actions/DiscountActions';
import * as paymentTypesActions from '../actions/PaymentTypesActions';
import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import ReceiptPaymentTypeRealm from '../database/reciept_payment_types/reciept_payment_types.operations';
import CustomerDebtRealm from '../database/customer_debt/customer_debt.operations';
import Events from 'react-native-simple-events';

import Communications from '../services/Communications';
import i18n from '../app/i18n';

const { height, width } = Dimensions.get('window');
const inputFontHeight = Math.round((24 * height) / 752);

const supportedUILanguages = [
	{ name: 'English', iso_code: 'en' },
	{ name: 'Français', iso_code: 'fr' }
];

class Login extends React.PureComponent {
	constructor(props) {

		super(props);

		this.supportedLanguages = React.createRef();

		this.state = {
			language: '',
			user: null,
			password: null,
			selectedLanguage: {},
			isLoading: false
		};

		this.onShowLanguages = this.onShowLanguages.bind(this);
		this.onLanguageSelected = this.onLanguageSelected.bind(this);
	}

	render() {
		let serviceItems = supportedUILanguages.map((s, i) => {
			return <Picker.Item key={i} value={s.iso_code} label={s.name} />
		});
		return (
			<ImageBackground style={styles.imgBackground}
				resizeMode='cover'
				source={require('../images/bottlesrackmin.jpg')}>
				<ScrollView style={{ flex: 1, backgroundColor: 'transparent' }}>
					<View style={{ flex: 1, backgroundColor: 'transparent', alignItems: 'center' }}>
						<Card
							title={'Welcome to SEMA'}
							titleStyle={{ fontSize: 26 }}
							dividerStyle={{ display: 'none' }}
							containerStyle={{ width: '50%', marginTop: 30, borderRadius: 5, elevation: 10 }}>

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
								style={{ padding: 10, width: '95%', alignSelf: 'center' }}
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
				this.loadSyncedData().then(results => {
					this.props.settingsActions.setSettings(SettingRealm.getAllSetting());
					this.setState({ isLoading: false });
					this.props.navigation.navigate('App');
				});

			});

		} catch (error) { }
	};


	_clearDataAndSync() {
		try {

			Events.trigger('ClearLoggedSales', {});
			this.props.settingsActions.setSettings(SettingRealm.getAllSetting());
			this.props.customerActions.setCustomers(CustomerRealm.getAllCustomer());
			const saveConnected = Synchronization.isConnected;
			Synchronization.initialize(
				CustomerRealm.getLastCustomerSync(),
				ProductsRealm.getLastProductsync(),
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
		if (!this.state.user || !this.state.password) {
			Alert.alert(
				i18n.t('no-username'),
				i18n.t('no-credentials'),
				[{ text: i18n.t('ok'), style: 'cancel' }],
				{ cancelable: true }
			);
			return;
		}
		this.setState({ isLoading: true });

		Communications.login(this.state.user, this.state.password)
			.then(result => {
				if (result.status === 200) {

					if (result.response.userSatus) {
						let oldSettings = { ...SettingRealm.getAllSetting() };
						let currency = '';
						if (result.response.data.kiosk.region_id == 201) {
							currency = 'UGX'
						} else if (result.response.data.kiosk.region_id == 301) {
							currency = 'RWF'
						} else if (result.response.data.kiosk.region_id == 401) {
							currency = 'KES'
						} else if (result.response.data.kiosk.region_id == 501) {
							currency = 'TZS'
						} else if (result.response.data.kiosk.region_id == 601) {
							currency = 'USD'
						} else if (result.response.data.kiosk.region_id == 602) {
							currency = 'USD'
						} else if (result.response.data.kiosk.region_id == 701) {
							currency = 'ZMW'
						} else if (result.response.data.kiosk.region_id == 801) {
							currency = 'FBU'
						}
						SettingRealm.saveSettings(
							"http://142.93.115.206:3002/",
							result.response.data.kiosk.name,
							this.state.user,
							this.state.password,
							this.state.selectedLanguage,
							result.response.token,
							result.response.data.kiosk.id,
							result.response.data.kiosk.region_id,
							false,
							currency
						);

						Communications.initialize(
							"http://142.93.115.206:3002/",
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
						}

						if (!this.isSiteIdDifferent(result.response.data.kiosk.id, oldSettings.siteId)) {
							this.props.settingsActions.setSettings(SettingRealm.getAllSetting());
							this.setState({ isLoading: false });
							this.props.navigation.navigate('App');
						}

					}else{
						Alert.alert(
							i18n.t('network-connection'),
							`Account has been De-activated`,
							[{ text: i18n.t('ok'), style: 'cancel' }],
							{ cancelable: true }
						);
						this.setState({ isLoading: false });
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

	subtractDays = (theDate, days) => {
		return new Date(theDate.getTime() - days * 24 * 60 * 60 * 1000);
	};

	loadSyncedData() {

		return new Promise(resolve => {

			try {

				this.props.customerActions.setCustomers(
					CustomerRealm.getAllCustomer()
				);

				this.props.productActions.setProducts(
					ProductsRealm.getProducts()
				);

				//PaymentTypeRealm.truncate();
				this.props.paymentTypesActions.setPaymentTypes(
					PaymentTypeRealm.getPaymentTypes()
				);

				this.props.paymentTypesActions.setRecieptPaymentTypes(
					ReceiptPaymentTypeRealm.getReceiptPaymentTypes()
				);

				this.props.topUpActions.setTopups(
					CreditRealm.getAllCredit()
				);

				this.props.wastageActions.GetInventoryReportData(this.subtractDays(new Date(), 1), new Date(), ProductsRealm.getProducts());


				this.props.inventoryActions.setInventory(
					InventroyRealm.getAllInventory()
				);


				this.props.receiptActions.setReceipts(
					OrderRealm.getAllOrder()
				);


				this.props.customerReminderActions.setCustomerReminders(
					CustomerReminderRealm.getCustomerReminders()
				);

				this.props.paymentTypesActions.setCustomerPaidDebt(
					CustomerDebtRealm.getCustomerDebts()
				);

				this.props.discountActions.setDiscounts(
					DiscountRealm.getDiscounts()
				);



				Synchronization.initialize(
					CustomerRealm.getLastCustomerSync(),
					ProductsRealm.getLastProductsync(),
					'',
					CreditRealm.getLastCreditSync(),
					InventroyRealm.getLastInventorySync(),
				);
				Synchronization.setConnected(this.props.network.isNWConnected);
				resolve(true)
			} catch (error) {
				resolve(false);
			}

		});


	};


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
		discounts: state.discountReducer.discounts,
		products: state.productReducer.products,
	};
}
function mapDispatchToProps(dispatch) {
	return {
		networkActions: bindActionCreators(NetworkActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch),
		settingsActions: bindActionCreators(SettingsActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		wastageActions: bindActionCreators(WastageActions, dispatch),
		authActions: bindActionCreators(AuthActions, dispatch),
		inventoryActions: bindActionCreators(InventoryActions, dispatch),
		productActions: bindActionCreators(ProductActions, dispatch),
		receiptActions: bindActionCreators(receiptActions, dispatch),
		discountActions: bindActionCreators(discountActions, dispatch),
		customerReminderActions: bindActionCreators(CustomerReminderActions, dispatch),
		paymentTypesActions: bindActionCreators(paymentTypesActions, dispatch),
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
