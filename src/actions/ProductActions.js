export const PRODUCTS_LOADED = 'PRODUCTS_LOADED';
export const PRODUCTS_SET = 'PRODUCTS_SET';

export function setProducts( products ) {
	return (dispatch) => {dispatch({type: PRODUCTS_SET, data:products})};

}
