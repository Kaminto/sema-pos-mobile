// import 'react-native-gesture-handler';
import React from 'react';
import { createAppContainer } from 'react-navigation';
import JibuRouter from './src/routes/semaRouter';

const MainApp = createAppContainer(JibuRouter);

class App extends React.PureComponent {
    render() {
        return (
            <MainApp />
        );
    }
}

export default App;
