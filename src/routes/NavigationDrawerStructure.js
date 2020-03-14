import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { withNavigation } from "react-navigation";
import Icon from 'react-native-vector-icons/Ionicons';

class NavigationDrawerStructure extends React.PureComponent {
    toggleDrawer = () => {
        this.props.navigation.toggleDrawer();
    };

    render() {
        return (
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
                    <Icon
                        name='md-menu'
                        size={30}
                        color="white"
                        style={{
                            width: 50, height: 30, marginLeft: 10, paddingRight:20
                        }}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

export default withNavigation(NavigationDrawerStructure);
