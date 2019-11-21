import { SET_SETTINGS} from "../actions/SettingsActions";

let initialState = {settings:{semaUrl:"", site:"", user:"", password:"", uiLanguage: {name: 'English', iso_code: 'en'}, token:"", sitedId:"", loginSync: false}};

const settingsReducer = (state = initialState, action) => {
	let newState;
	console.log("settingsReducer: " +action.type);
	switch (action.type) {
		case SET_SETTINGS:
			newState = {...state};
			newState.settings = action.data ;
			return newState;

		default:
			return state;
	}
};

export default settingsReducer;
