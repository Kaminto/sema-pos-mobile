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
    Alert,
    ActivityIndicator
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PropTypes from 'prop-types';

import * as CustomerActions from '../actions/CustomerActions';
import * as ToolbarActions from '../actions/ToolBarActions';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ModalDropdown from 'react-native-modal-dropdown';

import Events from 'react-native-simple-events';
import i18n from '../app/i18n';
const { height, width } = Dimensions.get('window');
const inputFontHeight = Math.round((24 * height) / 752);
const marginTextInput = Math.round((5 * height) / 752);
const marginSpacing = Math.round((20 * height) / 752);
const inputTextWidth = 400;
const marginInputItems = width / 2 - inputTextWidth / 2;

const supportedUILanguages = [
    { name: 'English', iso_code: 'en' },
    { name: 'Français', iso_code: 'fr' }
];
 
export  class Inventory extends Component {
    constructor(props) {
        super(props);
    }


    componentDidMount() {
    }

    componentDidUpdate(oldProps) {
    }

    render() {
        return (
            <View style={styles.container}>
               
            </View>
        );
    }


}

function mapStateToProps(state, props) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer,
		customers: state.customerReducer.customers,
		searchString: state.customerReducer.searchString
	};
}

function mapDispatchToProps(dispatch) {
	return {
		customerActions: bindActionCreators(CustomerActions, dispatch),
		toolbarActions: bindActionCreators(ToolbarActions, dispatch)
	};
}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Inventory);



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
