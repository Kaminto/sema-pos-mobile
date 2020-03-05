
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as CustomerActions from '../actions/CustomerActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class CustomerTitle extends React.PureComponent {

    render() {
        return (
            <View
                style={styles.container}>
                {this.props.customerProps.isCustomerSelected && (
                    <Text style={styles.tooltitle}>{this.props.customerProps.customerName}</Text>
                )}
                {!this.props.customerProps.isCustomerSelected && (
                    <Text style={styles.tooltitle}>{this.props.title ? this.props.title : this.props.customerProps.title}</Text>
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

const styles = StyleSheet.create({
	tooltitle: {
		color: 'white',
						fontSize: 18
	},

	container: {
		            flexDirection: 'row',
					color: 'white',
					fontSize: 18
	}

  });
