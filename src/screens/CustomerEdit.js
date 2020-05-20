import React from 'react';

import {
	View,
	Text,
	StyleSheet,
	Modal,
	ScrollView,
	Alert,
	ActivityIndicator
} from 'react-native';
import { Card, Button, Input } from 'react-native-elements';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Events from 'react-native-simple-events';

import Ionicons from 'react-native-vector-icons/Ionicons';
import RNPickerSelect from 'react-native-picker-select';

import CustomerRealm from '../database/customers/customer.operations';
import CustomerTypeRealm from '../database/customer-types/customer-types.operations';
import SalesChannelRealm from '../database/sales-channels/sales-channels.operations';
import * as CustomerActions from '../actions/CustomerActions';

import i18n from '../app/i18n';

class CustomerEdit extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			isEditInProgress: false,
			isCreateInProgress: false,
			isLoading: true,
			salescid: 0,
			language: "",
			name: this.props.selectedCustomer.name ? this.props.selectedCustomer.name : "",
			phoneNumber: this.props.selectedCustomer.phoneNumber ? this.props.selectedCustomer.phoneNumber : "",
			secondPhoneNumber: this.props.selectedCustomer.secondPhoneNumber ? this.props.selectedCustomer.secondPhoneNumber : "",
			address: this.props.selectedCustomer.address ? this.props.selectedCustomer.address : "",
			reference: '7',
			customerType: this.props.selectedCustomer.customerTypeId ? this.props.selectedCustomer.customerTypeId : 0,
			customerChannel: this.props.selectedCustomer.salesChannelId ? this.props.selectedCustomer.salesChannelId : 0
		};

		this.saleschannelid = 0;
		this.phone = React.createRef();
		this.secondPhoneNumber = React.createRef();
		this.name = React.createRef();
		this.address = React.createRef();
		this.customerType = React.createRef();

		this.customerTypes = CustomerTypeRealm.getCustomerTypesForDisplay(this.saleschannelid);
		this.customerTypeOptions = this.customerTypes.map(customerType => {
			return customerType.displayName;
		});

		this.customerTypesOptions = this.customerTypes.map(customerType => {
			var rObj = {};
			rObj.label = customerType.displayName;
			rObj.value = customerType.id;
			rObj.key = customerType.salesChannelId;
			return rObj;
		});

		this.customerTypesIndicies = this.customerTypes.map(customerType => {
			return customerType.id;
		});
	}

	componentDidMount() {
		if (this.props.isEdit) {
			this.props.navigation.setParams({ isEdit: true });
		} else {
			this.props.navigation.setParams({ isEdit: false });
		}

	}

	componentWillUnmount() {
		this.props.customerActions.CustomerSelected({});
		this.props.customerActions.setCustomerEditStatus(false);
		this.props.navigation.setParams({ isCustomerSelected: false });
		this.props.navigation.setParams({ customerName: '' });
	}

	onEdit() {
		this.props.customerActions.setIsLoading(true);
		try {
			let salesChannelId = this.state.customerChannel > 0 ? this.state.customerChannel : -1;
			let customerTypeId = this.state.customerType > 0 ? this.state.customerType : -1;
			if (this.props.isEdit) {
				CustomerRealm.updateCustomer(
					this.props.selectedCustomer,
					this.state.phoneNumber,
					this.state.name,
					this.state.address,
					salesChannelId,
					customerTypeId,
					this.state.reference,
					this.state.secondPhoneNumber
				).then(e => {
					console.log('eeee', e)
					this.props.customerActions.setCustomers(CustomerRealm.getAllCustomer());
					this.props.customerActions.CustomerSelected({});
					this.setState({ isEditInProgress: true });
				});
			} else {
				if (this._textIsEmpty(this.state.phoneNumber) ||
					this._textIsEmpty(this.state.name) ||
					this._textIsEmpty(this.state.address) ||
					this._textIsEmpty(this.state.secondPhoneNumber)) {
					Alert.alert(
						'Empty Fields',
						'A customer cannot be created with empty fields!',
						[
							{
								text: 'Cancel',
								onPress: () => { },
								style: 'cancel'
							},
							{
								text: 'OK',
								onPress: () => {

								}
							}
						],
						{ cancelable: false }
					);
					return;
				}


				CustomerRealm.createCustomer(
					this.state.phoneNumber,
					this.state.name,
					this.state.address,
					this.props.settings.siteId,
					salesChannelId,
					customerTypeId,
					this.state.reference,
					this.state.secondPhoneNumber
				);
				this.props.customerActions.setCustomers(CustomerRealm.getAllCustomer());
				this.props.customerActions.CustomerSelected({});
				this.setState({ isCreateInProgress: true });
			}
			this.props.navigation.goBack();
		} catch (error) { }
	}



	render() {
		const cplaceholder = {
			label: '',
			value: null,
			key: 0,
		};
		return (
			<View style={{ flex: 1, backgroundColor: '#f1f1f1', justifyContent: 'center' }}>
				<ScrollView
					style={{ flex: 1 }}
				>
					<View style={{ flex: 1, alignItems: 'center' }}>

						<Card containerStyle={{ width: '55%', marginTop: 30, padding: 0, borderRadius: 8 }}>

							<Input
								placeholder={i18n.t(
									'account-name'
								)}
								onChangeText={this.onChangeName}
								// label={i18n.t('account-name')}
								underlineColorAndroid="transparent"
								keyboardType="default"
								value={this.state.name}
								inputContainerStyle={[styles.inputText]}
								leftIcon={
									<Ionicons
										name='md-person'
										size={24}
										color='black'
									/>
								}
							/>
							<View style={{ flex: 1, flexDirection: 'row' }}>
								<Input
									placeholder={i18n.t('telephone-number')}
									onChangeText={this.onChangeTeleOne.bind(this)}
									value={this.state.phoneNumber}
									keyboardType="phone-pad"
									// label={i18n.t('telephone-number')}
									inputContainerStyle={[styles.inputText]}
									containerStyle={{ flex: .5 }}
									leftIcon={
										<Ionicons
											name='md-contact'
											size={24}
											color='black'
										/>
									}
								/>

								<Input
									placeholder={i18n.t('second-phone-number')}
									value={this.state.secondPhoneNumber}
									keyboardType="phone-pad"
									onChangeText={this.onChangeTeleTwo.bind(this)}
									// label={i18n.t('second-phone-number')}
									inputContainerStyle={[styles.inputText]}
									containerStyle={{ flex: .5 }}
									leftIcon={
										<Ionicons
											name='md-contact'
											size={24}
											color='black'
										/>
									}
								/>
							</View>
							<Input
								placeholder={i18n.t(
									'address'
								)}
								keyboardType="default"
								value={this.state.address}
								onChangeText={this.onChangeAddress.bind(this)}
								// label={i18n.t('address')}
								inputContainerStyle={[styles.inputText]}
								leftIcon={
									<Ionicons
										name='md-map'
										size={24}
										color='black'
									/>
								}
							/>


							<RNPickerSelect
								placeholder={{
									label: 'Select a customer type',
									value: null,
									key: 0,
								}}
								items={this.customerTypesOptions}
								onValueChange={(value, itemKey) => {
									this.setState({ customerType: value });
									this.setState({ customerChannel: this.customerTypesOptions[itemKey - 1].key });
								}}
								value={this.state.customerType}
								useNativeAndroidPickerStyle={false}
								style={{
									...pickerSelectStyles,
									iconContainer: {
										top: 20,
										left: 30,
										color: "black",
										marginRight: 10
									},
								}}
								Icon={() => {
									return <Ionicons name="md-ribbon" size={24} />;
								}}
							/>

							<Button
								onPress={this.onEdit.bind(this)}
								buttonStyle={{ padding: 20 }}
								containerStyle={{
									bottom: 0,
									borderRadius: 0,
									flex: 1,
									marginLeft: 0,
									marginRight: 0,
									marginBottom: 0,
									marginTop: 10
								}}
								title={this.getSubmitText()} />


						</Card>


						<Modal
							visible={this.state.isEditInProgress}
							backdropColor={'red'}
							transparent={true}
							onRequestClose={this.closeHandler}>
							{this.showEditInProgress()}
						</Modal>
						<Modal
							visible={this.state.isCreateInProgress}
							backdropColor={'red'}
							transparent={true}
							onRequestClose={this.closeHandler}>
							{this.showCreateInProgress()}
						</Modal>



					</View>
				</ScrollView>
			</View>
		);
	}

	onChangeName = text => {
		this.setState({
			name: text
		});
	};

	checkEdit() {

		if (this.props.isEdit) {
			this.setState({ name: this.props.selectedCustomer.name });
			this.setState({ phoneNumber: this.props.selectedCustomer.phoneNumber });
			this.setState({ secondPhoneNumber: this.props.selectedCustomer.secondPhoneNumber });
			this.setState({ address: this.props.selectedCustomer.address });
			this.setState({ reference: this.props.selectedCustomer.frequency });
			this.setState({ customerType: this.props.selectedCustomer.customerTypeId });
			this.setState({ customerChannel: this.props.selectedCustomer.salesChannelId });
		}

	}

	getName(me) {
		if (me.props.isEdit) {
			return me.props.selectedCustomer.name;
		} else {
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
			const salesChannels = SalesChannelRealm.getSalesChannels();
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
		this.props.navigation.navigate('ListCustomers');
		var that = this;
		setTimeout(() => {
			Events.trigger('ScrollCustomerTo', {
				customer: that.props.selectedCustomer
			});
		}, 10);
	}

	closeHandler() {
		this.setState({ isEditInProgress: false });
		this.setState({ isCreateInProgress: false });
		this.onCancelEdit();
	}

	isNumeric(text) {
		return /^\d+$/.test(text);
	}

	isValidPhoneNumber(text) {
		let test = /^\d{8,14}$/.test(text);
		if (!test) {
			alert(
				'Phone number should be atleast 8 digits long. Example 0752XXXYYY'
			);
		}
		return test;
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


	showCreateInProgress() {
		let that = this;
		if (this.state.isCreateInProgress) {
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
						Creating
					</Text>
				</View>
			</View>
		);
	}

}

function mapStateToProps(state, props) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer,
		isEdit: state.customerReducer.isEdit,
		isLoading: state.customerReducer.isLoading,
		settings: state.settingsReducer.settings
	};
}
function mapDispatchToProps(dispatch) {
	return {
		customerActions: bindActionCreators(CustomerActions, dispatch)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(CustomerEdit);

const pickerSelectStyles = StyleSheet.create({
	inputAndroid: {
		fontSize: 18,
		borderWidth: 2,
		borderRadius: 8,
		borderColor: '#f1f1f1',
		backgroundColor: '#f1f1f1',
		color: 'black',
		alignItems: 'center',
		marginTop: 5,
		marginBottom: 10,
		marginLeft: 20,
		marginRight: 20,
		paddingLeft: 30,
		paddingRight: 30 // to ensure the text is never behind the icon
	},
});

const styles = StyleSheet.create({
	headerText: {
		fontSize: 24,
		color: 'black',
		marginLeft: 100
	},
	submit: {
		backgroundColor: '#2858a7',
		borderRadius: 20,
		padding: 10,
		marginTop: '1%'
	},
	inputContainer: {
		borderWidth: 2,
		borderRadius: 10,
		borderColor: '#CCC',
		backgroundColor: '#CCC'
	},
	buttonText: {
		fontWeight: 'bold',
		fontSize: 28,
		color: 'white',
		textAlign: 'center',
		width: 300
	},

	inputText: {
		alignSelf: 'center',
		borderWidth: 2,
		borderRadius: 8,
		borderColor: '#f1f1f1',
		backgroundColor: '#f1f1f1',
		margin: 5
	},

	phoneInputText: {
		backgroundColor: 'white',
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
