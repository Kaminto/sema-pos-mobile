import {createAppContainer, createBottomTabNavigator} from "react-navigation";
import ProductListScreen from './ProductListScreen';

export default OrderProductScreen = createAppContainer(createBottomTabNavigator({
	ProductList: {
		screen: ProductListScreen,
		navigationOptions: {
			tabBarVisible: false
		}
	}
}));

