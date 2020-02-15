import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createAppContainer } from 'react-navigation';
import JibuRouter from './src/routes/semaRouter';

import * as CustomerActions from './src/actions/CustomerActions';
import * as NetworkActions from './src/actions/NetworkActions';
import * as SettingsActions from './src/actions/SettingsActions';
import * as ProductActions from './src/actions/ProductActions';
import * as ToolbarActions from './src/actions/ToolBarActions';
import * as receiptActions from './src/actions/ReceiptActions';

import { enableScreens } from 'react-native-screens';
// import 'react-native-gesture-handler';


enableScreens();


const MainApp = createAppContainer(JibuRouter);


class App extends React.Component {

    render() {
        return (
            <MainApp />
        );
    }

}


function mapStateToProps(state, props) {
    return {
        selectedCustomer: state.customerReducer.selectedCustomer,
        customers: state.customerReducer.customers,
        network: state.networkReducer.network,
        showView: state.customerBarReducer.showView,
        showScreen: state.toolBarReducer.showScreen,
        settings: state.settingsReducer.settings,
        receipts: state.receiptReducer.receipts,
        remoteReceipts: state.receiptReducer.remoteReceipts,
        products: state.productReducer.products
    };
}

function mapDispatchToProps(dispatch) {
    return {
        customerActions: bindActionCreators(CustomerActions, dispatch),
        productActions: bindActionCreators(ProductActions, dispatch),
        networkActions: bindActionCreators(NetworkActions, dispatch),
        toolbarActions: bindActionCreators(ToolbarActions, dispatch),
        settingsActions: bindActionCreators(SettingsActions, dispatch),
        receiptActions: bindActionCreators(receiptActions, dispatch)
    };
}



export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
