import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { withNavigation } from "react-navigation";
import Icon from 'react-native-vector-icons/Ionicons';


const size = 30;
const color = "white";
const name = 'md-menu';

class NavigationDrawerStructure extends React.PureComponent {
    
    toggleDrawer = () => {
        this.props.navigation.toggleDrawer();
    };

    render() {
        return (
            <View style={styles.cont}>
                <TouchableOpacity onPress={this.toggleDrawer}>
                    <Icon
                        name={name}
                        size={size}
                        color={color}
                        style={styles.drawerIcon}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

export default withNavigation(NavigationDrawerStructure);

const styles = StyleSheet.create({
    cont: {
        flexDirection: 'row'
    },
    drawerIcon: {
        width: 50, height: 30, marginLeft: 10, paddingRight: 20
    }
})
