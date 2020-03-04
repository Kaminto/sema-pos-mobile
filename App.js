// import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import JibuDrawerNavigation from './src/routes/semaRouter';
//const MainApp = createAppContainer(JibuRouter);

class App extends React.PureComponent {
    render() {
        return (
            // <MainApp />
            <NavigationContainer>
                <JibuDrawerNavigation />
            </NavigationContainer>
        );
    }
}

export default App;
