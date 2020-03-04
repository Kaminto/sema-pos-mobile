import React from 'react';
import JibuRouter from './src/routes/semaRouter';
// import { NavigationContainer } from '@react-navigation/native';

class App extends React.PureComponent {
    render() {
        return (
			   <JibuRouter />
        );
    }
}

export default App;
