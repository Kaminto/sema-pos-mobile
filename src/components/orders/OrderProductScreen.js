import {createAppContainer} from "react-navigation";
import { createBottomTabNavigator } from 'react-navigation-tabs';
import ProductListScreen from './ProductListScreen';

export default OrderProductScreen = createAppContainer(createBottomTabNavigator({
	ProductList: {
		screen: ProductListScreen,
		navigationOptions: {
			tabBarVisible: false
		}
	}
}));

