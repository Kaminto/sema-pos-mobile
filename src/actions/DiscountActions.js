export const DISCOUNTS_SET = 'DISCOUNTS_SET';

export function setDiscounts(discounts) {
    return (dispatch) => { dispatch({ type: DISCOUNTS_SET, data: discounts }) };

}
