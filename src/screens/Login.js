import React, { Component } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableHighlight,
	TextInput,
	StyleSheet,
	Dimensions,
	Image,
	Picker,
	Alert,
	ActivityIndicator
} from 'react-native';
import { Card, ListItem, Button, Input, ThemeProvider } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Synchronization from '../services/Synchronization';

import PosStorage from '../database/PosStorage';

import * as TopUpActions from '../actions/TopUpActions';
import * as SettingsActions from '../actions/SettingsActions';
import * as ToolbarActions from '../actions/ToolBarActions';
import * as CustomerActions from '../actions/CustomerActions';
import * as NetworkActions from '../actions/NetworkActions';
import * as AuthActions from '../actions/AuthActions';
import ModalDropdown from 'react-native-modal-dropdown';

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

class SettingsButton extends Component {
	render() {
		return (
			<View
				style={[styles.submit, { marginLeft: 30 }, this.getOpacity()]}>
				<View
					style={[
						{
							justifyContent: 'center',
							height: 60,
							alignItems: 'center'
						}
					]}>
					{this.showEnabled()}
				</View>
			</View>
		);
	}
	getOpacity() {
		return this.props.enableFn() ? { opacity: 1 } : { opacity: 0.7 };
	}
	showEnabled() {
		if (this.props.enableFn()) {
			console.log('Enabled - ' + this.props.label);
			return (
				<TouchableHighlight
					underlayColor="#c0c0c0"
					onPress={() => this.props.pressFn()}>
					<Text style={[styles.buttonText]}>{this.props.label}</Text>
				</TouchableHighlight>
			);
		} else {
			console.log('Disabled - ' + this.props.label);
			return <Text style={[styles.buttonText]}>{this.props.label}</Text>;
		}
	}
}

class Login extends Component {
	constructor(props) {
		let setting = PosStorage.loadSettings();
		console.log(setting);
		super(props);
		// this.url = React.createRef();
		// this.site = React.createRef();
		this.url = setting.semaUrl;
		this.site = setting.site;
		this.user = React.createRef();
		this.supportedLanguages = React.createRef();
		this.password = React.createRef();

		this.state = {
			animating: false,
			language: '',
			user: "administrator",
			password: "Let'sGrow",
			selectedLanguage: {},
			isLoggedIn: setting.token.length > 0 || false,
			isLoading: false
		};

		this.onShowLanguages = this.onShowLanguages.bind(this);
		this.onLanguageSelected = this.onLanguageSelected.bind(this);
		this.onSaveSettings = this.onSaveSettings.bind(this);
	}

	componentDidMount() {
		console.log(this.props.settings);
		this.props.authActions.isAuth(
			PosStorage.getSettings().token.length > 0 || false
		);
	}

	componentDidUpdate(oldProps) {
		if (this.props.auth.status !== oldProps.auth.status) {
			this.setState({ isLoggedIn: this.props.auth.status })
		}
	}

	render() {
		console.log(this.props.settings);
		let serviceItems = supportedUILanguages.map((s, i) => {
			return <Picker.Item key={i} value={s.iso_code} label={s.name} />
		});
		return (
			<View style={styles.container}>
				<ScrollView style={{ flex: 1 }}>
					<KeyboardAwareScrollView
						style={{ flex: 1 }}
						resetScrollToCoords={{ x: 0, y: 0 }}
						scrollEnabled={false}>
						<View style={{ flex: 1, alignItems: 'center', backgroundColor: 'white' }}>

							<Card
								title={i18n.t('connect')}
								containerStyle={{ width: 500, marginTop: 30 }}
							>

								<Input
									placeholder={i18n.t(
										'username-or-email-placeholder'
									)}
									label={i18n.t('username-or-email-placeholder')}
									onChangeText={this.onChangeEmail.bind(this)}
									leftIcon={
										<Icon
											name='md-mail'
											size={24}
											color='black'
										/>
									}
								/>

								<Input
									placeholder={i18n.t('password-placeholder')}
									label={i18n.t('password-placeholder')}
									onChangeText={this.onChangePassword.bind(this)}
									leftIcon={
										<Icon
											name='md-compass'
											size={24}
											color='black'
										/>
									}
								/>


								<Picker
									selectedValue={this.state.selectedLanguage.iso_code}
									onValueChange={(itemValue, itemIndex) => {
										this.onLanguageSelected(itemIndex);
									}
									}
								>
									{serviceItems}
								</Picker>

								<Button
									icon={<Icon
										name='md-mail'
										size={24}
										color='black'
										style={{ marginRight: 10 }}
									/>}
									onPress={this.onConnection.bind(this)}
									buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 10 }}
									title={i18n.t('connect')} />

							</Card>



							<View
								style={{
									flexDirection: 'row',
									flex: 1,
									alignItems: 'center'
								}}>

								{this.state.isLoggedIn && (
									<SettingsButton
										pressFn={this.onSynchronize.bind(this)}
										enableFn={this.enableConnectionOrSync.bind(
											this
										)}
										label={i18n.t('sync-now')}
									/>
								)}
							</View>
						</View>
					</KeyboardAwareScrollView>
					{this.state.animating && (
						<View style={styles.activityIndicator}>
							<ActivityIndicator size="large" />
						</View>
					)}
					{
						this.state.isLoading && (
							<ActivityIndicator size={120} color="#0000ff" />
						)
					}
				</ScrollView>
			</View>
		);
	}




	getSettingsCancel() {
		try {
			if (PosStorage.getCustomerTypes()) {
				if (PosStorage.getCustomerTypes().length > 0) {
					if (Communications._token) {
						return (
							<TouchableHighlight
								onPress={() => this.onCancelSettings()}>
								<Image
									source={require('../images/icons8-cancel-50.png')}
									style={{ marginRight: 100 }}
								/>
							</TouchableHighlight>
						);
					}
				}
			}
			return null;
		} catch (error) { }
	}

	getUrl() {
		return this.props.settings.semaUrl;
	}

	getUser() {
		return this.props.settings.user;
	}

	getPassword() {
		return this.props.settings.password;
	}

	getSite() {
		return this.props.settings.site;
	}

	onCancelSettings() {
		this.props.toolbarActions.ShowScreen('main');
	}

	onShowLanguages() {
		this.supportedLanguages.current.show();
	}

	closeHandler() {
		this.onCancelSettings();
	}

	onSaveSettings() {
		this.setState({ isLoading: true });
		// TODO - Validate fields and set focus to invalid field;
		this.saveSettings(
			this.props.settings.site,
			this.props.settings.token,
			this.props.settings.siteId
		);
	}

	enableSaveSettings() {
		return true;
	}
	onSynchronize() {
		try {
			this.setState({ isLoading: true });
			Synchronization.synchronize().then(syncResult => {
				this.setState({ isLoading: false });
				console.log(
					'Synchronization-result: ' + JSON.stringify(syncResult)
				);
				// let foo = this._getSyncResults(syncResult);
				Alert.alert(
					i18n.t('sync-results'),
					this._getSyncResults(syncResult),
					[{ text: i18n.t('ok'), style: 'cancel' }],
					{ cancelable: true }
				);
			});
			//Added by Jean Pierre
			Synchronization.getLatestSales();
		} catch (error) { }
	}
	_getSyncResults(syncResult) {
		try {
			if (syncResult.status != 'success')
				return i18n.t('sync-error', { error: syncResult.error });
			if (
				syncResult.hasOwnProperty('customers') &&
				syncResult.customers.error != null
			)
				return i18n.t('sync-error', {
					error: syncResult.customers.error
				});
			if (
				syncResult.hasOwnProperty('products') &&
				syncResult.products.error != null
			)
				return i18n.t('sync-error', {
					error: syncResult.products.error
				});
			if (
				syncResult.hasOwnProperty('sales') &&
				syncResult.sales.error != null
			)
				return i18n.t('sync-error', { error: syncResult.sales.error });
			if (
				syncResult.hasOwnProperty('productMrps') &&
				syncResult.productMrps.error != null
			)
				return i18n.t('sync-error', {
					error: syncResult.productMrps.error
				});
			else {
				if (
					syncResult.customers.localCustomers == 0 &&
					syncResult.customers.remoteCustomers == 0 &&
					syncResult.products.remoteProducts == 0 &&
					syncResult.sales.localReceipts == 0 &&
					syncResult.productMrps.remoteProductMrps == 0
				) {
					return i18n.t('data-is-up-to-date');
				} else {
					return `${syncResult.customers.localCustomers +
						syncResult.customers.remoteCustomers} ${i18n.t(
							'customers-updated'
						)}
				${syncResult.products.remoteProducts} ${i18n.t('products-updated')}
				${syncResult.sales.localReceipts} ${i18n.t('sales-receipts-updated')}
				${syncResult.productMrps.remoteProductMrps} ${i18n.t(
							'product-sales-channel-prices-updated'
						)}`;
				}
			}
		} catch (error) { }
	}
	onClearAll() {
		console.log('Settings:onClearAll');
		let alertMessage = i18n.t('clear-all-data');
		Alert.alert(
			alertMessage,
			i18n.t('are-you-sure', { doThat: i18n.t('delete-all-data') }),
			[
				{
					text: i18n.t('no'),
					onPress: () => console.log('Cancel Pressed'),
					style: 'cancel'
				},
				{
					text: i18n.t('yes'),
					onPress: () => {
						this._clearDataAndSync();
						this.closeHandler();
					}
				}
			],
			{ cancelable: false }
		);
	}
	enableClearAll() {
		return true;
	}

	_clearDataAndSync() {
		try {
			PosStorage.clearDataOnly();

			Events.trigger('ClearLoggedSales', {});
			this.props.settingsActions.setSettings(PosStorage.getSettings());
			this.props.customerActions.setCustomers(PosStorage.getCustomers());
			const saveConnected = Synchronization.isConnected;
			Synchronization.initialize(
				PosStorage.getLastCustomerSync(),
				PosStorage.getLastProductSync(),
				PosStorage.getLastSalesSync()
			);
			Synchronization.setConnected(saveConnected);
		} catch (error) { }
	}

	onChangeEmail = user => {
		console.log(user);
		this.setState({ user });
		//this.props.parent.forceUpdate();
	};

	onChangePassword = password => {
		console.log(password);
		this.setState({ password });
		//this.props.parent.forceUpdate();
	};


	onConnection() {
		this.setState({ animating: true });
		Communications.initialize(
			"http://142.93.115.206:3006/",
			"",
			this.state.user,
			this.state.password
		);

		console.log(this.props.settings.loginSync);
		if (this.props.settings.loginSync) {
			this.loginWithSync();

		}

		if (!this.props.settings.loginSync) {

			if (this.state.user === this.props.settings.user && this.state.password === this.props.settings.password) {

				Communications.login()
					.then(result => {
						console.log(
							'Passed - status' +
							result.status +
							' ' +
							JSON.stringify(result.response)
						);
						if (result.status === 200) {
							console.log('reponse',result.response);
							console.log('kiosks',result.response.data.kioskUser);
							//'UGTraining',
							Communications.getSiteId(
								result.response.token,
								result.response.data.kiosk.name
							)
								.then(async siteId => {
									if (siteId === -1) {
										message = i18n.t(
											'successful-connection-but',
											{
												what: this.site.current.state
													.propertyText,
												happened: i18n.t('does-not-exist')
											}
										);
									} else if (siteId === -2) {
										message = i18n.t(
											'successful-connection-but',
											{
												what: this.site.current.state
													.propertyText,
												happened: i18n.t('is-not-active')
											}
										);
									} else {

										console.log('siteId', siteId)
										this.props.authActions.isAuth(true);
										this.saveSettings(
											result.response.data.kiosk.name,
											result.response.token,
											siteId
										);
										Communications.setToken(
											result.response.token
										);
										Communications.setSiteId(siteId);
										PosStorage.setTokenExpiration();
										this.props.navigation.navigate('App');

									}

								})
								.catch(error => { });
						} else {
							this.setState({ animating: false });
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
						console.log(
							'Failed- status ' +
							result.status +
							' ' +
							result.response.message
						);
						this.setState({ animating: false });
						Alert.alert(
							i18n.t('network-connection'),
							result.response.message + '. (' + result.status + ')',
							[{ text: i18n.t('ok'), style: 'cancel' }],
							{ cancelable: true }
						);
					});

				// Communications.login()
				// 	.then(result => {
				// 		if (result.status === 200) {
				// 			let message = i18n.t('successful-connection');
				// 			Alert.alert(
				// 				i18n.t('network-connection'),
				// 				message,
				// 				[{ text: i18n.t('ok'), style: 'cancel' }],
				// 				{ cancelable: true }
				// 			);
				// 			Communications.setToken(
				// 				result.response.token
				// 			);
				// 		} else {
				// 			this.setState({ animating: false });
				// 			message =
				// 				result.response.msg +
				// 				'(Error code: ' +
				// 				result.status +
				// 				')';
				// 			Alert.alert(
				// 				i18n.t('network-connection'),
				// 				message,
				// 				[{ text: i18n.t('ok'), style: 'cancel' }],
				// 				{ cancelable: true }
				// 			);
				// 		}
				// 	})

				//this.props.navigation.navigate('App');
			} else {
				this.setState({ animating: true });
				Alert.alert(
					i18n.t('network-connection'),
					'Wrong Credentials have been Provided',
					[{ text: i18n.t('ok'), style: 'cancel' }],
					{ cancelable: true }
				);
			}

		}

	}


	loginWithSync() {

		try {
			let message = i18n.t('successful-connection');
			Communications.login()
				.then(result => {
					console.log(
						'Passed - status' +
						result.status +
						' ' +
						JSON.stringify(result.response)
					);
					if (result.status === 200) {

						console.log(result.response.token);
						console.log('kiosks',result.response.data.kiosk);
						console.log('kiosks',result.response.data.kioskUser);

						// Communications.getSiteId(
						// 	result.response.token,
						// 	result.response.data.kiosk.name
						// )
						// 	.then(siteId => {
						// 		console.log(siteId);
						// 	}).catch(error => {
						// 		console.log(error);
						// 	});


						Communications.getSiteId(
							result.response.token,
							result.response.data.kiosk.name
						)
							.then(async siteId => {
								console.log(
									'siteId - siteId' +
									siteId
								);
								if (siteId === -1) {
									message = i18n.t(
										'successful-connection-but',
										{
											what: this.site.current.state
												.propertyText,
											happened: i18n.t('does-not-exist')
										}
									);
								} else if (siteId === -2) {
									message = i18n.t(
										'successful-connection-but',
										{
											what: this.site.current.state
												.propertyText,
											happened: i18n.t('is-not-active')
										}
									);
								} else {
									this.props.authActions.isAuth(true);
									this.saveSettings(
										result.response.data.kiosk.name,
										result.response.token,
										siteId
									);
									Communications.setToken(
										result.response.token
									);
									Communications.setSiteId(siteId);
									PosStorage.setTokenExpiration();
									await Synchronization.synchronizeSalesChannels();
									Synchronization.scheduleSync();

									let date = new Date();
									//date.setDate(date.getDate() - 30);
									date.setDate(date.getDate() - 7);
								//	this.props.navigation.navigate('App');
									Communications.getReceiptsBySiteIdAndDate(
										siteId,
										date
									)
										.then(json => {
											console.log('ORIGINAL');
											console.log(JSON.stringify(json));
											console.log('END');

											PosStorage.addRemoteReceipts(
												json
											).then(saved => {
												console.log('SAVED');
												console.log(
													JSON.stringify(saved)
												);
												console.log('END');
												this.setState({ animating: false });
												Alert.alert(
													i18n.t('network-connection'),
													message,
													[{ text: i18n.t('ok'), style: 'cancel' }],
													{ cancelable: true }
												);
												this.loadSyncedData();
												this.props.navigation.navigate('App');
												Events.trigger(
													'ReceiptsFetched',
													saved
												);
											});
										})
										.catch(error => { });
								}

							})
							.catch(error => { });
					} else {
						this.setState({ animating: false });
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
					console.log(
						'Failed- status ' +
						result.status +
						' ' +
						result.response.message
					);
					this.setState({ animating: false });
					Alert.alert(
						i18n.t('network-connection'),
						result.response.message + '. (' + result.status + ')',
						[{ text: i18n.t('ok'), style: 'cancel' }],
						{ cancelable: true }
					);
				});
		} catch (error) {
			this.setState({ animating: false });
			console.log(JSON.stringify(error));
		}
	}


	loadSyncedData() {
		PosStorage.loadLocalData();

		this.props.customerActions.setCustomers(
			PosStorage.getCustomers()
		);
		this.props.productActions.setProducts(
			PosStorage.getProducts()
		);
		this.props.receiptActions.setRemoteReceipts(
			PosStorage.getRemoteReceipts()
		);

		this.props.topUpActions.setTopups(
			TopUps.getTopUps()
		);

		Synchronization.initialize(
			PosStorage.getLastCustomerSync(),
			PosStorage.getLastProductSync(),
			PosStorage.getLastSalesSync(),
			TopUps.getLastTopUpSync()
		);
		Synchronization.setConnected(this.props.network.isNWConnected);
	}

	onConnectionee() {
		this.setState({ animating: true });
		console.log(this.state.user, this.state.password);
		// Communications.initialize(
		// 	"http://142.93.115.206:3006/",
		// 	"",
		// 	this.state.user,
		// 	this.state.password
		// );
		Communications.initialize(
			"http://142.93.115.206:3006/",
			"",
			"administrator",
			"Let'sGrow"
		);


		try {
			let message = i18n.t('successful-connection');
			Communications.login()
				.then(result => {
					console.log(
						'Passed - status' +
						result.status +
						' ' +
						JSON.stringify(result.response)
					);
					if (result.status === 200) {
						console.log(result);

						// console.log("Response site name: " + result.response.data.kiosk.name);
						Communications.getSiteId(
							result.response.token,
							result.response.data.kiosk.name
						)
							.then(async siteId => {
								if (siteId === -1) {
									message = i18n.t(
										'successful-connection-but',
										{
											what: this.site.current.state
												.propertyText,
											happened: i18n.t('does-not-exist')
										}
									);
								} else if (siteId === -2) {
									message = i18n.t(
										'successful-connection-but',
										{
											what: this.site.current.state
												.propertyText,
											happened: i18n.t('is-not-active')
										}
									);
								} else {
									this.props.authActions.isAuth(true);
									this.saveSettings(
										result.response.data.kiosk.name,
										result.response.token,
										siteId
									);
									Communications.setToken(
										result.response.token
									);
									Communications.setSiteId(siteId);
									PosStorage.setTokenExpiration();
									await Synchronization.synchronizeSalesChannels();
									Synchronization.scheduleSync();

									let date = new Date();
									//date.setDate(date.getDate() - 30);
									date.setDate(date.getDate() - 7);
									Communications.getReceiptsBySiteIdAndDate(
										siteId,
										date
									)
										.then(json => {
											console.log('ORIGINAL');
											console.log(JSON.stringify(json));
											console.log('END');

											PosStorage.addRemoteReceipts(
												json
											).then(saved => {
												console.log('SAVED');
												console.log(
													JSON.stringify(saved)
												);
												console.log('END');
												Events.trigger(
													'ReceiptsFetched',
													saved
												);
											});
										})
										.catch(error => { });
								}
								this.setState({ animating: false });
								Alert.alert(
									i18n.t('network-connection'),
									message,
									[{ text: i18n.t('ok'), style: 'cancel' }],
									{ cancelable: true }
								);
								this.props.navigation.navigate('App');
								if (siteId !== -1 && siteId !== -2) {
									this.closeHandler();
								}
							})
							.catch(error => { });
					} else {
						this.setState({ animating: false });
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
					console.log(
						'Failed- status ' +
						result.status +
						' ' +
						result.response.message
					);
					this.setState({ animating: false });
					Alert.alert(
						i18n.t('network-connection'),
						result.response.message + '. (' + result.status + ')',
						[{ text: i18n.t('ok'), style: 'cancel' }],
						{ cancelable: true }
					);
				});
		} catch (error) {
			this.setState({ animating: false });
			console.log(JSON.stringify(error));
		}
	}



	onConnectionw() {
		this.setState({ animating: true });
		Communications.initialize(
			"http://142.93.115.206:3006/",
			"",
			this.user.current.state.propertyText,
			this.password.current.state.propertyText
		);
		try {
			let message = i18n.t('successful-connection');
			Communications.login()
				.then(result => {
					console.log(
						'Passed - status' +
						result.status +
						' ' +
						JSON.stringify(result.response)
					);
					if (result.status === 200) {
						this.saveSettings(
							"http://142.93.115.206:3006/",
							result.response.token,
							result.response.data.kiosk.name
						);
						// console.log("Response site name: " + result.response.data.kiosk.name);
						Communications.getSiteId(
							result.response.token,
							result.response.data.kiosk.name
						)
							.then(async siteId => {
								if (siteId === -1) {
									message = i18n.t(
										'successful-connection-but',
										{
											what: this.site.current.state
												.propertyText,
											happened: i18n.t('does-not-exist')
										}
									);
								} else if (siteId === -2) {
									message = i18n.t(
										'successful-connection-but',
										{
											what: this.site.current.state
												.propertyText,
											happened: i18n.t('is-not-active')
										}
									);
								} else {
									this.props.authActions.isAuth(true);
									this.saveSettings(
										result.response.data.kiosk.name,
										result.response.token,
										siteId
									);
									Communications.setToken(
										result.response.token
									);
									Communications.setSiteId(siteId);
									PosStorage.setTokenExpiration();
									await Synchronization.synchronizeSalesChannels();
									Synchronization.scheduleSync();

									let date = new Date();
									//date.setDate(date.getDate() - 30);
									date.setDate(date.getDate() - 7);
									Communications.getReceiptsBySiteIdAndDate(
										siteId,
										date
									)
										.then(json => {
											console.log('ORIGINAL');
											console.log(JSON.stringify(json));
											console.log('END');

											PosStorage.addRemoteReceipts(
												json
											).then(saved => {
												console.log('SAVED');
												console.log(
													JSON.stringify(saved)
												);
												console.log('END');
												Events.trigger(
													'ReceiptsFetched',
													saved
												);
											});
										})
										.catch(error => { });
								}
								this.setState({ animating: false });
								Alert.alert(
									i18n.t('network-connection'),
									message,
									[{ text: i18n.t('ok'), style: 'cancel' }],
									{ cancelable: true }
								);
								if (siteId !== -1 && siteId !== -2) {
									this.closeHandler();
								}
							})
							.catch(error => { });
					} else {
						this.setState({ animating: false });
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
					console.log(
						'Failed- status ' +
						result.status +
						' ' +
						result.response.message
					);
					this.setState({ animating: false });
					Alert.alert(
						i18n.t('network-connection'),
						result.response.message + '. (' + result.status + ')',
						[{ text: i18n.t('ok'), style: 'cancel' }],
						{ cancelable: true }
					);
				});
		} catch (error) {
			this.setState({ animating: false });
			console.log(JSON.stringify(error));
		}
	}

	enableConnectionOrSync() {
		// let url = this.url.current
		// 	? this.url.current.state.propertyText
		// 	: this.getUrl();
		// let site = this.site.current
		// 	? this.site.current.state.propertyText
		// 	: this.getSite();
		let user = this.url.current
			? this.user.current.state.propertyText
			: this.getUser();
		let password = this.password.current
			? this.password.current.state.propertyText
			: this.getPassword();

		if (
			// url.length > 0 &&
			// site.length > 0 &&
			user.length > 0 &&
			password.length > 0
		) {
			return true;
		} else {
			return false;
		}
	}

	saveSettings(site, token, siteId) {
		// Check to see if the site has changed
		let currentSettings = PosStorage.loadSettings();
		if (currentSettings.siteId != siteId) {
			// New site - clear all data
			this._clearDataAndSync();
		}
		console.log("jonah");
		console.log(this.props);
		//console.log(this.user.current.state.propertyText);
		console.log(this.state);
		console.log(this.state.selectedLanguage);
		console.log(token);
		PosStorage.saveSettings(
			"http://142.93.115.206:3006/",
			site,
			this.state.user,
			this.state.password,
			this.state.selectedLanguage,
			token,
			siteId,
			false
		);
		this.props.settingsActions.setSettings(PosStorage.loadSettings());
		this.setState({ isLoading: false });
	}

	getDefaultUILanguage() {
		console.log(
			`CURRENT UI LANGUAGE IS ${this.props.settings.uiLanguage.iso_code}`
		);
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
				console.log(
					`Selected language is ${this.state.selectedLanguage.name}`
				);
				i18n.locale = this.state.selectedLanguage.iso_code;

				Events.trigger('SalesChannelsUpdated', {});
				let currentSettings = PosStorage.loadSettings();
				console.log(currentSettings);
				PosStorage.saveSettings(
					"http://142.93.115.206:3006/",
					currentSettings.site,
					currentSettings.user,
					currentSettings.password,
					this.state.selectedLanguage,
					currentSettings.token,
					currentSettings.siteId
				);
				this.props.settingsActions.setSettings(PosStorage.loadSettings());
				//this.props.settings.uiLanguage.name
				this.setState({ isLoading: false });

				//this.onSaveSettings();
			}
		);
		console.log(this.state.selectedLanguage);
	}
}

// Login.propTypes = {
// 	settings: PropTypes.object.isRequired,
// 	settingsActions: PropTypes.object.isRequired,
// 	customerActions: PropTypes.object.isRequired
// };

function mapStateToProps(state, props) {
	return { settings: state.settingsReducer.settings, auth: state.authReducer, network: state.networkReducer.network, };
}
function mapDispatchToProps(dispatch) {
	return {
		networkActions: bindActionCreators(NetworkActions, dispatch),
		toolbarActions: bindActionCreators(ToolbarActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch),
		settingsActions: bindActionCreators(SettingsActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		authActions: bindActionCreators(AuthActions, dispatch)
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
		flex: 1
	},
	container: {
		flex: 1,
		width: '100%',
		height: '100%',
		backgroundColor: '#fff'
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
	buttonText: {
		fontWeight: 'bold',
		fontSize: 24,
		color: 'white',
		textAlign: 'center',
		// paddingTop:10,
		paddingLeft: 30,
		paddingRight: 30
		// paddingBottom:10
	},
	inputText: {
		fontSize: inputFontHeight,
		alignSelf: 'center',
		backgroundColor: 'white',
		width: inputTextWidth,
		margin: marginTextInput
	},
	labelText: {
		fontSize: inputFontHeight,
		alignSelf: 'flex-end',
		marginRight: 20
	},

	dropdownText: {
		fontSize: 24
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
