import {
	SALES_REPORT_FROM_ORDERS,
	REMINDER_REPORT,
	REPORT_TYPE,
	INVENTORY_REPORT,
	REPORT_FILTER,
} from '../actions/WastageActions';

let initialState = {
	salesData: { totalLiters: 0, totalSales: 0, totalDebt: 0, salesItems: [] },
	reportType: 'sales',
	inventoryData: {
		salesAndProducts: { totalLiters: 0, totalSales: 0, totalDebt: 0, salesItems: [] },
		inventory: {
			date: new Date(),
			currentMeter: 0,
			currentProductSkus: [],
			previousMeter: 0,
			previousProductSkus: []
		}
	},
	dateFilter: {}
};

const wastageReducer = (state = initialState, action) => {
	// console.log('wastageReducer: ' + action.type);

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

		case INVENTORY_REPORT:
			newState = { ...state };
			newState.inventoryData = action.data.inventoryData;
			return newState;

		case REPORT_FILTER:
			newState = { ...state };
			newState.dateFilter = action.data;
			return newState;

		case REPORT_TYPE:
			newState = { ...state };
			newState.reportType = action.data;
			return newState;

		default:
			return state;
	}
};

export default wastageReducer;
