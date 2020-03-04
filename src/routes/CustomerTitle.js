
import React from 'react';
import { View, TouchableOpacity, Text, Picker } from 'react-native';
import * as CustomerActions from '../actions/CustomerActions';
import { Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomSidebarMenu from './CustomSidebarMenu';
import Icons from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import i18n from '../app/i18n';

class CustomerTitle extends React.PureComponent {

    render() {
        console.log('header props', this.props.customerProps)
        return (
            <View
                style={{
                    flexDirection: 'row',
                }}>
                {this.props.customerProps.isCustomerSelected && (
                    <Text>{this.props.customerProps.customerName}</Text>
                )}
                {!this.props.customerProps.isCustomerSelected && (
                    <Text>Customers</Text>
                )}
            </View>

        );
    }
}

function mapStateToProps(state, props) {
    return {
        selectedCustomer: state.customerReducer.selectedCustomer,
        customers: state.customerReducer.customers,
        searchString: state.customerReducer.searchString,
        customerProps: state.customerReducer.customerProps,
        customerTypeFilter: state.customerReducer.customerTypeFilter,
        paymentTypes: state.paymentTypesReducer.paymentTypes,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        customerActions: bindActionCreators(CustomerActions, dispatch),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomerTitle);