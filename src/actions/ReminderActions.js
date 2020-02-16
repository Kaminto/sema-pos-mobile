export const ADD_REMINDER = 'ADD_REMINDER';

export function addReminder(reminder){
    return dispatch => {
	dispatch({type: ADD_REMINDER, data:{reminder}});
    };

}
