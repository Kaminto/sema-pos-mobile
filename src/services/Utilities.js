import { NativeModules } from 'react-native';
import ProductsRealm from "../database/products/product.operations";
import { format, parseISO, isBefore, isAfter, isEqual } from 'date-fns';

const IntlPolyFill = require('intl');
// Add additional locales here
require('intl/locale-data/jsonp/en-US');	// U.S.
require('intl/locale-data/jsonp/ee-GH');	// Ghana
require('intl/locale-data/jsonp/rw-RW');	// Rawanda
require('intl/locale-data/jsonp/lg-UG');	// Uganda
require('intl/locale-data/jsonp/sw-KE');	// Kenya
require('intl/locale-data/jsonp/sw-TZ');	// Tanzania
require('intl/locale-data/jsonp/en-ZW');	// Zimbabwe

export const capitalizeWord = word => {
	return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
};

export const isEmptyObj = (obj) => {
	for (var key in obj) {
		if (obj.hasOwnProperty(key))
			return false;
	}
	return true;
}

const isBetween = (date, from, to, inclusivity = '()') => {
    if (!['()', '[]', '(]', '[)'].includes(inclusivity)) {
        throw new Error('Inclusivity parameter must be one of (), [], (], [)');
    }

    const isBeforeEqual = inclusivity[0] === '[',
        isAfterEqual = inclusivity[1] === ']';

    return (isBeforeEqual ? (isEqual(from, date) || isBefore(from, date)) : isBefore(from, date)) &&
        (isAfterEqual ? (isEqual(to, date) || isAfter(to, date)) : isAfter(to, date));
};

export function formatCurrency(value) {
	console.log('value===', value);
	let locale = 'en-US';
	let currency = "USD";
	try {
		locale = NativeModules.I18nManager.localeIdentifier;
		locale = locale.replace('_', '-');
	} catch (error) {
		console.log("formatCurrency - NativeModules.I18nManager - error " + error);
	}
	if (ProductsRealm.getProducts().length > 0) {
		if (ProductsRealm.getProducts()[0].priceCurrency.length === 3) {
			currency = ProductsRealm.getProducts()[0].priceCurrency;
		}
	}
	value = parseFloat(value);

	// Note: Because of the very large number of locales that exist in order to support all locales AND
	// Adding currency info adds addtional text, it has been decided to format curency as a,ddd.00 format
	// and not include a currency symbol such as "$" or 'U sh'
	currency = "USD";
	locale = "en-US";
	try {
		var formatter = new IntlPolyFill.NumberFormat(locale, {
			style: 'currency',
			currency: currency,
			minimumFractionDigits: 2,
		});
		return formatter.format(value).replace('$', '');
	} catch (error) {
		console.log("formatCurrency - IntlPolyFill - error " + error);
		return value;
	}
}
