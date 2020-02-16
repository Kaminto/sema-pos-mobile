import { combineReducers } from 'redux';
import customerReducer from "./CustomerReducer";
import networkReducer from "./NetworkReducer";
import productReducer from "./ProductReducer";
import orderReducer from "./OrderReducer";
import reportReducer from "./ReportReducer";
import settingsReducer from "./SettingsReducer";
import receiptReducer from "./ReceiptReducer";
import authReducer from "./AuthReducers";
import reminderReducer from "./ReminderReducer.js";
import topupReducer from "./TopUpReducer";
import inventoryReducer from "./InventoryReducer";
import discountReducer from "./DiscountReducer";
import paymentTypesReducer from './PaymentTypesReducer';
import customerReminderReducer from './CustomerReminderReducer';
import wastageReducer from './WastageReducer';

// Combine all the reducers
const RootReducer = combineReducers({
	customerReducer,
	networkReducer,
	productReducer,
	orderReducer,
	reportReducer,
	settingsReducer,
	receiptReducer,
	authReducer,
	reminderReducer,
	topupReducer,
	inventoryReducer,
	discountReducer,
	paymentTypesReducer,
	customerReminderReducer,
	wastageReducer
});

export default RootReducer;
