
import {
	ADD_PRODUCT_TO_ORDER, CLEAR_ORDER, REMOVE_PRODUCT,
	SET_PRODUCT_QUANTITY, SET_ORDER_CHANNEL, SET_ORDER_FLOW,
	SET_PAYMENT, SET_DISCOUNTS, REMOVE_PRODUCT_DISCOUNT
} from "../actions/OrderActions";

let initialState = { products: [], channel: { salesChannel: 'direct' }, flow: { page: 'products' }, payment: { cash: 0, credit: 0, mobile: 0 }, discounts: [] };

const orderReducer = (state = initialState, action) => {
	console.log("orderReducer: " + action.type);
	let newState;
	switch (action.type) {
		case ADD_PRODUCT_TO_ORDER:
			newState = { ...state };
			// Check if product exists
			for (let product of newState.products) {
				if (product.product.productId === action.data.product.productId) {
					product.quantity += action.data.quantity;
					newState.products = newState.products.slice();
					return newState;
				}
			}
			newState.products = newState.products.concat(action.data);
			return newState;
		case CLEAR_ORDER:
			newState = { ...state };
			newState.products = [];
			return newState;

		case REMOVE_PRODUCT:
			newState = { ...state };
			newState.products = [];
			for (let product of state.products) {
				if (product.product.productId !== action.data.product.productId) {
					newState.products.push(product);
				}
			}
			return newState;

		case SET_PRODUCT_QUANTITY:
			newState = { ...state };
			newState.products = [];
			for (let product of state.products) {
				if (product.product.productId === action.data.product.productId) {
					product.quantity = action.data.quantity;
				}
				newState.products.push(product);
			}
			return newState;

		case SET_ORDER_CHANNEL:
			newState = { ...state };
			newState.channel = action.data.channel;
			return newState;

		case SET_DISCOUNTS:
			newState = { ...state };
			// Check if product exists
			for (let product of newState.discounts) {
				if (product.product.productId === action.data.product.productId) {
					if (action.data.isCustom === 'Not Custom') {
						product.discount = action.data.discount;
						product.totalPrice = action.data.totalPrice;
						product.customDiscount = 0;
						newState.discounts = newState.discounts.slice();
					}
					if (action.data.isCustom === 'Custom') {
						product.discount = {};
						product.customDiscount = action.data.customDiscount;
						newState.discounts = newState.discounts.slice();
					}
					return newState;
				}
			}
			newState.discounts = newState.discounts.concat(
				{
					product: action.data.product,
					discount: action.data.discount,
					totalPrice: action.data.totalPrice,
					customDiscount: action.data.customDiscount
				});
			return newState;
		case REMOVE_PRODUCT_DISCOUNT:
			newState = { ...state };
			newState.discounts = [];
			for (let product of state.discounts) {
				if (product.product.productId !== action.data.product.productId) {
					newState.discounts.push(product);
				}
			}
			return newState;




			// newState = { ...state };
			// //newState.discounts = [];
			// console.log('state.discounts', state.discounts);
			// console.log('action.data', action.data);


			// const productIndex = state.discounts.map(function (e) { return e.product.productId }).indexOf(action.data.product.productId);

			// if (productIndex >= 0) {
			// 	let productDiscountArray = [...state.discounts];
			// 	productDiscountArray.splice(productIndex, 1);
			// }

			// for (let product of state.discounts) {
			// 	if (product.product.productId === action.data.product.productId) {
			// 		const itemIndex = product.discount.map(function (e) { return e.id }).indexOf(action.data.discountId);
			// 		//
			// 		console.log('itemIndex', itemIndex);
			// 		if (itemIndex >= 0) {
			// 			let discountArray = [...product.discount];
			// 			discountArray.splice(itemIndex, 1);
			// 			product.discount = discountArray;
			// 			console.log('product.discount', product.discount);
			// 			console.log('discountArray', discountArray);
			// 			console.log('product', product);
			// 		}

			// 	}
			// }
			// console.log('newState.discounts', newState.discounts);
			// return newState;

		case SET_ORDER_FLOW:
			newState = { ...state };
			newState.flow = action.data.flow;
			return newState;

		case SET_PAYMENT:
			newState = { ...state };
			newState.payment = action.data.payment;
			return newState;

		default:
			return state;
	}
};

export default orderReducer;
