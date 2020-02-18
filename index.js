import 'react-native-gesture-handler';
import React from 'react';
import { AppRegistry } from 'react-native';
//import App from './src/app/App';
import { Provider } from 'react-redux';
import App from './App';
//import configureStore from './src/store/configureStore';
import configureStore from './src/app/store';


// if (Platform.OS === 'android') {
//   const { UIManager } = NativeModules;
//   if (UIManager) {
//     // Add gesture specific events to genericDirectEventTypes object exported from UIManager native module.
//     // Once new event types are registered with react it is possible to dispatch these events to all kind of native views.
//     UIManager.genericDirectEventTypes = {
//       ...UIManager.genericDirectEventTypes,
//       onGestureHandlerEvent: { registrationName: 'onGestureHandlerEvent' },
//       onGestureHandlerStateChange: {
//         registrationName: 'onGestureHandlerStateChange',
//       },
//     };
//   }
// }

const store = configureStore();

const MainApp = () => (
    <Provider store={store}>
        <App />
    </Provider>
);

AppRegistry.registerComponent('semapos', () => MainApp);
console.disableYellowBox = true;
