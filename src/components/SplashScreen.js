import React, { Component } from 'react';
import { View, StyleSheet, ImageBackground, Image } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

export default class SplashScreen extends Component {
	render() {
		return (
			<View style={{ flex: 1 }}>
				<ImageBackground
					source={require('../images/swe-login.jpg')}
					resizeMode="cover"
					style={styles.imgBackground}>
					<View style={{ flex: 1, alignItems: 'center' }}>
						<View style={{ marginTop: '1.5%' }}>
							<Image
								source={require('../images/swe-logo.png')}
								resizeMode="stretch"
								style={styles.logoSize}
							/>
						</View>
					</View>
				</ImageBackground>

				{/**Adding a spinner */}
				<Spinner
					visible={true}
					textContent={'LOADING...'}
					textStyle={styles.spinnerTextStyle}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	imgBackground: {
		width: '100%',
		height: '100%',
		flex: 1
	},
	logoSize: {
		width: 200,
		height: 200
	},
	spinnerTextStyle: {
		color: '#002b80',
		fontSize: 50,
		fontWeight: 'bold'
	  },
});
