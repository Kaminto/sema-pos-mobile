export const INVENTORY_SET = 'INVENTORY_SET';
export const SET_METER_READING = 'SET_METER_READING';

export function setInventory(inventory) {
	return (dispatch) => { dispatch({ type: INVENTORY_SET, data: inventory }) };
}

export function setMeterReading(meterReading) {
	return (dispatch) => { dispatch({ type: SET_METER_READING, data: meterReading }) };
}

