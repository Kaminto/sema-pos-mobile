export const  AUTH_STATUS= 'AUTH_STATUS';


export function isAuth( status){
	return (dispatch) => {
		dispatch({type: AUTH_STATUS, data:{status:status}});
	};
}
