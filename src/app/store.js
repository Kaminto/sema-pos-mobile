import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import RootReducer from '../reducers/RootReducer';

let composeEnhancers = compose;

if (__DEV__) {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

// Connect our store to the reducers
const configureStore = () => {
  return createStore(RootReducer, composeEnhancers(applyMiddleware(thunk)));
};

export default configureStore;
