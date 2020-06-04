import React from 'react';
if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	const ReactRedux = require('react-redux');
	whyDidYouRender(React, {
		trackAllPureComponents: true,
		trackExtraHooks: [
			[ReactRedux, 'useSelector']
		]
	});
}
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
import CustomerRealm from '../database/customers/customer.operations';
import ProductsRealm from '../database/products/product.operations';
import SettingRealm from '../database/settings/settings.operations';

import * as SettingsActions from '../actions/SettingsActions';
import * as CustomerActions from '../actions/CustomerActions';
import * as NetworkActions from '../actions/NetworkActions';
import * as ProductActions from '../actions/ProductActions';

import Events from 'react-native-simple-events';
import slowlog from 'react-native-slowlog';
import Communications from '../services/Communications';
import i18n from '../app/i18n';

const { height, width } = Dimensions.get('window');
const inputFontHeight = Math.round((24 * height) / 752);

const supportedUILanguages = [
	{ name: 'English', iso_code: 'en' },
	{ name: 'Français', iso_code: 'fr' }
];

const resizeMode = 'cover';
const color="#ABC1DE";
const appTitle='Welcome to SEMA';
const secureTextEntry = true;
class Login extends React.PureComponent {
	constructor(props) {

		super(props);
		this.supportedLanguages = React.createRef();
		slowlog(this, /.*/);
		this.state = {
			language: '',
			user: null,
			password: null,
			selectedLanguage: {},
			isLoading: false
		};
		this.onShowLanguages = this.onShowLanguages.bind(this);
		this.onLanguageSelected = this.onLanguageSelected.bind(this);
		this.image = require('../images/bottlesrackmin.jpg');
		this.size=100;
		this.serviceItems = supportedUILanguages.map((s, i) => {
			return <Picker.Item key={i} value={s.iso_code} label={s.name} />
		});
	}
	static whyDidYouRender = true;
	componentDidMount() {}

	render() {
	return (
			<ImageBackground style={styles.imgBackground}
				resizeMode={resizeMode}
				source={this.image}>
				<ScrollView style={styles.scrollst}>
					<View style={styles.ctnerstyle}>
						<Card
							title={appTitle}
							titleStyle={styles.titleStyle}
							dividerStyle={this.dividerStyle}
							containerStyle={styles.cardstyle}>

							<Input
								label={i18n.t('username-or-email-placeholder')}
								onChangeText={this.onChangeEmail}
								inputContainerStyle={[styles.inputText]}
							/>
							<Input
								label={i18n.t('password-placeholder')}
								secureTextEntry={secureTextEntry}
								onChangeText={this.onChangePassword}
								inputContainerStyle={[styles.inputText]}
							/>
							<Picker
								style={styles.pickerstyle}
								selectedValue={this.state.selectedLanguage.iso_code}
								onValueChange={(itemValue, itemIndex) => {
									this.onLanguageSelected(itemIndex);
								}
								}
							>
								{this.serviceItems}
							</Picker>
							<Button
								onPress={this.onConnection}
								buttonStyle={styles.btnstyle}
								title={i18n.t('connect')} />

						</Card>
					</View>
					{
						this.state.isLoading && (
							<ActivityIndicator size={this.size} color={color} />
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

	onConnection=()=> {
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

				this.props.customerActions.setCustomers(CustomerRealm.getAllCustomer());
				this.props.productActions.setProducts(ProductsRealm.getProducts()); 
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
		network: state.networkReducer.network,		
		products: state.productReducer.products,
	};
}
function mapDispatchToProps(dispatch) {
	return {
		networkActions: bindActionCreators(NetworkActions, dispatch),
		productActions: bindActionCreators(ProductActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		settingsActions: bindActionCreators(SettingsActions, dispatch),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Login);

const styles = StyleSheet.create({
	scrollst: {
		flex: 1,
		backgroundColor: 'transparent',
	},
	ctnerstyle: {
		flex: 1,
		backgroundColor: 'transparent',
		alignItems: 'center'
	},
	imgBackground: {
		width: '100%',
		height: '100%',
		flex: 1,
	},
	cardstyle: {
		width: '50%',
		 marginTop: 30,
		  borderRadius: 5,
		   elevation: 10,
	},
	container: {
		flex: 1,
		width: '100%',
		height: '100%',
		backgroundColor: 'transparent'
	},
	btnstyle: {
		borderRadius: 8, marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 10, padding: 10
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
	titleStyle:{ fontSize: 26 },
	dividerStyle:{ display: 'none' },
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

	pickerstyle: {
		padding: 10, width: '95%', alignSelf: 'center'
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
