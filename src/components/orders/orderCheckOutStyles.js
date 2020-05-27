import { StyleSheet } from "react-native";
const widthQuanityModal = '70%';
const heightQuanityModal = 520; 
export default orderCheckOutStyles = StyleSheet.create({
	onPayView: {
		flex: 1,
		justifyContent: 'center'
	},
	onPayText: {
		paddingTop: 10,
		paddingBottom: 10,
		textAlign: 'center'
	},
	container: {
		flex: 1,
		backgroundColor: "#2858a7",

	},

	checkBoxRow: {
		flex: 1,
		flexDirection: 'row',
		marginTop: '1%',
		alignItems: 'center'
	},
	checkBox: {},
	checkLabel: {
		left: 20,
		fontSize: 20
	},
	totalText: {
		marginTop: 10,
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	},

	buttonText: {
		fontWeight: 'bold',
		fontSize: 30,
		alignSelf: 'center',
		color: 'white'
	},
	summaryText: {
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	},
	baseItem: {
		fontWeight: 'bold',
		fontSize: 16,
		color: 'black',
		paddingTop: 4,
		paddingBottom: 4,

	},
	modal: {
		justifyContent: 'center',
		// alignItems: 'center'
	},

	modal2: {
		justifyContent: 'center',
		height: 300,
		width: '65%',
		padding: 5,
		backgroundColor: "#f1f1f1"
	},

	completeOrder: {
		backgroundColor: '#2858a7',
		borderRadius: 10,
		marginTop: '1%'
	},

	completeOrderBtn: {
		backgroundColor: '#2858a7',
		bottom: 0,
		marginTop: '3%',
		marginBottom: 0,
		// position: 'absolute'
	},

	modal3: {
		justifyContent: 'center',
		width: widthQuanityModal,
		height: heightQuanityModal,
	},

	headerItem: {
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		paddingTop: 5,
		paddingBottom: 5,
	},

	headerBtlItem: {
		fontWeight: 'bold',
		fontSize: 16,
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

});
