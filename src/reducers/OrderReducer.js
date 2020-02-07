
import {
	ADD_PRODUCT_TO_ORDER, CLEAR_ORDER, REMOVE_PRODUCT,
	SET_PRODUCT_QUANTITY, SET_ORDER_CHANNEL, SET_ORDER_FLOW,
	SET_PAYMENT, SET_DISCOUNTS, REMOVE_PRODUCT_DISCOUNT, ADD_PRODUCT_DISCOUNT,
	SET_PRODUCT_NOTES
} from "../actions/OrderActions";

let initialState = { products: [], channel: { salesChannel: 'direct' }, flow: { page: 'products' }, payment: { cash: 0, credit: 0, mobile: 0 }, discounts: [] };

const orderReducer = (state = initialState, action) => {
	console.log("orderReducer: " + action.type);
	let newState;
	switch (action.type) {
		case SET_PRODUCT_NOTES:
			newState = { ...state };
			// Check if product exists
			for (let product of newState.products) {
				if (product.product.productId === action.data.product.productId) {
					product.notes = action.data.notes;
					product.emptiesReturned = action.data.emptiesReturned;
					product.refillPending = action.data.refillPending;
					product.emptiesDamaged = action.data.emptiesDamaged;
					newState.products = newState.products.slice();
					return newState;
				}
			}
			newState.products = newState.products.concat(action.data);
			return newState;
		case ADD_PRODUCT_TO_ORDER:
			newState = { ...state };
			// Check if product exists
			for (let product of newState.products) {
				if (product.product.productId === action.data.product.productId) {
					product.quantity += action.data.quantity;


					if (!product.hasOwnProperty('discount')) {
						product.finalAmount = (Number(product.quantity)) * Number(product.unitPrice);
					}

					if (product.hasOwnProperty('discount')) {
						if (product.type === 'Percentage') {
							product.finalAmount = (product.quantity * product.unitPrice) - Number(product.discount);
						}

						if (product.type === 'Flat') {
							product.finalAmount = (product.quantity * product.unitPrice) * Number(product.discount) / 100;
						}
					}

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

					if (!product.hasOwnProperty('discount')) {
						product.finalAmount = (Number(product.quantity)) * Number(product.unitPrice);
					}

					if (product.hasOwnProperty('discount')) {
						if (product.type === 'Percentage') {
							product.finalAmount = (product.quantity * product.unitPrice) - Number(product.discount);
						}

						if (product.type === 'Flat') {
							product.finalAmount = (product.quantity * product.unitPrice) * Number(product.discount) / 100;
						}
					}
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
					discountType: action.data.isCustom,
					totalPrice: action.data.totalPrice,
					customDiscount: action.data.customDiscount
				});
			return newState;
		case ADD_PRODUCT_DISCOUNT:
			newState = { ...state };
			newState.products = [];
			for (let product of state.products) {
				if (product.product.productId === action.data.product.productId) {
					if (action.data.isCustom === 'Not Custom') {
						product.discount = action.data.discount.amount;
						product.type = action.data.discount.type;

						if (action.data.discount.type === 'Percentage') {
							product.finalAmount = (product.quantity * product.unitPrice) - action.data.discount.amount;
						}

						if (action.data.discount.type === 'Flat') {
							product.finalAmount = (product.quantity * product.unitPrice) * action.data.discount.amount / 100;
						}
					}
					if (action.data.isCustom === 'Custom') {
						product.discount = action.data.customDiscount;
						product.type = 'Flat';
						product.finalAmount = (product.quantity * product.unitPrice) - action.data.customDiscount;

					}
				}

				newState.products.push(product);
			}
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
