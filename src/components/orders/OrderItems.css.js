import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	container: {
		flex: 6,
		backgroundColor: "white",
		borderColor: '#2858a7',
		borderTopWidth: 5,
		borderRightWidth: 5,
	},
	headerBackground: {
		backgroundColor: '#ABC1DE'
	},
	leftMargin: {
		left: 10
	},
	rightMargin: {
		left: 10
	},
	headerLeftMargin: {
		left: 10
	},
	headerItem: {
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		paddingTop: 5,
		paddingBottom: 5,
	},
	baseItem: {
		fontWeight: 'bold',
		fontSize: 16,
		color: 'black',
		paddingTop: 4,
		paddingBottom: 4,

	},
	quantityModal: {
		width: widthQuanityModal,
		height: heightQuanityModal,
		position: 'absolute',
		bottom: 120,
		right: 100,
		backgroundColor: '#e0e0e0',
		// padding: 22,
		// justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
		borderColor: 'rgba(0, 0, 0, 1)',
		borderWidth: 2
	},
	modalTotal: {
		flex: .15,
		flexDirection: 'row',
		backgroundColor: 'white',
		alignItems: 'center',
		borderColor: 'black',
		borderWidth: 4,
		borderRadius: 3
	},
	production: {
		fontWeight: "bold",
		fontSize: 24,
	},
	modalCalculator: {
		flex: .70,
		flexDirection: 'row',
	},
	modalDone: {
		flex: .15,
		backgroundColor: '#2858a7',
		flexDirection: 'row',
		alignItems: 'center',

	},
	inputText: {
		fontSize: inputFontHeight,
		alignSelf: 'center',
		backgroundColor: 'white',
	},
	digitContainer: {
		flex: 1,
		width: widthQuanityModal / 3,
		height: (.7 * heightQuanityModal) / 4,
		alignItems: 'center',
		justifyContent: 'center'
	},
	clearContainer: {
		flex: 1,
		width: widthQuanityModal * 2 / 3,
		height: (.7 * heightQuanityModal) / 4,
		alignItems: 'center',
		justifyContent: 'center'
	},
	digit: {
		textAlign: 'center',
		color: 'black',
		fontWeight: 'bold',
		fontSize: 30,
	},
	accumulator: {
		color: 'black',
		fontWeight: 'bold',
		fontSize: 30,
		flex: 1,
		textAlign: 'center'
	},
	doneButton: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 30,
		flex: 1,
		textAlign: 'center'
	},



	wrapper: {
		paddingTop: 50,
		flex: 1
	},

	modal: {
		 justifyContent: 'center',
		// alignItems: 'center'
	},

	modal2: {
		height: 230,
		backgroundColor: "#3B5998"
	},

	modal3: {
		// height: 300,
		// width: 500
		width: widthQuanityModal,
		height: heightQuanityModal,
	},

	modal4: {
		height: 300
	},

	btn: {
		margin: 10,
		backgroundColor: "#3B5998",
		color: "white",
		padding: 10
	},
	totalItem: {
		fontWeight: "bold",
		fontSize: 18,
		paddingLeft: 10,
	},
	btnModal: {
		position: "absolute",
		top: 0,
		right: 0,
		width: 50,
		height: 50,
		backgroundColor: "transparent"
	},

	text: {
		color: "black",
		fontSize: 22
	}
});
