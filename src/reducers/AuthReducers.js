import { AUTH_STATUS} from "../actions/AuthActions";

let initialState = { status :false};

const authReducer = (state = initialState, action) => {
	switch (action.type) {
		case AUTH_STATUS:
			return action.data;
		default:
			return state;
	}
};

export default authReducer;
