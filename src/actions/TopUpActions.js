export const TOPUPS_SET = 'TOPUPS_SET';
export const TOPUP_TOTAL = 'TOPUP_TOTAL';
export const TOPUP_BALANCE = 'TOPUP_BALANCE';


export function setTopups(topups) {
	return (dispatch) => { dispatch({ type: TOPUPS_SET, data: topups }) };
}


export function setTopUpBalance(balance) {
	return (dispatch) => { dispatch({ type: TOPUP_BALANCE, data: balance }) };
}

export function setTopUpTotal(total) {
	return (dispatch) => { dispatch({ type: TOPUP_TOTAL, data: total }) };
}
