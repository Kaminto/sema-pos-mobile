import React from 'react';
import { AppRegistry } from 'react-native';
//import App from './src/app/App';
import { Provider } from 'react-redux';
import App from './App';
//import configureStore from './src/store/configureStore';
import configureStore from './src/app/store';
import 'react-native-gesture-handler';

const store = configureStore();

const MainApp = () => (
    <Provider store={store}>
        <App />
    </Provider>
);

AppRegistry.registerComponent('semapos', () => MainApp);
// console.disableYellowBox = true;
