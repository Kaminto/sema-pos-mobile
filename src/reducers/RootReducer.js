import { combineReducers } from 'redux';
import customerReducer from "./CustomerReducer";
import networkReducer from "./NetworkReducer";
import productReducer from "./ProductReducer";
import settingsReducer from "./SettingsReducer";
// Combine all the reducers
const RootReducer = combineReducers({
	settingsReducer,
	customerReducer,
	networkReducer,
	productReducer,
});

export default RootReducer;
