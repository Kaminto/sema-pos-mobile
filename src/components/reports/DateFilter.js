import React from 'react';
import { Text, View, TouchableHighlight, StyleSheet } from 'react-native';
import { bindActionCreators } from "redux";
import * as reportActions from "../../actions/ReportActions";
import { connect } from "react-redux";
import Icon from 'react-native-vector-icons/Ionicons';

const dayInMilliseconds =  24*60*60*1000;

class DateFilter extends React.PureComponent {
	constructor(props) {
		super(props);
		let currentDate = new Date();
		this.state = {currentDate :new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() )};
		this.maxDate = new Date( this.state.currentDate.getTime() + dayInMilliseconds );
		this.minDate = new Date( this.maxDate.getTime() - 30 * dayInMilliseconds );
		// this.minDate = new Date( this.maxDate.getTime() - 7 * dayInMilliseconds );
		console.log( "DateFilter - maxDate = " + this.maxDate.toString());
		console.log( "DateFilter - minDate = " + this.minDate.toString());
		this.props.reportActions.setReportFilter( this.state.currentDate, new Date( this.state.currentDate.getTime() + dayInMilliseconds));
	}

	render() {
		return (
			<View style={styles.filterContainer}>
				<View style={styles.filterItemContainer}>
					{this.getPreviousButton()}
				</View>
				<View style={styles.filterItemContainer}>
					<Text style={{fontSize:20}}>{this.state.currentDate.toDateString()}</Text>
				</View>
				<View style={styles.filterItemContainer}>
					{this.getNextButton()}
				</View>
			</View>
		)
	}

	getPreviousButton(){
		const prevDate = new Date( this.state.currentDate.getTime() - dayInMilliseconds );
		if( prevDate > this.minDate){
			return (
				<TouchableHighlight onPress={() => this.onPreviousDay()}>
					               {
										<Icon
											name='md-arrow-round-back'
											size={40}
											color='black'
										/>
									}
				</TouchableHighlight>
			)
		}else{
			return (
				<Icon
				name='md-arrow-round-back'
				size={40}
				color='black'
				style={{opacity:.4 }}
				/>

			);
		}
	}

	getNextButton(){
		const nextDate = new Date( this.state.currentDate.getTime() + dayInMilliseconds );
		if( nextDate < this.maxDate){
			return (
				<TouchableHighlight onPress={() => this.onNextDay()}>
					<Icon
						name='md-arrow-round-forward'
						size={40}
						color='black'
					/>
				</TouchableHighlight>
			)
		}else{
			return (
				<Icon
						name='md-arrow-round-forward'
						size={40}
						color='black'
						style={{opacity:.4 }}
					/>
			);
		}
	}


	onPreviousDay(){
		this.setState({currentDate:new Date(this.state.currentDate.getTime() - dayInMilliseconds) }, () => this.update());
	}
	onNextDay(){
		this.setState({currentDate:new Date(this.state.currentDate.getTime() + dayInMilliseconds) }, () => this.update());
	}

	update(){
		const beginDate = this.state.currentDate;
		const endDate = new Date( beginDate.getTime() + dayInMilliseconds );
		this.props.reportActions.setReportFilter( beginDate, endDate );
	}
}

function mapStateToProps(state, props) {
	return { dateFilter: state.reportReducer.dateFilter };
}

function mapDispatchToProps(dispatch) {
	return {reportActions:bindActionCreators(reportActions, dispatch) };
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(DateFilter);


const styles = StyleSheet.create({

	filterContainer:{
		flex: .3,
		backgroundColor: 'white',
		marginLeft: 10,
		marginTop: 20,
		flexDirection:'row',
		width:500
	},
	filterItemContainer:{
		justifyContent:"center",
		paddingLeft:10
	},
	filterImage:{
		width: 30,
		height: 30
	}

});
