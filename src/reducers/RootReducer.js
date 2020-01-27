
import { combineReducers } from 'redux';
import customerReducer from "./CustomerReducer";
import networkReducer from "./NetworkReducer";
import customerBarReducer from "./CustomerBarReducer";
import productReducer from "./ProductReducer";
import orderReducer from "./OrderReducer";
import toolBarReducer from "./ToolbarReducer";
import reportReducer from "./ReportReducer";
import settingsReducer from "./SettingsReducer";
import receiptReducer from "./ReceiptReducer";
import authReducer from "./AuthReducers";
import reminderReducer from "./ReminderReducer.js";
import topupReducer from "./TopUpReducer";
import inventoryReducer from "./InventoryReducer";
import discountReducer from "./DiscountReducer";
import paymentTypesReducer from './PaymentTypesReducer';
import customerDebtReducer from './CustomerReducer';

// Combine all the reducers
const RootReducer = combineReducers({
	customerReducer,
	networkReducer,
	customerBarReducer,
	productReducer,
	orderReducer,
	toolBarReducer,
	reportReducer,
	settingsReducer,
	receiptReducer,
	authReducer,
	reminderReducer,
	topupReducer,
	inventoryReducer,
	discountReducer,
	paymentTypesReducer,
	customerDebtReducer
});

export default RootReducer;
