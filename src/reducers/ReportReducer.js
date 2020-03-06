import {
	SALES_REPORT_FROM_ORDERS,
	REMINDER_REPORT,
	REPORT_FILTER,
} from '../actions/ReportActions';

let initialState = {
	salesData: { totalLiters: 0, totalSales: 0, totalDebt: 0, salesItems: [], totalTypes: [] },
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
