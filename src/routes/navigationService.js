import { NavigationActions } from 'react-navigation';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
    _navigator = navigatorRef;
}

function navigate(routeName, params) {
    console.log('_navigator', _navigator)
    if (_navigator) {
        console.log('_navigator', _navigator)
        _navigator.dispatch(
            NavigationActions.navigate({
                routeName,
                params,
            })
        );
    }

}

// add other navigation functions that you need and export them

export default {
    navigate,
    setTopLevelNavigator,
};