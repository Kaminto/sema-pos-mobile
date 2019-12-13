import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableHighlight,
	TextInput,
	StyleSheet,
	Modal,
	Image,
	Picker
} from 'react-native';
import { Card, ListItem, Button, Input, ThemeProvider } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PropTypes from 'prop-types';


import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Events from 'react-native-simple-events';

import Icon from 'react-native-vector-icons/Ionicons';

import * as ToolbarActions from '../actions/ToolBarActions';
import ModalDropdown from 'react-native-modal-dropdown';
import PosStorage from '../database/PosStorage';
import * as CustomerActions from '../actions/CustomerActions';

import i18n from '../app/i18n';

class CustomerProperty extends Component {
	constructor(props) {
		super(props);
		this.state = { propertyText: this.props.valueFn(this.props.parent) };
	}

	render() {
		return (
			<View
				style={[
					{ marginTop: this.props.marginTop },
					styles.inputContainer
				]}>
				<TextInput
					ref={this.props.reference}
					style={[styles.inputText]}
					underlineColorAndroid="transparent"
					placeholder={this.props.placeHolder}
					value={this.state.propertyText}
					keyboardType={this.props.kbType}
					onChangeText={this.onChangeText}
				/>
			</View>
		);
	}
	onChangeText = text => {
		if (this.props.reference === 'customerFrequency') {
			if (text) {
				if (/^\d+$/.test(text)) {
					this.setState({
						propertyText: text
					});
				} else {
					alert('Digits only please');
				}
			} else {
				this.setState({
					propertyText: ''
				});
			}
		} else {
			this.setState({ propertyText: text });
		}
	};
}

class PhoneProperty extends Component {
	constructor(props) {
		super(props);
		this.state = { propertyText: this.props.valueFn(this.props.parent) };
	}

	render() {
		return (
			<View
				style={[
					{ marginTop: this.props.marginTop },
					styles.inputContainer
				]}>
				<TextInput
					ref={this.props.reference}
					style={[styles.phoneInputText]}
					underlineColorAndroid="transparent"
					placeholder={this.props.placeHolder}
					value={this.state.propertyText}
					keyboardType={this.props.kbType}
					onChangeText={this.onChangeText}
				/>
			</View>
		);
	}
	onChangeText = text => {
		if (this.props.reference === 'customerFrequency' ||
			this.props.reference === 'customerNumber' || this.props.reference === 'secondPhoneNumber') {
			if (text) {
				// if (/^\d+$/.test(text)) {
				this.setState({
					propertyText: text
				});
				// } else {
				// 	alert('Digits only please');
				// }
			} else {
				this.setState({
					propertyText: ''
				});
			}
		} else {
			this.setState({ propertyText: text });
		}
	};
}

class CustomerEdit extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isEditInProgress: false,
			salescid: 0,
			language: "",
			name: this.props.selectedCustomer.name ? this.props.selectedCustomer.name : "",
			phoneNumber: this.props.selectedCustomer.name ? this.props.selectedCustomer.phoneNumber : "",
			secondPhoneNumber: this.props.selectedCustomer.name ? this.props.selectedCustomer.secondPhoneNumber : "",
			address: this.props.selectedCustomer.name ? this.props.selectedCustomer.address : "",
			reference: this.props.selectedCustomer.name ? this.props.selectedCustomer.frequency : "",
			customerType: this.props.selectedCustomer.name ? this.props.selectedCustomer.customerTypeId : 0,
			customerChannel: this.props.selectedCustomer.name ? this.props.selectedCustomer.salesChannelId : 0
		};


		this.saleschannelid = 0;
		this.phone = React.createRef();
		this.secondPhoneNumber = React.createRef();
		this.name = React.createRef();
		this.address = React.createRef();
		this.customerChannel = React.createRef();
		this.customerType = React.createRef();
		this.frequency = React.createRef();

		this.salesChannels = PosStorage.getSalesChannelsForDisplay();
		this.channelOptions = this.salesChannels.map(channel => {
			console.log(channel);
			return channel.displayName;
		});
		console.log(this.channelOptions);

		this.customerTypes = PosStorage.getCustomerTypesForDisplay(this.saleschannelid);
		this.customerTypeOptions = this.customerTypes.map(customerType => {
			return customerType.displayName;
		});
		this.customerTypesIndicies = this.customerTypes.map(customerType => {
			return customerType.id;
		});
	}

	componentDidMount() {
		console.log('CustomerEdit = Mounted' + this.props.isEdit);
		if (this.props.isEdit) {
			this.props.navigation.setParams({ isEdit: true });
		}else{
			this.props.navigation.setParams({ isEdit: false });
		}

	}

	componentWillUnmount() {
		this.props.customerActions.CustomerSelected({});
		this.props.customerActions.setCustomerEditStatus(false);
	}

	onEdit() {
		let salesChannelId = this.state.customerChannel > 0 ? this.state.customerChannel : -1;
		let customerTypeId = this.state.customerType > 0 ? this.state.customerType : -1;
		console.log(this.state);
		console.log(this.props.isEdit);
		// if (
		// 	this._textIsEmpty(this.phone.current.state.propertyText) ||
		// 	!this.isValidPhoneNumber(this.phone.current.state.propertyText)
		// ) {
		// 	this.phone.current.refs.customerNumber.focus();
		// 	return;
		// }

		// if (
		// 	!this._textIsEmpty(
		// 		this.secondPhoneNumber.current.state.propertyText
		// 	) &&
		// 	!this.isValidPhoneNumber(
		// 		this.secondPhoneNumber.current.state.propertyText
		// 	)
		// ) {
		// 	this.secondPhoneNumber.current.refs.secondPhoneNumber.focus();
		// 	return;
		// }

		// if (this._textIsEmpty(this.name.current.state.propertyText)) {
		// 	this.name.current.refs.customerName.focus();
		// 	return;
		// }

		// if (this._textIsEmpty(this.address.current.state.propertyText)) {
		// 	this.address.current.refs.customerAddress.focus();
		// 	return;
		// }

		// if (this.customerChannel.current.state.selectedIndex === -1) {
		// 	this.customerChannel.current.show();
		// 	return;
		// }

		// if (this._textIsEmpty(this.frequency.current.state.propertyText)) {
		// 	this.frequency.current.refs.customerFrequency.focus();
		// 	return;
		// } else {
		// 	salesChannelId = this.salesChannels[
		// 		this.customerChannel.current.state.selectedIndex
		// 	].id;
		// }

		// if (this.customerType.current.state.selectedIndex === -1) {
		// 	this.customerType.current.show();
		// 	return;
		// } else {
		// 	customerTypeId = this.customerTypes[
		// 		this.customerType.current.state.selectedIndex
		// 	].id;
		// }
		if (this.props.isEdit) {
			this.setReminderIfExists(this.props.selectedCustomer);
			PosStorage.updateCustomer(
				this.props.selectedCustomer,
				this.state.phoneNumber,
				this.state.name,
				this.state.address,
				salesChannelId,
				customerTypeId,
				this.state.frequency,
				this.state.secondPhoneNumber
			);
			this.props.customerActions.CustomerSelected({});
			this.setState({ isEditInProgress: true });
			this.props.navigation.goBack();
		} else {
			let newCustomer = PosStorage.createCustomer(
				this.state.phoneNumber,
				this.state.name,
				this.state.address,
				this.props.settings.siteId,
				salesChannelId,
				customerTypeId,
				this.state.frequency,
				this.state.secondPhoneNumber
			);
			this.props.customerActions.setCustomers(PosStorage.getCustomers());
			this.props.customerActions.CustomerSelected({});
			this.props.navigation.goBack();
		}


	}


	render() {

		console.log(this.props);
		console.log(this.state);
		let salesChannelOption = this.salesChannels.map((s, i) => {
			return <Picker.Item key={i} value={s.id} label={s.displayName} />
		});
		let customerTypesOption = this.customerTypes.map((s, i) => {
			return <Picker.Item key={i} value={s.id} label={s.displayName} />
		});
		return (
			<View style={{ flex: 1, backgroundColor: '#fff' }}>
				<KeyboardAwareScrollView
					style={{ flex: 1 }}
					resetScrollToCoords={{ x: 0, y: 0 }}
					scrollEnabled={true}>
					<View style={{ flex: 1, alignItems: 'center' }}>

						<Card
							containerStyle={{ width: 500, marginTop: 30 }}
						>

							<Input
								placeholder={i18n.t(
									'account-name'
								)}
								onChangeText={this.onChangeName}
								label={i18n.t('account-name')}
								underlineColorAndroid="transparent"
								keyboardType="default"
								value={this.state.name}
								style={[styles.inputText]}
							/>

							<Input
								placeholder={i18n.t(
									'telephone-number'
								)}
								onChangeText={this.onChangeTeleOne.bind(this)}
								value={this.state.phoneNumber}
								keyboardType="phone-pad"
								label={i18n.t('telephone-number')}
								inputStyle={[styles.inputText]}
							/>

							<Input
								placeholder={i18n.t(
									'second-phone-number'
								)}
								value={this.state.secondPhoneNumber}
								keyboardType="phone-pad"
								onChangeText={this.onChangeTeleTwo.bind(this)}
								label={i18n.t('second-phone-number')}
								inputStyle={[styles.inputText]}
							/>

							<Input
								placeholder={i18n.t(
									'address'
								)}
								value={this.state.address}
								onChangeText={this.onChangeAddress.bind(this)}
								label={i18n.t('address')}
								inputStyle={[styles.inputText]}
							/>

							<Input
								placeholder="Frequency"
								label="Frequency"
								value={this.state.reference}
								keyboardType="number-pad"
								onChangeText={this.onChangeReference.bind(this)}
								inputStyle={[styles.inputText]}
							/>


							<Picker
								selectedValue={this.state.customerChannel}
								onValueChange={(itemValue, itemIndex) => {
									this.setState({ customerChannel: itemValue })
								}
								}>
								{salesChannelOption}
							</Picker>

							<Picker
								selectedValue={this.state.customerType}
								onValueChange={(itemValue, itemIndex) => {
									this.setState({ customerType: itemValue });
								}
								}>
								{customerTypesOption}
							</Picker>

							<Button
								onPress={() => this.onEdit()}
								buttonStyle={{ borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 10 }}
								title={this.getSubmitText()} />

						</Card>
						<Modal
							visible={this.state.isEditInProgress}
							backdropColor={'red'}
							transparent={true}
							onRequestClose={this.closeHandler}>
							{this.showEditInProgress()}
						</Modal>
					</View>
				</KeyboardAwareScrollView>
			</View>
		);
	}

	onChangeName = text => {
		console.log(text);
		this.setState({
			name: text
		});
	};

	checkEdit() {

		if (this.props.isEdit) {
			this.setState({ name: this.props.selectedCustomer.name });
			this.setState({ phoneNumber: this.props.selectedCustomer.phoneNumber });
			this.setState({ secondPhoneNumber: this.props.selectedCustomer.secondPhoneNumber }),
			this.setState({ address: this.props.selectedCustomer.address });
			this.setState({ reference: this.props.selectedCustomer.frequency });
			this.setState({ customerType: this.props.selectedCustomer.customerTypeId });
			this.setState({ customerChannel: this.props.selectedCustomer.salesChannelId });
		}

	}


	getName(me) {
		console.log(me.props);
		if (me.props.isEdit) {
			return me.props.selectedCustomer.name;
		} else {
			console.log("me.props");
			return 'wee';
		}
	}

	onChangeTeleOne = text => {
		this.setState({
			phoneNumber: text
		});
	};

	onChangeTeleTwo = text => {
		this.setState({
			secondPhoneNumber: text
		});
	};

	onChangeAddress = text => {
		this.setState({
			address: text
		});
	};

	onChangeReference = text => {
		//if (this.props.reference === 'customerFrequency') {
		if (text) {
			if (/^\d+$/.test(text)) {
				this.setState({
					reference: text
				});
			} else {
				alert('Digits only please');
			}
		} else {
			this.setState({
				reference: ''
			});
		}
		//}
	};


	getTelephoneNumber(me) {
		if (me.props.isEdit) {
			return me.props.selectedCustomer.phoneNumber;
		} else {
			return '';
		}
	}


	getSecondTelephoneNumber(me) {
		try {
			if (me.props.isEdit) {
				return me.props.selectedCustomer.secondPhoneNumber;
			} else {
				return '';
			}
		} catch (error) { }
	}


	getAddress(me) {
		if (me.props.isEdit) {
			return me.props.selectedCustomer.address;
		} else {
			return '';
		}
	}

	getFrequency(me) {
		if (me.props.isEdit) {
			return me.props.selectedCustomer.frequency;
		} else {
			return '';
		}
	}

	getDefaultChannelValue() {
		if (this.props.isEdit) {
			for (let i = 0; i < this.salesChannels.length; i++) {
				if (
					this.salesChannels[i].id ==
					this.props.selectedCustomer.salesChannelId
				) {
					return this.salesChannels[i].displayName;
				}
			}
		}
		return i18n.t('sales-channel');
	}

	getDefaultTypeValue() {
		if (this.props.isEdit) {
			for (let i = 0; i < this.customerTypes.length; i++) {
				if (
					this.customerTypes[i].id ==
					this.props.selectedCustomer.customerTypeId
				) {
					return this.customerTypes[i].displayName;
				}
			}
		}
		return i18n.t('customer-type');
	}

	getDefaultChannelIndex() {
		if (this.props.isEdit) {
			const salesChannels = PosStorage.getSalesChannels();
			for (let i = 0; i < salesChannels.length; i++) {
				if (
					salesChannels[i].id ==
					this.props.selectedCustomer.salesChannelId
				) {
					return i;
				}
			}
		}
		return -1;
	}

	getDefaultTypeIndex() {
		if (this.props.isEdit) {
			for (let i = 0; i < this.customerTypesIndicies.length; i++) {
				if (
					this.customerTypesIndicies[i] ==
					this.props.selectedCustomer.customerTypeId
				) {
					return i;
				}
			}
		}
		return -1;
	}

	getHeaderText() {
		return this.props.isEdit
			? i18n.t('edit-customer')
			: i18n.t('new-customer');
	}
	getSubmitText() {
		return this.props.isEdit
			? i18n.t('update-customer')
			: i18n.t('create-customer');
	}
	onCancelEdit() {
		this.props.toolbarActions.ShowScreen('main');
		var that = this;
		setTimeout(() => {
			Events.trigger('ScrollCustomerTo', {
				customer: that.props.selectedCustomer
			});
		}, 10);
	}

	closeHandler() {
		this.setState({ isEditInProgress: false });
		this.onCancelEdit();
	}

	isNumeric(text) {
		return /^\d+$/.test(text);
	}

	isValidPhoneNumber(text) {
		let test = /^\d{9,14}$/.test(text);
		if (!test) {
			alert(
				'Phone number should be atleast 9 digits long. Example 0752XXXYYY'
			);
		}
		return test;
	}

	changeCustomerTypeList(value) {
		let tindex = 0;
		if (value === 'Direct') {
			tindex = 2;
		} else if (value === 'Reseller') {
			tindex = 3;
		} else if (value === 'Water Club') {
			tindex = 4;
		}
		this.saleschannelid = tindex;
		console.log("Adams" + this.saleschannelid);
		this.setState({ salescid: tindex });
		this.customerTypes = PosStorage.getCustomerTypesForDisplay(tindex);
		this.customerTypeOptions = this.customerTypes.map(customerType => {
			return customerType.displayName;
		});
	}

	onMakeSale() {
		let salesChannelId = -1;
		let customerTypeId = -1;

		if (
			this._textIsEmpty(this.phone.current.state.propertyText) ||
			!this.isValidPhoneNumber(this.phone.current.state.propertyText)
		) {
			this.phone.current.refs.customerNumber.focus();
			return;
		}

		if (
			!this._textIsEmpty(
				this.secondPhoneNumber.current.state.propertyText
			) &&
			!this.isValidPhoneNumber(
				this.secondPhoneNumber.current.state.propertyText
			)
		) {
			this.secondPhoneNumber.current.refs.secondPhoneNumber.focus();
			return;
		}

		if (this._textIsEmpty(this.name.current.state.propertyText)) {
			this.name.current.refs.customerName.focus();
			return;
		}

		if (this._textIsEmpty(this.address.current.state.propertyText)) {
			this.address.current.refs.customerAddress.focus();
			return;
		}

		if (this.customerChannel.current.state.selectedIndex === -1) {
			this.customerChannel.current.show();
			return;
		}

		if (this._textIsEmpty(this.frequency.current.state.propertyText)) {
			this.frequency.current.refs.customerFrequency.focus();
			return;
		} else {
			salesChannelId = this.salesChannels[
				this.customerChannel.current.state.selectedIndex
			].id;
		}

		if (this.customerType.current.state.selectedIndex === -1) {
			this.customerType.current.show();
			return;
		} else {
			customerTypeId = this.customerTypes[
				this.customerType.current.state.selectedIndex
			].id;
		}
		if (this.props.isEdit) {
			this.setReminderIfExists(this.props.selectedCustomer);
			PosStorage.updateCustomer(
				this.props.selectedCustomer,
				this.phone.current.state.propertyText,
				this.name.current.state.propertyText,
				this.address.current.state.propertyText,
				salesChannelId,
				customerTypeId,
				this.frequency.current.state.propertyText,
				this.secondPhoneNumber.current.state.propertyText
			);
		} else {
			let newCustomer = PosStorage.createCustomer(
				this.phone.current.state.propertyText,
				this.name.current.state.propertyText,
				this.address.current.state.propertyText,
				this.props.settings.siteId,
				salesChannelId,
				customerTypeId,
				this.frequency.current.state.propertyText,
				this.secondPhoneNumber.current.state.propertyText
			);
			this.props.customerActions.setCustomers(PosStorage.getCustomers());
			this.props.customerActions.CustomerSelected(newCustomer);
		}

		this.setState({ isEditInProgress: true });
	}



	onEditd() {
		let salesChannelId = -1;
		let customerTypeId = -1;

		if (
			this._textIsEmpty(this.phone.current.state.propertyText) ||
			!this.isValidPhoneNumber(this.phone.current.state.propertyText)
		) {
			this.phone.current.refs.customerNumber.focus();
			return;
		}

		if (
			!this._textIsEmpty(
				this.secondPhoneNumber.current.state.propertyText
			) &&
			!this.isValidPhoneNumber(
				this.secondPhoneNumber.current.state.propertyText
			)
		) {
			this.secondPhoneNumber.current.refs.secondPhoneNumber.focus();
			return;
		}

		if (this._textIsEmpty(this.name.current.state.propertyText)) {
			this.name.current.refs.customerName.focus();
			return;
		}

		if (this._textIsEmpty(this.address.current.state.propertyText)) {
			this.address.current.refs.customerAddress.focus();
			return;
		}

		if (this.customerChannel.current.state.selectedIndex === -1) {
			this.customerChannel.current.show();
			return;
		}

		if (this._textIsEmpty(this.frequency.current.state.propertyText)) {
			this.frequency.current.refs.customerFrequency.focus();
			return;
		} else {
			salesChannelId = this.salesChannels[
				this.customerChannel.current.state.selectedIndex
			].id;
		}

		if (this.customerType.current.state.selectedIndex === -1) {
			this.customerType.current.show();
			return;
		} else {
			customerTypeId = this.customerTypes[
				this.customerType.current.state.selectedIndex
			].id;
		}
		if (this.props.isEdit) {
			this.setReminderIfExists(this.props.selectedCustomer);
			PosStorage.updateCustomer(
				this.props.selectedCustomer,
				this.phone.current.state.propertyText,
				this.name.current.state.propertyText,
				this.address.current.state.propertyText,
				salesChannelId,
				customerTypeId,
				this.frequency.current.state.propertyText,
				this.secondPhoneNumber.current.state.propertyText
			);
		} else {
			let newCustomer = PosStorage.createCustomer(
				this.phone.current.state.propertyText,
				this.name.current.state.propertyText,
				this.address.current.state.propertyText,
				this.props.settings.siteId,
				salesChannelId,
				customerTypeId,
				this.frequency.current.state.propertyText,
				this.secondPhoneNumber.current.state.propertyText
			);
			this.props.customerActions.setCustomers(PosStorage.getCustomers());
			this.props.navigation.navigate('ListCustomers');
			this.props.customerActions.CustomerSelected(newCustomer);
		}

		this.setState({ isEditInProgress: true });
	}

	setReminderIfExists(customer) {
		if (customer.reminder_date && customer.frequency) {
			Events.trigger('OnEdit', customer);
		}
		return;
	}

	onShowChannel() {
		this.customerChannel.current.show();
	}
	onShowCustomerType() {
		this.customerType.current.show();
	}

	_textIsEmpty(txt) {
		if (txt === null || txt.length === 0) {
			return true;
		}
		return false;
	}
	showEditInProgress() {
		let that = this;
		if (this.state.isEditInProgress) {
			setTimeout(() => {
				that.closeHandler();
			}, 1000);
		}
		return (
			<View
				style={{
					flex: 1,
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center'
				}}>
				<View style={styles.updating}>
					<Text style={{ fontSize: 24, fontWeight: 'bold' }}>
						{i18n.t('updating')}
					</Text>
				</View>
			</View>
		);
	}
}

// CustomerEdit.propTypes = {
// 	isEdit: PropTypes.bool.isRequired,
// 	toolbarActions: PropTypes.object.isRequired,
// 	customerActions: PropTypes.object.isRequired,
// 	settings: PropTypes.object.isRequired
// };

function mapStateToProps(state, props) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer,
		isEdit: state.customerReducer.isEdit,
		settings: state.settingsReducer.settings
	};
}
function mapDispatchToProps(dispatch) {
	return {
		toolbarActions: bindActionCreators(ToolbarActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(CustomerEdit);

const styles = StyleSheet.create({
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
		fontSize: 28,
		color: 'white',
		textAlign: 'center',
		width: 300
	},
	inputText: {
		fontSize: 24,
		alignSelf: 'center',
		backgroundColor: 'white',
		width: 400,
		margin: 5
	},
	phoneInputText: {
		fontSize: 24,
		alignSelf: 'center',
		backgroundColor: 'white',
		width: 195,
		margin: 5,
		paddingRight: 5
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
	}
});
