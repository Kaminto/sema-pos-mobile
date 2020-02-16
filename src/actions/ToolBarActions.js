
export const SHOW_SCREEN = 'SHOW_SCREEN';
export const SET_LOGGED_IN = 'SET_LOGGED_IN';

export function ShowScreen(screen) {
	return (dispatch) => { dispatch({ type: SHOW_SCREEN, data: { screen: screen } }); };
}


export function SetLoggedIn(loggedIn) {
	return (dispatch) => { dispatch({ type: SET_LOGGED_IN, data: { loggedIn: loggedIn } }); };
}
