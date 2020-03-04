import React from 'react';
import JibuRouter from './src/routes/semaRouter';
import { NavigationContainer } from '@react-navigation/native';

class App extends React.PureComponent {
    render() {
        return (
			<NavigationContainer>
			   <JibuRouter />
			</NavigationContainer>
        );
    }
}

export default App;
