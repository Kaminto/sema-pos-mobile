import {
	SALES_REPORT_FROM_ORDERS,
	REMINDER_REPORT,
	REPORT_FILTER,
	initializeSalesData
} from '../actions/ReportActions';

let initialState = {
	salesData: initializeSalesData(),
	dateFilter: {}
};

const reportReducer = (state = initialState, action) => {
	let newState;
	switch (action.type) {
		case SALES_REPORT_FROM_ORDERS:
			newState = { ...state };
			newState.salesData = action.data.salesData;
			return newState;
		case REMINDER_REPORT:
			newState = { ...state };
			newState.reminderData = action.data.reminderdata;
			return newState;
		case REPORT_FILTER:
			newState = { ...state };
			newState.dateFilter = action.data;
			return newState;
		default:
			return state;
	}
};

export default reportReducer;
