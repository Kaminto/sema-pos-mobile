
export const SELECTED_CLIENT = 'SELECTED_CLIENT';
export const LOAD_CLIENTS = 'LOAD_CLIENTS';
export const SET_CLIENT = 'SET_CLIENT';
export const SEARCH_CLIENTS = 'SEARCH_CLIENTS';

export function selectedClient(client) {
	console.log("selectedClient - action", client);
	const data = client;
	return (dispatch) => {
		dispatch({ type: SELECTED_CLIENT, data: data });
	};
}

export const getClients = () => {
    return dispatch => {
        fetch("http://35.177.161.105/api/getClients.php?section=getClientData")
        .catch(err => {
            alert("Something went wrong, sorry :/");
            console.log(err);
        })
        .then(res => res.json())
        .then(parsedRes => {
            dispatch(setClient(parsedRes));
        });
    };
};

export const setClient = data => {
    return {
        type: SET_CLIENT,
        data
    };
};

export function SearchClients(searchString) {
	return (dispatch) => { dispatch({ type: SEARCH_CLIENTS, data: searchString }) };
}
