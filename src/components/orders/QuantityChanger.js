import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableHighlight,
	TextInput,
	StyleSheet,
	FlatList,
	Image
} from 'react-native';

import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Events from 'react-native-simple-events';

import * as ToolbarActions from '../../actions/ToolBarActions';
import ModalDropdown from 'react-native-modal-dropdown';
import PosStorage from '../../database/PosStorage';
import * as CustomerActions from '../../actions/CustomerActions';

import i18n from '../../app/i18n';
class QuantityChanger extends Component {
	constructor(props) {
		super(props);

		this.state = {
			refresh: false,
			// selectedCustomer: null,
			searchString: '',
			hasScrolled: false,
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

	componentDidMount() {
		console.log(
			'CustomerDetails:componentDidMount - filter: ' + this.props.filter
		);
		Events.on(
			'ScrollCustomerTo',
			'customerId1',
			this.onScrollCustomerTo.bind(this)
		);
	}
	componentWillUnmount() {
		Events.rm('ScrollCustomerTo', 'customerId1');
	}

	onScrollCustomerTo(data) {
		console.log('onScrollCustomerTo');
		// Commented onto scrollToItem requires getItemLayout and getItemLayout fails with
		// searches. Expect since not all items are rendered on sea
		// this.flatListRef.scrollToItem({animated: false, item: data.customer, viewPosition:0.5});
	}
	getItemLayout = (data, index) => ({
		length: 50,
		offset: 50 * index,
		index
	});

	shouldComponentUpdate(nextProps, nextState) {
		console.log('onScrollCustomerTo');
		return true;
	}


	render() {

		const state = this.state;
		return (
			<View style={{ flex: 1 }}>
				<View style={{
					flexDirection: 'row',
					height: 100,
					backgroundColor: 'white',
					alignItems: 'center'
				}}>
					<View style={[styles.leftToolbar
					]}>

						<TouchableHighlight onPress={() => this.onCancelEdit()}>
							<Image
								source={require('../../images/icons8-cancel-50.png')}
								style={{ marginRight: 100 }}
							/>
						</TouchableHighlight>
					</View>


				</View>

				<View style={{ flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' }}>
					<Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }}>
						<Row data={state.tableHead} style={{ height: 40, backgroundColor: '#f1f8ff' }} textStyle={{ margin: 6 }} />

						<Rows data={state.tableData} textStyle={{ margin: 6 }} />
					</Table>
				</View>


			</View>
		);
	}

	showHeader = () => {
		console.log('Displaying header');
		return (
			<View
				style={[
					{
						flex: 1,
						flexDirection: 'row',
						height: 50,
						alignItems: 'center'
					},
					styles.headerBackground
				]}>
				<View style={[{ flex: 2 }]}>
					<Text style={[styles.headerItem, styles.leftMargin]}>
						{i18n.t('product')}
					</Text>
				</View>
				<View style={[{ flex: 1.5 }]}>
					<Text style={[styles.headerItem]}>
						{i18n.t('quantity')}
					</Text>
				</View>
				<View style={[{ flex: 1.5 }]}>
					<Text style={[styles.headerItem]}>
						{i18n.t('unitPrice')}
					</Text>
				</View>
			</View>
		);
	};


	onCancelEdit() {
		this.props.toolbarActions.ShowScreen('main');
		var that = this;
		setTimeout(() => {
			Events.trigger('ScrollCustomerTo', {
				customer: that.props.selectedCustomer
			});
		}, 10);
	}


}


class SelectedCustomerDetails extends React.Component {


	render() {
		return (
			<View style={styles.commandBarContainer}>
				<View style={{ flexDirection: 'row', height: 40 }}>
					<Text style={styles.selectedCustomerText}>
						{i18n.t('account-name')}
					</Text>
					<Text style={styles.selectedCustomerText}>
						{this.getName()}
					</Text>
				</View>
				<View style={{ flexDirection: 'row', height: 40 }}>
					<Text style={styles.selectedCustomerText}>
						{i18n.t('telephone-number')}
					</Text>
					<Text style={styles.selectedCustomerText}>
						{this.getPhone()}
					</Text>
				</View>
			</View>
		);
	}
	getName() {
		if (this.props.selectedCustomer.hasOwnProperty('name')) {
			return this.props.selectedCustomer.name;
		} else {
			return '';
		}
	}
	getPhone() {
		if (this.props.selectedCustomer.hasOwnProperty('phoneNumber')) {
			return this.props.selectedCustomer.phoneNumber;
		} else {
			return '';
		}
	}
}

function mapStateToProps(state, props) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer,
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
)(QuantityChanger);

const styles = StyleSheet.create({
	headerText: {
		fontSize: 24,
		color: 'black',
		marginLeft: 100
	},
	leftMargin: {
		left: 10
	},
	headerItem: {
		fontWeight: 'bold',
		fontSize: 18
	},
	headerBackground: {
		backgroundColor: '#ABC1DE'
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
	leftToolbar: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center'
	},
	rightToolbar: {
		flexDirection: 'row-reverse',
		flex: 0.34,
		alignItems: 'center'
	},
	buttonText: {
		fontWeight: 'bold',
		fontSize: 28,
		color: 'white',
		textAlign: 'center',
		width: 300
	},
	commandBarContainer: {
		flex: 1,
		backgroundColor: '#ABC1DE',
		height: 80,
		alignSelf: 'center',
		marginLeft: 20,
		marginRight: 20
	},
	selectedCustomerText: {
		marginLeft: 10,
		alignSelf: 'center',
		flex: 0.5,
		color: 'black'
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
